/**
 * Custom hook for handling content submission workflow
 * Integrates text and image validation, API calls, loading states, and error handling
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { contentApi } from "../services/contentApi";
import { imageUploadApi } from "../services/imageUploadApi";
import { enhanceError, ErrorRecoveryManager } from "../utils/errorHandling";
import { useLoadingState, LoadingType } from "./useLoadingState";

/**
 * Custom hook for content submission functionality
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Success callback function
 * @param {Function} options.onError - Error callback function
 * @param {boolean} options.autoReset - Whether to auto-reset form after successful submission
 * @param {boolean} options.uploadImagesFirst - Whether to upload images before content generation
 * @returns {Object} Hook return object with state and functions
 */
export const useContentSubmission = (options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    autoReset = true,
    uploadImagesFirst = false,
  } = options;

  // Enhanced loading state management
  const loadingState = useLoadingState({
    defaultTimeout: 60000, // 60 seconds for content operations
    onTimeout: (operationId) => {
      console.warn(`Content submission operation ${operationId} timed out`);
    },
    onError: (operationId, error) => {
      console.error(
        `Content submission operation ${operationId} failed:`,
        error
      );
    },
  });

  // Results and errors
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [uploadResults, setUploadResults] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Ref to track mounted state for cleanup
  const isMountedRef = useRef(true);

  // Error recovery manager
  const recoveryManager = useRef(
    new ErrorRecoveryManager({
      onRetry: async (error, context) => {
        if (context.lastSubmissionData) {
          return submit(
            context.lastSubmissionData.text,
            context.lastSubmissionData.images,
            context.lastSubmissionData.options
          );
        }
      },
      onReset: () => {
        reset();
      },
      maxRetries: 3,
    })
  ).current;

  /**
   * Validates submission data before processing
   * @param {string} text - Text content to validate
   * @param {Array} images - Images array to validate
   * @returns {Object} Validation result
   */
  const validateSubmissionData = useCallback(
    (text, images) => {
      const errors = [];

      // Text validation
      if (!text || text.trim().length === 0) {
        errors.push({
          type: "required",
          field: "text",
          message: "Content text is required",
        });
      }

      if (text && text.length > 2000) {
        errors.push({
          type: "max-length",
          field: "text",
          message: "Content exceeds maximum length of 2000 characters",
        });
      }

      // Image validation
      if (images && images.length > 10) {
        errors.push({
          type: "max-images",
          field: "images",
          message: "Maximum 10 images allowed",
        });
      }

      // Check for failed image uploads
      if (images && images.length > 0) {
        const failedUploads = images.filter(
          (img) => img.uploadStatus === "error"
        );
        if (failedUploads.length > 0) {
          errors.push({
            type: "upload-failed",
            field: "images",
            message: `${failedUploads.length} image(s) failed to upload. Please retry or remove them.`,
          });
        }

        const pendingUploads = images.filter(
          (img) =>
            img.uploadStatus === "pending" || img.uploadStatus === "uploading"
        );
        if (pendingUploads.length > 0 && uploadImagesFirst) {
          errors.push({
            type: "upload-pending",
            field: "images",
            message: `${pendingUploads.length} image(s) are still uploading. Please wait for completion.`,
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [uploadImagesFirst]
  );

  /**
   * Uploads images that haven't been uploaded yet
   * @param {Array} images - Array of image objects
   * @returns {Promise<Array>} Array of upload results
   */
  const uploadPendingImages = useCallback(async (images) => {
    if (!images || images.length === 0) {
      return [];
    }

    const pendingImages = images.filter(
      (img) => img.uploadStatus === "pending" || img.uploadStatus === "error"
    );

    if (pendingImages.length === 0) {
      // Return already uploaded images
      return images
        .filter((img) => img.uploadStatus === "completed")
        .map((img) => ({
          id: img.id,
          url: img.uploadUrl || img.preview,
          originalName: img.file.name,
        }));
    }

    setIsUploading(true);
    const results = [];

    try {
      // Upload images one by one with progress tracking
      for (let i = 0; i < pendingImages.length; i++) {
        const image = pendingImages[i];

        if (!isMountedRef.current) {
          throw new Error("Component unmounted during upload");
        }

        try {
          const uploadResult = await imageUploadApi.uploadImage(
            image.file,
            (progress) => {
              if (isMountedRef.current) {
                setUploadProgress((prev) => ({
                  ...prev,
                  [image.id]: progress,
                }));
              }
            }
          );

          results.push({
            id: image.id,
            url: uploadResult.url,
            originalName: uploadResult.originalName,
            uploadSuccess: true,
          });

          // Update progress to 100% for completed upload
          if (isMountedRef.current) {
            setUploadProgress((prev) => ({
              ...prev,
              [image.id]: 100,
            }));
          }
        } catch (uploadError) {
          results.push({
            id: image.id,
            error: uploadError.message,
            uploadSuccess: false,
            file: image.file,
          });
        }
      }

      // Add already uploaded images to results
      const alreadyUploaded = images
        .filter((img) => img.uploadStatus === "completed")
        .map((img) => ({
          id: img.id,
          url: img.uploadUrl || img.preview,
          originalName: img.file.name,
          uploadSuccess: true,
        }));

      return [...alreadyUploaded, ...results];
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Submits content for generation and processing with enhanced error handling
   * @param {string} text - Text content
   * @param {Array} images - Array of image objects
   * @param {Object} options - Submission options
   * @returns {Promise<Object>} Submission result
   */
  const submit = useCallback(
    async (text, images = [], submissionOptions = {}) => {
      if (loadingState.isLoading) {
        return { success: false, error: "Submission already in progress" };
      }

      // Store submission data for retry functionality
      const submissionData = { text, images, options: submissionOptions };

      // Clear previous state
      setSubmissionError(null);
      setSubmissionResult(null);
      setIsSuccess(false);
      setSuccessMessage("");
      setUploadResults([]);
      setUploadProgress({});

      // Validate submission data
      const validation = validateSubmissionData(text, images);
      if (!validation.isValid) {
        const error = enhanceError(new Error("Validation failed"), {
          type: "validation",
          details: validation.errors,
        });

        setSubmissionError(error);

        if (onError) {
          onError(error);
        }

        return { success: false, error };
      }

      // Start main submission operation
      const mainOperation = loadingState.startOperation("submission", {
        type: LoadingType.SUBMIT,
        message: "Submitting content...",
        cancellable: true,
      });

      try {
        // Single step: send multipart/form-data per backend contract
        const generationOperation = loadingState.startOperation(
          "content-generation",
          {
            type: LoadingType.PROCESS,
            message: "Generating content...",
            cancellable: false,
          }
        );

        let generationResult;

        try {
          generationResult = await contentApi.generateContentViaForm(
            text,
            images
          );
          generationOperation.complete(generationResult);
        } catch (generationError) {
          generationOperation.fail(generationError);
          const enhancedError = enhanceError(generationError, {
            type: "processing",
            context: "content_generation_phase",
          });

          setSubmissionError(enhancedError);

          if (onError) {
            onError(enhancedError);
          }

          return { success: false, error: enhancedError };
        }

        // Step 2: Save content (optional)
        let saveResult = null;
        if (submissionOptions.saveContent !== false) {
          const saveOperation = loadingState.startOperation("content-save", {
            type: LoadingType.SAVE,
            message: "Saving content...",
            cancellable: false,
          });

          try {
            const contentToSave = {
              text,
              imageIds: [], // not used with direct form submit; backend may return ids in generationResult
              generatedContent: generationResult,
              metadata: {
                submittedAt: new Date().toISOString(),
                imageCount: Array.isArray(images) ? images.length : 0,
                characterCount: text.length,
              },
            };

            saveResult = await contentApi.saveContent(contentToSave);
            saveOperation.complete(saveResult);
          } catch (saveError) {
            // Saving is optional, so we don't fail the entire submission
            console.warn("Failed to save content:", saveError);
            saveOperation.fail(saveError);
          }
        }

        // Success!
        const result = {
          success: true,
          generatedContent: generationResult,
          uploadedImages: Array.isArray(images) ? images : [],
          savedContent: saveResult,
          timestamp: new Date().toISOString(),
        };

        setSubmissionResult(result);
        setIsSuccess(true);
        setSuccessMessage("Content submitted successfully!");
        mainOperation.complete(result);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        const enhancedError = enhanceError(error, {
          type: "submission",
          context: "main_submission_flow",
          submissionData,
        });

        setSubmissionError(enhancedError);
        mainOperation.fail(enhancedError);

        if (onError) {
          onError(enhancedError);
        }

        return { success: false, error: enhancedError };
      }
    },
    [
      loadingState,
      validateSubmissionData,
      uploadPendingImages,
      uploadImagesFirst,
      onSuccess,
      onError,
    ]
  );

  /**
   * Retries a failed submission with enhanced error recovery
   * @param {string} text - Text content
   * @param {Array} images - Array of image objects
   * @param {Object} options - Retry options
   * @returns {Promise<Object>} Retry result
   */
  const retry = useCallback(
    async (text, images = [], retryOptions = {}) => {
      // Clear error state before retry
      setSubmissionError(null);

      try {
        return await submit(text, images, retryOptions);
      } catch (error) {
        const enhancedError = enhanceError(error, {
          type: "retry",
          context: "submission_retry",
        });

        setSubmissionError(enhancedError);
        throw enhancedError;
      }
    },
    [submit]
  );

  /**
   * Executes error recovery action
   * @param {string} action - Recovery action to execute
   * @param {Object} context - Recovery context
   * @returns {Promise<boolean>} Success status
   */
  const executeRecovery = useCallback(
    async (action, context = {}) => {
      try {
        return await recoveryManager.executeRecovery(
          submissionError,
          action,
          context
        );
      } catch (error) {
        console.error("Recovery action failed:", error);
        return false;
      }
    },
    [recoveryManager, submissionError]
  );

  /**
   * Resets all submission state
   */
  const reset = useCallback(() => {
    loadingState.cancelAll();
    loadingState.clearCompleted();
    setSubmissionResult(null);
    setSubmissionError(null);
    setUploadResults([]);
    setUploadProgress({});
    setIsSuccess(false);
    setSuccessMessage("");
  }, [loadingState]);

  /**
   * Cancels ongoing submission operations
   */
  const cancel = useCallback(() => {
    loadingState.cancelAll();
    setSubmissionError(
      enhanceError(new Error("Submission cancelled by user"), {
        type: "cancellation",
        context: "user_initiated",
      })
    );
  }, [loadingState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Computed values
  const isLoading = loadingState.isLoading;
  const canSubmit = !isLoading;
  const hasError = submissionError !== null;
  const hasResult = submissionResult !== null;

  // Get current operation phase
  const getCurrentPhase = () => {
    const activeOps = loadingState.activeOperations;
    if (activeOps.length === 0) return "idle";

    const currentOp = activeOps[activeOps.length - 1]; // Get most recent operation
    switch (currentOp.type) {
      case LoadingType.UPLOAD:
        return "uploading";
      case LoadingType.PROCESS:
        return "generating";
      case LoadingType.SAVE:
        return "saving";
      case LoadingType.SUBMIT:
        return "submitting";
      default:
        return "processing";
    }
  };

  const enhancedLoadingState = {
    ...loadingState,
    phase: getCurrentPhase(),
    canSubmit,
    hasError,
    hasResult,
  };

  return {
    // State
    isSubmitting: loadingState.isOperationLoading("submission"),
    isUploading: loadingState.isOperationLoading("image-upload"),
    isGenerating: loadingState.isOperationLoading("content-generation"),
    isSaving: loadingState.isOperationLoading("content-save"),
    isLoading,
    isSuccess,
    canSubmit,
    hasError,
    hasResult,

    // Results and errors
    submissionResult,
    submissionError,
    uploadResults,
    uploadProgress,
    successMessage,

    // Enhanced loading state details
    loadingState: enhancedLoadingState,

    // Actions
    submit,
    retry,
    executeRecovery,
    reset,
    cancel,

    // Validation
    validateSubmissionData,

    // Recovery manager
    recoveryManager,
  };
};

export default useContentSubmission;

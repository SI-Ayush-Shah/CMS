/**
 * Custom hook for managing image upload state and functionality
 * Handles image selection, validation, preview generation, and upload progress
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  validateMultipleFiles,
  validateFile,
  MAX_IMAGES,
  MAX_FILE_SIZE,
} from "../utils/fileValidation";
import {
  generateMultiplePreviews,
  generateFileId,
  revokeObjectUrls,
} from "../utils/imageProcessing";
import { imageUploadApi } from "../services/imageUploadApi";

/**
 * Custom hook for image upload functionality
 * @param {Object} options - Configuration options
 * @param {number} options.maxImages - Maximum number of images allowed
 * @param {number} options.maxFileSize - Maximum file size in bytes
 * @param {Function} options.onError - Error callback function
 * @param {Function} options.onSuccess - Success callback function
 * @param {boolean} options.testMode - Test mode for deterministic behavior
 * @param {boolean} options.testShouldSucceed - Whether uploads should succeed in test mode
 * @returns {Object} Hook return object with state and functions
 */
export const useImageUpload = (options = {}) => {
  const {
    maxImages = MAX_IMAGES,
    maxFileSize = MAX_FILE_SIZE,
    onError = null,
    onSuccess = null,
    testMode = false,
    testShouldSucceed = true,
  } = options;

  // State for managing images and their metadata
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Ref to track mounted state for cleanup
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Revoke all object URLs to prevent memory leaks
      const previewUrls = images
        .map((img) => img.preview)
        .filter((url) => url && url.startsWith("blob:"));
      revokeObjectUrls(previewUrls);
    };
  }, [images]);

  /**
   * Adds new images to the current collection with validation
   * @param {FileList|File[]} newFiles - Files to add
   */
  const addImages = useCallback(
    async (newFiles) => {
      if (!newFiles || newFiles.length === 0) {
        return;
      }

      // Clear previous errors
      setErrors([]);

      try {
        // Check if adding these files would exceed the maximum
        const totalAfterAdd = images.length + newFiles.length;
        const filesToProcess =
          totalAfterAdd > maxImages
            ? Array.from(newFiles).slice(0, maxImages - images.length)
            : Array.from(newFiles);

        if (totalAfterAdd > maxImages) {
          const maxExceededError = {
            type: "max-images",
            message: `Cannot add ${newFiles.length} images. Maximum ${maxImages} images allowed. Adding first ${filesToProcess.length} images.`,
          };
          setErrors((prev) => [...prev, maxExceededError]);

          if (onError) {
            onError(maxExceededError);
          }
        }

        // Validate files
        const validation = validateMultipleFiles(filesToProcess, maxImages);

        if (validation.errors.length > 0) {
          setErrors((prev) => [...prev, ...validation.errors]);

          if (onError) {
            validation.errors.forEach((error) => onError(error));
          }
        }

        // Process valid files
        if (validation.validFiles.length > 0) {
          // Generate previews for valid files
          const previewResults = await generateMultiplePreviews(
            validation.validFiles
          );

          // Create image objects with metadata
          const newImageObjects = previewResults
            .filter((result) => result.success)
            .map((result) => ({
              id: result.id,
              file: result.file,
              preview: result.preview,
              uploadStatus: "pending",
              uploadProgress: 0,
              error: null,
              addedAt: new Date().toISOString(),
            }));

          // Update images state
          setImages((prev) => [...prev, ...newImageObjects]);

          // Handle preview generation errors
          const previewErrors = previewResults
            .filter((result) => !result.success)
            .map((result) => ({
              type: "preview-generation",
              message: `Failed to generate preview for ${result.file.name}: ${result.error}`,
              fileName: result.file.name,
            }));

          if (previewErrors.length > 0) {
            setErrors((prev) => [...prev, ...previewErrors]);

            if (onError) {
              previewErrors.forEach((error) => onError(error));
            }
          }

          // Call success callback if provided
          if (onSuccess && newImageObjects.length > 0) {
            onSuccess({
              addedCount: newImageObjects.length,
              totalCount: images.length + newImageObjects.length,
              addedImages: newImageObjects,
            });
          }
        }
      } catch (error) {
        const processingError = {
          type: "processing-error",
          message: `Failed to process images: ${error.message}`,
        };

        setErrors((prev) => [...prev, processingError]);

        if (onError) {
          onError(processingError);
        }
      }
    },
    [images, maxImages, onError, onSuccess]
  );

  /**
   * Removes an image by its ID
   * @param {string} imageId - ID of the image to remove
   */
  const removeImage = useCallback((imageId) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);

      if (imageToRemove) {
        // Revoke the object URL to prevent memory leaks
        if (
          imageToRemove.preview &&
          imageToRemove.preview.startsWith("blob:")
        ) {
          revokeObjectUrls(imageToRemove.preview);
        }

        // Remove from upload progress tracking
        setUploadProgress((prevProgress) => {
          const newProgress = { ...prevProgress };
          delete newProgress[imageId];
          return newProgress;
        });

        // Clear any errors related to this image
        setErrors((prevErrors) =>
          prevErrors.filter(
            (error) => !error.imageId || error.imageId !== imageId
          )
        );
      }

      return prev.filter((img) => img.id !== imageId);
    });
  }, []);

  /**
   * Removes an image by its index
   * @param {number} index - Index of the image to remove
   */
  const removeImageByIndex = useCallback(
    (index) => {
      if (index >= 0 && index < images.length) {
        const imageToRemove = images[index];
        removeImage(imageToRemove.id);
      }
    },
    [images, removeImage]
  );

  /**
   * Clears all images
   */
  const clearAllImages = useCallback(() => {
    // Revoke all object URLs
    const previewUrls = images
      .map((img) => img.preview)
      .filter((url) => url && url.startsWith("blob:"));
    revokeObjectUrls(previewUrls);

    // Clear state
    setImages([]);
    setUploadProgress({});
    setErrors([]);
  }, [images]);

  /**
   * Mock upload function for individual image
   * @param {Object} imageObject - Image object to upload
   * @returns {Promise<string>} - Promise that resolves to upload result
   */
  const uploadSingleImage = useCallback(
    async (imageObject) => {
      if (testMode) {
        // Preserve deterministic behavior for tests
        return new Promise((resolve, reject) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 20;
            if (!isMountedRef.current) {
              clearInterval(interval);
              reject(new Error("Component unmounted"));
              return;
            }
            setUploadProgress((prev) => ({
              ...prev,
              [imageObject.id]: Math.min(progress, 100),
            }));
            if (progress >= 100) {
              clearInterval(interval);
              if (testShouldSucceed) resolve(`mock-url-${imageObject.id}`);
              else reject(new Error("Mock upload failure"));
            }
          }, 100);
        });
      }

      // Real upload via backend
      const result = await imageUploadApi.uploadImage(
        imageObject.file,
        (progress) => {
          if (!isMountedRef.current) return;
          setUploadProgress((prev) => ({
            ...prev,
            [imageObject.id]: Math.min(progress, 100),
          }));
        }
      );
      return result.url;
    },
    [testMode, testShouldSucceed]
  );

  /**
   * Uploads all pending images
   * @returns {Promise<Array>} - Promise that resolves to array of upload results
   */
  const uploadImages = useCallback(async () => {
    const pendingImages = images.filter(
      (img) => img.uploadStatus === "pending"
    );

    if (pendingImages.length === 0) {
      return [];
    }

    setIsUploading(true);

    try {
      // Update status to uploading
      setImages((prev) =>
        prev.map((img) =>
          pendingImages.some((pending) => pending.id === img.id)
            ? { ...img, uploadStatus: "uploading" }
            : img
        )
      );

      // Upload all images concurrently
      const uploadPromises = pendingImages.map(async (imageObject) => {
        try {
          const uploadUrl = await uploadSingleImage(imageObject);

          // Update image status to completed
          setImages((prev) =>
            prev.map((img) =>
              img.id === imageObject.id
                ? { ...img, uploadStatus: "completed", uploadUrl, error: null }
                : img
            )
          );

          return {
            id: imageObject.id,
            success: true,
            url: uploadUrl,
            file: imageObject.file,
          };
        } catch (error) {
          // Update image status to error
          setImages((prev) =>
            prev.map((img) =>
              img.id === imageObject.id
                ? { ...img, uploadStatus: "error", error: error.message }
                : img
            )
          );

          const uploadError = {
            type: "upload-error",
            message: `Failed to upload ${imageObject.file.name}: ${error.message}`,
            imageId: imageObject.id,
            fileName: imageObject.file.name,
          };

          setErrors((prev) => [...prev, uploadError]);

          return {
            id: imageObject.id,
            success: false,
            error: error.message,
            file: imageObject.file,
          };
        }
      });

      const results = await Promise.all(uploadPromises);

      return results;
    } finally {
      setIsUploading(false);
    }
  }, [images, uploadSingleImage]);

  /**
   * Retries upload for a specific image
   * @param {string} imageId - ID of the image to retry
   */
  const retryUpload = useCallback(
    async (imageId) => {
      const imageToRetry = images.find((img) => img.id === imageId);

      if (!imageToRetry || imageToRetry.uploadStatus !== "error") {
        return;
      }

      // Reset image status
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, uploadStatus: "pending", error: null }
            : img
        )
      );

      // Clear related errors
      setErrors((prev) => prev.filter((error) => error.imageId !== imageId));

      // Retry upload
      try {
        await uploadSingleImage(imageToRetry);
      } catch (error) {
        // Error handling is done in uploadSingleImage
      }
    },
    [images, uploadSingleImage]
  );

  /**
   * Gets validation status for current images
   * @returns {Object} - Validation status object
   */
  const getValidationStatus = useCallback(() => {
    const hasErrors = errors.length > 0;
    const hasImages = images.length > 0;
    const allUploaded = images.every((img) => img.uploadStatus === "completed");
    const hasFailedUploads = images.some((img) => img.uploadStatus === "error");

    return {
      isValid: hasImages && !hasErrors,
      hasImages,
      hasErrors,
      allUploaded,
      hasFailedUploads,
      imageCount: images.length,
      errorCount: errors.length,
    };
  }, [images, errors]);

  // Return hook interface
  return {
    // State
    images,
    uploadProgress,
    errors,
    isUploading,

    // Actions
    addImages,
    removeImage,
    removeImageByIndex,
    clearAllImages,
    uploadImages,
    retryUpload,

    // Computed values
    imageCount: images.length,
    canAddMore: images.length < maxImages,
    remainingSlots: Math.max(0, maxImages - images.length),
    validationStatus: getValidationStatus(),

    // Configuration
    maxImages,
    maxFileSize,
  };
};

export default useImageUpload;

/**
 * Enhanced AI Chat Input Component
 *
 * An enhanced version of the AiChatInput component that includes:
 * - Text input with character counting and validation
 * - Image upload functionality with drag-and-drop
 * - Real-time validation feedback
 * - Error display and management
 * - Maintains the existing StarBorder styling
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import StarBorder from "./StarBorder";
import { ValidationDisplay } from "./ValidationDisplay";
import { useTextInput } from "../hooks/useTextInput";
import { useImageUpload } from "../hooks/useImageUpload";
import { useValidation } from "../hooks/useValidation";
import { useAutoResize } from "../hooks/useAutoResize";
import { useAccessibility } from "../hooks/useAccessibility";

/**
 * Enhanced AI Chat Input Component
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {string} props.placeholder - Placeholder text for textarea
 * @param {number} props.maxLength - Maximum character limit for text
 * @param {number} props.maxImages - Maximum number of images
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {Object} props.validationOptions - Options for validation
 */
export const EnhancedAiChatInput = ({
  onSubmit,
  placeholder = "Your blog crafting experience starts here...",
  maxLength = 5000,
  maxImages = 10,
  disabled = false,
  validationOptions = {},
}) => {
  // Refs
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // State for UI interactions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGlobalDragOver, setIsGlobalDragOver] = useState(false);
  const [, setDragCounter] = useState(0);
  const [thumbOverlayRect, setThumbOverlayRect] = useState(null);

  const updateThumbOverlayRect = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const stripHeight = 64; // approximate thumbnail strip height
    const top = Math.max(8, rect.top - stripHeight - 8);
    setThumbOverlayRect({
      top,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    updateThumbOverlayRect();
  }, [updateThumbOverlayRect]);

  useEffect(() => {
    const onResize = () => updateThumbOverlayRect();
    const onScroll = () => updateThumbOverlayRect();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [updateThumbOverlayRect]);

  // Accessibility hook
  const { announce, createKeyboardHandler } = useAccessibility({
    announceChanges: true,
    manageFocus: true,
  });

  // Custom hooks
  const {
    text,
    setText,
    characterCount,
    isValid: isTextValid,
    isAtWarning,
    isAtLimit,
    warningMessage,
    clearText,
  } = useTextInput({
    maxLength,
    warningThreshold: 0.8,
  });

  const { images, addImages, removeImage, clearAllImages, imageCount } =
    useImageUpload({
      maxImages,
      onError: (error) => {
        handleValidationError("image", error);
      },
    });

  const {
    errors,
    warnings,
    allErrors,
    allWarnings,
    hasErrors,
    hasWarnings,
    validateForm,
    clearErrors,
    clearWarnings,
    handleSubmissionError,
  } = useValidation();

  // Auto-resize functionality
  useAutoResize(textareaRef, text);

  /**
   * Handles validation errors from various sources
   */
  const handleValidationError = useCallback(
    (category, error) => {
      // This will be handled by the validation hook
      console.log(`Validation error in ${category}:`, error);
      // Announce error to screen readers
      announce(`Error in ${category}: ${error.message || error}`, "assertive");
    },
    [announce]
  );

  // Recompute overlay rect when image count changes
  useEffect(() => {
    updateThumbOverlayRect();
  }, [imageCount, updateThumbOverlayRect]);

  /**
   * File selection via hidden input
   */
  const handleFileSelect = useCallback(
    (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        addImages(files);
      }
      // reset to allow re-selecting same files
      event.target.value = "";
    },
    [addImages]
  );

  const openFileDialog = useCallback(() => {
    if (disabled || isSubmitting) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isSubmitting]);

  /**
   * Global drag & drop handlers so you can drop anywhere on the page
   */
  useEffect(() => {
    const onDragEnter = (event) => {
      event.preventDefault();
      event.stopPropagation();
      // Only react to file drags
      const hasFiles = Array.from(event.dataTransfer?.items || []).some(
        (i) => i.kind === "file"
      );
      if (disabled || isSubmitting || !hasFiles) return;
      setDragCounter((prev) => prev + 1);
      setIsGlobalDragOver(true);
    };

    const onDragOver = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled || isSubmitting) return;
      event.dataTransfer.dropEffect = "copy";
    };

    const onDragLeave = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled || isSubmitting) return;
      setDragCounter((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) setIsGlobalDragOver(false);
        return next;
      });
    };

    const onDrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled || isSubmitting) return;
      setIsGlobalDragOver(false);
      setDragCounter(0);
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        addImages(files);
      }
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [addImages, disabled, isSubmitting]);

  /**
   * Handles text change with real-time validation
   */
  const handleTextChange = useCallback(
    (event) => {
      const newText = event.target.value;
      setText(newText);

      // Clear text errors when user starts typing
      if (errors.text.length > 0) {
        clearErrors("text");
      }
    },
    [setText, errors.text, clearErrors]
  );

  // (Inline image change handler not needed: global drop & picker already announce and validate on submit)

  /**
   * Toggles image upload zone visibility
   */
  const toggleImageUpload = useCallback(() => {
    // Repurpose shortcut to open file dialog per new UX
    openFileDialog();
    announce("File picker opened");
  }, [openFileDialog, announce]);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (disabled) return; // disabled driven by parent state

    // Guard to prevent duplicate calls from rapid keypress/click
    setIsSubmitting(true);

    try {
      // Validate the form
      const validation = await validateForm(
        { text, images },
        {
          textOptions: {
            required: true,
            maxLength,
            ...validationOptions.text,
          },
          imageOptions: {
            maxImages,
            ...validationOptions.images,
          },
        }
      );

      if (!validation.isValid) {
        // Validation errors are already handled by the validation hook
        return;
      }

      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit({
          text: text.trim(),
          images,
          metadata: {
            characterCount,
            imageCount,
            timestamp: new Date().toISOString(),
          },
        });

        // Clear form on successful submission
        clearText();
        clearAllImages();
        clearErrors("all");
        clearWarnings("all");

        // Announce successful submission
        announce("Content submitted successfully");
      }
    } catch (error) {
      handleSubmissionError(error, "form submission");
      // Announce submission error
      announce(`Submission failed: ${error.message}`, "assertive");
    } finally {
      // Always release lock
      setIsSubmitting(false);
    }
  }, [
    disabled,
    isSubmitting,
    validateForm,
    text,
    images,
    maxLength,
    maxImages,
    validationOptions,
    onSubmit,
    characterCount,
    imageCount,
    clearText,
    clearAllImages,
    clearErrors,
    clearWarnings,
    handleSubmissionError,
    announce,
  ]);

  /**
   * Handles key press events using accessibility hook
   */
  const handleKeyPress = createKeyboardHandler({
    custom: (event, key, modifiers) => {
      // Enter behavior: Enter submits, Shift+Enter makes a new line
      if (key === "Enter") {
        if (modifiers.shiftKey) {
          // Allow default newline
          return;
        }
        event.preventDefault();
        handleSubmit();
        return;
      }

      // Submit on Ctrl/Cmd + Enter
      if ((modifiers.ctrlKey || modifiers.metaKey) && key === "Enter") {
        event.preventDefault();
        handleSubmit();
      }

      // Open file picker with Alt + I
      if (modifiers.altKey && key.toLowerCase() === "i") {
        event.preventDefault();
        toggleImageUpload();
      }
    },
  });

  /**
   * Dismisses validation messages
   */
  const handleDismissValidation = useCallback(
    (item, index, type) => {
      if (type === "error") {
        // Find which category this error belongs to
        Object.keys(errors).forEach((category) => {
          if (errors[category].includes(item)) {
            clearErrors(category);
          }
        });
      } else if (type === "warning") {
        // Find which category this warning belongs to
        Object.keys(warnings).forEach((category) => {
          if (warnings[category].includes(item)) {
            clearWarnings(category);
          }
        });
      }
    },
    [errors, warnings, clearErrors, clearWarnings]
  );

  // Calculate if form can be submitted
  const canSubmit =
    isTextValid && !hasErrors && !isSubmitting && text.trim().length > 0;

  return (
    <StarBorder
      as="div"
      className="w-full h-full"
      color="var(--color-core-prim-300)"
      speed="6s"
      thickness={0}
    >
      <div
        ref={containerRef}
        className="relative backdrop-blur-[20px]  backdrop-filter bg-core-neu-1000/40 w-full h-full flex flex-col justify-between p-4 rounded-[15px] border-none"
        role="form"
        aria-label="Content creation form"
      >
        <div className="inset-[2px] -z-1 bg-black absolute rounded-xl"></div>
        {/* Hidden file input for selecting multiple images */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />

        {imageCount > 0 && thumbOverlayRect && (
          <div className="w-full mb-4  bg-core-neu-1000/80 backdrop-blur rounded-xl border border-core-prim-300/20 p-2 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-invert-low">
                Selected Images ({imageCount}/{maxImages})
              </div>
              <button
                onClick={clearAllImages}
                className="text-[11px] text-error-500 hover:text-error-400 focus:outline-none focus:ring-2 focus:ring-error-500 rounded px-1"
                type="button"
                aria-label="Clear all images"
              >
                Clear All
              </button>
            </div>
            <div
              className="flex gap-2 overflow-x-auto"
              role="list"
              aria-label="Selected image thumbnails"
            >
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  role="listitem"
                  className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden border border-core-prim-300/20"
                >
                  <img
                    src={img.preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error-500 text-white flex items-center justify-center"
                    aria-label={`Remove image ${idx + 1}`}
                    type="button"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global drag overlay */}
        {isGlobalDragOver && (
          <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative pointer-events-none flex flex-col items-center justify-center border-2 border-dashed border-core-prim-400 rounded-2xl px-6 py-5 bg-core-neu-1000/70 text-invert-high">
              <svg
                className="w-8 h-8 mb-2 text-core-prim-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="text-sm font-medium">Drop images to add</div>
              <div className="text-xs text-invert-low">
                You can drop anywhere on this page
              </div>
            </div>
          </div>
        )}

        {/* Validation Messages */}
        {(hasErrors || hasWarnings) && (
          <div className="mb-3">
            <ValidationDisplay
              errors={allErrors}
              warnings={allWarnings}
              dismissible={true}
              onDismiss={handleDismissValidation}
              className="max-h-32 overflow-y-auto"
            />
          </div>
        )}

        {/* Main input area */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Text input area */}
          <div className="flex flex-wrap gap-2 items-start justify-between min-h-7 px-2 py-0 rounded-xl w-full">
            <textarea
              ref={textareaRef}
              className="font-normal text-[14px] text-invert-low w-full h-full bg-transparent border-none outline-none resize-none placeholder:text-invert-low min-h-[80px] focus:ring-0 focus:ring-offset-0"
              placeholder={placeholder}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyPress}
              disabled={disabled || isSubmitting}
              style={{ lineHeight: "normal" }}
              aria-label="Content input. Press Enter to submit, Shift+Enter for new line, Alt+I to add photos"
              aria-describedby="character-count validation-messages keyboard-shortcuts"
              aria-required="true"
              aria-invalid={hasErrors ? "true" : "false"}
            />
          </div>

          {/* Character count display */}
          <div className="px-2">
            <div
              id="character-count"
              className={`text-xs text-right ${
                isAtLimit
                  ? "text-error-500"
                  : isAtWarning
                    ? "text-warning-500"
                    : "text-invert-low"
              }`}
              aria-live="polite"
              role="status"
              aria-label={`Character count: ${characterCount} of ${maxLength} characters used${warningMessage ? `. ${warningMessage}` : ""}`}
            >
              {characterCount}/{maxLength}
              {warningMessage && (
                <span className="ml-2">({warningMessage})</span>
              )}
            </div>
          </div>

          {/* Inline upload zone removed in favor of global drag & drop and file picker */}
        </div>

        {/* Bottom buttons */}
        <div className="flex flex-wrap gap-2 items-center justify-between min-h-7 p-0 rounded-xl w-full mt-3">
          {/* Add Photos button opens native file picker */}
          <button
            onClick={openFileDialog}
            disabled={disabled || isSubmitting}
            className={`flex gap-2 items-center justify-center min-h-7 min-w-7 p-[4px] rounded-2xl shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-core-prim-500 focus:ring-offset-2 ${"hover:bg-core-prim-500/10"} ${
              disabled || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            aria-label={`Add photos. Opens file picker. Press Alt+I as shortcut.`}
            aria-describedby="image-upload-help"
            type="button"
          >
            <div className="flex items-center justify-center p-0 rounded-lg shrink-0">
              <div className="relative shrink-0 size-4">
                <svg
                  className="w-full h-full text-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  />
                </svg>
              </div>
            </div>
            <div className="font-normal text-current text-[12px] whitespace-nowrap">
              Add Photos
              {imageCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-core-prim-500 text-white text-[10px] rounded-full">
                  {imageCount}
                </span>
              )}
            </div>
          </button>

          {/* Generate button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`bg-core-prim-500 text-invert-high flex gap-1 items-center justify-center px-3 py-2 rounded-2xl shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-core-prim-500 focus:ring-offset-2 ${
              canSubmit
                ? "hover:bg-core-prim-600 active:bg-core-prim-700 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            aria-label={`Generate content${isSubmitting ? " (submitting...)" : canSubmit ? ". Press Ctrl+Enter as shortcut." : " (form incomplete)"}`}
            aria-describedby="submit-help"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <div className="flex items-center justify-center p-0 rounded-lg shrink-0">
                  <span className="inline-block size-4 rounded-full border-2 border-invert-high border-t-transparent animate-spin" />
                </div>
                <div className="font-normal text-invert-high text-[14px]">
                  Generating...
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center p-0 rounded-lg shrink-0">
                  <div className="relative shrink-0 size-4">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="font-normal text-invert-high text-[14px]">
                  Generate
                </div>
              </>
            )}
          </button>
        </div>

        {/* Keyboard shortcuts help */}
        <div
          id="keyboard-shortcuts"
          className="sr-only"
          aria-label="Keyboard shortcuts"
        >
          Press Enter to submit content. Press Shift+Enter for a new line. Press
          Alt+I to add photos.
        </div>

        {/* Help text for buttons */}
        <div id="image-upload-help" className="sr-only">
          Toggle image upload area. You can also use Alt+I keyboard shortcut.
        </div>

        <div id="submit-help" className="sr-only">
          Submit the form to generate content. You can also use Ctrl+Enter
          keyboard shortcut.
        </div>

        <div id="image-upload-instructions" className="sr-only">
          Drag and drop images or click to select files. Maximum {maxImages}{" "}
          images allowed.
        </div>

        {/* Visual keyboard shortcut hint */}
        {text.length > 0 && !isSubmitting && (
          <div
            className="text-xs text-invert-low/60 text-center mt-2"
            aria-hidden="true"
          >
            Press Enter to generate, Shift+Enter for new line
          </div>
        )}
      </div>
    </StarBorder>
  );
};

export default EnhancedAiChatInput;

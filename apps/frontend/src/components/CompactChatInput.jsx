import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTextInput } from '../hooks/useTextInput';
import { useImageUpload } from '../hooks/useImageUpload';
import { useValidation } from '../hooks/useValidation';
import { useAccessibility } from '../hooks/useAccessibility';
import StarBorder from './StarBorder';

const CompactChatInput = ({ 
  placeholder = "Your blog crafting experience starts here...",
  maxLength = 2000,
  maxImages = 10,
  validationOptions = {},
  onSubmit = () => {},
  className = "",
  disabled = false
}) => {
  // Refs
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // State for UI interactions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGlobalDragOver, setIsGlobalDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

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
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, 200); // Max height of 200px
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  /**
   * Handles validation errors from various sources
   */
  const handleValidationError = useCallback(
    (category, error) => {
      console.log(`Validation error in ${category}:`, error);
      announce(`Error in ${category}: ${error.message || error}`, "assertive");
    },
    [announce]
  );

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
      if (errors.text && errors.text.length > 0) {
        clearErrors("text");
      }
    },
    [setText, errors.text, clearErrors]
  );

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    if (disabled) return;

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

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = '44px';
        }

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
        openFileDialog();
      }
    },
  });

  // Calculate if form can be submitted
  const canSubmit =
    isTextValid && !hasErrors && !isSubmitting && text.trim().length > 0;

  return (
    <StarBorder
      as="div"
      className="w-full h-[110px]"
      color="var(--color-core-prim-300)"
      speed="6s"
      thickness={0}
    >
      <div className={`rounded-2xl bg-button-filled-main-default border border-core-prim-300/20 p-3 h-full transition-all duration-200 ${className}`}>
        {/* Hidden file input for image uploads */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload images"
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Text Input Area */}
          <div className="flex-1">
            {/* Image Previews */}
            {images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <div key={image.id || index} className="relative group">
                    <img
                      src={image.preview || URL.createObjectURL(image.file)}
                      alt={`Uploaded image ${index + 1}`}
                      className="w-8 h-8 object-cover rounded-lg border border-core-prim-300/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id || index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={disabled || isSubmitting}
              className="w-full bg-transparent text-invert-low placeholder-invert-low resize-none outline-none text-[14px] leading-5"
              style={{ 
                height: '44px',
                minHeight: '44px',
                maxHeight: '200px'
              }}
              rows={1}
              aria-label="Content input"
            />
          </div>

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between">
            {/* Left side - Attachment and character count */}
            <div className="flex items-center gap-3">
              {/* Attachment button */}
              <button
                type="button"
                onClick={openFileDialog}
                disabled={disabled || isSubmitting}
                className="flex items-center gap-2 text-invert-low hover:text-invert-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload images"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-[12px]">Cover Image</span>
                {imageCount > 0 && (
                  <span className="text-[10px] bg-core-prim-500 text-white px-1.5 py-0.5 rounded-full">
                    {imageCount}
                  </span>
                )}
              </button>

              {/* Character count */}
              <span className={`text-[11px] ${
                isAtLimit ? 'text-error-500' : 
                isAtWarning ? 'text-warning-500' : 
                'text-invert-low'
              }`}>
                {characterCount}/{maxLength}
              </span>
            </div>

            {/* Right side - Send button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                canSubmit 
                  ? 'bg-core-prim-500 text-white hover:bg-core-prim-400 cursor-pointer' 
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Submit content"
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>

        {/* Global drag overlay indicator */}
        {isGlobalDragOver && (
          <div className="fixed inset-0 bg-core-prim-500/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-core-neu-1000/90 text-white p-6 rounded-lg border-2 border-dashed border-core-prim-300">
              <p className="text-lg font-medium">Drop images here to upload</p>
            </div>
          </div>
        )}
      </div>
    </StarBorder>
  );
};

export default CompactChatInput; 
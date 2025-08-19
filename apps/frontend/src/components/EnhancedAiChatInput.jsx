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

import React, { useState, useCallback, useRef, useEffect } from 'react'
import StarBorder from './StarBorder'
import { ImageUploadZone } from './ImageUploadZone'
import { ValidationDisplay } from './ValidationDisplay'
import { useTextInput } from '../hooks/useTextInput'
import { useImageUpload } from '../hooks/useImageUpload'
import { useValidation } from '../hooks/useValidation'
import { useAutoResize } from '../hooks/useAutoResize'
import { useAccessibility } from '../hooks/useAccessibility'

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
  maxLength = 2000,
  maxImages = 10,
  disabled = false,
  validationOptions = {},
  ...props
}) => {
  // Refs
  const textareaRef = useRef(null)
  
  // State for UI interactions
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)

  // Accessibility hook
  const { 
    announce, 
    createKeyboardHandler, 
    createAriaAttributes,
    manageFocusTo 
  } = useAccessibility({
    announceChanges: true,
    manageFocus: true
  })

  // Custom hooks
  const {
    text,
    setText,
    characterCount,
    remainingCharacters,
    isValid: isTextValid,
    isAtWarning,
    isAtLimit,
    warningMessage,
    clearText
  } = useTextInput({
    maxLength,
    warningThreshold: 0.8
  })

  const {
    images,
    addImages,
    removeImage,
    clearAllImages,
    canAddMore,
    remainingSlots,
    imageCount,
    errors: imageUploadErrors
  } = useImageUpload({
    maxImages,
    onError: (error) => {
      handleValidationError('image', error)
    }
  })

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
    handleNetworkError
  } = useValidation()

  // Auto-resize functionality
  useAutoResize(textareaRef, text)

  /**
   * Handles validation errors from various sources
   */
  const handleValidationError = useCallback((category, error) => {
    // This will be handled by the validation hook
    console.log(`Validation error in ${category}:`, error)
    // Announce error to screen readers
    announce(`Error in ${category}: ${error.message || error}`, 'assertive')
  }, [announce])

  /**
   * Handles text change with real-time validation
   */
  const handleTextChange = useCallback((event) => {
    const newText = event.target.value
    setText(newText)
    
    // Clear text errors when user starts typing
    if (errors.text.length > 0) {
      clearErrors('text')
    }
  }, [setText, errors.text, clearErrors])

  /**
   * Handles image changes with validation
   */
  const handleImagesChange = useCallback((newImages) => {
    // Clear image errors when images change
    if (errors.image.length > 0) {
      clearErrors('image')
    }
    
    // Announce image changes to screen readers
    if (newImages && newImages.length > 0) {
      announce(`${newImages.length} image${newImages.length === 1 ? '' : 's'} selected`)
    }
  }, [errors.image, clearErrors, announce])

  /**
   * Toggles image upload zone visibility
   */
  const toggleImageUpload = useCallback(() => {
    setShowImageUpload(prev => {
      const newState = !prev
      // Announce state change to screen readers
      announce(`Image upload ${newState ? 'opened' : 'closed'}`)
      return newState
    })
  }, [announce])

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(async () => {
    if (disabled || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Validate the form
      const validation = await validateForm(
        { text, images },
        {
          textOptions: {
            required: true,
            maxLength,
            ...validationOptions.text
          },
          imageOptions: {
            maxImages,
            ...validationOptions.images
          }
        }
      )

      if (!validation.isValid) {
        // Validation errors are already handled by the validation hook
        return
      }

      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit({
          text: text.trim(),
          images,
          metadata: {
            characterCount,
            imageCount,
            timestamp: new Date().toISOString()
          }
        })

        // Clear form on successful submission
        clearText()
        clearAllImages()
        clearErrors('all')
        clearWarnings('all')
        setShowImageUpload(false)
        
        // Announce successful submission
        announce('Content submitted successfully')
      }

    } catch (error) {
      handleSubmissionError(error, 'form submission')
      // Announce submission error
      announce(`Submission failed: ${error.message}`, 'assertive')
    } finally {
      setIsSubmitting(false)
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
    handleSubmissionError
  ])

  /**
   * Handles key press events using accessibility hook
   */
  const handleKeyPress = createKeyboardHandler({
    custom: (event, key, modifiers) => {
      // Submit on Ctrl/Cmd + Enter
      if ((modifiers.ctrlKey || modifiers.metaKey) && key === 'Enter') {
        event.preventDefault()
        handleSubmit()
      }
      
      // Toggle image upload with Alt + I
      if (modifiers.altKey && key.toLowerCase() === 'i') {
        event.preventDefault()
        toggleImageUpload()
      }
    }
  })

  /**
   * Dismisses validation messages
   */
  const handleDismissValidation = useCallback((item, index, type) => {
    if (type === 'error') {
      // Find which category this error belongs to
      Object.keys(errors).forEach(category => {
        if (errors[category].includes(item)) {
          clearErrors(category)
        }
      })
    } else if (type === 'warning') {
      // Find which category this warning belongs to
      Object.keys(warnings).forEach(category => {
        if (warnings[category].includes(item)) {
          clearWarnings(category)
        }
      })
    }
  }, [errors, warnings, clearErrors, clearWarnings])

  // Calculate if form can be submitted
  const canSubmit = isTextValid && !hasErrors && !isSubmitting && text.trim().length > 0

  return (
    <StarBorder
      as="div"
      className="w-full h-full"
      color="var(--color-core-prim-300)"
      speed="6s"
      thickness={0}
    >
      <div 
        className="backdrop-blur-[20px] backdrop-filter bg-core-neu-1000/40 w-full h-full flex flex-col justify-between p-4 rounded-[15px] border-none"
        role="form"
        aria-label="Content creation form"
      >
        

        
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
              aria-label="Content input. Press Ctrl+Enter to submit, Alt+I to toggle image upload"
              aria-describedby="character-count validation-messages keyboard-shortcuts"
              aria-required="true"
              aria-invalid={hasErrors ? 'true' : 'false'}
            />
          </div>

          {/* Character count display */}
          <div className="px-2">
            <div 
              id="character-count"
              className={`text-xs text-right ${
                isAtLimit 
                  ? 'text-error-500' 
                  : isAtWarning 
                    ? 'text-warning-500' 
                    : 'text-invert-low'
              }`}
              aria-live="polite"
              role="status"
              aria-label={`Character count: ${characterCount} of ${maxLength} characters used${warningMessage ? `. ${warningMessage}` : ''}`}
            >
              {characterCount}/{maxLength}
              {warningMessage && (
                <span className="ml-2">({warningMessage})</span>
              )}
            </div>
          </div>

          {/* Image upload zone */}
          {showImageUpload && (
            <div className="px-2" role="region" aria-label="Image upload area">
              <ImageUploadZone
                onImagesChange={handleImagesChange}
                maxImages={maxImages}
                disabled={disabled || isSubmitting}
                className="border-core-prim-300/30"
                aria-describedby="image-upload-instructions"
              />
            </div>
          )}
        </div>

        {/* Bottom buttons */}
        <div className="flex flex-wrap gap-2 items-center justify-between min-h-7 p-0 rounded-xl w-full mt-3">
          
          {/* Cover Image button */}
          <button
            onClick={toggleImageUpload}
            disabled={disabled || isSubmitting}
            className={`flex gap-2 items-center justify-center min-h-7 min-w-7 p-[4px] rounded-2xl shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-core-prim-500 focus:ring-offset-2 ${
              showImageUpload 
                ? 'bg-core-prim-500/20 text-core-prim-400' 
                : 'hover:bg-core-prim-500/10'
            } ${
              disabled || isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'
            }`}
            aria-label={`${showImageUpload ? 'Hide' : 'Show'} image upload area. Press Alt+I as shortcut.`}
            aria-pressed={showImageUpload}
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
            className={`bg-neutral-900 flex gap-1 items-center justify-center px-3 py-2 rounded-2xl shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-core-prim-500 focus:ring-offset-2 ${
              canSubmit
                ? 'hover:bg-neutral-800 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
            aria-label={`Generate content${isSubmitting ? ' (submitting...)' : canSubmit ? '. Press Ctrl+Enter as shortcut.' : ' (form incomplete)'}`}
            aria-describedby="submit-help"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <div className="flex items-center justify-center p-0 rounded-lg shrink-0">
                  <div className="relative shrink-0 size-4">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="font-normal text-core-neu-800 text-[14px]">
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
                <div className="font-normal text-core-neu-800 text-[14px]">
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
          Press Ctrl+Enter to submit content. Press Alt+I to toggle image upload.
        </div>
        
        {/* Help text for buttons */}
        <div id="image-upload-help" className="sr-only">
          Toggle image upload area. You can also use Alt+I keyboard shortcut.
        </div>
        
        <div id="submit-help" className="sr-only">
          Submit the form to generate content. You can also use Ctrl+Enter keyboard shortcut.
        </div>
        
        <div id="image-upload-instructions" className="sr-only">
          Drag and drop images or click to select files. Maximum {maxImages} images allowed.
        </div>

        {/* Visual keyboard shortcut hint */}
        {text.length > 0 && !isSubmitting && (
          <div className="text-xs text-invert-low/60 text-center mt-2" aria-hidden="true">
            Press Ctrl+Enter to generate
          </div>
        )}
      </div>
    </StarBorder>
  )
}

export default EnhancedAiChatInput
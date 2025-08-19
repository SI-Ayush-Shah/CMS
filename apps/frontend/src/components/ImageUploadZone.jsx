/**
 * ImageUploadZone Component
 * 
 * A drag-and-drop image upload zone with file selection dialog integration,
 * thumbnail display, and accessibility features. Integrates with the useImageUpload hook
 * and follows the existing design system patterns.
 */

import React, { useRef, useState, useCallback } from 'react'
import { useImageUpload } from '../hooks/useImageUpload'

/**
 * ImageUploadZone Component
 * @param {Object} props - Component props
 * @param {Function} props.onImagesChange - Callback when images change
 * @param {number} props.maxImages - Maximum number of images allowed
 * @param {number} props.maxFileSize - Maximum file size in bytes
 * @param {string[]} props.allowedTypes - Array of allowed MIME types
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether the upload zone is disabled
 * @param {Function} props.onError - Error callback function
 * @param {Function} props.onSuccess - Success callback function
 */
export const ImageUploadZone = ({
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  disabled = false,
  onError,
  onSuccess,
  ...props
}) => {
  // File input ref for programmatic access
  const fileInputRef = useRef(null)
  
  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  
  // Use the image upload hook
  const {
    images,
    addImages,
    removeImage,
    clearAllImages,
    canAddMore,
    remainingSlots,
    errors,
    imageCount
  } = useImageUpload({
    maxImages,
    maxFileSize,
    onError,
    onSuccess
  })

  // Notify parent component when images change
  React.useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images)
    }
  }, [images, onImagesChange])

  /**
   * Handles file selection from input dialog
   */
  const handleFileSelect = useCallback((event) => {
    const files = event.target.files
    if (files && files.length > 0) {
      addImages(files)
    }
    // Reset input value to allow selecting the same files again
    event.target.value = ''
  }, [addImages])

  /**
   * Opens the file selection dialog
   */
  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  /**
   * Handles drag enter event
   */
  const handleDragEnter = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (disabled) return
    
    setDragCounter(prev => prev + 1)
    
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }, [disabled])

  /**
   * Handles drag leave event
   */
  const handleDragLeave = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (disabled) return
    
    setDragCounter(prev => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragOver(false)
      }
      return newCounter
    })
  }, [disabled])

  /**
   * Handles drag over event
   */
  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (disabled) return
    
    // Set the drop effect to copy
    event.dataTransfer.dropEffect = 'copy'
  }, [disabled])

  /**
   * Handles file drop event
   */
  const handleDrop = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (disabled) return
    
    setIsDragOver(false)
    setDragCounter(0)
    
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      addImages(files)
    }
  }, [disabled, addImages])

  /**
   * Handles keyboard events for accessibility
   */
  const handleKeyDown = useCallback((event) => {
    if (disabled) return
    
    // Open file dialog on Enter or Space
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openFileDialog()
    }
    
    // Clear all images with Delete key when focused on upload zone
    if (event.key === 'Delete' && images.length > 0) {
      event.preventDefault()
      clearAllImages()
    }
  }, [disabled, openFileDialog, images.length, clearAllImages])

  /**
   * Handles image removal
   */
  const handleRemoveImage = useCallback((imageId, event) => {
    event.stopPropagation()
    removeImage(imageId)
  }, [removeImage])

  /**
   * Handles keyboard navigation for image removal
   */
  const handleRemoveKeyDown = useCallback((imageId, event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      removeImage(imageId)
    }
  }, [removeImage])

  // Generate accepted file types string for input
  const acceptedTypes = allowedTypes.join(',')

  // Calculate dynamic classes
  const dropZoneClasses = [
    'relative w-full min-h-[120px] border-2 border-dashed rounded-xl transition-all duration-200',
    'flex flex-col items-center justify-center p-6 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-core-prim-500 focus:ring-opacity-50',
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-core-prim-400',
    isDragOver && !disabled ? 'border-core-prim-500 bg-core-prim-500/10' : 'border-core-prim-300',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="w-full space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        disabled={disabled}
      />

      {/* Drop zone */}
      <div
        className={dropZoneClasses}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`Upload images. ${canAddMore ? `${remainingSlots} slots remaining.` : 'Maximum images reached.'} Press Enter or Space to select files. Press Delete to clear all images.`}
        aria-describedby="upload-instructions upload-status upload-help"
        aria-disabled={disabled}
        aria-expanded={images.length > 0}
      >
        {/* Upload icon */}
        <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-core-prim-500/20">
          <svg
            className="w-6 h-6 text-core-prim-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Upload text */}
        <div className="text-center">
          <p className="text-invert-high font-medium mb-1">
            {isDragOver && !disabled ? 'Drop images here' : 'Add Photos'}
          </p>
          <p id="upload-instructions" className="text-invert-low text-sm">
            {canAddMore 
              ? `Drag and drop or click to select images (${remainingSlots} remaining)`
              : 'Maximum images reached'
            }
          </p>
          <p className="text-invert-low text-xs mt-1">
            JPG, PNG, GIF, WebP up to 5MB each
          </p>
        </div>

        {/* Visual feedback for drag over */}
        {isDragOver && !disabled && (
          <div className="absolute inset-0 bg-core-prim-500/5 rounded-xl border-2 border-core-prim-500 pointer-events-none" />
        )}
      </div>

      {/* Upload status and help */}
      <div id="upload-status" className="sr-only" aria-live="polite" role="status">
        {imageCount > 0 && `${imageCount} image${imageCount === 1 ? '' : 's'} selected`}
      </div>
      
      <div id="upload-help" className="sr-only">
        Keyboard shortcuts: Enter or Space to select files, Delete to clear all images. 
        Drag and drop is also supported.
      </div>

      {/* Error display */}
      {errors.length > 0 && (
        <div className="space-y-2" role="alert" aria-label="Upload errors">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-error-500/10 border border-error-500/20 rounded-lg"
            >
              <svg
                className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-error-600 text-sm font-medium">
                  {error.message}
                </p>
                {error.fileName && (
                  <p className="text-error-500 text-xs mt-1">
                    File: {error.fileName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image thumbnails */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-invert-high font-medium">
              Selected Images ({imageCount}/{maxImages})
            </h3>
            {imageCount > 0 && (
              <button
                onClick={clearAllImages}
                className="text-error-500 hover:text-error-600 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-1 rounded"
                aria-label={`Remove all ${imageCount} images`}
                type="button"
              >
                Clear All
              </button>
            )}
          </div>

          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            role="grid"
            aria-label="Selected images"
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group aspect-square bg-core-neu-900 rounded-lg overflow-hidden border border-core-prim-300/20 focus-within:ring-2 focus-within:ring-core-prim-500 focus-within:ring-offset-1"
                role="gridcell"
                aria-label={`Image ${index + 1} of ${imageCount}: ${image.file.name}`}
              >
                {/* Image preview */}
                <img
                  src={image.preview}
                  alt={`Preview of ${image.file.name}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Upload status overlay */}
                {image.uploadStatus === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-xs">Uploading...</div>
                  </div>
                )}

                {image.uploadStatus === 'error' && (
                  <div className="absolute inset-0 bg-error-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-error-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemoveImage(image.id, e)}
                  onKeyDown={(e) => handleRemoveKeyDown(image.id, e)}
                  className="absolute top-1 right-1 w-6 h-6 bg-error-500 hover:bg-error-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-1"
                  aria-label={`Remove image ${index + 1}: ${image.file.name}`}
                  aria-describedby={`image-${image.id}-status`}
                  tabIndex={0}
                  type="button"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* File name and status */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.file.name}
                </div>
                
                {/* Hidden status for screen readers */}
                <div id={`image-${image.id}-status`} className="sr-only">
                  {image.uploadStatus === 'uploading' && 'Uploading'}
                  {image.uploadStatus === 'completed' && 'Upload completed'}
                  {image.uploadStatus === 'error' && `Upload failed: ${image.error}`}
                  {image.uploadStatus === 'pending' && 'Ready to upload'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploadZone
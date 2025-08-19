/**
 * Custom hook for handling content submission workflow
 * Integrates text and image validation, API calls, loading states, and error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { contentApi } from '../services/contentApi'
import { imageUploadApi } from '../services/imageUploadApi'

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
    uploadImagesFirst = true
  } = options

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Results and errors
  const [submissionResult, setSubmissionResult] = useState(null)
  const [submissionError, setSubmissionError] = useState(null)
  const [uploadResults, setUploadResults] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})

  // Success state
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Ref to track mounted state for cleanup
  const isMountedRef = useRef(true)

  /**
   * Validates submission data before processing
   * @param {string} text - Text content to validate
   * @param {Array} images - Images array to validate
   * @returns {Object} Validation result
   */
  const validateSubmissionData = useCallback((text, images) => {
    const errors = []

    // Text validation
    if (!text || text.trim().length === 0) {
      errors.push({
        type: 'required',
        field: 'text',
        message: 'Content text is required'
      })
    }

    if (text && text.length > 2000) {
      errors.push({
        type: 'max-length',
        field: 'text',
        message: 'Content exceeds maximum length of 2000 characters'
      })
    }

    // Image validation
    if (images && images.length > 10) {
      errors.push({
        type: 'max-images',
        field: 'images',
        message: 'Maximum 10 images allowed'
      })
    }

    // Check for failed image uploads
    if (images && images.length > 0) {
      const failedUploads = images.filter(img => img.uploadStatus === 'error')
      if (failedUploads.length > 0) {
        errors.push({
          type: 'upload-failed',
          field: 'images',
          message: `${failedUploads.length} image(s) failed to upload. Please retry or remove them.`
        })
      }

      const pendingUploads = images.filter(img => img.uploadStatus === 'pending' || img.uploadStatus === 'uploading')
      if (pendingUploads.length > 0 && uploadImagesFirst) {
        errors.push({
          type: 'upload-pending',
          field: 'images',
          message: `${pendingUploads.length} image(s) are still uploading. Please wait for completion.`
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [uploadImagesFirst])

  /**
   * Uploads images that haven't been uploaded yet
   * @param {Array} images - Array of image objects
   * @returns {Promise<Array>} Array of upload results
   */
  const uploadPendingImages = useCallback(async (images) => {
    if (!images || images.length === 0) {
      return []
    }

    const pendingImages = images.filter(img => 
      img.uploadStatus === 'pending' || img.uploadStatus === 'error'
    )

    if (pendingImages.length === 0) {
      // Return already uploaded images
      return images
        .filter(img => img.uploadStatus === 'completed')
        .map(img => ({
          id: img.id,
          url: img.uploadUrl || img.preview,
          originalName: img.file.name
        }))
    }

    setIsUploading(true)
    const results = []

    try {
      // Upload images one by one with progress tracking
      for (let i = 0; i < pendingImages.length; i++) {
        const image = pendingImages[i]
        
        if (!isMountedRef.current) {
          throw new Error('Component unmounted during upload')
        }

        try {
          const uploadResult = await imageUploadApi.uploadImage(
            image.file,
            (progress) => {
              if (isMountedRef.current) {
                setUploadProgress(prev => ({
                  ...prev,
                  [image.id]: progress
                }))
              }
            }
          )

          results.push({
            id: image.id,
            url: uploadResult.url,
            originalName: uploadResult.originalName,
            uploadSuccess: true
          })

          // Update progress to 100% for completed upload
          if (isMountedRef.current) {
            setUploadProgress(prev => ({
              ...prev,
              [image.id]: 100
            }))
          }

        } catch (uploadError) {
          results.push({
            id: image.id,
            error: uploadError.message,
            uploadSuccess: false,
            file: image.file
          })
        }
      }

      // Add already uploaded images to results
      const alreadyUploaded = images
        .filter(img => img.uploadStatus === 'completed')
        .map(img => ({
          id: img.id,
          url: img.uploadUrl || img.preview,
          originalName: img.file.name,
          uploadSuccess: true
        }))

      return [...alreadyUploaded, ...results]

    } finally {
      setIsUploading(false)
    }
  }, [])

  /**
   * Submits content for generation and processing
   * @param {string} text - Text content
   * @param {Array} images - Array of image objects
   * @param {Object} options - Submission options
   * @returns {Promise<Object>} Submission result
   */
  const submit = useCallback(async (text, images = [], submissionOptions = {}) => {
    if (isSubmitting) {
      return { success: false, error: 'Submission already in progress' }
    }

    // Clear previous state
    setSubmissionError(null)
    setSubmissionResult(null)
    setIsSuccess(false)
    setSuccessMessage('')
    setUploadResults([])
    setUploadProgress({})

    // Validate submission data
    const validation = validateSubmissionData(text, images)
    if (!validation.isValid) {
      const error = {
        type: 'validation',
        message: 'Validation failed',
        details: validation.errors
      }
      setSubmissionError(error)
      
      if (onError) {
        onError(error)
      }
      
      return { success: false, error }
    }

    setIsSubmitting(true)

    try {
      let imageResults = []

      // Step 1: Upload images if needed
      if (images && images.length > 0 && uploadImagesFirst) {
        try {
          imageResults = await uploadPendingImages(images)
          setUploadResults(imageResults)

          // Check if any uploads failed
          const failedUploads = imageResults.filter(result => !result.uploadSuccess)
          if (failedUploads.length > 0) {
            throw new Error(`${failedUploads.length} image(s) failed to upload`)
          }

        } catch (uploadError) {
          const error = {
            type: 'upload',
            message: 'Image upload failed',
            details: uploadError.message
          }
          setSubmissionError(error)
          
          if (onError) {
            onError(error)
          }
          
          return { success: false, error }
        }
      }

      // Step 2: Generate content
      setIsGenerating(true)
      let generationResult

      try {
        const imageIds = imageResults
          .filter(result => result.uploadSuccess)
          .map(result => result.id)

        generationResult = await contentApi.generateContent(text, imageIds)

      } catch (generationError) {
        const error = {
          type: 'generation',
          message: 'Content generation failed',
          details: generationError.message
        }
        setSubmissionError(error)
        
        if (onError) {
          onError(error)
        }
        
        return { success: false, error }
      } finally {
        setIsGenerating(false)
      }

      // Step 3: Save content (optional)
      let saveResult = null
      if (submissionOptions.saveContent !== false) {
        setIsSaving(true)
        
        try {
          const contentToSave = {
            text,
            imageIds: imageResults
              .filter(result => result.uploadSuccess)
              .map(result => result.id),
            generatedContent: generationResult,
            metadata: {
              submittedAt: new Date().toISOString(),
              imageCount: imageResults.filter(r => r.uploadSuccess).length,
              characterCount: text.length
            }
          }

          saveResult = await contentApi.saveContent(contentToSave)

        } catch (saveError) {
          // Saving is optional, so we don't fail the entire submission
          console.warn('Failed to save content:', saveError.message)
        } finally {
          setIsSaving(false)
        }
      }

      // Success!
      const result = {
        success: true,
        generatedContent: generationResult,
        uploadedImages: imageResults.filter(r => r.uploadSuccess),
        savedContent: saveResult,
        timestamp: new Date().toISOString()
      }

      setSubmissionResult(result)
      setIsSuccess(true)
      setSuccessMessage('Content submitted successfully!')

      if (onSuccess) {
        onSuccess(result)
      }

      return result

    } catch (error) {
      const submissionError = {
        type: 'submission',
        message: 'Submission failed',
        details: error.message
      }
      
      setSubmissionError(submissionError)
      
      if (onError) {
        onError(submissionError)
      }
      
      return { success: false, error: submissionError }

    } finally {
      setIsSubmitting(false)
    }
  }, [
    isSubmitting,
    validateSubmissionData,
    uploadPendingImages,
    uploadImagesFirst,
    onSuccess,
    onError
  ])

  /**
   * Retries a failed submission
   * @param {string} text - Text content
   * @param {Array} images - Array of image objects
   * @param {Object} options - Retry options
   * @returns {Promise<Object>} Retry result
   */
  const retry = useCallback(async (text, images = [], retryOptions = {}) => {
    // Clear error state before retry
    setSubmissionError(null)
    
    return submit(text, images, retryOptions)
  }, [submit])

  /**
   * Resets all submission state
   */
  const reset = useCallback(() => {
    setIsSubmitting(false)
    setIsUploading(false)
    setIsGenerating(false)
    setIsSaving(false)
    setSubmissionResult(null)
    setSubmissionError(null)
    setUploadResults([])
    setUploadProgress({})
    setIsSuccess(false)
    setSuccessMessage('')
  }, [])

  /**
   * Cancels ongoing submission (if possible)
   */
  const cancel = useCallback(() => {
    // Note: This is a basic implementation
    // In a real app, you'd want to cancel ongoing HTTP requests
    if (isSubmitting) {
      reset()
    }
  }, [isSubmitting, reset])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Computed values
  const isLoading = isSubmitting || isUploading || isGenerating || isSaving
  const canSubmit = !isLoading
  const hasError = submissionError !== null
  const hasResult = submissionResult !== null

  const loadingState = {
    isSubmitting,
    isUploading,
    isGenerating,
    isSaving,
    isLoading,
    phase: isUploading ? 'uploading' : 
           isGenerating ? 'generating' : 
           isSaving ? 'saving' : 
           isSubmitting ? 'submitting' : 'idle'
  }

  return {
    // State
    isSubmitting,
    isUploading,
    isGenerating,
    isSaving,
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

    // Loading state details
    loadingState,

    // Actions
    submit,
    retry,
    reset,
    cancel,

    // Validation
    validateSubmissionData
  }
}

export default useContentSubmission
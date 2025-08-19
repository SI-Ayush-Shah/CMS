/**
 * Custom hook for managing validation state across the content wizard
 * Provides centralized error and warning management with real-time validation
 */

import { useState, useCallback, useMemo } from 'react'

/**
 * Custom hook for validation state management
 * @param {Object} options - Configuration options
 * @param {boolean} options.clearOnSuccess - Whether to clear errors on successful validation
 * @returns {Object} Validation state and handlers
 */
export const useValidation = ({ clearOnSuccess = true } = {}) => {
  // State for different types of validation messages
  const [textErrors, setTextErrors] = useState([])
  const [imageErrors, setImageErrors] = useState([])
  const [submissionErrors, setSubmissionErrors] = useState([])
  const [networkErrors, setNetworkErrors] = useState([])
  
  const [textWarnings, setTextWarnings] = useState([])
  const [imageWarnings, setImageWarnings] = useState([])
  
  // Track validation state
  const [isValidating, setIsValidating] = useState(false)
  const [lastValidation, setLastValidation] = useState(null)

  /**
   * Adds an error to the specified category
   */
  const addError = useCallback((category, error) => {
    const errorObject = {
      id: `${category}-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      ...error
    }

    switch (category) {
      case 'text':
        setTextErrors(prev => [...prev, errorObject])
        break
      case 'image':
        setImageErrors(prev => [...prev, errorObject])
        break
      case 'submission':
        setSubmissionErrors(prev => [...prev, errorObject])
        break
      case 'network':
        setNetworkErrors(prev => [...prev, errorObject])
        break
      default:
        console.warn(`Unknown error category: ${category}`)
    }
  }, [])

  /**
   * Adds a warning to the specified category
   */
  const addWarning = useCallback((category, warning) => {
    const warningObject = {
      id: `${category}-warning-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      ...warning
    }

    switch (category) {
      case 'text':
        setTextWarnings(prev => [...prev, warningObject])
        break
      case 'image':
        setImageWarnings(prev => [...prev, warningObject])
        break
      default:
        console.warn(`Unknown warning category: ${category}`)
    }
  }, [])

  /**
   * Removes an error by ID from the specified category
   */
  const removeError = useCallback((category, errorId) => {
    switch (category) {
      case 'text':
        setTextErrors(prev => prev.filter(error => error.id !== errorId))
        break
      case 'image':
        setImageErrors(prev => prev.filter(error => error.id !== errorId))
        break
      case 'submission':
        setSubmissionErrors(prev => prev.filter(error => error.id !== errorId))
        break
      case 'network':
        setNetworkErrors(prev => prev.filter(error => error.id !== errorId))
        break
    }
  }, [])

  /**
   * Removes a warning by ID from the specified category
   */
  const removeWarning = useCallback((category, warningId) => {
    switch (category) {
      case 'text':
        setTextWarnings(prev => prev.filter(warning => warning.id !== warningId))
        break
      case 'image':
        setImageWarnings(prev => prev.filter(warning => warning.id !== warningId))
        break
    }
  }, [])

  /**
   * Clears all errors from a specific category
   */
  const clearErrors = useCallback((category) => {
    switch (category) {
      case 'text':
        setTextErrors([])
        break
      case 'image':
        setImageErrors([])
        break
      case 'submission':
        setSubmissionErrors([])
        break
      case 'network':
        setNetworkErrors([])
        break
      case 'all':
        setTextErrors([])
        setImageErrors([])
        setSubmissionErrors([])
        setNetworkErrors([])
        break
    }
  }, [])

  /**
   * Clears all warnings from a specific category
   */
  const clearWarnings = useCallback((category) => {
    switch (category) {
      case 'text':
        setTextWarnings([])
        break
      case 'image':
        setImageWarnings([])
        break
      case 'all':
        setTextWarnings([])
        setImageWarnings([])
        break
    }
  }, [])

  /**
   * Clears all validation messages
   */
  const clearAll = useCallback(() => {
    clearErrors('all')
    clearWarnings('all')
  }, [clearErrors, clearWarnings])

  /**
   * Validates text content
   */
  const validateText = useCallback((text, options = {}) => {
    const { 
      required = true, 
      maxLength = 2000, 
      minLength = 0,
      warningThreshold = 0.8 
    } = options

    // Clear previous text errors and warnings
    setTextErrors([])
    setTextWarnings([])

    const errors = []
    const warnings = []

    // Required validation
    if (required && (!text || text.trim().length === 0)) {
      errors.push({
        type: 'required',
        field: 'text',
        message: 'Content is required'
      })
    }

    // Length validations
    if (text && text.length > maxLength) {
      errors.push({
        type: 'max-length',
        field: 'text',
        message: `Content exceeds maximum length of ${maxLength} characters`,
        details: `Current length: ${text.length}`
      })
    }

    if (text && text.length < minLength) {
      errors.push({
        type: 'min-length',
        field: 'text',
        message: `Content must be at least ${minLength} characters`,
        details: `Current length: ${text.length}`
      })
    }

    // Warning for approaching limit
    if (text && text.length >= maxLength * warningThreshold && text.length < maxLength) {
      const remaining = maxLength - text.length
      warnings.push({
        type: 'approaching-limit',
        field: 'text',
        message: `Approaching character limit (${remaining} characters remaining)`
      })
    }

    // Add errors and warnings to state
    errors.forEach(error => addError('text', error))
    warnings.forEach(warning => addWarning('text', warning))

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [addError, addWarning])

  /**
   * Validates images
   */
  const validateImages = useCallback((images, options = {}) => {
    const { 
      required = false, 
      maxImages = 10, 
      minImages = 0 
    } = options

    // Clear previous image errors and warnings
    setImageErrors([])
    setImageWarnings([])

    const errors = []
    const warnings = []

    // Required validation
    if (required && (!images || images.length === 0)) {
      errors.push({
        type: 'required',
        field: 'images',
        message: 'At least one image is required'
      })
    }

    // Count validations
    if (images && images.length > maxImages) {
      errors.push({
        type: 'max-images',
        field: 'images',
        message: `Too many images selected. Maximum allowed: ${maxImages}`,
        details: `Current count: ${images.length}`
      })
    }

    if (images && images.length < minImages) {
      errors.push({
        type: 'min-images',
        field: 'images',
        message: `At least ${minImages} image${minImages === 1 ? '' : 's'} required`,
        details: `Current count: ${images.length}`
      })
    }

    // Warning for approaching limit
    if (images && images.length >= maxImages * 0.8 && images.length < maxImages) {
      const remaining = maxImages - images.length
      warnings.push({
        type: 'approaching-limit',
        field: 'images',
        message: `Approaching image limit (${remaining} slots remaining)`
      })
    }

    // Check for failed uploads
    if (images) {
      const failedUploads = images.filter(img => img.uploadStatus === 'error')
      if (failedUploads.length > 0) {
        errors.push({
          type: 'upload-failed',
          field: 'images',
          message: `${failedUploads.length} image${failedUploads.length === 1 ? '' : 's'} failed to upload`,
          details: `Failed files: ${failedUploads.map(img => img.file.name).join(', ')}`
        })
      }
    }

    // Add errors and warnings to state
    errors.forEach(error => addError('image', error))
    warnings.forEach(warning => addWarning('image', warning))

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [addError, addWarning])

  /**
   * Validates the entire form
   */
  const validateForm = useCallback(async (formData, options = {}) => {
    setIsValidating(true)
    
    try {
      const { text, images } = formData
      const { 
        textOptions = {}, 
        imageOptions = {} 
      } = options

      // Clear all previous errors if specified
      if (clearOnSuccess) {
        clearAll()
      }

      // Validate text and images
      const textValidation = validateText(text, textOptions)
      const imageValidation = validateImages(images, imageOptions)

      const isFormValid = textValidation.isValid && imageValidation.isValid

      const result = {
        isValid: isFormValid,
        text: textValidation,
        images: imageValidation,
        timestamp: new Date().toISOString()
      }

      setLastValidation(result)
      return result

    } finally {
      setIsValidating(false)
    }
  }, [validateText, validateImages, clearOnSuccess, clearAll])

  /**
   * Handles network errors
   */
  const handleNetworkError = useCallback((error, context = '') => {
    const networkError = {
      type: 'network',
      message: `Network error${context ? ` during ${context}` : ''}: ${error.message}`,
      details: error.stack || error.toString(),
      retryable: true
    }

    addError('network', networkError)
    return networkError
  }, [addError])

  /**
   * Handles submission errors
   */
  const handleSubmissionError = useCallback((error, context = '') => {
    const submissionError = {
      type: 'submission',
      message: `Submission failed${context ? ` during ${context}` : ''}: ${error.message}`,
      details: error.stack || error.toString()
    }

    addError('submission', submissionError)
    return submissionError
  }, [addError])

  // Computed values
  const allErrors = useMemo(() => [
    ...textErrors,
    ...imageErrors,
    ...submissionErrors,
    ...networkErrors
  ], [textErrors, imageErrors, submissionErrors, networkErrors])

  const allWarnings = useMemo(() => [
    ...textWarnings,
    ...imageWarnings
  ], [textWarnings, imageWarnings])

  const hasErrors = allErrors.length > 0
  const hasWarnings = allWarnings.length > 0
  const hasAnyMessages = hasErrors || hasWarnings

  const errorsByCategory = useMemo(() => ({
    text: textErrors,
    image: imageErrors,
    submission: submissionErrors,
    network: networkErrors
  }), [textErrors, imageErrors, submissionErrors, networkErrors])

  const warningsByCategory = useMemo(() => ({
    text: textWarnings,
    image: imageWarnings
  }), [textWarnings, imageWarnings])

  return {
    // State
    errors: errorsByCategory,
    warnings: warningsByCategory,
    allErrors,
    allWarnings,
    isValidating,
    lastValidation,

    // Computed values
    hasErrors,
    hasWarnings,
    hasAnyMessages,
    errorCount: allErrors.length,
    warningCount: allWarnings.length,

    // Actions
    addError,
    addWarning,
    removeError,
    removeWarning,
    clearErrors,
    clearWarnings,
    clearAll,

    // Validation functions
    validateText,
    validateImages,
    validateForm,

    // Error handlers
    handleNetworkError,
    handleSubmissionError
  }
}

export default useValidation
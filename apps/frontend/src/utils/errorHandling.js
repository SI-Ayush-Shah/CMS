/**
 * Comprehensive error handling utilities for user-friendly error management
 * and recovery workflows
 */

import { NetworkErrorTypes, classifyNetworkError, isOnline, waitForOnline } from '../services/axiosConfig'

/**
 * Error severity levels for different types of errors
 */
export const ErrorSeverity = {
  LOW: 'low',           // Minor issues, user can continue
  MEDIUM: 'medium',     // Significant issues, some functionality affected
  HIGH: 'high',         // Major issues, core functionality broken
  CRITICAL: 'critical'  // System-wide failures, app unusable
}

/**
 * Error categories for better organization and handling
 */
export const ErrorCategory = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  AUTHENTICATION: 'authentication',
  PERMISSION: 'permission',
  SYSTEM: 'system'
}

/**
 * Recovery action types that can be suggested to users
 */
export const RecoveryAction = {
  RETRY: 'retry',
  REFRESH: 'refresh',
  RESET: 'reset',
  CONTACT_SUPPORT: 'contact_support',
  CHECK_CONNECTION: 'check_connection',
  WAIT_AND_RETRY: 'wait_and_retry',
  LOGIN_AGAIN: 'login_again',
  CLEAR_CACHE: 'clear_cache'
}

/**
 * Enhanced error class with user-friendly messaging and recovery suggestions
 */
export class EnhancedError extends Error {
  constructor(options = {}) {
    const {
      message,
      originalError,
      category = ErrorCategory.SYSTEM,
      severity = ErrorSeverity.MEDIUM,
      userMessage,
      technicalMessage,
      recoveryActions = [],
      context = {},
      retryable = false,
      timestamp = new Date().toISOString()
    } = options

    super(message || 'An error occurred')

    this.name = 'EnhancedError'
    this.originalError = originalError
    this.category = category
    this.severity = severity
    this.userMessage = userMessage || this.message
    this.technicalMessage = technicalMessage || this.message
    this.recoveryActions = recoveryActions
    this.context = context
    this.retryable = retryable
    this.timestamp = timestamp
    this.errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Converts the error to a plain object for logging or transmission
   */
  toJSON() {
    return {
      errorId: this.errorId,
      name: this.name,
      message: this.message,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      category: this.category,
      severity: this.severity,
      recoveryActions: this.recoveryActions,
      context: this.context,
      retryable: this.retryable,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }
}

/**
 * Converts various error types into enhanced errors with user-friendly messages
 * @param {Error|Object} error - Original error object
 * @param {Object} context - Additional context about where the error occurred
 * @returns {EnhancedError} Enhanced error with user messaging and recovery options
 */
export const enhanceError = (error, context = {}) => {
  // If already an enhanced error, return as-is
  if (error instanceof EnhancedError) {
    return error
  }

  // Handle network errors (axios errors or network-related errors)
  if (error.isAxiosError || error.response || error.request || 
      context.type === 'network' || 
      error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    
    const classification = error.classification || classifyNetworkError(error)
    
    const recoveryActions = []
    
    if (classification.isRetryable) {
      recoveryActions.push(RecoveryAction.RETRY)
    }
    
    if (classification.type === NetworkErrorTypes.CONNECTION) {
      recoveryActions.push(RecoveryAction.CHECK_CONNECTION)
    }
    
    if (classification.type === NetworkErrorTypes.TIMEOUT) {
      recoveryActions.push(RecoveryAction.WAIT_AND_RETRY)
    }

    return new EnhancedError({
      message: error.message,
      originalError: error,
      category: ErrorCategory.NETWORK,
      severity: classification.type === NetworkErrorTypes.CONNECTION ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      userMessage: classification.message,
      technicalMessage: `${error.message} (${error.code || 'Unknown'})`,
      recoveryActions,
      context: {
        ...context,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        retryCount: error.config?.metadata?.retryCount || 0
      },
      retryable: classification.isRetryable
    })
  }

  // Handle validation errors
  if (error.name === 'ValidationError' || context.type === 'validation') {
    return new EnhancedError({
      message: error.message,
      originalError: error,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      userMessage: error.message || 'Please check your input and try again.',
      technicalMessage: error.message,
      recoveryActions: [RecoveryAction.RESET],
      context,
      retryable: false
    })
  }

  // Handle file upload errors
  if (context.type === 'upload' || error.message?.includes('upload')) {
    const recoveryActions = [RecoveryAction.RETRY]
    
    if (error.message?.includes('size') || error.message?.includes('large')) {
      recoveryActions.push(RecoveryAction.RESET)
    }

    return new EnhancedError({
      message: error.message,
      originalError: error,
      category: ErrorCategory.UPLOAD,
      severity: ErrorSeverity.MEDIUM,
      userMessage: error.message || 'File upload failed. Please try again.',
      technicalMessage: error.message,
      recoveryActions,
      context,
      retryable: true
    })
  }

  // Handle React component errors
  if (error.componentStack || context.type === 'component') {
    return new EnhancedError({
      message: error.message,
      originalError: error,
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
      userMessage: 'A component error occurred. Please refresh the page or try again.',
      technicalMessage: error.message,
      recoveryActions: [RecoveryAction.REFRESH, RecoveryAction.RESET],
      context: {
        ...context,
        componentStack: error.componentStack
      },
      retryable: false
    })
  }

  // Handle generic JavaScript errors
  return new EnhancedError({
    message: error.message || 'An unexpected error occurred',
    originalError: error,
    category: ErrorCategory.SYSTEM,
    severity: context.severity || ErrorSeverity.MEDIUM,
    userMessage: 'Something went wrong. Please try again.',
    technicalMessage: error.message || error.toString(),
    recoveryActions: [RecoveryAction.RETRY, RecoveryAction.REFRESH],
    context,
    retryable: true
  })
}

/**
 * Error recovery manager that provides standardized recovery workflows
 */
export class ErrorRecoveryManager {
  constructor(options = {}) {
    this.onRetry = options.onRetry || (() => {})
    this.onReset = options.onReset || (() => {})
    this.onRefresh = options.onRefresh || (() => window.location.reload())
    this.onContactSupport = options.onContactSupport || (() => {})
    this.maxRetries = options.maxRetries || 3
    this.retryDelay = options.retryDelay || 1000
  }

  /**
   * Executes a recovery action for the given error
   * @param {EnhancedError} error - The error to recover from
   * @param {string} action - The recovery action to execute
   * @param {Object} context - Additional context for the recovery
   * @returns {Promise<boolean>} Success status of the recovery action
   */
  async executeRecovery(error, action, context = {}) {
    try {
      switch (action) {
        case RecoveryAction.RETRY:
          return await this.handleRetry(error, context)
          
        case RecoveryAction.REFRESH:
          this.onRefresh()
          return true
          
        case RecoveryAction.RESET:
          this.onReset(error, context)
          return true
          
        case RecoveryAction.CHECK_CONNECTION:
          return await this.handleConnectionCheck(error, context)
          
        case RecoveryAction.WAIT_AND_RETRY:
          return await this.handleWaitAndRetry(error, context)
          
        case RecoveryAction.CONTACT_SUPPORT:
          this.onContactSupport(error, context)
          return true
          
        case RecoveryAction.LOGIN_AGAIN:
          // TODO: Implement login redirect
          return false
          
        case RecoveryAction.CLEAR_CACHE:
          return await this.handleClearCache(error, context)
          
        default:
          console.warn(`Unknown recovery action: ${action}`)
          return false
      }
    } catch (recoveryError) {
      console.error('Recovery action failed:', recoveryError)
      return false
    }
  }

  /**
   * Handles retry recovery action
   */
  async handleRetry(error, context) {
    const retryCount = context.retryCount || 0
    
    if (retryCount >= this.maxRetries) {
      return false
    }

    // Wait before retry
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, this.retryDelay * retryCount))
    }

    try {
      await this.onRetry(error, { ...context, retryCount: retryCount + 1 })
      return true
    } catch (retryError) {
      return false
    }
  }

  /**
   * Handles connection check recovery action
   */
  async handleConnectionCheck(error, context) {
    if (!isOnline()) {
      // Wait for connection to be restored
      const isBackOnline = await waitForOnline(30000) // 30 second timeout
      
      if (isBackOnline) {
        // Connection restored, try the original action again
        return await this.handleRetry(error, context)
      }
      
      return false
    }
    
    // Already online, just retry
    return await this.handleRetry(error, context)
  }

  /**
   * Handles wait and retry recovery action
   */
  async handleWaitAndRetry(error, context) {
    // Wait longer for server issues
    const waitTime = context.waitTime || 5000
    await new Promise(resolve => setTimeout(resolve, waitTime))
    
    return await this.handleRetry(error, context)
  }

  /**
   * Handles cache clearing recovery action
   */
  async handleClearCache(error, context) {
    try {
      // Clear localStorage
      localStorage.clear()
      
      // Clear sessionStorage
      sessionStorage.clear()
      
      // Clear any cached data in the app
      if (context.clearAppCache) {
        await context.clearAppCache()
      }
      
      return true
    } catch (clearError) {
      console.error('Failed to clear cache:', clearError)
      return false
    }
  }
}

/**
 * Global error handler for unhandled errors
 */
export const setupGlobalErrorHandling = (errorHandler) => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const enhancedError = enhanceError(event.reason, {
      type: 'unhandled_promise_rejection',
      source: 'global'
    })
    
    errorHandler(enhancedError)
    
    // Prevent the default browser error handling
    event.preventDefault()
  })

  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    const enhancedError = enhanceError(event.error || new Error(event.message), {
      type: 'uncaught_error',
      source: 'global',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
    
    errorHandler(enhancedError)
  })
}

/**
 * Creates a standardized error message for display to users
 * @param {EnhancedError} error - The enhanced error object
 * @param {Object} options - Display options
 * @returns {Object} Formatted error message object
 */
export const formatErrorForDisplay = (error, options = {}) => {
  const {
    showTechnicalDetails = false,
    showRecoveryActions = true,
    showErrorId = false
  } = options

  return {
    title: getErrorTitle(error),
    message: error.userMessage,
    technicalMessage: showTechnicalDetails ? error.technicalMessage : null,
    severity: error.severity,
    category: error.category,
    recoveryActions: showRecoveryActions ? error.recoveryActions : [],
    errorId: showErrorId ? error.errorId : null,
    timestamp: error.timestamp,
    retryable: error.retryable
  }
}

/**
 * Gets an appropriate title for the error based on its category and severity
 * @param {EnhancedError} error - The enhanced error object
 * @returns {string} Error title
 */
const getErrorTitle = (error) => {
  switch (error.category) {
    case ErrorCategory.NETWORK:
      return error.severity === ErrorSeverity.HIGH ? 'Connection Problem' : 'Network Error'
    case ErrorCategory.VALIDATION:
      return 'Input Error'
    case ErrorCategory.UPLOAD:
      return 'Upload Failed'
    case ErrorCategory.PROCESSING:
      return 'Processing Error'
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication Required'
    case ErrorCategory.PERMISSION:
      return 'Access Denied'
    case ErrorCategory.SYSTEM:
      return error.severity === ErrorSeverity.CRITICAL ? 'System Error' : 'Something Went Wrong'
    default:
      return 'Error'
  }
}

/**
 * Logs errors in a structured format for debugging and monitoring
 * @param {EnhancedError} error - The enhanced error object
 * @param {Object} context - Additional logging context
 */
export const logError = (error, context = {}) => {
  const logData = {
    ...error.toJSON(),
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  }

  // Log to console in development
  if (import.meta.env.VITE_NODE_ENV === 'development') {
    console.group(`🚨 ${error.category.toUpperCase()} ERROR (${error.severity})`)
    console.error('User Message:', error.userMessage)
    console.error('Technical Message:', error.technicalMessage)
    console.error('Recovery Actions:', error.recoveryActions)
    console.error('Full Error Data:', logData)
    if (error.originalError) {
      console.error('Original Error:', error.originalError)
    }
    console.groupEnd()
  }

  // TODO: Send to error tracking service in production
  // errorTrackingService.captureError(logData)
}
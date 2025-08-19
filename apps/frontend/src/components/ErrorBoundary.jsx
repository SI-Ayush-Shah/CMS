/**
 * Comprehensive Error Boundary Component
 * 
 * A robust error boundary that provides graceful error handling, user-friendly
 * error messages, and recovery options for React component errors.
 */

import React from 'react'
import { enhanceError, ErrorRecoveryManager, formatErrorForDisplay, logError } from '../utils/errorHandling'

/**
 * Main Error Boundary Component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRecovering: false
    }

    // Initialize recovery manager
    this.recoveryManager = new ErrorRecoveryManager({
      onRetry: this.handleRetry.bind(this),
      onReset: this.handleReset.bind(this),
      onRefresh: this.handleRefresh.bind(this),
      onContactSupport: this.handleContactSupport.bind(this),
      maxRetries: this.props.maxRetries || 3
    })
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `boundary-error-${Date.now()}`
    }
  }

  componentDidCatch(error, errorInfo) {
    // Enhance the error with additional context
    const enhancedError = enhanceError(error, {
      type: 'component',
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'ErrorBoundary',
      props: this.props.logProps ? this.props : undefined
    })

    // Update state with enhanced error
    this.setState({
      error: enhancedError,
      errorInfo
    })

    // Log the error
    logError(enhancedError, {
      errorBoundary: this.props.name || 'ErrorBoundary',
      componentStack: errorInfo.componentStack
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(enhancedError, errorInfo)
    }
  }

  /**
   * Handles retry recovery action
   */
  handleRetry = async () => {
    if (this.state.retryCount >= (this.props.maxRetries || 3)) {
      return
    }

    this.setState({ isRecovering: true })

    try {
      // Call custom retry handler if provided
      if (this.props.onRetry) {
        await this.props.onRetry(this.state.error, {
          retryCount: this.state.retryCount + 1
        })
      }

      // Reset error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: this.state.retryCount + 1,
        isRecovering: false
      })

    } catch (retryError) {
      console.error('Retry failed:', retryError)
      this.setState({ isRecovering: false })
    }
  }

  /**
   * Handles reset recovery action
   */
  handleReset = () => {
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset(this.state.error)
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRecovering: false
    })
  }

  /**
   * Handles refresh recovery action
   */
  handleRefresh = () => {
    if (this.props.onRefresh) {
      this.props.onRefresh()
    } else {
      window.location.reload()
    }
  }

  /**
   * Handles contact support recovery action
   */
  handleContactSupport = () => {
    if (this.props.onContactSupport) {
      this.props.onContactSupport(this.state.error)
    } else {
      // Default support action - could open a modal, redirect, etc.
      console.log('Contact support requested for error:', this.state.errorId)
    }
  }

  /**
   * Executes a recovery action
   */
  executeRecoveryAction = async (action) => {
    this.setState({ isRecovering: true })
    
    try {
      const success = await this.recoveryManager.executeRecovery(
        this.state.error,
        action,
        { retryCount: this.state.retryCount }
      )

      if (!success) {
        console.warn(`Recovery action '${action}' failed`)
      }
    } catch (error) {
      console.error(`Recovery action '${action}' threw an error:`, error)
    } finally {
      this.setState({ isRecovering: false })
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo,
          {
            retry: this.handleRetry,
            reset: this.handleReset,
            refresh: this.handleRefresh,
            contactSupport: this.handleContactSupport,
            executeRecoveryAction: this.executeRecoveryAction,
            isRecovering: this.state.isRecovering,
            retryCount: this.state.retryCount,
            maxRetries: this.props.maxRetries || 3
          }
        )
      }

      // Format error for display
      const displayError = formatErrorForDisplay(this.state.error, {
        showTechnicalDetails: import.meta.env.VITE_NODE_ENV === 'development',
        showRecoveryActions: true,
        showErrorId: import.meta.env.VITE_NODE_ENV === 'development'
      })

      // Default fallback UI
      return (
        <ErrorBoundaryFallback
          error={displayError}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          onRefresh={this.handleRefresh}
          onContactSupport={this.handleContactSupport}
          onExecuteRecoveryAction={this.executeRecoveryAction}
          isRecovering={this.state.isRecovering}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          title={this.props.title}
          message={this.props.message}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default Error Boundary Fallback Component
 */
const ErrorBoundaryFallback = ({
  error,
  onRetry,
  onReset,
  onRefresh,
  onContactSupport,
  onExecuteRecoveryAction,
  isRecovering,
  retryCount,
  maxRetries,
  title,
  message
}) => {
  const canRetry = retryCount < maxRetries && error.retryable

  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-error-500/10 border border-error-500/20 rounded-lg p-6">
          {/* Error Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-error-500/20 rounded-full">
            <svg
              className="w-6 h-6 text-error-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h3 className="text-lg font-semibold text-error-600 text-center mb-2">
            {title || error.title}
          </h3>

          {/* Error Message */}
          <p className="text-error-600 text-sm text-center mb-4">
            {message || error.message}
          </p>

          {/* Technical Details (Development Only) */}
          {error.technicalMessage && (
            <details className="mb-4">
              <summary className="text-error-500 text-xs cursor-pointer hover:text-error-600 mb-2">
                Technical Details
              </summary>
              <div className="p-3 bg-error-500/5 rounded text-xs font-mono text-error-600 overflow-auto max-h-32">
                <div className="mb-2">
                  <strong>Error:</strong> {error.technicalMessage}
                </div>
                {error.errorId && (
                  <div className="mb-2">
                    <strong>Error ID:</strong> {error.errorId}
                  </div>
                )}
                <div>
                  <strong>Timestamp:</strong> {new Date(error.timestamp).toLocaleString()}
                </div>
              </div>
            </details>
          )}

          {/* Recovery Actions */}
          <div className="space-y-2">
            {/* Primary Actions */}
            <div className="flex gap-2 justify-center">
              {canRetry && (
                <button
                  onClick={onRetry}
                  disabled={isRecovering}
                  className="px-4 py-2 bg-error-500 hover:bg-error-600 disabled:bg-error-400 text-white text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 disabled:cursor-not-allowed"
                >
                  {isRecovering ? 'Retrying...' : `Try Again ${retryCount > 0 ? `(${retryCount}/${maxRetries})` : ''}`}
                </button>
              )}
              
              <button
                onClick={onReset}
                disabled={isRecovering}
                className="px-4 py-2 border border-error-500 text-error-600 hover:bg-error-500/10 disabled:bg-gray-100 disabled:text-gray-400 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-2 justify-center text-xs">
              <button
                onClick={onRefresh}
                disabled={isRecovering}
                className="text-error-500 hover:text-error-600 disabled:text-gray-400 underline focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 rounded disabled:cursor-not-allowed"
              >
                Refresh Page
              </button>
              
              <span className="text-error-300">•</span>
              
              <button
                onClick={onContactSupport}
                disabled={isRecovering}
                className="text-error-500 hover:text-error-600 disabled:text-gray-400 underline focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 rounded disabled:cursor-not-allowed"
              >
                Get Help
              </button>
            </div>
          </div>

          {/* Retry Count Display */}
          {retryCount > 0 && (
            <div className="mt-4 text-center">
              <p className="text-xs text-error-500">
                Retry attempts: {retryCount}/{maxRetries}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = React.forwardRef((props, ref) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ))

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Hook for handling errors in functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null)

  const handleError = React.useCallback((error, context = {}) => {
    const enhancedError = enhanceError(error, context)
    setError(enhancedError)
    logError(enhancedError, context)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  const retryWithErrorHandling = React.useCallback(async (asyncFunction, context = {}) => {
    try {
      clearError()
      return await asyncFunction()
    } catch (error) {
      handleError(error, context)
      throw error
    }
  }, [handleError, clearError])

  return {
    error,
    hasError: !!error,
    handleError,
    clearError,
    retryWithErrorHandling
  }
}

export default ErrorBoundary
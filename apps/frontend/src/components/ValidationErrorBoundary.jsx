/**
 * Validation Error Boundary Component
 * 
 * A specialized error boundary for the validation system that provides
 * graceful error handling and recovery options for validation-related failures.
 */

import React from 'react'

class ValidationErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `validation-error-${Date.now()}`
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('Validation Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })

    // Call the onRetry callback if provided
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })

    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo,
          this.handleRetry,
          this.handleReset
        )
      }

      // Default fallback UI
      return (
        <div className="p-4 border border-error-500/20 rounded-lg bg-error-500/10">
          <div className="flex items-start gap-3">
            {/* Error icon */}
            <div className="flex-shrink-0">
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

            <div className="flex-1">
              <h3 className="text-error-600 font-medium text-sm mb-2">
                {this.props.title || 'Validation Error'}
              </h3>
              
              <p className="text-error-600 text-sm mb-3">
                {this.props.message || 
                 'Something went wrong with the validation system. You can try again or reset the form.'}
              </p>

              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-3">
                  <summary className="text-error-500 text-xs cursor-pointer hover:text-error-600">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-2 bg-error-500/5 rounded text-xs font-mono text-error-600 overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={this.handleRetry}
                  className="px-3 py-1.5 bg-error-500 hover:bg-error-600 text-white text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="px-3 py-1.5 border border-error-500 text-error-600 hover:bg-error-500/10 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
                >
                  Reset Form
                </button>

                {this.props.onReportError && (
                  <button
                    onClick={() => this.props.onReportError(this.state.error, this.state.errorInfo)}
                    className="px-3 py-1.5 text-error-500 hover:text-error-600 text-sm underline focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 rounded"
                  >
                    Report Issue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook version of the error boundary for functional components
 */
export const useValidationErrorHandler = () => {
  const [error, setError] = React.useState(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error, errorInfo) => {
    setError({ error, errorInfo, timestamp: Date.now() })
  }, [])

  React.useEffect(() => {
    if (error) {
      console.error('Validation error caught:', error.error, error.errorInfo)
    }
  }, [error])

  return {
    error,
    resetError,
    handleError,
    hasError: !!error
  }
}

/**
 * Higher-order component for wrapping components with validation error boundary
 */
export const withValidationErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = React.forwardRef((props, ref) => (
    <ValidationErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </ValidationErrorBoundary>
  ))

  WrappedComponent.displayName = `withValidationErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ValidationErrorBoundary
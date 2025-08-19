/**
 * Error Boundary Component for Content Wizard Enhancement
 * 
 * Provides error handling and recovery for the enhanced Content Wizard functionality.
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI with recovery options.
 */

import React from 'react'

class ContentWizardErrorBoundary extends React.Component {
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
      errorId: Date.now().toString()
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ContentWizard Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Report error to monitoring service if available
    if (typeof window !== 'undefined' && window.reportError) {
      window.reportError(error, {
        component: 'ContentWizardErrorBoundary',
        errorInfo,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Handles retry action - resets error state
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  /**
   * Handles refresh action - reloads the page
   */
  handleRefresh = () => {
    window.location.reload()
  }

  /**
   * Handles navigation to home
   */
  handleGoHome = () => {
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome()
    } else {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="relative w-full flex h-full items-center justify-center">
          <div className="flex flex-col w-full max-w-[600px] gap-6 h-full justify-center px-4">
            
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-error-500/10 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-error-500" 
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
            </div>

            {/* Error Title */}
            <div className="text-center">
              <h2 className="font-semibold text-invert-high text-xl sm:text-2xl mb-2">
                Something went wrong
              </h2>
              <p className="font-normal text-invert-low text-sm">
                The content wizard encountered an unexpected error. Don't worry, your work is safe.
              </p>
            </div>

            {/* Error Details (Development Mode) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-core-neu-900/50 border border-error-500/20 rounded-lg p-4 max-h-40 overflow-y-auto">
                <h3 className="text-error-400 font-medium text-sm mb-2">Error Details:</h3>
                <pre className="text-xs text-invert-low whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="bg-core-prim-500 hover:bg-core-prim-600 text-white font-medium px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-core-prim-500 focus:ring-offset-2 focus:ring-offset-core-neu-1000"
                aria-label="Try again"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleRefresh}
                className="bg-core-neu-800 hover:bg-core-neu-700 text-invert-high font-medium px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-core-neu-600 focus:ring-offset-2 focus:ring-offset-core-neu-1000"
                aria-label="Refresh page"
              >
                Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="text-invert-low hover:text-invert-high font-medium px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-core-neu-600 focus:ring-offset-2 focus:ring-offset-core-neu-1000"
                aria-label="Go to home page"
              >
                Go Home
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-invert-low">
                If this problem persists, please try refreshing the page or contact support.
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Render children normally when there's no error
    return this.props.children
  }
}

export default ContentWizardErrorBoundary
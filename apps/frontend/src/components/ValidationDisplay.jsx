/**
 * ValidationDisplay Component
 * 
 * A reusable component for displaying validation errors and warnings
 * with consistent styling that matches the design system.
 * Supports different error types, severity levels, and dismissible errors.
 */

import React from 'react'

/**
 * ValidationDisplay Component
 * @param {Object} props - Component props
 * @param {Array} props.errors - Array of error objects to display
 * @param {Array} props.warnings - Array of warning objects to display
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showIcons - Whether to show error/warning icons
 * @param {Function} props.onDismiss - Callback for dismissing errors
 * @param {boolean} props.dismissible - Whether errors can be dismissed
 * @param {string} props.ariaLabel - ARIA label for the error container
 */
export const ValidationDisplay = ({
  errors = [],
  warnings = [],
  className = '',
  showIcons = true,
  onDismiss = null,
  dismissible = false,
  ariaLabel = 'Validation messages',
  ...props
}) => {
  // Don't render if no errors or warnings
  if (errors.length === 0 && warnings.length === 0) {
    return null
  }

  /**
   * Handles dismissing an error or warning
   */
  const handleDismiss = (item, index, type) => {
    if (onDismiss) {
      onDismiss(item, index, type)
    }
  }

  /**
   * Gets the appropriate icon for error type
   */
  const getErrorIcon = () => (
    <svg
      className="w-5 h-5 text-error-500 flex-shrink-0"
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
  )

  /**
   * Gets the appropriate icon for warning type
   */
  const getWarningIcon = () => (
    <svg
      className="w-5 h-5 text-warning-500 flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  )

  /**
   * Gets the dismiss button
   */
  const getDismissButton = (item, index, type) => (
    <button
      onClick={() => handleDismiss(item, index, type)}
      className="ml-auto flex-shrink-0 p-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 transition-colors"
      aria-label={`Dismiss ${type}: ${item.message}`}
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
  )

  /**
   * Renders an individual error item
   */
  const renderErrorItem = (error, index) => (
    <div
      key={`error-${index}-${error.type || 'unknown'}`}
      className="flex items-start gap-3 p-3 bg-error-500/10 border border-error-500/20 rounded-lg focus-within:ring-2 focus-within:ring-error-500 focus-within:ring-offset-1"
      role="alert"
      aria-labelledby={`error-${index}-message`}
    >
      {showIcons && getErrorIcon()}
      
      <div className="flex-1 min-w-0">
        <p id={`error-${index}-message`} className="text-error-600 text-sm font-medium">
          {error.message}
        </p>
        
        {error.fileName && (
          <p className="text-error-500 text-xs mt-1">
            File: {error.fileName}
          </p>
        )}
        
        {error.field && (
          <p className="text-error-500 text-xs mt-1">
            Field: {error.field}
          </p>
        )}
        
        {error.details && (
          <p className="text-error-500 text-xs mt-1">
            {error.details}
          </p>
        )}
      </div>
      
      {dismissible && getDismissButton(error, index, 'error')}
    </div>
  )

  /**
   * Renders an individual warning item
   */
  const renderWarningItem = (warning, index) => (
    <div
      key={`warning-${index}-${warning.type || 'unknown'}`}
      className="flex items-start gap-3 p-3 bg-warning-500/10 border border-warning-500/20 rounded-lg focus-within:ring-2 focus-within:ring-warning-500 focus-within:ring-offset-1"
      role="alert"
      aria-live="polite"
      aria-labelledby={`warning-${index}-message`}
    >
      {showIcons && getWarningIcon()}
      
      <div className="flex-1 min-w-0">
        <p id={`warning-${index}-message`} className="text-warning-600 text-sm font-medium">
          {warning.message}
        </p>
        
        {warning.fileName && (
          <p className="text-warning-500 text-xs mt-1">
            File: {warning.fileName}
          </p>
        )}
        
        {warning.field && (
          <p className="text-warning-500 text-xs mt-1">
            Field: {warning.field}
          </p>
        )}
        
        {warning.details && (
          <p className="text-warning-500 text-xs mt-1">
            {warning.details}
          </p>
        )}
      </div>
      
      {dismissible && getDismissButton(warning, index, 'warning')}
    </div>
  )

  const containerClasses = [
    'space-y-2',
    className
  ].filter(Boolean).join(' ')

  return (
    <div 
      className={containerClasses}
      role="region"
      aria-label={ariaLabel}
      {...props}
    >
      {/* Render errors first */}
      {errors.map((error, index) => renderErrorItem(error, index))}
      
      {/* Render warnings */}
      {warnings.map((warning, index) => renderWarningItem(warning, index))}
    </div>
  )
}

/**
 * ErrorDisplay Component - Specialized for errors only
 */
export const ErrorDisplay = (props) => (
  <ValidationDisplay 
    {...props} 
    warnings={[]} 
    ariaLabel="Error messages"
  />
)

/**
 * WarningDisplay Component - Specialized for warnings only
 */
export const WarningDisplay = (props) => (
  <ValidationDisplay 
    {...props} 
    errors={[]} 
    ariaLabel="Warning messages"
  />
)

export default ValidationDisplay
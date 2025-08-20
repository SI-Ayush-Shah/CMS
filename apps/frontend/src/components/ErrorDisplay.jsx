/**
 * Comprehensive Error Display Component
 * 
 * Displays user-friendly error messages with recovery options and
 * appropriate styling based on error severity and category.
 */

import React from 'react'
import { 
  ErrorSeverity, 
  ErrorCategory, 
  RecoveryAction, 
  formatErrorForDisplay 
} from '../utils/errorHandling'
import { LoadingIndicator, LoadingVariant, LoadingSize } from './LoadingIndicator'

/**
 * Main Error Display Component
 */
export const ErrorDisplay = ({
  error,
  onRetry,
  onReset,
  onRefresh,
  onContactSupport,
  onExecuteRecoveryAction,
  isRecovering = false,
  showTechnicalDetails = false,
  showRecoveryActions = true,
  className = '',
  compact = false,
  ...props
}) => {
  if (!error) {
    return null
  }

  // Format error for display
  const displayError = formatErrorForDisplay(error, {
    showTechnicalDetails,
    showRecoveryActions,
    showErrorId: import.meta.env.VITE_NODE_ENV === 'development'
  })

  const baseClasses = `error-display error-${displayError.severity} error-${displayError.category}`
  const classes = `${baseClasses} ${className}`.trim()

  if (compact) {
    return (
      <CompactErrorDisplay
        error={displayError}
        onRetry={onRetry}
        onReset={onReset}
        onExecuteRecoveryAction={onExecuteRecoveryAction}
        isRecovering={isRecovering}
        className={classes}
        {...props}
      />
    )
  }

  return (
    <FullErrorDisplay
      error={displayError}
      onRetry={onRetry}
      onReset={onReset}
      onRefresh={onRefresh}
      onContactSupport={onContactSupport}
      onExecuteRecoveryAction={onExecuteRecoveryAction}
      isRecovering={isRecovering}
      className={classes}
      {...props}
    />
  )
}

/**
 * Full Error Display Component
 */
const FullErrorDisplay = ({
  error,
  onRetry,
  onReset,
  onRefresh,
  onContactSupport,
  onExecuteRecoveryAction,
  isRecovering,
  className,
  ...props
}) => {
  const severityConfig = getSeverityConfig(error.severity)
  const iconConfig = getIconConfig(error.category)

  return (
    <div className={`rounded-lg border p-4 ${severityConfig.containerClasses} ${className}`} {...props}>
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <div className={`flex-shrink-0 ${severityConfig.iconContainerClasses}`}>
          {iconConfig.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Error Title */}
          <h3 className={`font-medium text-sm mb-1 ${severityConfig.titleClasses}`}>
            {error.title}
          </h3>

          {/* Error Message */}
          <p className={`text-sm mb-3 ${severityConfig.messageClasses}`}>
            {error.message}
          </p>

          {/* Technical Details (Development Only) */}
          {error.technicalMessage && (
            <details className="mb-3">
              <summary className={`text-xs cursor-pointer hover:opacity-80 mb-2 ${severityConfig.detailsClasses}`}>
                Technical Details
              </summary>
              <div className={`p-3 rounded text-xs font-mono overflow-auto max-h-32 ${severityConfig.technicalClasses}`}>
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
          {error.recoveryActions && error.recoveryActions.length > 0 && (
            <ErrorRecoveryActions
              actions={error.recoveryActions}
              onRetry={onRetry}
              onReset={onReset}
              onRefresh={onRefresh}
              onContactSupport={onContactSupport}
              onExecuteRecoveryAction={onExecuteRecoveryAction}
              isRecovering={isRecovering}
              severity={error.severity}
              retryable={error.retryable}
            />
          )}

          {/* Recovery Loading State */}
          {isRecovering && (
            <div className="mt-3 flex items-center gap-2">
              <LoadingIndicator
                variant={LoadingVariant.SPINNER}
                size={LoadingSize.SMALL}
                color={severityConfig.loadingColor}
              />
              <span className={`text-xs ${severityConfig.messageClasses}`}>
                Attempting recovery...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Compact Error Display Component
 */
const CompactErrorDisplay = ({
  error,
  onRetry,
  onReset,
  onExecuteRecoveryAction,
  isRecovering,
  className,
  ...props
}) => {
  const severityConfig = getSeverityConfig(error.severity)
  const iconConfig = getIconConfig(error.category)

  return (
    <div className={`flex items-center gap-2 p-2 rounded ${severityConfig.compactClasses} ${className}`} {...props}>
      {/* Error Icon */}
      <div className="flex-shrink-0">
        {React.cloneElement(iconConfig.icon, { className: 'w-4 h-4' })}
      </div>

      {/* Error Message */}
      <span className={`flex-1 text-sm ${severityConfig.messageClasses}`}>
        {error.message}
      </span>

      {/* Recovery Actions */}
      {!isRecovering && error.retryable && onRetry && (
        <button
          onClick={onRetry}
          className={`text-xs px-2 py-1 rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 ${severityConfig.buttonClasses}`}
        >
          Retry
        </button>
      )}

      {!isRecovering && onReset && (
        <button
          onClick={onReset}
          className={`text-xs px-2 py-1 rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 ${severityConfig.secondaryButtonClasses}`}
        >
          Reset
        </button>
      )}

      {/* Recovery Loading State */}
      {isRecovering && (
        <LoadingIndicator
          variant={LoadingVariant.SPINNER}
          size={LoadingSize.SMALL}
          color={severityConfig.loadingColor}
        />
      )}
    </div>
  )
}

/**
 * Error Recovery Actions Component
 */
const ErrorRecoveryActions = ({
  actions,
  onRetry,
  onReset,
  onRefresh,
  onContactSupport,
  onExecuteRecoveryAction,
  isRecovering,
  severity,
  retryable
}) => {
  const severityConfig = getSeverityConfig(severity)

  const handleAction = (action) => {
    if (isRecovering) return

    switch (action) {
      case RecoveryAction.RETRY:
        onRetry?.()
        break
      case RecoveryAction.RESET:
        onReset?.()
        break
      case RecoveryAction.REFRESH:
        onRefresh?.()
        break
      case RecoveryAction.CONTACT_SUPPORT:
        onContactSupport?.()
        break
      default:
        onExecuteRecoveryAction?.(action)
    }
  }

  const getActionLabel = (action) => {
    switch (action) {
      case RecoveryAction.RETRY:
        return 'Try Again'
      case RecoveryAction.RESET:
        return 'Reset'
      case RecoveryAction.REFRESH:
        return 'Refresh Page'
      case RecoveryAction.CHECK_CONNECTION:
        return 'Check Connection'
      case RecoveryAction.WAIT_AND_RETRY:
        return 'Wait & Retry'
      case RecoveryAction.CONTACT_SUPPORT:
        return 'Get Help'
      case RecoveryAction.LOGIN_AGAIN:
        return 'Login Again'
      case RecoveryAction.CLEAR_CACHE:
        return 'Clear Cache'
      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const isPrimaryAction = (action) => {
    return action === RecoveryAction.RETRY || action === RecoveryAction.RESET
  }

  const primaryActions = actions.filter(isPrimaryAction)
  const secondaryActions = actions.filter(action => !isPrimaryAction(action))

  return (
    <div className="space-y-2">
      {/* Primary Actions */}
      {primaryActions.length > 0 && (
        <div className="flex gap-2">
          {primaryActions.map((action) => (
            <button
              key={action}
              onClick={() => handleAction(action)}
              disabled={isRecovering || (action === RecoveryAction.RETRY && !retryable)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
                action === RecoveryAction.RETRY
                  ? severityConfig.primaryButtonClasses
                  : severityConfig.secondaryButtonClasses
              }`}
            >
              {getActionLabel(action)}
            </button>
          ))}
        </div>
      )}

      {/* Secondary Actions */}
      {secondaryActions.length > 0 && (
        <div className="flex gap-2 text-xs">
          {secondaryActions.map((action, index) => (
            <React.Fragment key={action}>
              {index > 0 && <span className={severityConfig.separatorClasses}>•</span>}
              <button
                onClick={() => handleAction(action)}
                disabled={isRecovering}
                className={`underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded disabled:cursor-not-allowed ${severityConfig.linkClasses}`}
              >
                {getActionLabel(action)}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Gets severity-specific styling configuration
 */
const getSeverityConfig = (severity) => {
  switch (severity) {
    case ErrorSeverity.LOW:
      return {
        containerClasses: 'bg-warning-50 border-warning-200',
        iconContainerClasses: 'text-warning-500',
        titleClasses: 'text-warning-800',
        messageClasses: 'text-warning-700',
        detailsClasses: 'text-warning-600',
        technicalClasses: 'bg-warning-100 text-warning-800',
        primaryButtonClasses: 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-500',
        secondaryButtonClasses: 'border border-warning-500 text-warning-700 hover:bg-warning-50 focus:ring-warning-500',
        buttonClasses: 'bg-warning-500 text-white focus:ring-warning-500',
        secondaryButtonClasses: 'border border-warning-500 text-warning-700 focus:ring-warning-500',
        linkClasses: 'text-warning-600 hover:text-warning-700 focus:ring-warning-500',
        separatorClasses: 'text-warning-400',
        compactClasses: 'bg-warning-50 border border-warning-200',
        loadingColor: 'warning'
      }

    case ErrorSeverity.MEDIUM:
      return {
        containerClasses: 'bg-error-50 border-error-200',
        iconContainerClasses: 'text-error-500',
        titleClasses: 'text-error-800',
        messageClasses: 'text-error-700',
        detailsClasses: 'text-error-600',
        technicalClasses: 'bg-error-100 text-error-800',
        primaryButtonClasses: 'bg-error-500 hover:bg-error-600 text-white focus:ring-error-500',
        secondaryButtonClasses: 'border border-error-500 text-error-700 hover:bg-error-50 focus:ring-error-500',
        buttonClasses: 'bg-error-500 text-white focus:ring-error-500',
        linkClasses: 'text-error-600 hover:text-error-700 focus:ring-error-500',
        separatorClasses: 'text-error-400',
        compactClasses: 'bg-error-50 border border-error-200',
        loadingColor: 'error'
      }

    case ErrorSeverity.HIGH:
    case ErrorSeverity.CRITICAL:
      return {
        containerClasses: 'bg-red-50 border-red-300',
        iconContainerClasses: 'text-red-600',
        titleClasses: 'text-red-900',
        messageClasses: 'text-red-800',
        detailsClasses: 'text-red-700',
        technicalClasses: 'bg-red-100 text-red-900',
        primaryButtonClasses: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600',
        secondaryButtonClasses: 'border border-red-600 text-red-800 hover:bg-red-50 focus:ring-red-600',
        buttonClasses: 'bg-red-600 text-white focus:ring-red-600',
        linkClasses: 'text-red-700 hover:text-red-800 focus:ring-red-600',
        separatorClasses: 'text-red-500',
        compactClasses: 'bg-red-50 border border-red-300',
        loadingColor: 'error'
      }

    default:
      return {
        containerClasses: 'bg-gray-50 border-gray-200',
        iconContainerClasses: 'text-gray-500',
        titleClasses: 'text-gray-800',
        messageClasses: 'text-gray-700',
        detailsClasses: 'text-gray-600',
        technicalClasses: 'bg-gray-100 text-gray-800',
        primaryButtonClasses: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500',
        secondaryButtonClasses: 'border border-gray-500 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        buttonClasses: 'bg-gray-500 text-white focus:ring-gray-500',
        linkClasses: 'text-gray-600 hover:text-gray-700 focus:ring-gray-500',
        separatorClasses: 'text-gray-400',
        compactClasses: 'bg-gray-50 border border-gray-200',
        loadingColor: 'gray'
      }
  }
}

/**
 * Gets category-specific icon configuration
 */
const getIconConfig = (category) => {
  const iconClass = 'w-5 h-5'

  switch (category) {
    case ErrorCategory.NETWORK:
      return {
        icon: (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        )
      }

    case ErrorCategory.UPLOAD:
      return {
        icon: (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )
      }

    case ErrorCategory.VALIDATION:
      return {
        icon: (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      }

    case ErrorCategory.PROCESSING:
      return {
        icon: (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      }

    default:
      return {
        icon: (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      }
  }
}

export default ErrorDisplay
/**
 * Comprehensive Loading Indicator Component
 * 
 * Provides various loading indicators for different use cases including
 * spinners, progress bars, skeleton loaders, and operation-specific indicators.
 */

import React from 'react'
import { LoadingState, LoadingType } from '../hooks/useLoadingState'

/**
 * Loading indicator variants
 */
export const LoadingVariant = {
  SPINNER: 'spinner',
  PROGRESS: 'progress',
  SKELETON: 'skeleton',
  DOTS: 'dots',
  PULSE: 'pulse',
  OVERLAY: 'overlay'
}

/**
 * Loading indicator sizes
 */
export const LoadingSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
}

/**
 * Main Loading Indicator Component
 */
export const LoadingIndicator = ({
  variant = LoadingVariant.SPINNER,
  size = LoadingSize.MEDIUM,
  progress = null,
  message = null,
  type = LoadingType.PROCESS,
  overlay = false,
  className = '',
  color = 'primary',
  ...props
}) => {
  const baseClasses = `loading-indicator loading-${variant} loading-${size} loading-${color}`
  const classes = `${baseClasses} ${className}`.trim()

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" {...props}>
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <LoadingContent
            variant={variant}
            size={size}
            progress={progress}
            message={message}
            type={type}
            color={color}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={classes} {...props}>
      <LoadingContent
        variant={variant}
        size={size}
        progress={progress}
        message={message}
        type={type}
        color={color}
      />
    </div>
  )
}

/**
 * Loading Content Component
 */
const LoadingContent = ({ variant, size, progress, message, type, color }) => {
  switch (variant) {
    case LoadingVariant.SPINNER:
      return <SpinnerLoader size={size} color={color} message={message} />
    
    case LoadingVariant.PROGRESS:
      return <ProgressLoader size={size} color={color} progress={progress} message={message} />
    
    case LoadingVariant.SKELETON:
      return <SkeletonLoader size={size} type={type} />
    
    case LoadingVariant.DOTS:
      return <DotsLoader size={size} color={color} message={message} />
    
    case LoadingVariant.PULSE:
      return <PulseLoader size={size} color={color} message={message} />
    
    default:
      return <SpinnerLoader size={size} color={color} message={message} />
  }
}

/**
 * Spinner Loading Component
 */
const SpinnerLoader = ({ size, color, message }) => {
  const sizeClasses = {
    [LoadingSize.SMALL]: 'w-4 h-4',
    [LoadingSize.MEDIUM]: 'w-6 h-6',
    [LoadingSize.LARGE]: 'w-8 h-8'
  }

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
    gray: 'text-gray-500'
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message && (
        <p className={`text-sm ${colorClasses[color]} text-center`}>
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * Progress Bar Loading Component
 */
const ProgressLoader = ({ size, color, progress, message }) => {
  const heightClasses = {
    [LoadingSize.SMALL]: 'h-1',
    [LoadingSize.MEDIUM]: 'h-2',
    [LoadingSize.LARGE]: 'h-3'
  }

  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    gray: 'bg-gray-500'
  }

  const textColorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
    gray: 'text-gray-600'
  }

  const progressValue = Math.max(0, Math.min(100, progress || 0))

  return (
    <div className="w-full space-y-2">
      {message && (
        <div className="flex justify-between items-center">
          <p className={`text-sm ${textColorClasses[color]}`}>
            {message}
          </p>
          <span className={`text-xs ${textColorClasses[color]} font-mono`}>
            {Math.round(progressValue)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heightClasses[size]} overflow-hidden`}>
        <div
          className={`${heightClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progressValue}%` }}
          role="progressbar"
          aria-valuenow={progressValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

/**
 * Skeleton Loading Component
 */
const SkeletonLoader = ({ size, type }) => {
  const getSkeletonContent = () => {
    switch (type) {
      case LoadingType.UPLOAD:
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded animate-pulse" />
          </div>
        )
      
      case LoadingType.FETCH:
        return (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
          </div>
        )
      
      default:
        return (
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse" />
          </div>
        )
    }
  }

  return (
    <div className="w-full">
      {getSkeletonContent()}
    </div>
  )
}

/**
 * Dots Loading Component
 */
const DotsLoader = ({ size, color, message }) => {
  const sizeClasses = {
    [LoadingSize.SMALL]: 'w-1 h-1',
    [LoadingSize.MEDIUM]: 'w-2 h-2',
    [LoadingSize.LARGE]: 'w-3 h-3'
  }

  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    gray: 'bg-gray-500'
  }

  const textColorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
    gray: 'text-gray-600'
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
      {message && (
        <p className={`text-sm ${textColorClasses[color]} text-center`}>
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * Pulse Loading Component
 */
const PulseLoader = ({ size, color, message }) => {
  const sizeClasses = {
    [LoadingSize.SMALL]: 'w-8 h-8',
    [LoadingSize.MEDIUM]: 'w-12 h-12',
    [LoadingSize.LARGE]: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    gray: 'bg-gray-500'
  }

  const textColorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
    gray: 'text-gray-600'
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse opacity-75`} />
      {message && (
        <p className={`text-sm ${textColorClasses[color]} text-center`}>
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * Operation-specific loading indicators
 */
export const UploadLoadingIndicator = ({ progress, message, files = [] }) => (
  <div className="space-y-4">
    <LoadingIndicator
      variant={LoadingVariant.PROGRESS}
      progress={progress}
      message={message || 'Uploading files...'}
      type={LoadingType.UPLOAD}
      color="primary"
    />
    {files.length > 0 && (
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center space-x-3 text-sm">
            <div className="w-4 h-4">
              {file.progress === 100 ? (
                <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <LoadingIndicator variant={LoadingVariant.SPINNER} size={LoadingSize.SMALL} />
              )}
            </div>
            <span className="flex-1 truncate">{file.name}</span>
            <span className="text-xs text-gray-500">{file.progress || 0}%</span>
          </div>
        ))}
      </div>
    )}
  </div>
)

export const SubmissionLoadingIndicator = ({ phase, message }) => {
  const phaseMessages = {
    uploading: 'Uploading images...',
    generating: 'Generating content...',
    saving: 'Saving content...',
    submitting: 'Submitting...'
  }

  return (
    <LoadingIndicator
      variant={LoadingVariant.SPINNER}
      message={message || phaseMessages[phase] || 'Processing...'}
      type={LoadingType.SUBMIT}
      color="primary"
    />
  )
}

export const NetworkLoadingIndicator = ({ isRetrying, retryCount, maxRetries }) => (
  <div className="flex items-center space-x-3">
    <LoadingIndicator variant={LoadingVariant.DOTS} size={LoadingSize.SMALL} color="warning" />
    <div className="text-sm text-warning-600">
      {isRetrying ? (
        <span>Retrying... ({retryCount}/{maxRetries})</span>
      ) : (
        <span>Connecting...</span>
      )}
    </div>
  </div>
)

export default LoadingIndicator
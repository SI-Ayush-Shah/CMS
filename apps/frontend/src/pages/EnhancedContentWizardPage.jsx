/**
 * Enhanced Content Wizard Page
 * 
 * An enhanced version of the ContentWizardPage that demonstrates the complete
 * validation, error handling, and loading state system integration.
 */

import React, { useState, useCallback, useEffect } from 'react'
import { EnhancedAiChatInput } from '../components/EnhancedAiChatInput'
import ErrorBoundary from '../components/ErrorBoundary'
import ErrorDisplay from '../components/ErrorDisplay'
import LoadingIndicator, { LoadingVariant, SubmissionLoadingIndicator } from '../components/LoadingIndicator'
import { setupGlobalErrorHandling, enhanceError, logError } from '../utils/errorHandling'
import { useErrorHandler } from '../components/ErrorBoundary'

/**
 * Enhanced Content Wizard Page Component
 */
export default function EnhancedContentWizardPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSubmission, setLastSubmission] = useState(null)

  /**
   * Handles form submission from the enhanced input
   */
  const handleSubmit = useCallback(async (formData) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock API response
      const mockResponse = {
        id: `content-${Date.now()}`,
        generatedContent: `Generated content based on: "${formData.text.substring(0, 50)}..."`,
        imageUrls: formData.images.map(img => `https://example.com/uploads/${img.id}`),
        timestamp: new Date().toISOString()
      }
      
      setLastSubmission({
        success: true,
        data: mockResponse,
        timestamp: new Date().toISOString()
      })
      
      console.log('Content generated successfully:', mockResponse)
      
    } catch (error) {
      setLastSubmission({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      // Re-throw to let the component handle it
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  /**
   * Handles validation error boundary errors
   */
  const handleValidationError = useCallback((error, errorInfo) => {
    console.error('Validation system error:', error, errorInfo)
    
    // In a real app, you might want to report this to an error tracking service
    // reportError(error, { context: 'validation', errorInfo })
  }, [])

  /**
   * Handles error boundary retry
   */
  const handleRetry = useCallback(() => {
    setLastSubmission(null)
    setIsSubmitting(false)
  }, [])

  /**
   * Handles error boundary reset
   */
  const handleReset = useCallback(() => {
    setLastSubmission(null)
    setIsSubmitting(false)
    // Could also clear any global state here
  }, [])

  return (
    <div className="relative w-full flex h-full items-center justify-center">
      <div className="flex flex-col w-full gap-4 h-full justify-center">
        
        {/* Title - positioned exactly as in Figma */}
        <div className="font-semibold text-invert-high text-[36px] text-center whitespace-nowrap">
          What's on your mind today?
        </div>

        {/* Subtitle - positioned exactly as in Figma */}
        <div className="font-normal text-invert-low text-[14px] text-center whitespace-nowrap">
          Type it. Dream it. Watch it appear!
        </div>

        {/* Success message */}
        {lastSubmission?.success && (
          <div className="w-full max-w-[600px] mx-auto mb-4">
            <div className="p-4 bg-success-500/10 border border-success-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-success-600 font-medium text-sm">
                    Content generated successfully!
                  </p>
                  <p className="text-success-500 text-xs mt-1">
                    {lastSubmission.data.generatedContent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced AI Chat Input with Error Boundary */}
        <div className="w-full max-w-[600px] h-[175px] backdrop-blur-[20px] backdrop-filter bg-core-neu-1000 rounded-[15px] mx-auto">
          <ValidationErrorBoundary
            title="Content Input Error"
            message="There was an issue with the content input system. Please try again or reset the form."
            onError={handleValidationError}
            onRetry={handleRetry}
            onReset={handleReset}
          >
            <EnhancedAiChatInput
              onSubmit={handleSubmit}
              disabled={isSubmitting}
              maxLength={2000}
              maxImages={10}
              validationOptions={{
                text: {
                  required: true,
                  minLength: 10
                },
                images: {
                  required: false,
                  maxImages: 10
                }
              }}
            />
          </ValidationErrorBoundary>
        </div>

        {/* Development info */}
        {import.meta.env.VITE_NODE_ENV === 'development' && (
          <div className="w-full max-w-[600px] mx-auto mt-4">
            <details className="text-xs text-invert-low/60">
              <summary className="cursor-pointer hover:text-invert-low">
                Development Info
              </summary>
              <div className="mt-2 p-2 bg-core-neu-900/50 rounded text-xs font-mono">
                <div>Submitting: {isSubmitting.toString()}</div>
                <div>Last Submission: {lastSubmission ? 'Available' : 'None'}</div>
                {lastSubmission && (
                  <div className="mt-1">
                    Status: {lastSubmission.success ? 'Success' : 'Error'}
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
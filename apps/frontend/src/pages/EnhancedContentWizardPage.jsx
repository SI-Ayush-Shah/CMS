/**
 * Enhanced Content Wizard Page
 *
 * An enhanced version of the ContentWizardPage that demonstrates the complete
 * validation, error handling, and loading state system integration.
 */

import React, { useState, useCallback, useEffect } from "react";
import { EnhancedAiChatInput } from "../components/EnhancedAiChatInput";
import ErrorBoundary from "../components/ErrorBoundary";
import ErrorDisplay from "../components/ErrorDisplay";
import LoadingIndicator, {
  LoadingVariant,
  SubmissionLoadingIndicator,
} from "../components/LoadingIndicator";
import {
  setupGlobalErrorHandling,
  enhanceError,
  logError,
} from "../utils/errorHandling";
import { useErrorHandler } from "../components/ErrorBoundary";

/**
 * Enhanced Content Wizard Page Component
 */
export default function EnhancedContentWizardPage() {
  const [lastSubmission, setLastSubmission] = useState(null);
  const [submissionPhase, setSubmissionPhase] = useState("idle");

  // Enhanced error handling
  const {
    error: pageError,
    handleError: handlePageError,
    clearError,
  } = useErrorHandler();

  // Set up global error handling
  useEffect(() => {
    const cleanup = setupGlobalErrorHandling((error) => {
      handlePageError(error, {
        context: "global",
        page: "EnhancedContentWizardPage",
      });
    });

    return cleanup;
  }, [handlePageError]);

  /**
   * Handles form submission from the enhanced input with comprehensive error handling
   */
  const handleSubmit = useCallback(
    async (formData) => {
      clearError();
      setSubmissionPhase("submitting");

      try {
        // Simulate different phases of submission
        setSubmissionPhase("uploading");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSubmissionPhase("generating");
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setSubmissionPhase("saving");
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Simulate occasional failures for testing
        if (Math.random() < 0.2) {
          // 20% chance of failure
          throw new Error("Mock API failure for testing error handling");
        }

        // Mock API response
        const mockResponse = {
          id: `content-${Date.now()}`,
          generatedContent: `Generated content based on: "${formData.text.substring(0, 50)}..."`,
          imageUrls: formData.images.map(
            (img) => `https://example.com/uploads/${img.id}`
          ),
          timestamp: new Date().toISOString(),
        };

        setLastSubmission({
          success: true,
          data: mockResponse,
          timestamp: new Date().toISOString(),
        });

        setSubmissionPhase("idle");
        console.log("Content generated successfully:", mockResponse);
      } catch (error) {
        const enhancedError = enhanceError(error, {
          type: "submission",
          context: "content_wizard_submission",
          formData: {
            textLength: formData.text?.length || 0,
            imageCount: formData.images?.length || 0,
          },
        });

        setLastSubmission({
          success: false,
          error: enhancedError,
          timestamp: new Date().toISOString(),
        });

        setSubmissionPhase("idle");
        handlePageError(enhancedError);

        // Log the error for debugging
        logError(enhancedError, {
          context: "content_wizard_submission",
          userAction: "form_submit",
        });

        // Re-throw to let the input component handle it
        throw enhancedError;
      }
    },
    [clearError, handlePageError]
  );

  /**
   * Handles component error boundary errors
   */
  const handleComponentError = useCallback((error, errorInfo) => {
    const enhancedError = enhanceError(error, {
      type: "component",
      context: "content_wizard_component",
      componentStack: errorInfo.componentStack,
    });

    logError(enhancedError, {
      context: "error_boundary",
      component: "EnhancedContentWizardPage",
    });

    // In a real app, you might want to report this to an error tracking service
    // errorTrackingService.captureError(enhancedError)
  }, []);

  /**
   * Handles error boundary retry
   */
  const handleRetry = useCallback(async () => {
    clearError();
    setLastSubmission(null);
    setSubmissionPhase("idle");

    // If there was a previous submission attempt, we could retry it here
    if (lastSubmission?.error) {
      console.log("Retrying after error boundary recovery");
    }
  }, [clearError, lastSubmission]);

  /**
   * Handles error boundary reset
   */
  const handleReset = useCallback(() => {
    clearError();
    setLastSubmission(null);
    setSubmissionPhase("idle");

    // Clear any cached form data or state
    console.log("Resetting content wizard state");
  }, [clearError]);

  /**
   * Handles page refresh recovery
   */
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  /**
   * Handles contact support recovery
   */
  const handleContactSupport = useCallback((error) => {
    // In a real app, this would open a support modal or redirect to help
    console.log("Contact support requested for error:", error?.errorId);

    // Could open a modal with error details pre-filled
    // or redirect to a support page with error context
  }, []);

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

        {/* Page-level error display */}
        {pageError && (
          <div className="w-full max-w-[600px] mx-auto mb-4">
            <ErrorDisplay
              error={pageError}
              onRetry={handleRetry}
              onReset={handleReset}
              onRefresh={handleRefresh}
              onContactSupport={handleContactSupport}
              showTechnicalDetails={
                import.meta.env.VITE_NODE_ENV === "development"
              }
            />
          </div>
        )}

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

        {/* Submission loading indicator */}
        {submissionPhase !== "idle" && (
          <div className="w-full max-w-[600px] mx-auto mb-4">
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <SubmissionLoadingIndicator phase={submissionPhase} />
            </div>
          </div>
        )}

        {/* Enhanced AI Chat Input with Comprehensive Error Boundary */}
        <div className="w-full max-w-[600px] h-[175px] backdrop-blur-[20px] backdrop-filter bg-core-neu-1000 rounded-[15px] mx-auto">
          <ErrorBoundary
            name="ContentWizardInput"
            title="Content Input Error"
            message="There was an issue with the content input system. Please try again or reset the form."
            onError={handleComponentError}
            onRetry={handleRetry}
            onReset={handleReset}
            onRefresh={handleRefresh}
            onContactSupport={handleContactSupport}
            maxRetries={3}
          >
            <EnhancedAiChatInput
              onSubmit={handleSubmit}
              disabled={submissionPhase !== "idle"}
              maxLength={5000}
              maxImages={10}
              validationOptions={{
                text: {
                  required: true,
                  minLength: 10,
                },
                images: {
                  required: false,
                  maxImages: 10,
                },
              }}
            />
          </ErrorBoundary>
        </div>

        {/* Development info */}
        {import.meta.env.VITE_NODE_ENV === "development" && (
          <div className="w-full max-w-[600px] mx-auto mt-4">
            <details className="text-xs text-invert-low/60">
              <summary className="cursor-pointer hover:text-invert-low">
                Development Info
              </summary>
              <div className="mt-2 p-2 bg-core-neu-900/50 rounded text-xs font-mono space-y-1">
                <div>Submission Phase: {submissionPhase}</div>
                <div>Page Error: {pageError ? "Present" : "None"}</div>
                <div>
                  Last Submission: {lastSubmission ? "Available" : "None"}
                </div>
                {lastSubmission && (
                  <div className="mt-1">
                    Status: {lastSubmission.success ? "Success" : "Error"}
                    {lastSubmission.error && (
                      <div className="ml-2 text-error-400">
                        Error Type: {lastSubmission.error.category}
                      </div>
                    )}
                  </div>
                )}
                {pageError && (
                  <div className="mt-1 text-error-400">
                    <div>Error ID: {pageError.errorId}</div>
                    <div>Category: {pageError.category}</div>
                    <div>Severity: {pageError.severity}</div>
                    <div>Retryable: {pageError.retryable.toString()}</div>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

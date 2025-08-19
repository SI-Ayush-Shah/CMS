import { useState, useCallback } from "react";
import { EnhancedAiChatInput } from "../components/EnhancedAiChatInput";
import { useContentSubmission } from "../hooks/useContentSubmission";
import ContentWizardErrorBoundary from "../components/ContentWizardErrorBoundary";

// Main Content Wizard Screen component
export default function ContentWizardPage() {
  // State for success/error feedback
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackType, setFeedbackType] = useState("") // 'success' | 'error' | ''

  // Content submission hook
  const {
    submit,
    isLoading
  } = useContentSubmission({
    onSuccess: () => {
      setFeedbackMessage("Content generated successfully!")
      setFeedbackType("success")
      
      // Clear feedback after 5 seconds
      setTimeout(() => {
        setFeedbackMessage("")
        setFeedbackType("")
      }, 5000)
    },
    onError: (error) => {
      setFeedbackMessage(error.message || "Failed to generate content. Please try again.")
      setFeedbackType("error")
      
      // Clear error feedback after 8 seconds
      setTimeout(() => {
        setFeedbackMessage("")
        setFeedbackType("")
      }, 8000)
    }
  })

  /**
   * Handles content submission from the enhanced input
   */
  const handleContentSubmit = useCallback(async (submissionData) => {
    const { text, images } = submissionData
    
    try {
      await submit(text, images, {
        saveContent: true // Save the content after generation
      })
    } catch (error) {
      console.error('Content submission failed:', error)
    }
  }, [submit])

  /**
   * Clears feedback messages
   */
  const clearFeedback = useCallback(() => {
    setFeedbackMessage("")
    setFeedbackType("")
  }, [])

  return (
    <ContentWizardErrorBoundary>
      <div className="relative w-full flex h-full items-center justify-center">
        <div className="flex flex-col w-full gap-4 h-full justify-center">
          {/* Title - responsive design */}
          <div className="font-semibold text-invert-high text-2xl sm:text-3xl lg:text-[36px] text-center px-4">
            What's on your mind today?
          </div>

          {/* Subtitle - responsive design */}
          <div className="font-normal text-invert-low text-sm text-center px-4">
            Type it. Dream it. Watch it appear!
          </div>

          {/* Feedback message */}
          {feedbackMessage && (
            <div className={`max-w-[600px] mx-auto p-3 rounded-lg text-center text-sm font-medium transition-all duration-300 mx-4 sm:mx-auto ${
              feedbackType === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-error-500/10 border border-error-500/20 text-error-400'
            }`}>
              <div className="flex items-center justify-center gap-2">
                {feedbackType === 'success' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{feedbackMessage}</span>
                <button
                  onClick={clearFeedback}
                  className="ml-2 hover:opacity-70 transition-opacity"
                  aria-label="Dismiss message"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced AI Chat Input - responsive design */}
            <div className="w-full max-w-[600px] min-h-[175px] backdrop-blur-[20px] backdrop-filter bg-core-neu-1000 rounded-[15px] mx-auto px-4 sm:px-0">
              <EnhancedAiChatInput
                onSubmit={handleContentSubmit}
                placeholder="Your blog crafting experience starts here..."
                maxLength={2000}
                maxImages={10}
                disabled={isLoading}
                validationOptions={{
                  text: {
                    required: true,
                    maxLength: 2000
                  },
                  images: {
                    maxImages: 10,
                    required: false
                  }
                }}
              />
            </div>
          </div>
        </div>
      </ContentWizardErrorBoundary>
    );
}

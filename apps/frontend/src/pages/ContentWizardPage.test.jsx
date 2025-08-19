/**
 * Integration tests for ContentWizardPage
 * Tests the complete user workflow from typing to submission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContentWizardPage from './ContentWizardPage'

// Mock the hooks and components
vi.mock('../hooks/useContentSubmission', () => ({
  useContentSubmission: vi.fn(() => ({
    submit: vi.fn().mockResolvedValue({ success: true }),
    isLoading: false
  }))
}))

vi.mock('../components/EnhancedAiChatInput', () => ({
  EnhancedAiChatInput: vi.fn(({ onSubmit, placeholder, disabled }) => (
    <div data-testid="enhanced-ai-chat-input">
      <textarea
        data-testid="text-input"
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          // Simulate text input
        }}
      />
      <button
        data-testid="submit-button"
        onClick={() => {
          onSubmit({
            text: 'Test content',
            images: [],
            metadata: {
              characterCount: 12,
              imageCount: 0,
              timestamp: new Date().toISOString()
            }
          })
        }}
        disabled={disabled}
      >
        Generate
      </button>
    </div>
  ))
}))

vi.mock('../components/ContentWizardErrorBoundary', () => ({
  default: vi.fn(({ children }) => <div data-testid="error-boundary">{children}</div>)
}))

describe('ContentWizardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page with all required elements', () => {
    render(<ContentWizardPage />)
    
    // Check title and subtitle
    expect(screen.getByText("What's on your mind today?")).toBeInTheDocument()
    expect(screen.getByText('Type it. Dream it. Watch it appear!')).toBeInTheDocument()
    
    // Check enhanced input component is rendered
    expect(screen.getByTestId('enhanced-ai-chat-input')).toBeInTheDocument()
    
    // Check error boundary is present
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
  })

  it('wraps content with error boundary', () => {
    render(<ContentWizardPage />)
    
    const errorBoundary = screen.getByTestId('error-boundary')
    expect(errorBoundary).toBeInTheDocument()
    
    // Check that the main content is inside the error boundary
    const mainContent = screen.getByText("What's on your mind today?")
    expect(errorBoundary).toContainElement(mainContent)
  })

  it('passes correct props to EnhancedAiChatInput', () => {
    const { EnhancedAiChatInput } = require('../components/EnhancedAiChatInput')
    
    render(<ContentWizardPage />)
    
    expect(EnhancedAiChatInput).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholder: "Your blog crafting experience starts here...",
        maxLength: 2000,
        maxImages: 10,
        disabled: false,
        validationOptions: {
          text: {
            required: true,
            maxLength: 2000
          },
          images: {
            maxImages: 10,
            required: false
          }
        }
      }),
      expect.any(Object)
    )
  })

  it('handles content submission successfully', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn().mockResolvedValue({ success: true })
    
    const { useContentSubmission } = require('../hooks/useContentSubmission')
    useContentSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: false
    })
    
    render(<ContentWizardPage />)
    
    // Simulate content submission
    const submitButton = screen.getByTestId('submit-button')
    await user.click(submitButton)
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Content generated successfully!')).toBeInTheDocument()
    })
    
    // Check that submit was called with correct parameters
    expect(mockSubmit).toHaveBeenCalledWith(
      'Test content',
      [],
      { saveContent: true }
    )
  })

  it('handles content submission errors', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    
    const { useContentSubmission } = require('../hooks/useContentSubmission')
    useContentSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: false
    })
    
    render(<ContentWizardPage />)
    
    // Simulate content submission that fails
    const submitButton = screen.getByTestId('submit-button')
    await user.click(submitButton)
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('shows loading state when submitting', () => {
    const { useContentSubmission } = require('../hooks/useContentSubmission')
    useContentSubmission.mockReturnValue({
      submit: vi.fn(),
      isLoading: true
    })
    
    render(<ContentWizardPage />)
    
    // Check that the input is disabled during loading
    const textInput = screen.getByTestId('text-input')
    expect(textInput).toBeDisabled()
    
    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeDisabled()
  })

  it('allows dismissing feedback messages', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn().mockResolvedValue({ success: true })
    
    const { useContentSubmission } = require('../hooks/useContentSubmission')
    useContentSubmission.mockReturnValue({
      submit: mockSubmit,
      isLoading: false
    })
    
    render(<ContentWizardPage />)
    
    // Trigger success message
    const submitButton = screen.getByTestId('submit-button')
    await user.click(submitButton)
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Content generated successfully!')).toBeInTheDocument()
    })
    
    // Find and click dismiss button
    const dismissButton = screen.getByLabelText('Dismiss message')
    await user.click(dismissButton)
    
    // Message should be gone
    expect(screen.queryByText('Content generated successfully!')).not.toBeInTheDocument()
  })

  it('maintains backward compatibility with existing props', () => {
    const { EnhancedAiChatInput } = require('../components/EnhancedAiChatInput')
    
    render(<ContentWizardPage />)
    
    // Verify that all expected props are passed
    const calls = EnhancedAiChatInput.mock.calls[0]
    const props = calls[0]
    
    expect(props).toHaveProperty('onSubmit')
    expect(props).toHaveProperty('placeholder')
    expect(props).toHaveProperty('maxLength')
    expect(props).toHaveProperty('maxImages')
    expect(props).toHaveProperty('disabled')
    expect(props).toHaveProperty('validationOptions')
    
    // Check that onSubmit is a function
    expect(typeof props.onSubmit).toBe('function')
  })

  it('handles responsive design classes correctly', () => {
    render(<ContentWizardPage />)
    
    // Check responsive classes on title
    const title = screen.getByText("What's on your mind today?")
    expect(title).toHaveClass('text-2xl', 'sm:text-3xl', 'lg:text-[36px]')
    
    // Check responsive classes on input container
    const inputContainer = title.closest('div').querySelector('.max-w-\\[600px\\]')
    expect(inputContainer).toHaveClass('px-4', 'sm:px-0')
  })
})
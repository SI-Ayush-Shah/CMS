/**
 * Tests for ValidationDisplay Component
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ValidationDisplay, ErrorDisplay, WarningDisplay } from './ValidationDisplay'

// Mock data used across all tests
const mockErrors = [
  {
    type: 'file-size',
    message: 'File size exceeds limit',
    fileName: 'test.jpg'
  },
  {
    type: 'required',
    field: 'text',
    message: 'Content is required'
  }
]

const mockWarnings = [
  {
    type: 'approaching-limit',
    message: 'Approaching character limit',
    field: 'text'
  }
]

describe('ValidationDisplay', () => {

  describe('Basic Rendering', () => {
    it('renders nothing when no errors or warnings', () => {
      const { container } = render(<ValidationDisplay />)
      expect(container.firstChild).toBeNull()
    })

    it('renders errors correctly', () => {
      render(<ValidationDisplay errors={mockErrors} />)
      
      expect(screen.getByText('File size exceeds limit')).toBeInTheDocument()
      expect(screen.getByText('Content is required')).toBeInTheDocument()
      expect(screen.getByText('File: test.jpg')).toBeInTheDocument()
      expect(screen.getByText('Field: text')).toBeInTheDocument()
    })

    it('renders warnings correctly', () => {
      render(<ValidationDisplay warnings={mockWarnings} />)
      
      expect(screen.getByText('Approaching character limit')).toBeInTheDocument()
      expect(screen.getByText('Field: text')).toBeInTheDocument()
    })

    it('renders both errors and warnings', () => {
      render(<ValidationDisplay errors={mockErrors} warnings={mockWarnings} />)
      
      expect(screen.getByText('File size exceeds limit')).toBeInTheDocument()
      expect(screen.getByText('Approaching character limit')).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('shows icons by default', () => {
      render(<ValidationDisplay errors={mockErrors} />)
      
      // SVG icons have aria-hidden="true" so we need to query differently
      const svgIcons = document.querySelectorAll('svg[aria-hidden="true"]')
      expect(svgIcons.length).toBeGreaterThan(0)
    })

    it('hides icons when showIcons is false', () => {
      render(<ValidationDisplay errors={mockErrors} showIcons={false} />)
      
      const svgIcons = document.querySelectorAll('svg[aria-hidden="true"]')
      expect(svgIcons).toHaveLength(0)
    })
  })

  describe('Dismissible Functionality', () => {
    it('shows dismiss buttons when dismissible is true', () => {
      render(<ValidationDisplay errors={mockErrors} dismissible={true} />)
      
      const dismissButtons = screen.getAllByLabelText(/dismiss/i)
      expect(dismissButtons).toHaveLength(mockErrors.length)
    })

    it('does not show dismiss buttons by default', () => {
      render(<ValidationDisplay errors={mockErrors} />)
      
      const dismissButtons = screen.queryAllByLabelText(/dismiss/i)
      expect(dismissButtons).toHaveLength(0)
    })

    it('calls onDismiss when dismiss button is clicked', () => {
      const mockOnDismiss = vi.fn()
      render(
        <ValidationDisplay 
          errors={mockErrors} 
          dismissible={true} 
          onDismiss={mockOnDismiss} 
        />
      )
      
      const dismissButton = screen.getAllByLabelText(/dismiss/i)[0]
      fireEvent.click(dismissButton)
      
      expect(mockOnDismiss).toHaveBeenCalledWith(mockErrors[0], 0, 'error')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ValidationDisplay errors={mockErrors} />)
      
      const container = screen.getByRole('region')
      expect(container).toHaveAttribute('aria-label', 'Validation messages')
      
      const alerts = screen.getAllByRole('alert')
      expect(alerts).toHaveLength(mockErrors.length)
    })

    it('uses custom aria-label when provided', () => {
      render(<ValidationDisplay errors={mockErrors} ariaLabel="Custom label" />)
      
      const container = screen.getByRole('region')
      expect(container).toHaveAttribute('aria-label', 'Custom label')
    })

    it('has proper live region for warnings', () => {
      render(<ValidationDisplay warnings={mockWarnings} />)
      
      const warningElement = screen.getByRole('alert')
      expect(warningElement).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<ValidationDisplay errors={mockErrors} className="custom-class" />)
      
      const container = screen.getByRole('region')
      expect(container).toHaveClass('custom-class')
    })

    it('applies error styling for errors', () => {
      render(<ValidationDisplay errors={mockErrors} />)
      
      const errorElements = screen.getAllByRole('alert')
      errorElements.forEach(element => {
        expect(element).toHaveClass('bg-error-500/10', 'border-error-500/20')
      })
    })

    it('applies warning styling for warnings', () => {
      render(<ValidationDisplay warnings={mockWarnings} />)
      
      const warningElement = screen.getByRole('alert')
      expect(warningElement).toHaveClass('bg-warning-500/10', 'border-warning-500/20')
    })
  })

  describe('Error Details', () => {
    it('displays fileName when provided', () => {
      const errorWithFile = [{
        type: 'file-error',
        message: 'Error message',
        fileName: 'document.pdf'
      }]
      
      render(<ValidationDisplay errors={errorWithFile} />)
      expect(screen.getByText('File: document.pdf')).toBeInTheDocument()
    })

    it('displays field when provided', () => {
      const errorWithField = [{
        type: 'validation-error',
        message: 'Error message',
        field: 'email'
      }]
      
      render(<ValidationDisplay errors={errorWithField} />)
      expect(screen.getByText('Field: email')).toBeInTheDocument()
    })

    it('displays details when provided', () => {
      const errorWithDetails = [{
        type: 'validation-error',
        message: 'Error message',
        details: 'Additional error details'
      }]
      
      render(<ValidationDisplay errors={errorWithDetails} />)
      expect(screen.getByText('Additional error details')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('dismiss buttons are keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<ValidationDisplay errors={mockErrors} dismissible={true} />)
      
      const dismissButtons = screen.getAllByLabelText(/dismiss/i)
      
      // Test that we can tab to the first button
      await user.tab()
      expect(dismissButtons[0]).toHaveFocus()
    })
  })
})

describe('ErrorDisplay', () => {
  it('only displays errors, not warnings', () => {
    render(<ErrorDisplay errors={mockErrors} warnings={mockWarnings} />)
    
    expect(screen.getByText('File size exceeds limit')).toBeInTheDocument()
    expect(screen.queryByText('Approaching character limit')).not.toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    render(<ErrorDisplay errors={mockErrors} />)
    
    const container = screen.getByRole('region')
    expect(container).toHaveAttribute('aria-label', 'Error messages')
  })
})

describe('WarningDisplay', () => {
  it('only displays warnings, not errors', () => {
    render(<WarningDisplay errors={mockErrors} warnings={mockWarnings} />)
    
    expect(screen.getByText('Approaching character limit')).toBeInTheDocument()
    expect(screen.queryByText('File size exceeds limit')).not.toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    render(<WarningDisplay warnings={mockWarnings} />)
    
    const container = screen.getByRole('region')
    expect(container).toHaveAttribute('aria-label', 'Warning messages')
  })
})

describe('Edge Cases', () => {
  it('handles empty error objects gracefully', () => {
    const emptyErrors = [{}]
    render(<ValidationDisplay errors={emptyErrors} />)
    
    // Should not crash and should render something
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('handles errors without message gracefully', () => {
    const errorsWithoutMessage = [{
      type: 'unknown-error'
    }]
    render(<ValidationDisplay errors={errorsWithoutMessage} />)
    
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('handles very long error messages', () => {
    const longMessage = 'A'.repeat(1000)
    const longErrors = [{
      type: 'long-error',
      message: longMessage
    }]
    
    render(<ValidationDisplay errors={longErrors} />)
    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })

  it('handles special characters in messages', () => {
    const specialCharErrors = [{
      type: 'special-char-error',
      message: 'Error with <script>alert("xss")</script> & special chars'
    }]
    
    render(<ValidationDisplay errors={specialCharErrors} />)
    expect(screen.getByText(/Error with.*special chars/)).toBeInTheDocument()
  })
})
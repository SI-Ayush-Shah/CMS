/**
 * Accessibility tests for the Content Wizard components
 * Tests keyboard navigation, ARIA attributes, and screen reader support
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedAiChatInput } from '../components/EnhancedAiChatInput'
import { ImageUploadZone } from '../components/ImageUploadZone'
import { ValidationDisplay } from '../components/ValidationDisplay'

// Mock the StarBorder component
vi.mock('../components/StarBorder', () => ({
  default: ({ children, ...props }) => <div {...props}>{children}</div>
}))

describe('Accessibility Features', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('EnhancedAiChatInput Accessibility', () => {
    const defaultProps = {
      onSubmit: vi.fn(),
      placeholder: 'Test placeholder',
      maxLength: 100,
      maxImages: 5
    }

    it('should have proper ARIA attributes', () => {
      render(<EnhancedAiChatInput {...defaultProps} />)
      
      const form = screen.getByRole('form')
      expect(form).toHaveAttribute('aria-label', 'Content creation form')
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-label')
      expect(textarea).toHaveAttribute('aria-describedby')
      expect(textarea).toHaveAttribute('aria-required', 'true')
    })

    it('should support keyboard shortcuts', async () => {
      const onSubmit = vi.fn()
      render(<EnhancedAiChatInput {...defaultProps} onSubmit={onSubmit} />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Test content')
      
      // Test Ctrl+Enter shortcut
      await user.keyboard('{Control>}{Enter}{/Control}')
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })
  })
})
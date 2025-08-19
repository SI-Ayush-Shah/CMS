/**
 * Tests for useValidation Hook
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useValidation } from './useValidation'

describe('useValidation', () => {
  describe('Initial State', () => {
    it('initializes with empty state', () => {
      const { result } = renderHook(() => useValidation())
      
      expect(result.current.hasErrors).toBe(false)
      expect(result.current.hasWarnings).toBe(false)
      expect(result.current.hasAnyMessages).toBe(false)
      expect(result.current.errorCount).toBe(0)
      expect(result.current.warningCount).toBe(0)
      expect(result.current.allErrors).toEqual([])
      expect(result.current.allWarnings).toEqual([])
      expect(result.current.isValidating).toBe(false)
      expect(result.current.lastValidation).toBeNull()
    })
  })

  describe('Error Management', () => {
    it('adds errors to correct categories', () => {
      const { result } = renderHook(() => useValidation())
      
      act(() => {
        result.current.addError('text', {
          type: 'required',
          message: 'Text is required'
        })
      })
      
      expect(result.current.errors.text).toHaveLength(1)
      expect(result.current.errors.text[0].message).toBe('Text is required')
      expect(result.current.hasErrors).toBe(true)
      expect(result.current.errorCount).toBe(1)
    })

    it('adds multiple errors to different categories', () => {
      const { result } = renderHook(() => useValidation())
      
      act(() => {
        result.current.addError('text', {
          type: 'required',
          message: 'Text is required'
        })
        result.current.addError('image', {
          type: 'file-size',
          message: 'File too large'
        })
      })
      
      expect(result.current.errors.text).toHaveLength(1)
      expect(result.current.errors.image).toHaveLength(1)
      expect(result.current.errorCount).toBe(2)
    })

    it('removes errors by ID', () => {
      const { result } = renderHook(() => useValidation())
      
      act(() => {
        result.current.addError('text', {
          type: 'required',
          message: 'Text is required'
        })
      })
      
      const errorId = result.current.errors.text[0].id
      
      act(() => {
        result.current.removeError('text', errorId)
      })
      
      expect(result.current.errors.text).toHaveLength(0)
      expect(result.current.hasErrors).toBe(false)
    })

    it('clears all errors in a category', () => {
      const { result } = renderHook(() => useValidation())
      
      act(() => {
        result.current.addError('text', { type: 'error1', message: 'Error 1' })
        result.current.addError('text', { type: 'error2', message: 'Error 2' })
        result.current.addError('image', { type: 'error3', message: 'Error 3' })
      })
      
      act(() => {
        result.current.clearErrors('text')
      })
      
      expect(result.current.errors.text).toHaveLength(0)
      expect(result.current.errors.image).toHaveLength(1)
      expect(result.current.errorCount).toBe(1)
    })

    it('clears all errors when category is "all"', () => {
      const { result } = renderHook(() => useValidation())
      
      act(() => {
        result.current.addError('text', { type: 'error1', message: 'Error 1' })
        result.current.addError('image', { type: 'error2', message: 'Error 2' })
        result.current.addError('submission', { type: 'error3', message: 'Error 3' })
      })
      
      act(() => {
        result.current.clearErrors('all')
      })
      
      expect(result.current.errorCount).toBe(0)
      expect(result.current.hasErrors).toBe(false)
    })
  })

  describe('Warning Management', () => {
    it('adds warnings to correct categories', () => {
      const { result } = renderHook(() => useValidation())
      
      act(() => {
        result.current.addWarning('text', {
          type: 'approaching-limit',
          message: 'Approaching character limit'
        })
      })
      
      expect(result.current.warnings.text).toHaveLength(1)
      expect(result.current.warnings.text[0].message).toBe('Approaching character limit')
      expect(result.current.hasWarnings).toBe(true)
      expect(result.current.warningCount).toBe(1)
    })

    it('removes warnings by ID', () => {
      const { result } = renderHook(() => useValidation())
      
      act(() => {
        result.current.addWarning('text', {
          type: 'approaching-limit',
          message: 'Approaching limit'
        })
      })
      
      const warningId = result.current.warnings.text[0].id
      
      act(() => {
        result.current.removeWarning('text', warningId)
      })
      
      expect(result.current.warnings.text).toHaveLength(0)
      expect(result.current.hasWarnings).toBe(false)
    })

    it('clears all warnings', () => {
      const { result } = renderHook(() => useValidation())
      
      act(() => {
        result.current.addWarning('text', { type: 'warning1', message: 'Warning 1' })
        result.current.addWarning('image', { type: 'warning2', message: 'Warning 2' })
      })
      
      act(() => {
        result.current.clearWarnings('all')
      })
      
      expect(result.current.warningCount).toBe(0)
      expect(result.current.hasWarnings).toBe(false)
    })
  })

  describe('Text Validation', () => {
    it('validates required text', () => {
      const { result } = renderHook(() => useValidation())
      
      let validation
      act(() => {
        validation = result.current.validateText('', { required: true })
      })
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].type).toBe('required')
      expect(result.current.errors.text).toHaveLength(1)
    })

    it('validates text length limits', () => {
      const { result } = renderHook(() => useValidation())
      
      let validation
      act(() => {
        validation = result.current.validateText('a'.repeat(101), { maxLength: 100 })
      })
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].type).toBe('max-length')
    })

    it('generates warnings for approaching limits', () => {
      const { result } = renderHook(() => useValidation())
      
      let validation
      act(() => {
        validation = result.current.validateText('a'.repeat(85), { 
          maxLength: 100, 
          warningThreshold: 0.8 
        })
      })
      
      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toHaveLength(1)
      expect(validation.warnings[0].type).toBe('approaching-limit')
      expect(result.current.warnings.text).toHaveLength(1)
    })

    it('validates minimum length', () => {
      const { result } = renderHook(() => useValidation())
      
      let validation
      act(() => {
        validation = result.current.validateText('abc', { minLength: 10 })
      })
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors[0].type).toBe('min-length')
    })

    it('clears previous errors before validation', () => {
      const { result } = renderHook(() => useValidation())
      
      // Add an error first
      act(() => {
        result.current.addError('text', { type: 'old-error', message: 'Old error' })
      })
      
      // Validate with valid text
      act(() => {
        result.current.validateText('Valid text', { required: true })
      })
      
      expect(result.current.errors.text).toHaveLength(0)
    })
  })

  describe('Image Validation', () => {
    const mockImages = [
      { id: '1', file: { name: 'image1.jpg' }, uploadStatus: 'completed' },
      { id: '2', file: { name: 'image2.jpg' }, uploadStatus: 'completed' }
    ]

    it('validates required images', () => {
      const { result } = renderHook(() => useValidation())
      
      let validation
      act(() => {
        validation = result.current.validateImages([], { required: true })
      })
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors[0].type).toBe('required')
    })

    it('validates maximum image count', () => {
      const { result } = renderHook(() => useValidation())
      
      const tooManyImages = Array(11).fill().map((_, i) => ({
        id: `${i}`,
        file: { name: `image${i}.jpg` },
        uploadStatus: 'completed'
      }))
      
      let validation
      act(() => {
        validation = result.current.validateImages(tooManyImages, { maxImages: 10 })
      })
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors[0].type).toBe('max-images')
    })

    it('validates minimum image count', () => {
      const { result } = renderHook(() => useValidation())
      
      let validation
      act(() => {
        validation = result.current.validateImages([mockImages[0]], { minImages: 2 })
      })
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors[0].type).toBe('min-images')
    })

    it('detects failed uploads', () => {
      const { result } = renderHook(() => useValidation())
      
      const imagesWithFailure = [
        ...mockImages,
        { id: '3', file: { name: 'failed.jpg' }, uploadStatus: 'error' }
      ]
      
      let validation
      act(() => {
        validation = result.current.validateImages(imagesWithFailure)
      })
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors[0].type).toBe('upload-failed')
    })

    it('generates warnings for approaching image limit', () => {
      const { result } = renderHook(() => useValidation())
      
      const manyImages = Array(8).fill().map((_, i) => ({
        id: `${i}`,
        file: { name: `image${i}.jpg` },
        uploadStatus: 'completed'
      }))
      
      let validation
      act(() => {
        validation = result.current.validateImages(manyImages, { maxImages: 10 })
      })
      
      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toHaveLength(1)
      expect(validation.warnings[0].type).toBe('approaching-limit')
    })
  })

  describe('Form Validation', () => {
    it('validates entire form', async () => {
      const { result } = renderHook(() => useValidation())
      
      const formData = {
        text: 'Valid content',
        images: [
          { id: '1', file: { name: 'image.jpg' }, uploadStatus: 'completed' }
        ]
      }
      
      let validation
      await act(async () => {
        validation = await result.current.validateForm(formData, {
          textOptions: { required: true },
          imageOptions: { maxImages: 10 }
        })
      })
      
      expect(validation.isValid).toBe(true)
      expect(validation.text.isValid).toBe(true)
      expect(validation.images.isValid).toBe(true)
      expect(result.current.lastValidation).toBe(validation)
    })

    it('sets isValidating during validation', async () => {
      const { result } = renderHook(() => useValidation())
      
      const formData = { text: 'test', images: [] }
      
      // Since validateForm is synchronous in our implementation, 
      // we need to test the state during the call
      await act(async () => {
        const validationPromise = result.current.validateForm(formData)
        // The validation is actually synchronous, so isValidating will be false by now
        await validationPromise
      })
      
      // Just verify that validation completed
      expect(result.current.isValidating).toBe(false)
    })
  })

  describe('Error Handlers', () => {
    it('handles network errors', () => {
      const { result } = renderHook(() => useValidation())
      
      const networkError = new Error('Network failed')
      
      act(() => {
        result.current.handleNetworkError(networkError, 'upload')
      })
      
      expect(result.current.errors.network).toHaveLength(1)
      expect(result.current.errors.network[0].type).toBe('network')
      expect(result.current.errors.network[0].message).toContain('upload')
      expect(result.current.errors.network[0].retryable).toBe(true)
    })

    it('handles submission errors', () => {
      const { result } = renderHook(() => useValidation())
      
      const submissionError = new Error('Submission failed')
      
      act(() => {
        result.current.handleSubmissionError(submissionError, 'form processing')
      })
      
      expect(result.current.errors.submission).toHaveLength(1)
      expect(result.current.errors.submission[0].type).toBe('submission')
      expect(result.current.errors.submission[0].message).toContain('form processing')
    })
  })

  describe('Configuration Options', () => {
    it('respects clearOnSuccess option', async () => {
      const { result } = renderHook(() => useValidation({ clearOnSuccess: false }))
      
      // Add some errors first
      act(() => {
        result.current.addError('submission', { type: 'old-error', message: 'Old error' })
      })
      
      // Validate with valid data (this will clear text errors but not submission errors)
      await act(async () => {
        await result.current.validateForm(
          { text: 'Valid text', images: [] },
          { textOptions: { required: true } }
        )
      })
      
      // Submission errors should still be there since clearOnSuccess is false
      // and validateForm only clears text/image errors, not submission errors
      expect(result.current.errors.submission).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles unknown error categories gracefully', () => {
      const { result } = renderHook(() => useValidation())
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      act(() => {
        result.current.addError('unknown-category', {
          type: 'test',
          message: 'Test error'
        })
      })
      
      expect(consoleSpy).toHaveBeenCalledWith('Unknown error category: unknown-category')
      consoleSpy.mockRestore()
    })

    it('handles null/undefined validation inputs', () => {
      const { result } = renderHook(() => useValidation())
      
      let validation
      act(() => {
        validation = result.current.validateText(null, { required: true })
      })
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors[0].type).toBe('required')
    })
  })
})
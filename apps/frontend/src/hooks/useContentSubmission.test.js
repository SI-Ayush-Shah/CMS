/**
 * Unit tests for useContentSubmission hook
 * Tests submission workflow, validation, error handling, and loading states
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useContentSubmission } from './useContentSubmission'

// Mock the API services
vi.mock('../services/contentApi', () => ({
  contentApi: {
    generateContent: vi.fn(),
    saveContent: vi.fn()
  }
}))

vi.mock('../services/imageUploadApi', () => ({
  imageUploadApi: {
    uploadImage: vi.fn()
  }
}))

// Import the mocked modules
import { contentApi } from '../services/contentApi'
import { imageUploadApi } from '../services/imageUploadApi'

describe('useContentSubmission', () => {
  // Mock functions
  const mockOnSuccess = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up default successful mock implementations
    contentApi.generateContent.mockResolvedValue({
      id: 'content-123',
      generatedText: 'Enhanced content',
      suggestions: ['Add hashtags']
    })
    
    contentApi.saveContent.mockResolvedValue({
      id: 'saved-123',
      status: 'saved'
    })
    
    imageUploadApi.uploadImage.mockImplementation((file, onProgress) => {
      // Simulate progress
      setTimeout(() => onProgress && onProgress(50), 10)
      setTimeout(() => onProgress && onProgress(100), 20)
      return Promise.resolve({
        id: 'upload-123',
        url: 'https://example.com/image.jpg',
        originalName: file.name
      })
    })
  })

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useContentSubmission())

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.isUploading).toBe(false)
      expect(result.current.isGenerating).toBe(false)
      expect(result.current.isSaving).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.canSubmit).toBe(true)
      expect(result.current.hasError).toBe(false)
      expect(result.current.hasResult).toBe(false)
      expect(result.current.submissionResult).toBeNull()
      expect(result.current.submissionError).toBeNull()
      expect(result.current.uploadResults).toEqual([])
      expect(result.current.uploadProgress).toEqual({})
      expect(result.current.successMessage).toBe('')
    })

    it('should initialize with custom options', () => {
      const options = {
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        autoReset: false,
        uploadImagesFirst: false
      }

      const { result } = renderHook(() => useContentSubmission(options))

      // State should still be the same, but callbacks are set
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.canSubmit).toBe(true)
    })
  })

  describe('Validation', () => {
    it('should validate required text content', () => {
      const { result } = renderHook(() => useContentSubmission())

      const validation = result.current.validateSubmissionData('', [])
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].type).toBe('required')
      expect(validation.errors[0].field).toBe('text')
    })

    it('should validate text length limits', () => {
      const { result } = renderHook(() => useContentSubmission())

      const longText = 'a'.repeat(2001)
      const validation = result.current.validateSubmissionData(longText, [])
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].type).toBe('max-length')
      expect(validation.errors[0].field).toBe('text')
    })

    it('should validate maximum image count', () => {
      const { result } = renderHook(() => useContentSubmission())

      const manyImages = Array(11).fill().map((_, i) => ({ id: `img-${i}` }))
      const validation = result.current.validateSubmissionData('Valid text', manyImages)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].type).toBe('max-images')
      expect(validation.errors[0].field).toBe('images')
    })

    it('should validate failed image uploads', () => {
      const { result } = renderHook(() => useContentSubmission())

      const imagesWithFailures = [
        { id: 'img-1', uploadStatus: 'completed' },
        { id: 'img-2', uploadStatus: 'error' },
        { id: 'img-3', uploadStatus: 'error' }
      ]
      
      const validation = result.current.validateSubmissionData('Valid text', imagesWithFailures)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].type).toBe('upload-failed')
      expect(validation.errors[0].field).toBe('images')
    })

    it('should validate pending uploads when uploadImagesFirst is true', () => {
      const { result } = renderHook(() => useContentSubmission({ uploadImagesFirst: true }))

      const imagesWithPending = [
        { id: 'img-1', uploadStatus: 'completed' },
        { id: 'img-2', uploadStatus: 'pending' },
        { id: 'img-3', uploadStatus: 'uploading' }
      ]
      
      const validation = result.current.validateSubmissionData('Valid text', imagesWithPending)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].type).toBe('upload-pending')
      expect(validation.errors[0].field).toBe('images')
    })

    it('should pass validation with valid data', () => {
      const { result } = renderHook(() => useContentSubmission())

      const validImages = [
        { id: 'img-1', uploadStatus: 'completed' },
        { id: 'img-2', uploadStatus: 'completed' }
      ]
      
      const validation = result.current.validateSubmissionData('Valid text content', validImages)
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('Successful Submission', () => {
    it('should handle successful submission without images', async () => {
      const { result } = renderHook(() => useContentSubmission({
        onSuccess: mockOnSuccess
      }))

      let submissionResult
      await act(async () => {
        submissionResult = await result.current.submit('Valid text content')
      })

      expect(submissionResult.success).toBe(true)
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.submissionResult).toBeTruthy()
      expect(result.current.submissionError).toBeNull()
      expect(mockOnSuccess).toHaveBeenCalledWith(submissionResult)
      expect(contentApi.generateContent).toHaveBeenCalledWith('Valid text content', [])
      expect(contentApi.saveContent).toHaveBeenCalled()
    })

    it('should handle successful submission with images', async () => {
      // Test with uploadImagesFirst set to false to avoid validation error
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockImages = [
        {
          id: 'img-1',
          file: mockFile,
          uploadStatus: 'pending'
        }
      ]

      const { result } = renderHook(() => useContentSubmission({
        onSuccess: mockOnSuccess,
        uploadImagesFirst: false // This allows pending uploads
      }))

      let submissionResult
      await act(async () => {
        submissionResult = await result.current.submit('Valid text content', mockImages)
      })

      expect(submissionResult.success).toBe(true)
      expect(result.current.isSuccess).toBe(true)
      expect(contentApi.generateContent).toHaveBeenCalledWith(
        'Valid text content',
        []
      )
    })

    it('should track loading states during submission', async () => {
      contentApi.generateContent.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ id: 'test' }), 50))
      )

      const { result } = renderHook(() => useContentSubmission())

      // Start submission and immediately check loading state
      let submissionPromise
      act(() => {
        submissionPromise = result.current.submit('Valid text content')
      })

      // Check loading states
      expect(result.current.isSubmitting).toBe(true)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.canSubmit).toBe(false)

      await act(async () => {
        await submissionPromise
      })

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.canSubmit).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const { result } = renderHook(() => useContentSubmission({
        onError: mockOnError
      }))

      let submissionResult
      await act(async () => {
        submissionResult = await result.current.submit('') // Empty text
      })

      expect(submissionResult.success).toBe(false)
      expect(result.current.hasError).toBe(true)
      expect(result.current.submissionError.type).toBe('validation')
      expect(mockOnError).toHaveBeenCalledWith(result.current.submissionError)
    })

    it('should handle content generation errors', async () => {
      contentApi.generateContent.mockRejectedValue(new Error('Generation failed'))

      const { result } = renderHook(() => useContentSubmission({
        onError: mockOnError
      }))

      let submissionResult
      await act(async () => {
        submissionResult = await result.current.submit('Valid text')
      })

      expect(submissionResult.success).toBe(false)
      expect(result.current.submissionError.type).toBe('generation')
      expect(mockOnError).toHaveBeenCalled()
    })

    it('should handle save errors gracefully (non-blocking)', async () => {
      contentApi.saveContent.mockRejectedValue(new Error('Save failed'))

      const { result } = renderHook(() => useContentSubmission({
        onSuccess: mockOnSuccess
      }))

      let submissionResult
      await act(async () => {
        submissionResult = await result.current.submit('Valid text')
      })

      // Should still succeed even if save fails
      expect(submissionResult.success).toBe(true)
      expect(result.current.isSuccess).toBe(true)
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  describe('Retry Functionality', () => {
    it('should retry failed submissions', async () => {
      // First call fails, second succeeds
      contentApi.generateContent
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValue({ id: 'content-123' })

      const { result } = renderHook(() => useContentSubmission())

      // First attempt should fail
      let firstResult
      await act(async () => {
        firstResult = await result.current.submit('Valid text')
      })

      expect(firstResult.success).toBe(false)
      expect(result.current.hasError).toBe(true)

      // Retry should succeed
      let retryResult
      await act(async () => {
        retryResult = await result.current.retry('Valid text')
      })

      expect(retryResult.success).toBe(true)
      expect(result.current.hasError).toBe(false)
      expect(result.current.isSuccess).toBe(true)
    })
  })

  describe('Reset and Cancel', () => {
    it('should reset all state', async () => {
      const { result } = renderHook(() => useContentSubmission())

      // Submit successfully
      await act(async () => {
        await result.current.submit('Valid text')
      })

      expect(result.current.isSuccess).toBe(true)
      expect(result.current.submissionResult).toBeTruthy()

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.submissionResult).toBeNull()
      expect(result.current.submissionError).toBeNull()
      expect(result.current.uploadResults).toEqual([])
      expect(result.current.successMessage).toBe('')
    })
  })

  describe('Loading State Details', () => {
    it('should provide detailed loading state information', async () => {
      const { result } = renderHook(() => useContentSubmission())

      expect(result.current.loadingState.phase).toBe('idle')
      expect(result.current.loadingState.isLoading).toBe(false)

      // Test loading state during submission
      let submissionPromise
      act(() => {
        submissionPromise = result.current.submit('Valid text')
      })

      // The phase might be 'generating' if the submission moves quickly to that phase
      expect(['submitting', 'generating']).toContain(result.current.loadingState.phase)
      expect(result.current.loadingState.isSubmitting).toBe(true)

      await act(async () => {
        await submissionPromise
      })

      expect(result.current.loadingState.phase).toBe('idle')
      expect(result.current.loadingState.isLoading).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should prevent multiple simultaneous submissions', async () => {
      contentApi.generateContent.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ id: 'test' }), 50))
      )

      const { result } = renderHook(() => useContentSubmission())

      // Start first submission
      let firstSubmission
      act(() => {
        firstSubmission = result.current.submit('Valid text')
      })

      // Try to start second submission while first is in progress
      let secondResult
      await act(async () => {
        secondResult = await result.current.submit('Another text')
      })

      expect(secondResult.success).toBe(false)
      expect(secondResult.error).toBe('Submission already in progress')

      await act(async () => {
        await firstSubmission
      })
    })

    it('should handle empty images array', async () => {
      const { result } = renderHook(() => useContentSubmission())

      let submissionResult
      await act(async () => {
        submissionResult = await result.current.submit('Valid text', [])
      })

      expect(submissionResult.success).toBe(true)
      expect(result.current.uploadResults).toEqual([])
      expect(contentApi.generateContent).toHaveBeenCalledWith('Valid text', [])
    })
  })
})
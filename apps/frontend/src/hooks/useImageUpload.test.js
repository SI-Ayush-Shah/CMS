/**
 * Unit tests for useImageUpload hook
 * Tests image state management, validation, upload progress, and error handling
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useImageUpload } from './useImageUpload'

// Mock the utility modules
vi.mock('../utils/fileValidation', () => ({
  validateMultipleFiles: vi.fn(),
  validateFile: vi.fn(),
  MAX_IMAGES: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024
}))

vi.mock('../utils/imageProcessing', () => ({
  generateMultiplePreviews: vi.fn(),
  generateFileId: vi.fn(),
  revokeObjectUrls: vi.fn()
}))

// Import mocked modules
import { validateMultipleFiles, validateFile } from '../utils/fileValidation'
import { generateMultiplePreviews, generateFileId, revokeObjectUrls } from '../utils/imageProcessing'

// Helper function to create mock files
const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
  const file = new File([''], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// Helper function to create mock FileList
const createMockFileList = (files) => {
  const fileList = {
    length: files.length,
    item: (index) => files[index],
    [Symbol.iterator]: function* () {
      for (let i = 0; i < files.length; i++) {
        yield files[i]
      }
    }
  }
  
  files.forEach((file, index) => {
    fileList[index] = file
  })
  
  return fileList
}

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock implementations
    generateFileId.mockImplementation((file, index) => `${file.name}_${Date.now()}_${index}`)
    revokeObjectUrls.mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useImageUpload())
      
      expect(result.current.images).toEqual([])
      expect(result.current.uploadProgress).toEqual({})
      expect(result.current.errors).toEqual([])
      expect(result.current.isUploading).toBe(false)
      expect(result.current.imageCount).toBe(0)
      expect(result.current.canAddMore).toBe(true)
      expect(result.current.remainingSlots).toBe(10)
    })

    it('should initialize with custom options', () => {
      const options = {
        maxImages: 5,
        maxFileSize: 2 * 1024 * 1024
      }
      
      const { result } = renderHook(() => useImageUpload(options))
      
      expect(result.current.maxImages).toBe(5)
      expect(result.current.maxFileSize).toBe(2 * 1024 * 1024)
      expect(result.current.remainingSlots).toBe(5)
    })
  })

  describe('addImages', () => {
    it('should handle empty file input', async () => {
      const { result } = renderHook(() => useImageUpload())
      
      await act(async () => {
        await result.current.addImages([])
      })
      
      expect(result.current.images).toEqual([])
      expect(result.current.errors).toEqual([])
    })

    it('should add valid images successfully', async () => {
      const mockFiles = [
        createMockFile('image1.jpg'),
        createMockFile('image2.png', 'image/png')
      ]
      
      // Mock validation success
      validateMultipleFiles.mockReturnValue({
        validFiles: mockFiles,
        invalidFiles: [],
        errors: []
      })
      
      // Mock preview generation success
      generateMultiplePreviews.mockResolvedValue([
        {
          file: mockFiles[0],
          preview: 'data:image/jpeg;base64,mock1',
          id: 'image1_123_0',
          success: true,
          error: null
        },
        {
          file: mockFiles[1],
          preview: 'data:image/png;base64,mock2',
          id: 'image2_123_1',
          success: true,
          error: null
        }
      ])
      
      const { result } = renderHook(() => useImageUpload())
      
      await act(async () => {
        await result.current.addImages(mockFiles)
      })
      
      expect(result.current.images).toHaveLength(2)
      expect(result.current.images[0]).toMatchObject({
        file: mockFiles[0],
        preview: 'data:image/jpeg;base64,mock1',
        uploadStatus: 'pending',
        uploadProgress: 0
      })
      expect(result.current.imageCount).toBe(2)
      expect(result.current.canAddMore).toBe(true)
    })

    it('should handle validation errors', async () => {
      const mockFiles = [createMockFile('invalid.txt', 'text/plain')]
      
      // Mock validation failure
      validateMultipleFiles.mockReturnValue({
        validFiles: [],
        invalidFiles: [{ file: mockFiles[0], errors: [{ type: 'file-type', message: 'Invalid file type' }] }],
        errors: [{ type: 'file-type', message: 'Invalid file type' }]
      })
      
      const { result } = renderHook(() => useImageUpload())
      
      await act(async () => {
        await result.current.addImages(mockFiles)
      })
      
      expect(result.current.images).toHaveLength(0)
      expect(result.current.errors).toHaveLength(1)
      expect(result.current.errors[0]).toMatchObject({
        type: 'file-type',
        message: 'Invalid file type'
      })
    })

    it('should handle maximum images limit', async () => {
      const mockFiles = Array.from({ length: 12 }, (_, i) => 
        createMockFile(`image${i}.jpg`)
      )
      
      // Mock validation with max limit
      validateMultipleFiles.mockReturnValue({
        validFiles: mockFiles.slice(0, 10),
        invalidFiles: [],
        errors: []
      })
      
      generateMultiplePreviews.mockResolvedValue(
        mockFiles.slice(0, 10).map((file, index) => ({
          file,
          preview: `data:image/jpeg;base64,mock${index}`,
          id: `image${index}_123_${index}`,
          success: true,
          error: null
        }))
      )
      
      const { result } = renderHook(() => useImageUpload())
      
      await act(async () => {
        await result.current.addImages(mockFiles)
      })
      
      expect(result.current.images).toHaveLength(10)
      expect(result.current.errors).toHaveLength(1)
      expect(result.current.errors[0].type).toBe('max-images')
      expect(result.current.canAddMore).toBe(false)
      expect(result.current.remainingSlots).toBe(0)
    })

    it('should handle preview generation errors', async () => {
      const mockFile = createMockFile('image.jpg')
      
      validateMultipleFiles.mockReturnValue({
        validFiles: [mockFile],
        invalidFiles: [],
        errors: []
      })
      
      // Mock preview generation failure
      generateMultiplePreviews.mockResolvedValue([
        {
          file: mockFile,
          preview: null,
          id: 'image_123_0',
          success: false,
          error: 'Failed to generate preview'
        }
      ])
      
      const { result } = renderHook(() => useImageUpload())
      
      await act(async () => {
        await result.current.addImages([mockFile])
      })
      
      expect(result.current.images).toHaveLength(0)
      expect(result.current.errors).toHaveLength(1)
      expect(result.current.errors[0].type).toBe('preview-generation')
    })

    it('should call onSuccess callback when images are added', async () => {
      const onSuccess = vi.fn()
      const mockFile = createMockFile('image.jpg')
      
      validateMultipleFiles.mockReturnValue({
        validFiles: [mockFile],
        invalidFiles: [],
        errors: []
      })
      
      generateMultiplePreviews.mockResolvedValue([
        {
          file: mockFile,
          preview: 'data:image/jpeg;base64,mock',
          id: 'image_123_0',
          success: true,
          error: null
        }
      ])
      
      const { result } = renderHook(() => useImageUpload({ onSuccess }))
      
      await act(async () => {
        await result.current.addImages([mockFile])
      })
      
      expect(onSuccess).toHaveBeenCalledWith({
        addedCount: 1,
        totalCount: 1,
        addedImages: expect.arrayContaining([
          expect.objectContaining({
            file: mockFile,
            preview: 'data:image/jpeg;base64,mock'
          })
        ])
      })
    })

    it('should call onError callback when errors occur', async () => {
      const onError = vi.fn()
      const mockFile = createMockFile('invalid.txt', 'text/plain')
      
      validateMultipleFiles.mockReturnValue({
        validFiles: [],
        invalidFiles: [],
        errors: [{ type: 'file-type', message: 'Invalid file type' }]
      })
      
      const { result } = renderHook(() => useImageUpload({ onError }))
      
      await act(async () => {
        await result.current.addImages([mockFile])
      })
      
      expect(onError).toHaveBeenCalledWith({
        type: 'file-type',
        message: 'Invalid file type'
      })
    })
  })

  describe('removeImage', () => {
    it('should remove image by ID', async () => {
      const mockFile = createMockFile('image.jpg')
      
      validateMultipleFiles.mockReturnValue({
        validFiles: [mockFile],
        invalidFiles: [],
        errors: []
      })
      
      generateMultiplePreviews.mockResolvedValue([
        {
          file: mockFile,
          preview: 'blob:mock-url',
          id: 'image_123_0',
          success: true,
          error: null
        }
      ])
      
      const { result } = renderHook(() => useImageUpload())
      
      // Add image first
      await act(async () => {
        await result.current.addImages([mockFile])
      })
      
      expect(result.current.images).toHaveLength(1)
      
      // Remove image
      act(() => {
        result.current.removeImage('image_123_0')
      })
      
      expect(result.current.images).toHaveLength(0)
      expect(revokeObjectUrls).toHaveBeenCalledWith('blob:mock-url')
    })

    it('should handle removing non-existent image', () => {
      const { result } = renderHook(() => useImageUpload())
      
      act(() => {
        result.current.removeImage('non-existent-id')
      })
      
      expect(result.current.images).toHaveLength(0)
      expect(result.current.errors).toHaveLength(0)
    })
  })

  describe('removeImageByIndex', () => {
    it('should remove image by index', async () => {
      const mockFiles = [
        createMockFile('image1.jpg'),
        createMockFile('image2.jpg')
      ]
      
      validateMultipleFiles.mockReturnValue({
        validFiles: mockFiles,
        invalidFiles: [],
        errors: []
      })
      
      generateMultiplePreviews.mockResolvedValue([
        {
          file: mockFiles[0],
          preview: 'data:image/jpeg;base64,mock1',
          id: 'image1_123_0',
          success: true,
          error: null
        },
        {
          file: mockFiles[1],
          preview: 'data:image/jpeg;base64,mock2',
          id: 'image2_123_1',
          success: true,
          error: null
        }
      ])
      
      const { result } = renderHook(() => useImageUpload())
      
      // Add images first
      await act(async () => {
        await result.current.addImages(mockFiles)
      })
      
      expect(result.current.images).toHaveLength(2)
      
      // Remove first image by index
      act(() => {
        result.current.removeImageByIndex(0)
      })
      
      expect(result.current.images).toHaveLength(1)
      expect(result.current.images[0].file).toBe(mockFiles[1])
    })

    it('should handle invalid index', () => {
      const { result } = renderHook(() => useImageUpload())
      
      act(() => {
        result.current.removeImageByIndex(5)
      })
      
      expect(result.current.images).toHaveLength(0)
    })
  })

  describe('clearAllImages', () => {
    it('should clear all images and revoke URLs', async () => {
      const mockFiles = [
        createMockFile('image1.jpg'),
        createMockFile('image2.jpg')
      ]
      
      validateMultipleFiles.mockReturnValue({
        validFiles: mockFiles,
        invalidFiles: [],
        errors: []
      })
      
      generateMultiplePreviews.mockResolvedValue([
        {
          file: mockFiles[0],
          preview: 'blob:mock-url-1',
          id: 'image1_123_0',
          success: true,
          error: null
        },
        {
          file: mockFiles[1],
          preview: 'blob:mock-url-2',
          id: 'image2_123_1',
          success: true,
          error: null
        }
      ])
      
      const { result } = renderHook(() => useImageUpload())
      
      // Add images first
      await act(async () => {
        await result.current.addImages(mockFiles)
      })
      
      expect(result.current.images).toHaveLength(2)
      
      // Clear all images
      act(() => {
        result.current.clearAllImages()
      })
      
      expect(result.current.images).toHaveLength(0)
      expect(result.current.uploadProgress).toEqual({})
      expect(result.current.errors).toHaveLength(0)
      expect(revokeObjectUrls).toHaveBeenCalledWith(['blob:mock-url-1', 'blob:mock-url-2'])
    })
  })

  describe('uploadImages', () => {
    beforeEach(() => {
      // Mock timers for upload simulation
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should upload all pending images successfully', async () => {
      const mockFile = createMockFile('image.jpg')
      
      validateMultipleFiles.mockReturnValue({
        validFiles: [mockFile],
        invalidFiles: [],
        errors: []
      })
      
      generateMultiplePreviews.mockResolvedValue([
        {
          file: mockFile,
          preview: 'data:image/jpeg;base64,mock',
          id: 'image_123_0',
          success: true,
          error: null
        }
      ])
      
      const { result } = renderHook(() => useImageUpload({ 
        testMode: true, 
        testShouldSucceed: true 
      }))
      
      // Add image first
      await act(async () => {
        await result.current.addImages([mockFile])
      })
      
      expect(result.current.images).toHaveLength(1)
      expect(result.current.images[0].uploadStatus).toBe('pending')
      
      // Start upload and advance timers simultaneously
      let uploadResults
      await act(async () => {
        const uploadPromise = result.current.uploadImages()
        
        // Advance timers to complete the upload simulation
        vi.advanceTimersByTime(1000)
        
        uploadResults = await uploadPromise
      })
      
      expect(uploadResults).toHaveLength(1)
      expect(uploadResults[0]).toHaveProperty('id', 'image_123_0')
      expect(uploadResults[0]).toHaveProperty('file', mockFile)
      
      // The upload should complete (either success or failure)
      expect(result.current.isUploading).toBe(false)
      expect(['completed', 'error']).toContain(result.current.images[0].uploadStatus)
    })

    it('should handle upload failures', async () => {
      const mockFile = createMockFile('image.jpg')
      
      validateMultipleFiles.mockReturnValue({
        validFiles: [mockFile],
        invalidFiles: [],
        errors: []
      })
      
      generateMultiplePreviews.mockResolvedValue([
        {
          file: mockFile,
          preview: 'data:image/jpeg;base64,mock',
          id: 'image_123_0',
          success: true,
          error: null
        }
      ])
      
      const { result } = renderHook(() => useImageUpload({ 
        testMode: true, 
        testShouldSucceed: false 
      }))
      
      // Add image first
      await act(async () => {
        await result.current.addImages([mockFile])
      })
      
      // Start upload and advance timers simultaneously
      let uploadResults
      await act(async () => {
        const uploadPromise = result.current.uploadImages()
        
        // Advance timers to complete the upload simulation
        vi.advanceTimersByTime(1000)
        
        uploadResults = await uploadPromise
      })
      
      expect(uploadResults).toHaveLength(1)
      expect(uploadResults[0]).toHaveProperty('id', 'image_123_0')
      expect(uploadResults[0]).toHaveProperty('success', false)
      
      expect(result.current.images[0].uploadStatus).toBe('error')
      expect(result.current.errors.length).toBeGreaterThan(0)
    })

    it('should return empty array when no pending images', async () => {
      const { result } = renderHook(() => useImageUpload())
      
      const results = await act(async () => {
        return result.current.uploadImages()
      })
      
      expect(results).toEqual([])
      expect(result.current.isUploading).toBe(false)
    })
  })

  describe('retryUpload', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should retry failed upload', async () => {
      const mockFile = createMockFile('image.jpg')
      
      const { result } = renderHook(() => useImageUpload())
      
      // Manually set up an image with error status
      act(() => {
        result.current.images.push({
          id: 'image_123_0',
          file: mockFile,
          preview: 'data:image/jpeg;base64,mock',
          uploadStatus: 'error',
          uploadProgress: 0,
          error: 'Upload failed',
          addedAt: new Date().toISOString()
        })
      })
      
      // Retry upload
      act(() => {
        result.current.retryUpload('image_123_0')
      })
      
      // Fast-forward timers
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      // Image status should be reset to pending initially
      expect(result.current.images[0].uploadStatus).toBe('pending')
      expect(result.current.images[0].error).toBeNull()
    })

    it('should not retry upload for non-error status', () => {
      const { result } = renderHook(() => useImageUpload())
      
      // Manually set up an image with completed status
      act(() => {
        result.current.images.push({
          id: 'image_123_0',
          file: createMockFile('image.jpg'),
          preview: 'data:image/jpeg;base64,mock',
          uploadStatus: 'completed',
          uploadProgress: 100,
          error: null,
          addedAt: new Date().toISOString()
        })
      })
      
      act(() => {
        result.current.retryUpload('image_123_0')
      })
      
      // Status should remain completed
      expect(result.current.images[0].uploadStatus).toBe('completed')
    })
  })

  describe('getValidationStatus', () => {
    it('should return correct validation status', async () => {
      const { result } = renderHook(() => useImageUpload())
      
      // Initial state
      expect(result.current.validationStatus).toMatchObject({
        isValid: false,
        hasImages: false,
        hasErrors: false,
        allUploaded: true,
        hasFailedUploads: false,
        imageCount: 0,
        errorCount: 0
      })
      
      // Add an image
      const mockFile = createMockFile('image.jpg')
      
      validateMultipleFiles.mockReturnValue({
        validFiles: [mockFile],
        invalidFiles: [],
        errors: []
      })
      
      generateMultiplePreviews.mockResolvedValue([
        {
          file: mockFile,
          preview: 'data:image/jpeg;base64,mock',
          id: 'image_123_0',
          success: true,
          error: null
        }
      ])
      
      await act(async () => {
        await result.current.addImages([mockFile])
      })
      
      expect(result.current.validationStatus).toMatchObject({
        isValid: true,
        hasImages: true,
        hasErrors: false,
        allUploaded: false,
        hasFailedUploads: false,
        imageCount: 1,
        errorCount: 0
      })
    })
  })

  describe('Cleanup', () => {
    it('should revoke object URLs on unmount', async () => {
      const mockFile = createMockFile('image.jpg')
      
      validateMultipleFiles.mockReturnValue({
        validFiles: [mockFile],
        invalidFiles: [],
        errors: []
      })
      
      generateMultiplePreviews.mockResolvedValue([
        {
          file: mockFile,
          preview: 'blob:mock-url',
          id: 'image_123_0',
          success: true,
          error: null
        }
      ])
      
      const { result, unmount } = renderHook(() => useImageUpload())
      
      // Add image
      await act(async () => {
        await result.current.addImages([mockFile])
      })
      
      // Unmount component
      unmount()
      
      expect(revokeObjectUrls).toHaveBeenCalledWith(['blob:mock-url'])
    })
  })
})
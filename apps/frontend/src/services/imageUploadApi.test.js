import { describe, it, expect, vi, beforeEach } from 'vitest'
import { imageUploadApi, uploadImage, uploadMultipleImages, deleteImage, getImage, getUploadProgress } from './imageUploadApi'

// Mock Math.random to control error simulation
const mockMath = Object.create(global.Math)
mockMath.random = vi.fn()
global.Math = mockMath

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')

// Create mock file
const createMockFile = (name = 'test.jpg', size = 1024, type = 'image/jpeg') => {
  const content = 'x'.repeat(size) // Create content of specified size
  return new File([content], name, { type })
}

describe('imageUploadApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default to success (no errors)
    Math.random.mockReturnValue(0.5)
  })

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockFile = createMockFile()
      const onProgress = vi.fn()
      
      const result = await uploadImage(mockFile, onProgress)
      
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('thumbnailUrl')
      expect(result).toHaveProperty('originalName', 'test.jpg')
      expect(result).toHaveProperty('size', 1024)
      expect(result).toHaveProperty('type', 'image/jpeg')
      expect(result).toHaveProperty('uploadedAt')
      expect(result).toHaveProperty('metadata')
      
      // Verify progress callback was called
      expect(onProgress).toHaveBeenCalled()
      expect(onProgress).toHaveBeenCalledWith(100)
    })

    it('should handle upload without progress callback', async () => {
      const mockFile = createMockFile()
      
      const result = await uploadImage(mockFile)
      
      expect(result).toHaveProperty('id')
      expect(result.originalName).toBe('test.jpg')
    })

    it('should simulate upload error', async () => {
      Math.random.mockReturnValue(0.1) // Force error
      const mockFile = createMockFile()
      
      await expect(uploadImage(mockFile)).rejects.toThrow(
        'Failed to upload test.jpg. Please try again.'
      )
    })

    it('should create blob URLs for preview', async () => {
      const mockFile = createMockFile()
      
      await uploadImage(mockFile)
      
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile)
      expect(URL.createObjectURL).toHaveBeenCalledTimes(2) // url and thumbnailUrl
    })
  })

  describe('uploadMultipleImages', () => {
    it('should upload multiple images successfully', async () => {
      const mockFiles = [
        createMockFile('image1.jpg'),
        createMockFile('image2.png', 2048, 'image/png')
      ]
      const onProgress = vi.fn()
      
      const result = await uploadMultipleImages(mockFiles, onProgress)
      
      expect(result).toHaveProperty('successful')
      expect(result).toHaveProperty('failed')
      expect(result).toHaveProperty('totalCount', 2)
      expect(result).toHaveProperty('successCount', 2)
      expect(result).toHaveProperty('failureCount', 0)
      expect(result.successful).toHaveLength(2)
      expect(result.failed).toHaveLength(0)
      
      // Verify progress callback was called for each file
      expect(onProgress).toHaveBeenCalledWith(0, expect.any(Number))
      expect(onProgress).toHaveBeenCalledWith(1, expect.any(Number))
    })

    it('should handle partial failures', async () => {
      // Mock to fail on second call
      Math.random
        .mockReturnValueOnce(0.5) // Success for first file
        .mockReturnValueOnce(0.1) // Error for second file
      
      const mockFiles = [
        createMockFile('image1.jpg'),
        createMockFile('image2.jpg')
      ]
      
      const result = await uploadMultipleImages(mockFiles)
      
      expect(result.totalCount).toBe(2)
      expect(result.successCount).toBe(1)
      expect(result.failureCount).toBe(1)
      expect(result.successful).toHaveLength(1)
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0]).toHaveProperty('error')
      expect(result.failed[0]).toHaveProperty('file')
    })

    it('should handle empty file array', async () => {
      const result = await uploadMultipleImages([])
      
      expect(result.totalCount).toBe(0)
      expect(result.successCount).toBe(0)
      expect(result.failureCount).toBe(0)
    })
  })

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const result = await deleteImage('test-image-id')
      
      expect(result).toHaveProperty('id', 'test-image-id')
      expect(result).toHaveProperty('status', 'deleted')
      expect(result).toHaveProperty('timestamp')
    })

    it('should simulate deletion error', async () => {
      Math.random.mockReturnValue(0.1) // Force error
      
      await expect(deleteImage('test-id')).rejects.toThrow(
        'Failed to delete image. Please try again.'
      )
    })
  })

  describe('getImage', () => {
    it('should retrieve image data successfully', async () => {
      const result = await getImage('test-image-id')
      
      expect(result).toHaveProperty('id', 'test-image-id')
      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('thumbnailUrl')
      expect(result).toHaveProperty('originalName')
      expect(result).toHaveProperty('size')
      expect(result).toHaveProperty('type')
      expect(result).toHaveProperty('uploadedAt')
      expect(result).toHaveProperty('metadata')
      expect(result.metadata).toHaveProperty('width')
      expect(result.metadata).toHaveProperty('height')
      expect(result.metadata).toHaveProperty('format')
    })

    it('should simulate retrieval error', async () => {
      Math.random.mockReturnValue(0.1) // Force error
      
      await expect(getImage('test-id')).rejects.toThrow(
        'Failed to retrieve image data'
      )
    })
  })

  describe('getUploadProgress', () => {
    it('should return upload progress', async () => {
      const result = await getUploadProgress('upload-123')
      
      expect(result).toHaveProperty('uploadId', 'upload-123')
      expect(result).toHaveProperty('status', 'completed')
      expect(result).toHaveProperty('progress', 100)
      expect(result).toHaveProperty('processedFiles', 1)
      expect(result).toHaveProperty('totalFiles', 1)
      expect(result).toHaveProperty('timestamp')
    })
  })

  describe('imageUploadApi object', () => {
    it('should export all functions as service object', () => {
      expect(imageUploadApi).toHaveProperty('uploadImage')
      expect(imageUploadApi).toHaveProperty('uploadMultipleImages')
      expect(imageUploadApi).toHaveProperty('deleteImage')
      expect(imageUploadApi).toHaveProperty('getImage')
      expect(imageUploadApi).toHaveProperty('getUploadProgress')
    })
  })
})
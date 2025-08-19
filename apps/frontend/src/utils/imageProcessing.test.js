/**
 * Unit tests for image processing utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateImagePreview,
  generateMultiplePreviews,
  generateFileId,
  calculateThumbnailDimensions,
  revokeObjectUrls
} from './imageProcessing'

// Mock FileReader
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: null,
  onload: null,
  onerror: null
}

// Mock URL.revokeObjectURL
const mockRevokeObjectURL = vi.fn()

// Setup mocks
beforeEach(() => {
  global.FileReader = vi.fn(() => ({ ...mockFileReader }))
  global.URL = { revokeObjectURL: mockRevokeObjectURL }
  
  // Reset mocks
  vi.clearAllMocks()
})

// Helper function to create mock files
const createMockFile = (name, type, size) => {
  const file = new File([''], name, { type })
  // Manually set size property since File constructor might not set it properly in test environment
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false
  })
  return file
}

describe('imageProcessing', () => {
  describe('generateImagePreview', () => {
    it('should generate preview for valid image file', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1000)
      const expectedResult = 'data:image/jpeg;base64,mockdata'
      
      const promise = generateImagePreview(file)
      
      // Simulate FileReader success
      const readerInstance = FileReader.mock.results[0].value
      readerInstance.result = expectedResult
      readerInstance.onload({ target: { result: expectedResult } })
      
      const result = await promise
      expect(result).toBe(expectedResult)
      expect(readerInstance.readAsDataURL).toHaveBeenCalledWith(file)
    })
    
    it('should reject for null file', async () => {
      await expect(generateImagePreview(null)).rejects.toThrow('No file provided')
    })
    
    it('should reject for non-image file', async () => {
      const file = createMockFile('test.txt', 'text/plain', 1000)
      
      await expect(generateImagePreview(file)).rejects.toThrow('File is not an image')
    })
    
    it('should reject on FileReader error', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1000)
      
      const promise = generateImagePreview(file)
      
      // Simulate FileReader error
      const readerInstance = FileReader.mock.results[0].value
      readerInstance.onerror(new Error('Read error'))
      
      await expect(promise).rejects.toThrow('Failed to read file')
    })
  })
  
  describe('generateMultiplePreviews', () => {
    it('should generate previews for multiple files', async () => {
      const files = [
        createMockFile('test1.jpg', 'image/jpeg', 1000),
        createMockFile('test2.png', 'image/png', 2000)
      ]
      
      const promise = generateMultiplePreviews(files)
      
      // Simulate successful FileReader operations
      const readerInstances = FileReader.mock.results
      readerInstances.forEach((result, index) => {
        const reader = result.value
        const expectedResult = `data:image/jpeg;base64,mockdata${index}`
        reader.result = expectedResult
        setTimeout(() => reader.onload({ target: { result: expectedResult } }), 0)
      })
      
      const results = await promise
      
      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
      expect(results[0].file).toBe(files[0])
      expect(results[1].file).toBe(files[1])
    })
    
    it('should handle empty file list', async () => {
      const result = await generateMultiplePreviews([])
      expect(result).toEqual([])
    })
    
    it('should handle null file list', async () => {
      const result = await generateMultiplePreviews(null)
      expect(result).toEqual([])
    })
    
    it('should handle mixed success and failure', async () => {
      const files = [
        createMockFile('test1.jpg', 'image/jpeg', 1000),
        createMockFile('test2.txt', 'text/plain', 1000) // This will fail
      ]
      
      const promise = generateMultiplePreviews(files)
      
      // Simulate one success and one failure
      const readerInstances = FileReader.mock.results
      const successReader = readerInstances[0].value
      successReader.result = 'data:image/jpeg;base64,mockdata'
      setTimeout(() => successReader.onload({ target: { result: 'data:image/jpeg;base64,mockdata' } }), 0)
      
      const results = await promise
      
      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[1].error).toContain('File is not an image')
    })
  })
  
  describe('generateFileId', () => {
    it('should generate unique ID for file', () => {
      const file = createMockFile('test file.jpg', 'image/jpeg', 1000)
      const id = generateFileId(file, 0)
      
      expect(id).toMatch(/^testfilejpg_\d+_0$/)
    })
    
    it('should include index in ID', () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1000)
      const id = generateFileId(file, 5)
      
      expect(id).toMatch(/^testjpg_\d+_5$/)
    })
    
    it('should handle special characters in filename', () => {
      const file = createMockFile('test@#$.jpg', 'image/jpeg', 1000)
      const id = generateFileId(file, 0)
      
      expect(id).toMatch(/^testjpg_\d+_0$/)
    })
  })
  
  describe('calculateThumbnailDimensions', () => {
    it('should maintain aspect ratio when scaling down', () => {
      const result = calculateThumbnailDimensions(200, 100, 150, 150)
      
      expect(result.width).toBe(150)
      expect(result.height).toBe(75)
    })
    
    it('should not upscale images', () => {
      const result = calculateThumbnailDimensions(100, 50, 150, 150)
      
      expect(result.width).toBe(100)
      expect(result.height).toBe(50)
    })
    
    it('should handle portrait images', () => {
      const result = calculateThumbnailDimensions(100, 200, 150, 150)
      
      expect(result.width).toBe(75)
      expect(result.height).toBe(150)
    })
    
    it('should handle square images', () => {
      const result = calculateThumbnailDimensions(200, 200, 150, 150)
      
      expect(result.width).toBe(150)
      expect(result.height).toBe(150)
    })
    
    it('should handle very wide images', () => {
      const result = calculateThumbnailDimensions(400, 100, 150, 150)
      
      expect(result.width).toBe(150)
      expect(result.height).toBe(38) // 150 * (100/400) = 37.5, rounded to 38
    })
  })
  
  describe('revokeObjectUrls', () => {
    it('should revoke single URL', () => {
      const url = 'blob:http://localhost/test'
      revokeObjectUrls(url)
      
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(url)
    })
    
    it('should revoke multiple URLs', () => {
      const urls = ['blob:http://localhost/test1', 'blob:http://localhost/test2']
      revokeObjectUrls(urls)
      
      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(2)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(urls[0])
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(urls[1])
    })
    
    it('should ignore non-blob URLs', () => {
      const urls = ['http://example.com/image.jpg', 'data:image/jpeg;base64,test']
      revokeObjectUrls(urls)
      
      expect(mockRevokeObjectURL).not.toHaveBeenCalled()
    })
    
    it('should handle null or undefined URLs', () => {
      revokeObjectUrls(null)
      revokeObjectUrls(undefined)
      revokeObjectUrls([null, undefined])
      
      expect(mockRevokeObjectURL).not.toHaveBeenCalled()
    })
  })
  
  // Note: createThumbnail and getImageDimensions tests are skipped in test environment
  // as they require DOM APIs (Image, Canvas) that are not available in Node.js test environment.
  // These functions will be tested in browser integration tests.
})
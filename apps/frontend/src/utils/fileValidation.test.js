/**
 * Unit tests for file validation utilities
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  validateFileType,
  validateFileSize,
  validateFile,
  validateMultipleFiles,
  validateFileExtension,
  formatFileSize,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_IMAGES
} from './fileValidation'

// Mock file creation helper
const createMockFile = (name, type, size) => {
  const file = new File([''], name, { type })
  // Manually set size property since File constructor might not set it properly in test environment
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false
  })
  return file
}

describe('fileValidation', () => {
  describe('validateFileType', () => {
    it('should return true for allowed image types', () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg', 1000)
      const pngFile = createMockFile('test.png', 'image/png', 1000)
      const gifFile = createMockFile('test.gif', 'image/gif', 1000)
      const webpFile = createMockFile('test.webp', 'image/webp', 1000)
      
      expect(validateFileType(jpegFile)).toBe(true)
      expect(validateFileType(pngFile)).toBe(true)
      expect(validateFileType(gifFile)).toBe(true)
      expect(validateFileType(webpFile)).toBe(true)
    })
    
    it('should return false for disallowed file types', () => {
      const txtFile = createMockFile('test.txt', 'text/plain', 1000)
      const pdfFile = createMockFile('test.pdf', 'application/pdf', 1000)
      const videoFile = createMockFile('test.mp4', 'video/mp4', 1000)
      
      expect(validateFileType(txtFile)).toBe(false)
      expect(validateFileType(pdfFile)).toBe(false)
      expect(validateFileType(videoFile)).toBe(false)
    })
    
    it('should handle case insensitive file types', () => {
      const jpegFile = createMockFile('test.jpg', 'IMAGE/JPEG', 1000)
      expect(validateFileType(jpegFile)).toBe(true)
    })
    
    it('should return false for null or undefined files', () => {
      expect(validateFileType(null)).toBe(false)
      expect(validateFileType(undefined)).toBe(false)
    })
    
    it('should return false for files without type property', () => {
      const fileWithoutType = { name: 'test.jpg', size: 1000 }
      expect(validateFileType(fileWithoutType)).toBe(false)
    })
  })
  
  describe('validateFileSize', () => {
    it('should return true for files within size limit', () => {
      const smallFile = createMockFile('test.jpg', 'image/jpeg', 1000)
      const maxSizeFile = createMockFile('test.jpg', 'image/jpeg', MAX_FILE_SIZE)
      
      expect(validateFileSize(smallFile)).toBe(true)
      expect(validateFileSize(maxSizeFile)).toBe(true)
    })
    
    it('should return false for files exceeding size limit', () => {
      const largeFile = createMockFile('test.jpg', 'image/jpeg', MAX_FILE_SIZE + 1)
      
      expect(validateFileSize(largeFile)).toBe(false)
    })
    
    it('should accept custom size limits', () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 2000)
      
      expect(validateFileSize(file, 1000)).toBe(false)
      expect(validateFileSize(file, 3000)).toBe(true)
    })
    
    it('should return false for null or undefined files', () => {
      expect(validateFileSize(null)).toBe(false)
      expect(validateFileSize(undefined)).toBe(false)
    })
    
    it('should return false for files without size property', () => {
      const fileWithoutSize = { name: 'test.jpg', type: 'image/jpeg' }
      expect(validateFileSize(fileWithoutSize)).toBe(false)
    })
  })
  
  describe('validateFile', () => {
    it('should return valid result for good files', () => {
      const validFile = createMockFile('test.jpg', 'image/jpeg', 1000)
      const result = validateFile(validFile)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    
    it('should return invalid result for files with wrong type', () => {
      const invalidFile = createMockFile('test.txt', 'text/plain', 1000)
      const result = validateFile(invalidFile)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('file-type')
      expect(result.errors[0].message).toContain('not allowed')
    })
    
    it('should return invalid result for files exceeding size limit', () => {
      const largeFile = createMockFile('test.jpg', 'image/jpeg', MAX_FILE_SIZE + 1)
      const result = validateFile(largeFile)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('file-size')
      expect(result.errors[0].message).toContain('exceeds the maximum limit')
    })
    
    it('should return multiple errors for files with multiple issues', () => {
      const invalidFile = createMockFile('test.txt', 'text/plain', MAX_FILE_SIZE + 1)
      const result = validateFile(invalidFile)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors.some(error => error.type === 'file-type')).toBe(true)
      expect(result.errors.some(error => error.type === 'file-size')).toBe(true)
    })
    
    it('should handle null or undefined files', () => {
      const result = validateFile(null)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('invalid-file')
    })
  })
  
  describe('validateMultipleFiles', () => {
    it('should validate multiple valid files', () => {
      const files = [
        createMockFile('test1.jpg', 'image/jpeg', 1000),
        createMockFile('test2.png', 'image/png', 2000)
      ]
      
      const result = validateMultipleFiles(files)
      
      expect(result.validFiles).toHaveLength(2)
      expect(result.invalidFiles).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })
    
    it('should separate valid and invalid files', () => {
      const files = [
        createMockFile('test1.jpg', 'image/jpeg', 1000),
        createMockFile('test2.txt', 'text/plain', 1000),
        createMockFile('test3.png', 'image/png', MAX_FILE_SIZE + 1)
      ]
      
      const result = validateMultipleFiles(files)
      
      expect(result.validFiles).toHaveLength(1)
      expect(result.invalidFiles).toHaveLength(2)
      expect(result.errors.length).toBeGreaterThan(0)
    })
    
    it('should enforce maximum image limit', () => {
      const files = Array.from({ length: 15 }, (_, i) => 
        createMockFile(`test${i}.jpg`, 'image/jpeg', 1000)
      )
      
      const result = validateMultipleFiles(files)
      
      expect(result.errors.some(error => error.type === 'max-images')).toBe(true)
      expect(result.validFiles.length + result.invalidFiles.length).toBeLessThanOrEqual(MAX_IMAGES)
    })
    
    it('should handle empty file list', () => {
      const result = validateMultipleFiles([])
      
      expect(result.validFiles).toHaveLength(0)
      expect(result.invalidFiles).toHaveLength(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('no-files')
    })
    
    it('should handle null or undefined files', () => {
      const result = validateMultipleFiles(null)
      
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('no-files')
    })
    
    it('should respect custom max images limit', () => {
      const files = Array.from({ length: 5 }, (_, i) => 
        createMockFile(`test${i}.jpg`, 'image/jpeg', 1000)
      )
      
      const result = validateMultipleFiles(files, 3)
      
      expect(result.errors.some(error => error.type === 'max-images')).toBe(true)
      expect(result.validFiles.length + result.invalidFiles.length).toBeLessThanOrEqual(3)
    })
  })
  
  describe('validateFileExtension', () => {
    it('should return true for allowed extensions', () => {
      expect(validateFileExtension('test.jpg')).toBe(true)
      expect(validateFileExtension('test.jpeg')).toBe(true)
      expect(validateFileExtension('test.png')).toBe(true)
      expect(validateFileExtension('test.gif')).toBe(true)
      expect(validateFileExtension('test.webp')).toBe(true)
    })
    
    it('should return false for disallowed extensions', () => {
      expect(validateFileExtension('test.txt')).toBe(false)
      expect(validateFileExtension('test.pdf')).toBe(false)
      expect(validateFileExtension('test.mp4')).toBe(false)
    })
    
    it('should handle case insensitive extensions', () => {
      expect(validateFileExtension('test.JPG')).toBe(true)
      expect(validateFileExtension('test.PNG')).toBe(true)
    })
    
    it('should handle files without extensions', () => {
      expect(validateFileExtension('test')).toBe(false)
    })
    
    it('should handle null or undefined filenames', () => {
      expect(validateFileExtension(null)).toBe(false)
      expect(validateFileExtension(undefined)).toBe(false)
    })
    
    it('should handle non-string inputs', () => {
      expect(validateFileExtension(123)).toBe(false)
      expect(validateFileExtension({})).toBe(false)
    })
  })
  
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(500)).toBe('500 Bytes')
      expect(formatFileSize(1023)).toBe('1023 Bytes')
    })
    
    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1024 * 1023)).toBe('1023 KB')
    })
    
    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB')
      expect(formatFileSize(MAX_FILE_SIZE)).toBe('5 MB')
    })
    
    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
      expect(formatFileSize(1024 * 1024 * 1024 * 1.5)).toBe('1.5 GB')
    })
  })
  
  describe('constants', () => {
    it('should have correct allowed file types', () => {
      expect(ALLOWED_FILE_TYPES).toContain('image/jpeg')
      expect(ALLOWED_FILE_TYPES).toContain('image/jpg')
      expect(ALLOWED_FILE_TYPES).toContain('image/png')
      expect(ALLOWED_FILE_TYPES).toContain('image/gif')
      expect(ALLOWED_FILE_TYPES).toContain('image/webp')
    })
    
    it('should have correct allowed file extensions', () => {
      expect(ALLOWED_FILE_EXTENSIONS).toContain('.jpg')
      expect(ALLOWED_FILE_EXTENSIONS).toContain('.jpeg')
      expect(ALLOWED_FILE_EXTENSIONS).toContain('.png')
      expect(ALLOWED_FILE_EXTENSIONS).toContain('.gif')
      expect(ALLOWED_FILE_EXTENSIONS).toContain('.webp')
    })
    
    it('should have correct max file size (5MB)', () => {
      expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024)
    })
    
    it('should have correct max images limit', () => {
      expect(MAX_IMAGES).toBe(10)
    })
  })
})
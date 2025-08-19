import { describe, it, expect, vi, beforeEach } from 'vitest'
import { contentApi, generateContent, saveContent, getContent, deleteContent } from './contentApi'

// Mock Math.random to control error simulation
const mockMath = Object.create(global.Math)
mockMath.random = vi.fn()
global.Math = mockMath

describe('contentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default to success (no errors)
    Math.random.mockReturnValue(0.5)
  })

  describe('generateContent', () => {
    it('should generate content successfully', async () => {
      const result = await generateContent('Test content', ['img1', 'img2'])
      
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('generatedText')
      expect(result).toHaveProperty('suggestions')
      expect(result).toHaveProperty('imageCount', 2)
      expect(result).toHaveProperty('processingTime')
      expect(result).toHaveProperty('timestamp')
      expect(result.generatedText).toContain('Test content')
    })

    it('should handle empty image array', async () => {
      const result = await generateContent('Test content')
      
      expect(result.imageCount).toBe(0)
    })

    it('should simulate error when random value is low', async () => {
      Math.random.mockReturnValue(0.1) // Force error
      
      await expect(generateContent('Test content')).rejects.toThrow(
        'Content generation failed. Please try again.'
      )
    })
  })

  describe('saveContent', () => {
    it('should save content successfully', async () => {
      const content = {
        text: 'Test content to save',
        imageIds: ['img1'],
        metadata: { author: 'test' }
      }
      
      const result = await saveContent(content)
      
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('status', 'saved')
      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('version', 1)
    })

    it('should reject empty content', async () => {
      const content = { text: '', imageIds: [] }
      
      await expect(saveContent(content)).rejects.toThrow(
        'Content text is required'
      )
    })

    it('should reject content with only whitespace', async () => {
      const content = { text: '   ', imageIds: [] }
      
      await expect(saveContent(content)).rejects.toThrow(
        'Content text is required'
      )
    })

    it('should simulate save error', async () => {
      Math.random.mockReturnValue(0.1) // Force error
      const content = { text: 'Valid content', imageIds: [] }
      
      await expect(saveContent(content)).rejects.toThrow(
        'Failed to save content. Please check your connection and try again.'
      )
    })
  })

  describe('getContent', () => {
    it('should retrieve content successfully', async () => {
      const result = await getContent('test-id')
      
      expect(result).toHaveProperty('id', 'test-id')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('imageIds')
      expect(result).toHaveProperty('metadata')
      expect(result.metadata).toHaveProperty('createdAt')
      expect(result.metadata).toHaveProperty('updatedAt')
    })

    it('should simulate retrieval error', async () => {
      Math.random.mockReturnValue(0.1) // Force error
      
      await expect(getContent('test-id')).rejects.toThrow(
        'Failed to retrieve content'
      )
    })
  })

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      const result = await deleteContent('test-id')
      
      expect(result).toHaveProperty('id', 'test-id')
      expect(result).toHaveProperty('status', 'deleted')
      expect(result).toHaveProperty('timestamp')
    })

    it('should simulate deletion error', async () => {
      Math.random.mockReturnValue(0.1) // Force error
      
      await expect(deleteContent('test-id')).rejects.toThrow(
        'Failed to delete content'
      )
    })
  })

  describe('contentApi object', () => {
    it('should export all functions as service object', () => {
      expect(contentApi).toHaveProperty('generateContent')
      expect(contentApi).toHaveProperty('saveContent')
      expect(contentApi).toHaveProperty('getContent')
      expect(contentApi).toHaveProperty('deleteContent')
    })
  })
})
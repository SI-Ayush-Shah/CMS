import { apiClient } from './axiosConfig'

/**
 * Content API service for handling content generation and management
 * Currently implements mock functions for development and testing
 */

// Mock delay function to simulate network latency
const mockDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

// Mock error simulation - 20% chance of failure
const shouldSimulateError = () => Math.random() < 0.2

/**
 * Generate content based on text input and uploaded images
 * @param {string} text - The text content to process
 * @param {string[]} imageIds - Array of uploaded image IDs
 * @returns {Promise<Object>} Generated content response
 */
export const generateContent = async (text, imageIds = []) => {
  // TODO: Replace with real API call to backend content generation endpoint
  // const response = await apiClient.post('/content/generate', {
  //   text,
  //   imageIds,
  //   options: { /* generation options */ }
  // })
  // return response.data

  // Mock implementation
  await mockDelay(1500) // Simulate processing time

  if (shouldSimulateError()) {
    throw new Error('Content generation failed. Please try again.')
  }

  // Mock successful response
  return {
    id: `content_${Date.now()}`,
    generatedText: `Enhanced content based on: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
    suggestions: [
      'Consider adding more descriptive language',
      'Try including relevant hashtags',
      'Add a call-to-action for better engagement'
    ],
    imageCount: imageIds.length,
    processingTime: 1.5,
    timestamp: new Date().toISOString()
  }
}

/**
 * Save content to the backend
 * @param {Object} content - Content object to save
 * @param {string} content.text - The text content
 * @param {string[]} content.imageIds - Array of image IDs
 * @param {Object} content.metadata - Additional metadata
 * @returns {Promise<Object>} Save response
 */
export const saveContent = async (content) => {
  // TODO: Replace with real API call to save content
  // const response = await apiClient.post('/content/save', content)
  // return response.data

  // Mock implementation
  await mockDelay(800)

  if (shouldSimulateError()) {
    throw new Error('Failed to save content. Please check your connection and try again.')
  }

  // Validate required fields
  if (!content.text || content.text.trim().length === 0) {
    throw new Error('Content text is required')
  }

  // Mock successful save response
  return {
    id: `saved_${Date.now()}`,
    status: 'saved',
    url: `/content/${Date.now()}`,
    timestamp: new Date().toISOString(),
    version: 1
  }
}

/**
 * Get content by ID
 * @param {string} contentId - The content ID to retrieve
 * @returns {Promise<Object>} Content data
 */
export const getContent = async (contentId) => {
  // TODO: Replace with real API call
  // const response = await apiClient.get(`/content/${contentId}`)
  // return response.data

  // Mock implementation
  await mockDelay(500)

  if (shouldSimulateError()) {
    throw new Error('Failed to retrieve content')
  }

  return {
    id: contentId,
    text: 'Sample content text',
    imageIds: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
}

/**
 * Delete content by ID
 * @param {string} contentId - The content ID to delete
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteContent = async (contentId) => {
  // TODO: Replace with real API call
  // const response = await apiClient.delete(`/content/${contentId}`)
  // return response.data

  // Mock implementation
  await mockDelay(600)

  if (shouldSimulateError()) {
    throw new Error('Failed to delete content')
  }

  return {
    id: contentId,
    status: 'deleted',
    timestamp: new Date().toISOString()
  }
}

// Export all functions as a service object
export const contentApi = {
  generateContent,
  saveContent,
  getContent,
  deleteContent
}
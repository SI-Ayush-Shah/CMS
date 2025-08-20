import { apiClient } from './axiosConfig'

/**
 * Image Upload API service for handling image uploads and management
 * Currently implements mock functions for development and testing
 */

// Mock delay function to simulate network latency and upload time
const mockDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

// Mock error simulation - 15% chance of failure for uploads
const shouldSimulateError = () => Math.random() < 0.15

// Simulate upload progress
const simulateUploadProgress = (onProgress, duration = 2000) => {
  return new Promise((resolve) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        onProgress(100)
        resolve()
      } else {
        onProgress(Math.floor(progress))
      }
    }, duration / 10)
  })
}

/**
 * Upload a single image file
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Progress callback function (0-100)
 * @returns {Promise<Object>} Upload response with image data
 */
export const uploadImage = async (file, onProgress = () => {}) => {
  // TODO: Replace with real API call using FormData
  // const formData = new FormData()
  // formData.append('image', file)
  // formData.append('metadata', JSON.stringify({
  //   originalName: file.name,
  //   size: file.size,
  //   type: file.type
  // }))
  // 
  // const response = await apiClient.post('/images/upload', formData, {
  //   headers: {
  //     'Content-Type': 'multipart/form-data'
  //   },
  //   onUploadProgress: (progressEvent) => {
  //     const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
  //     onProgress(progress)
  //   }
  // })
  // return response.data

  // Mock implementation
  if (shouldSimulateError()) {
    await mockDelay(500)
    throw new Error(`Failed to upload ${file.name}. Please try again.`)
  }

  // Simulate upload progress
  await simulateUploadProgress(onProgress, 2000)

  // Mock successful upload response
  return {
    id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    url: URL.createObjectURL(file), // Create blob URL for preview
    thumbnailUrl: URL.createObjectURL(file), // In real implementation, this would be a smaller version
    originalName: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
    metadata: {
      width: null, // Would be populated by backend after processing
      height: null,
      format: file.type.split('/')[1]
    }
  }
}

/**
 * Upload multiple images concurrently
 * @param {File[]} files - Array of image files to upload
 * @param {Function} onProgress - Progress callback with file index and progress
 * @returns {Promise<Object[]>} Array of upload responses
 */
export const uploadMultipleImages = async (files, onProgress = () => {}) => {
  // TODO: Implement real batch upload with proper error handling
  // Consider implementing concurrent uploads with a limit (e.g., 3 at a time)
  // Handle partial failures gracefully
  
  const uploadPromises = files.map(async (file, index) => {
    try {
      const result = await uploadImage(file, (progress) => {
        onProgress(index, progress)
      })
      return { success: true, data: result, file }
    } catch (error) {
      return { success: false, error: error.message, file }
    }
  })

  const results = await Promise.all(uploadPromises)
  
  // Separate successful and failed uploads
  const successful = results.filter(r => r.success).map(r => r.data)
  const failed = results.filter(r => !r.success)

  if (failed.length > 0) {
    console.warn('Some uploads failed:', failed)
  }

  return {
    successful,
    failed,
    totalCount: files.length,
    successCount: successful.length,
    failureCount: failed.length
  }
}

/**
 * Delete an uploaded image
 * @param {string} imageId - The image ID to delete
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteImage = async (imageId) => {
  // TODO: Replace with real API call
  // const response = await apiClient.delete(`/images/${imageId}`)
  // return response.data

  // Mock implementation
  await mockDelay(400)

  if (shouldSimulateError()) {
    throw new Error('Failed to delete image. Please try again.')
  }

  return {
    id: imageId,
    status: 'deleted',
    timestamp: new Date().toISOString()
  }
}

/**
 * Get image metadata and URLs
 * @param {string} imageId - The image ID to retrieve
 * @returns {Promise<Object>} Image data
 */
export const getImage = async (imageId) => {
  // TODO: Replace with real API call
  // const response = await apiClient.get(`/images/${imageId}`)
  // return response.data

  // Mock implementation
  await mockDelay(300)

  if (shouldSimulateError()) {
    throw new Error('Failed to retrieve image data')
  }

  return {
    id: imageId,
    url: `https://via.placeholder.com/800x600?text=Image+${imageId}`,
    thumbnailUrl: `https://via.placeholder.com/200x150?text=Thumb+${imageId}`,
    originalName: `image_${imageId}.jpg`,
    size: 1024000, // 1MB mock size
    type: 'image/jpeg',
    uploadedAt: new Date().toISOString(),
    metadata: {
      width: 800,
      height: 600,
      format: 'jpeg'
    }
  }
}

/**
 * Get upload progress for a specific upload session
 * @param {string} uploadId - The upload session ID
 * @returns {Promise<Object>} Upload progress data
 */
export const getUploadProgress = async (uploadId) => {
  // TODO: Replace with real API call for checking upload status
  // const response = await apiClient.get(`/uploads/${uploadId}/progress`)
  // return response.data

  // Mock implementation
  await mockDelay(200)

  return {
    uploadId,
    status: 'completed', // 'pending', 'processing', 'completed', 'failed'
    progress: 100,
    processedFiles: 1,
    totalFiles: 1,
    timestamp: new Date().toISOString()
  }
}

// Export all functions as a service object
export const imageUploadApi = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  getImage,
  getUploadProgress
}
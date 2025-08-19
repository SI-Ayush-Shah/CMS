// API services for the Content Wizard enhancement
// This file will export all API service functions for clean imports

// Axios configuration
export { apiClient } from './axiosConfig'

// Content API services
export { contentApi, generateContent, saveContent, getContent, deleteContent } from './contentApi'

// Image Upload API services
export { imageUploadApi, uploadImage, uploadMultipleImages, deleteImage, getImage, getUploadProgress } from './imageUploadApi'
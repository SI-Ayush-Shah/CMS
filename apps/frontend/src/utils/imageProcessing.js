/**
 * Image processing utilities for the Content Wizard enhancement
 * Handles image preview generation, compression, and related operations
 */

/**
 * Generates a preview URL for an image file using FileReader API
 * @param {File} file - The image file to generate preview for
 * @returns {Promise<string>} - Promise that resolves to the preview URL
 */
export const generateImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }
    
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'))
      return
    }
    
    const reader = new FileReader()
    
    reader.onload = (event) => {
      resolve(event.target.result)
    }
    
    reader.onerror = (error) => {
      reject(new Error('Failed to read file: ' + error.message))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Generates previews for multiple image files
 * @param {FileList|File[]} files - The image files to generate previews for
 * @returns {Promise<Array>} - Promise that resolves to array of preview objects
 */
export const generateMultiplePreviews = async (files) => {
  if (!files || files.length === 0) {
    return []
  }
  
  const fileArray = Array.from(files)
  const previewPromises = fileArray.map(async (file, index) => {
    try {
      const preview = await generateImagePreview(file)
      return {
        file,
        preview,
        index,
        id: generateFileId(file, index),
        success: true,
        error: null
      }
    } catch (error) {
      return {
        file,
        preview: null,
        index,
        id: generateFileId(file, index),
        success: false,
        error: error.message
      }
    }
  })
  
  return Promise.all(previewPromises)
}

/**
 * Generates a unique ID for a file based on its properties
 * @param {File} file - The file to generate ID for
 * @param {number} index - Optional index for uniqueness
 * @returns {string} - Unique file ID
 */
export const generateFileId = (file, index = 0) => {
  const timestamp = Date.now()
  const fileName = file.name.replace(/[^a-zA-Z0-9]/g, '')
  return `${fileName}_${timestamp}_${index}`
}

/**
 * Creates a thumbnail canvas element from an image file
 * @param {File} file - The image file
 * @param {number} maxWidth - Maximum width for thumbnail (default: 150)
 * @param {number} maxHeight - Maximum height for thumbnail (default: 150)
 * @returns {Promise<string>} - Promise that resolves to thumbnail data URL
 */
export const createThumbnail = (file, maxWidth = 150, maxHeight = 150) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate thumbnail dimensions while maintaining aspect ratio
      const { width, height } = calculateThumbnailDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      )
      
      canvas.width = width
      canvas.height = height
      
      // Draw the image on canvas
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to data URL
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      resolve(thumbnailDataUrl)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail creation'))
    }
    
    // Load the image
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file for thumbnail creation'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Calculates thumbnail dimensions while maintaining aspect ratio
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {number} maxWidth - Maximum allowed width
 * @param {number} maxHeight - Maximum allowed height
 * @returns {Object} - Object with calculated width and height
 */
export const calculateThumbnailDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let { width, height } = { width: originalWidth, height: originalHeight }
  
  // Calculate scaling factor
  const widthRatio = maxWidth / width
  const heightRatio = maxHeight / height
  const scalingFactor = Math.min(widthRatio, heightRatio, 1) // Don't upscale
  
  width = Math.round(width * scalingFactor)
  height = Math.round(height * scalingFactor)
  
  return { width, height }
}

/**
 * Revokes object URLs to prevent memory leaks
 * @param {string|string[]} urls - URL or array of URLs to revoke
 */
export const revokeObjectUrls = (urls) => {
  const urlArray = Array.isArray(urls) ? urls : [urls]
  
  urlArray.forEach(url => {
    if (url && typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
}

/**
 * Gets image dimensions from a file
 * @param {File} file - The image file
 * @returns {Promise<Object>} - Promise that resolves to dimensions object
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      })
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image to get dimensions'))
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file to get dimensions'))
    }
    reader.readAsDataURL(file)
  })
}
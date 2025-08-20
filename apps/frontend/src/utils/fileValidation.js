/**
 * File validation utilities for the Content Wizard enhancement
 * Handles file type validation, size validation, and related checks
 */

// Constants for file validation
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
export const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
export const MAX_IMAGES = 10

/**
 * Validates if a file is an allowed image type
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file type is allowed
 */
export const validateFileType = (file) => {
  if (!file || !file.type) {
    return false
  }
  
  return ALLOWED_FILE_TYPES.includes(file.type.toLowerCase())
}

/**
 * Validates if a file is within the size limit
 * @param {File} file - The file to validate
 * @param {number} maxSize - Maximum file size in bytes (optional, defaults to MAX_FILE_SIZE)
 * @returns {boolean} - True if file size is within limit
 */
export const validateFileSize = (file, maxSize = MAX_FILE_SIZE) => {
  if (!file || typeof file.size !== 'number') {
    return false
  }
  
  return file.size <= maxSize
}

/**
 * Validates a file against both type and size constraints
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with success flag and error details
 */
export const validateFile = (file) => {
  const result = {
    isValid: true,
    errors: []
  }
  
  if (!file) {
    result.isValid = false
    result.errors.push({
      type: 'invalid-file',
      message: 'No file provided'
    })
    return result
  }
  
  // Check file type
  if (!validateFileType(file)) {
    result.isValid = false
    result.errors.push({
      type: 'file-type',
      message: `File type "${file.type}" is not allowed. Allowed types: JPG, PNG, GIF, WebP`
    })
  }
  
  // Check file size
  if (!validateFileSize(file)) {
    result.isValid = false
    result.errors.push({
      type: 'file-size',
      message: `File size (${formatFileSize(file.size)}) exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`
    })
  }
  
  return result
}

/**
 * Validates multiple files and returns validation results
 * @param {FileList|File[]} files - The files to validate
 * @param {number} maxImages - Maximum number of images allowed (optional, defaults to MAX_IMAGES)
 * @returns {Object} - Validation result with valid files and errors
 */
export const validateMultipleFiles = (files, maxImages = MAX_IMAGES) => {
  const result = {
    validFiles: [],
    invalidFiles: [],
    errors: []
  }
  
  if (!files || files.length === 0) {
    result.errors.push({
      type: 'no-files',
      message: 'No files provided'
    })
    return result
  }
  
  // Check if too many files
  if (files.length > maxImages) {
    result.errors.push({
      type: 'max-images',
      message: `Too many files selected. Maximum allowed: ${maxImages}`
    })
  }
  
  // Validate each file
  const filesToProcess = Array.from(files).slice(0, maxImages)
  
  filesToProcess.forEach((file, index) => {
    const validation = validateFile(file)
    
    if (validation.isValid) {
      result.validFiles.push(file)
    } else {
      result.invalidFiles.push({
        file,
        index,
        errors: validation.errors
      })
      result.errors.push(...validation.errors.map(error => ({
        ...error,
        fileName: file.name,
        fileIndex: index
      })))
    }
  })
  
  return result
}

/**
 * Formats file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Checks if a file extension is allowed
 * @param {string} fileName - The file name to check
 * @returns {boolean} - True if extension is allowed
 */
export const validateFileExtension = (fileName) => {
  if (!fileName || typeof fileName !== 'string') {
    return false
  }
  
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  return ALLOWED_FILE_EXTENSIONS.includes(extension)
}
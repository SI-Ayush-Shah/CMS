// Utility functions for the Content Wizard enhancement
// This file will export all utility functions for clean imports

// File validation utilities
export {
  validateFile,
  validateFileSize,
  validateFileType,
  validateMultipleFiles,
  validateFileExtension,
  formatFileSize,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_IMAGES,
} from "./fileValidation";

// Image processing utilities
export {
  generateImagePreview,
  generateMultiplePreviews,
  generateFileId,
  createThumbnail,
  calculateThumbnailDimensions,
  revokeObjectUrls,
  getImageDimensions,
} from "./imageProcessing";

// Editor.js helpers
export { normalizeEditorJsBody } from "./sanitizeEditorJs";

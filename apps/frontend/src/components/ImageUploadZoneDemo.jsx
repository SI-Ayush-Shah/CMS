/**
 * Demo component for ImageUploadZone
 * 
 * This component demonstrates the ImageUploadZone functionality
 * and can be used for testing and development purposes.
 */

import React, { useState } from 'react'
import ImageUploadZone from './ImageUploadZone'

export const ImageUploadZoneDemo = () => {
  const [selectedImages, setSelectedImages] = useState([])
  const [logs, setLogs] = useState([])

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { message, type, timestamp }])
  }

  const handleImagesChange = (images) => {
    setSelectedImages(images)
    addLog(`Images updated: ${images.length} images selected`, 'success')
  }

  const handleError = (error) => {
    addLog(`Error: ${error.message}`, 'error')
  }

  const handleSuccess = (data) => {
    addLog(`Success: Added ${data.addedCount} images`, 'success')
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-invert-high mb-2">
          ImageUploadZone Demo
        </h1>
        <p className="text-invert-low">
          Test the drag-and-drop image upload functionality
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-core-neu-1000/40 backdrop-blur-[20px] rounded-[15px] p-6 border border-core-prim-300/20">
        <h2 className="text-xl font-semibold text-invert-high mb-4">
          Upload Images
        </h2>
        <ImageUploadZone
          onImagesChange={handleImagesChange}
          onError={handleError}
          onSuccess={handleSuccess}
          maxImages={5}
          maxFileSize={5 * 1024 * 1024} // 5MB
        />
      </div>

      {/* Selected Images Summary */}
      <div className="bg-core-neu-1000/40 backdrop-blur-[20px] rounded-[15px] p-6 border border-core-prim-300/20">
        <h2 className="text-xl font-semibold text-invert-high mb-4">
          Selected Images Summary
        </h2>
        <div className="space-y-2">
          <p className="text-invert-high">
            <span className="font-medium">Total Images:</span> {selectedImages.length}
          </p>
          <p className="text-invert-high">
            <span className="font-medium">Total Size:</span>{' '}
            {selectedImages.reduce((total, img) => total + img.file.size, 0) > 0
              ? `${(selectedImages.reduce((total, img) => total + img.file.size, 0) / 1024 / 1024).toFixed(2)} MB`
              : '0 MB'
            }
          </p>
          {selectedImages.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-invert-high mb-2">Files:</h3>
              <ul className="space-y-1">
                {selectedImages.map((image) => (
                  <li key={image.id} className="text-sm text-invert-low flex justify-between">
                    <span>{image.file.name}</span>
                    <span className="text-xs">
                      {(image.file.size / 1024).toFixed(1)} KB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Event Logs */}
      <div className="bg-core-neu-1000/40 backdrop-blur-[20px] rounded-[15px] p-6 border border-core-prim-300/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-invert-high">
            Event Logs
          </h2>
          <button
            onClick={clearLogs}
            className="px-3 py-1 text-sm bg-core-prim-500 hover:bg-core-prim-600 text-white rounded-lg transition-colors"
          >
            Clear Logs
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <p className="text-invert-low text-sm">No events logged yet</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`text-sm p-2 rounded ${
                  log.type === 'error'
                    ? 'bg-error-500/10 text-error-400'
                    : log.type === 'success'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-core-prim-500/10 text-invert-low'
                }`}
              >
                <span className="text-xs opacity-70">[{log.timestamp}]</span>{' '}
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-core-neu-1000/40 backdrop-blur-[20px] rounded-[15px] p-6 border border-core-prim-300/20">
        <h2 className="text-xl font-semibold text-invert-high mb-4">
          How to Test
        </h2>
        <div className="space-y-3 text-invert-low">
          <div>
            <h3 className="font-medium text-invert-high">Drag and Drop:</h3>
            <p className="text-sm">
              Drag image files from your computer and drop them onto the upload zone.
              You'll see visual feedback during the drag operation.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-invert-high">Click to Select:</h3>
            <p className="text-sm">
              Click on the upload zone to open the file selection dialog.
              You can select multiple images at once.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-invert-high">Keyboard Navigation:</h3>
            <p className="text-sm">
              Use Tab to focus the upload zone, then press Enter or Space to open the file dialog.
              Use Tab to navigate to remove buttons and press Enter to remove images.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-invert-high">Error Testing:</h3>
            <p className="text-sm">
              Try uploading files larger than 5MB, non-image files, or more than 5 images
              to see the error handling in action.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageUploadZoneDemo
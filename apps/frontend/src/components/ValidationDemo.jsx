/**
 * Validation Demo Component
 * 
 * A demonstration component that shows all validation features in action.
 * This is useful for testing and showcasing the validation system.
 */

import React, { useState } from 'react'
import { ValidationDisplay } from './ValidationDisplay'
import { useValidation } from '../hooks/useValidation'
import { useTextInput } from '../hooks/useTextInput'

export const ValidationDemo = () => {
  const [demoText, setDemoText] = useState('')
  const [demoImages, setDemoImages] = useState([])
  
  const {
    errors,
    warnings,
    allErrors,
    allWarnings,
    hasErrors,
    hasWarnings,
    validateText,
    validateImages,
    validateForm,
    clearErrors,
    clearWarnings,
    addError,
    addWarning
  } = useValidation()

  const {
    text,
    setText,
    characterCount,
    isAtWarning,
    isAtLimit,
    warningMessage
  } = useTextInput({
    maxLength: 100,
    warningThreshold: 0.8
  })

  // Demo functions
  const triggerTextValidation = () => {
    validateText(text, {
      required: true,
      maxLength: 100,
      minLength: 5
    })
  }

  const triggerImageValidation = () => {
    validateImages(demoImages, {
      required: false,
      maxImages: 3,
      minImages: 0
    })
  }

  const triggerFormValidation = async () => {
    await validateForm(
      { text, images: demoImages },
      {
        textOptions: { required: true, maxLength: 100, minLength: 5 },
        imageOptions: { maxImages: 3 }
      }
    )
  }

  const addMockError = () => {
    addError('text', {
      type: 'mock-error',
      message: 'This is a mock error for demonstration',
      field: 'demo-field'
    })
  }

  const addMockWarning = () => {
    addWarning('text', {
      type: 'mock-warning',
      message: 'This is a mock warning for demonstration',
      field: 'demo-field'
    })
  }

  const addMockImages = () => {
    const mockImages = [
      { id: '1', file: { name: 'image1.jpg' }, uploadStatus: 'completed' },
      { id: '2', file: { name: 'image2.jpg' }, uploadStatus: 'error' },
      { id: '3', file: { name: 'image3.jpg' }, uploadStatus: 'completed' },
      { id: '4', file: { name: 'image4.jpg' }, uploadStatus: 'completed' }
    ]
    setDemoImages(mockImages)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-invert-high mb-2">
          Validation System Demo
        </h1>
        <p className="text-invert-low">
          Interactive demonstration of the validation and error display system
        </p>
      </div>

      {/* Text Input Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-invert-high">Text Input Validation</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-invert-high">
            Demo Text Input (Max 100 characters, Min 5 characters)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border border-core-prim-300 rounded-lg bg-core-neu-1000 text-invert-high resize-none"
            rows={3}
            placeholder="Type something to see validation in action..."
          />
          <div className={`text-xs text-right ${
            isAtLimit ? 'text-error-500' : isAtWarning ? 'text-warning-500' : 'text-invert-low'
          }`}>
            {characterCount}/100
            {warningMessage && <span className="ml-2">({warningMessage})</span>}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={triggerTextValidation}
            className="px-4 py-2 bg-core-prim-500 text-white rounded-lg hover:bg-core-prim-600 transition-colors"
          >
            Validate Text
          </button>
          <button
            onClick={() => clearErrors('text')}
            className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
          >
            Clear Text Errors
          </button>
        </div>
      </div>

      {/* Image Validation Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-invert-high">Image Validation</h2>
        
        <div className="space-y-2">
          <p className="text-sm text-invert-low">
            Current images: {demoImages.length} (Max 3 allowed)
          </p>
          
          {demoImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {demoImages.map((img) => (
                <div
                  key={img.id}
                  className={`p-2 border rounded-lg text-xs ${
                    img.uploadStatus === 'error'
                      ? 'border-error-500 bg-error-500/10 text-error-600'
                      : 'border-success-500 bg-success-500/10 text-success-600'
                  }`}
                >
                  <div className="font-medium">{img.file.name}</div>
                  <div className="capitalize">{img.uploadStatus}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={addMockImages}
            className="px-4 py-2 bg-core-prim-500 text-white rounded-lg hover:bg-core-prim-600 transition-colors"
          >
            Add Mock Images
          </button>
          <button
            onClick={triggerImageValidation}
            className="px-4 py-2 bg-core-prim-500 text-white rounded-lg hover:bg-core-prim-600 transition-colors"
          >
            Validate Images
          </button>
          <button
            onClick={() => setDemoImages([])}
            className="px-4 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 transition-colors"
          >
            Clear Images
          </button>
          <button
            onClick={() => clearErrors('image')}
            className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
          >
            Clear Image Errors
          </button>
        </div>
      </div>

      {/* Form Validation Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-invert-high">Form Validation</h2>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={triggerFormValidation}
            className="px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
          >
            Validate Entire Form
          </button>
          <button
            onClick={addMockError}
            className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
          >
            Add Mock Error
          </button>
          <button
            onClick={addMockWarning}
            className="px-4 py-2 bg-warning-500 text-white rounded-lg hover:bg-warning-600 transition-colors"
          >
            Add Mock Warning
          </button>
          <button
            onClick={() => {
              clearErrors('all')
              clearWarnings('all')
            }}
            className="px-4 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Validation Display */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-invert-high">
          Validation Messages
          {(hasErrors || hasWarnings) && (
            <span className="ml-2 text-sm font-normal text-invert-low">
              ({allErrors.length} errors, {allWarnings.length} warnings)
            </span>
          )}
        </h2>
        
        <ValidationDisplay
          errors={allErrors}
          warnings={allWarnings}
          dismissible={true}
          onDismiss={(item, index, type) => {
            console.log('Dismissed:', type, item)
          }}
        />
        
        {!hasErrors && !hasWarnings && (
          <div className="p-4 border border-success-500/20 rounded-lg bg-success-500/10">
            <p className="text-success-600 text-sm">
              ✅ No validation errors or warnings
            </p>
          </div>
        )}
      </div>

      {/* Error Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-invert-high">Error Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(errors).map(([category, categoryErrors]) => (
            <div key={category} className="space-y-2">
              <h3 className="font-medium text-invert-high capitalize">
                {category} Errors ({categoryErrors.length})
              </h3>
              {categoryErrors.length > 0 ? (
                <ValidationDisplay
                  errors={categoryErrors}
                  showIcons={false}
                  className="text-xs"
                />
              ) : (
                <p className="text-xs text-invert-low italic">No {category} errors</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Development Info */}
      {import.meta.env.VITE_NODE_ENV === 'development' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-invert-high">Development Info</h2>
          
          <div className="p-4 bg-core-neu-900/50 rounded-lg font-mono text-xs space-y-2">
            <div>Has Errors: {hasErrors.toString()}</div>
            <div>Has Warnings: {hasWarnings.toString()}</div>
            <div>Total Errors: {allErrors.length}</div>
            <div>Total Warnings: {allWarnings.length}</div>
            <div>Text Length: {text.length}</div>
            <div>Images Count: {demoImages.length}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ValidationDemo
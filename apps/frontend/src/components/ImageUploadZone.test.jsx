/**
 * Tests for ImageUploadZone Component
 * 
 * Comprehensive test suite covering drag-and-drop functionality,
 * file selection, accessibility, error handling, and user interactions.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import ImageUploadZone from './ImageUploadZone'
import { useImageUpload } from '../hooks/useImageUpload'

// Mock the useImageUpload hook
vi.mock('../hooks/useImageUpload', () => ({
  useImageUpload: vi.fn()
}))

// Helper function to create mock files
const createMockFile = (name, type = 'image/jpeg', size = 1024) => {
  const file = new File(['mock content'], name, { type, size })
  return file
}

// Helper function to create mock image objects
const createMockImage = (id, fileName = 'test.jpg') => ({
  id,
  file: createMockFile(fileName),
  preview: `blob:mock-url-${id}`,
  uploadStatus: 'pending',
  uploadProgress: 0,
  error: null,
  addedAt: new Date().toISOString()
})

describe('ImageUploadZone', () => {
  // Default mock return values
  const defaultHookReturn = {
    images: [],
    addImages: vi.fn(),
    removeImage: vi.fn(),
    clearAllImages: vi.fn(),
    canAddMore: true,
    remainingSlots: 10,
    errors: [],
    imageCount: 0
  }

  beforeEach(() => {
    useImageUpload.mockReturnValue(defaultHookReturn)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders the upload zone with default props', () => {
      render(<ImageUploadZone />)
      
      expect(screen.getByRole('button', { name: /upload images/i })).toBeInTheDocument()
      expect(screen.getByText('Add Photos')).toBeInTheDocument()
      expect(screen.getByText(/drag and drop or click to select/i)).toBeInTheDocument()
      expect(screen.getByText(/jpg, png, gif, webp up to 5mb/i)).toBeInTheDocument()
    })

    it('renders with custom props', () => {
      render(
        <ImageUploadZone
          maxImages={5}
          className="custom-class"
          disabled={true}
        />
      )
      
      const uploadButton = screen.getByRole('button', { name: /upload images/i })
      expect(uploadButton).toHaveAttribute('aria-disabled', 'true')
      expect(uploadButton).toHaveClass('custom-class')
    })

    it('shows remaining slots correctly', () => {
      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        remainingSlots: 7,
        imageCount: 3
      })

      render(<ImageUploadZone maxImages={10} />)
      
      expect(screen.getByText(/7 remaining/i)).toBeInTheDocument()
    })

    it('shows maximum reached state', () => {
      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        canAddMore: false,
        remainingSlots: 0,
        imageCount: 10
      })

      render(<ImageUploadZone />)
      
      expect(screen.getByText('Maximum images reached')).toBeInTheDocument()
    })
  })

  describe('File Selection Dialog', () => {
    it('opens file dialog when clicking the upload zone', async () => {
      const user = userEvent.setup()
      render(<ImageUploadZone />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      
      // Mock the file input click
      const fileInput = document.querySelector('input[type="file"]')
      const clickSpy = vi.spyOn(fileInput, 'click')
      
      await user.click(uploadZone)
      
      expect(clickSpy).toHaveBeenCalled()
    })

    it('does not open file dialog when disabled', async () => {
      const user = userEvent.setup()
      render(<ImageUploadZone disabled={true} />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      
      // Mock the file input click
      const fileInput = document.querySelector('input[type="file"]')
      const clickSpy = vi.spyOn(fileInput, 'click')
      
      await user.click(uploadZone)
      
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('handles file selection from input', async () => {
      const addImagesMock = vi.fn()
      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        addImages: addImagesMock
      })

      render(<ImageUploadZone />)
      
      const fileInput = document.querySelector('input[type="file"]')
      const mockFiles = [createMockFile('test1.jpg'), createMockFile('test2.png')]
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: mockFiles } })
      })
      
      expect(addImagesMock).toHaveBeenCalledWith(mockFiles)
    })
  })

  describe('Drag and Drop Functionality', () => {
    it('handles drag enter event', () => {
      render(<ImageUploadZone />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      
      fireEvent.dragEnter(uploadZone, {
        dataTransfer: {
          items: [{ kind: 'file', type: 'image/jpeg' }]
        }
      })
      
      expect(uploadZone).toHaveClass('border-core-prim-500')
    })

    it('handles drag leave event', () => {
      render(<ImageUploadZone />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      
      // Enter drag state
      fireEvent.dragEnter(uploadZone, {
        dataTransfer: {
          items: [{ kind: 'file', type: 'image/jpeg' }]
        }
      })
      
      // Leave drag state
      fireEvent.dragLeave(uploadZone)
      
      expect(uploadZone).not.toHaveClass('border-core-prim-500')
    })

    it('handles file drop', async () => {
      const addImagesMock = vi.fn()
      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        addImages: addImagesMock
      })

      render(<ImageUploadZone />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      const mockFiles = [createMockFile('dropped.jpg')]
      
      await act(async () => {
        fireEvent.drop(uploadZone, {
          dataTransfer: {
            files: mockFiles
          }
        })
      })
      
      expect(addImagesMock).toHaveBeenCalledWith(mockFiles)
    })

    it('shows visual feedback during drag over', () => {
      render(<ImageUploadZone />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      
      fireEvent.dragEnter(uploadZone, {
        dataTransfer: {
          items: [{ kind: 'file', type: 'image/jpeg' }]
        }
      })
      
      expect(screen.getByText('Drop images here')).toBeInTheDocument()
    })

    it('ignores drag events when disabled', () => {
      render(<ImageUploadZone disabled={true} />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      
      fireEvent.dragEnter(uploadZone, {
        dataTransfer: {
          items: [{ kind: 'file', type: 'image/jpeg' }]
        }
      })
      
      expect(uploadZone).not.toHaveClass('border-core-prim-500')
    })
  })

  describe('Keyboard Accessibility', () => {
    it('opens file dialog on Enter key', async () => {
      const user = userEvent.setup()
      render(<ImageUploadZone />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      
      // Mock the file input click
      const fileInput = document.querySelector('input[type="file"]')
      const clickSpy = vi.spyOn(fileInput, 'click')
      
      uploadZone.focus()
      await user.keyboard('{Enter}')
      
      expect(clickSpy).toHaveBeenCalled()
    })

    it('opens file dialog on Space key', async () => {
      const user = userEvent.setup()
      render(<ImageUploadZone />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      
      // Mock the file input click
      const fileInput = document.querySelector('input[type="file"]')
      const clickSpy = vi.spyOn(fileInput, 'click')
      
      uploadZone.focus()
      await user.keyboard(' ')
      
      expect(clickSpy).toHaveBeenCalled()
    })

    it('has proper ARIA attributes', () => {
      render(<ImageUploadZone />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      
      expect(uploadZone).toHaveAttribute('aria-describedby', 'upload-instructions upload-status')
      expect(uploadZone).toHaveAttribute('tabindex', '0')
      expect(screen.getByText(/drag and drop or click/i)).toHaveAttribute('id', 'upload-instructions')
    })

    it('is not focusable when disabled', () => {
      render(<ImageUploadZone disabled={true} />)
      
      const uploadZone = screen.getByRole('button', { name: /upload images/i })
      
      expect(uploadZone).toHaveAttribute('tabindex', '-1')
      expect(uploadZone).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Image Thumbnails', () => {
    it('displays image thumbnails when images are present', () => {
      const mockImages = [
        createMockImage('1', 'image1.jpg'),
        createMockImage('2', 'image2.png')
      ]

      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        images: mockImages,
        imageCount: 2
      })

      render(<ImageUploadZone />)
      
      expect(screen.getByText('Selected Images (2/10)')).toBeInTheDocument()
      expect(screen.getByAltText('Preview of image1.jpg')).toBeInTheDocument()
      expect(screen.getByAltText('Preview of image2.png')).toBeInTheDocument()
    })

    it('shows clear all button when images are present', () => {
      const mockImages = [createMockImage('1')]
      const clearAllMock = vi.fn()

      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        images: mockImages,
        imageCount: 1,
        clearAllImages: clearAllMock
      })

      render(<ImageUploadZone />)
      
      const clearButton = screen.getByRole('button', { name: /remove all images/i })
      expect(clearButton).toBeInTheDocument()
    })

    it('handles individual image removal', async () => {
      const user = userEvent.setup()
      const mockImages = [createMockImage('1', 'test.jpg')]
      const removeImageMock = vi.fn()

      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        images: mockImages,
        imageCount: 1,
        removeImage: removeImageMock
      })

      render(<ImageUploadZone />)
      
      const removeButton = screen.getByRole('button', { name: /remove test\.jpg/i })
      await user.click(removeButton)
      
      expect(removeImageMock).toHaveBeenCalledWith('1')
    })

    it('handles image removal with keyboard', async () => {
      const user = userEvent.setup()
      const mockImages = [createMockImage('1', 'test.jpg')]
      const removeImageMock = vi.fn()

      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        images: mockImages,
        imageCount: 1,
        removeImage: removeImageMock
      })

      render(<ImageUploadZone />)
      
      const removeButton = screen.getByRole('button', { name: /remove test\.jpg/i })
      removeButton.focus()
      await user.keyboard('{Enter}')
      
      expect(removeImageMock).toHaveBeenCalledWith('1')
    })

    it('shows upload status overlays', () => {
      const mockImages = [
        { ...createMockImage('1'), uploadStatus: 'uploading' },
        { ...createMockImage('2'), uploadStatus: 'error' }
      ]

      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        images: mockImages,
        imageCount: 2
      })

      render(<ImageUploadZone />)
      
      expect(screen.getByText('Uploading...')).toBeInTheDocument()
      // Error status is shown with an icon, not text
    })
  })

  describe('Error Handling', () => {
    it('displays validation errors', () => {
      const mockErrors = [
        {
          type: 'file-size',
          message: 'File too large',
          fileName: 'large-file.jpg'
        },
        {
          type: 'file-type',
          message: 'Invalid file type'
        }
      ]

      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        errors: mockErrors
      })

      render(<ImageUploadZone />)
      
      expect(screen.getByRole('alert', { name: /upload errors/i })).toBeInTheDocument()
      expect(screen.getByText('File too large')).toBeInTheDocument()
      expect(screen.getByText('File: large-file.jpg')).toBeInTheDocument()
      expect(screen.getByText('Invalid file type')).toBeInTheDocument()
    })

    it('does not show error section when no errors', () => {
      render(<ImageUploadZone />)
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Callbacks', () => {
    it('calls onImagesChange when images change', () => {
      const onImagesChangeMock = vi.fn()
      const mockImages = [createMockImage('1')]

      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        images: mockImages
      })

      render(<ImageUploadZone onImagesChange={onImagesChangeMock} />)
      
      expect(onImagesChangeMock).toHaveBeenCalledWith(mockImages)
    })

    it('passes error and success callbacks to hook', () => {
      const onErrorMock = vi.fn()
      const onSuccessMock = vi.fn()

      render(
        <ImageUploadZone
          onError={onErrorMock}
          onSuccess={onSuccessMock}
        />
      )
      
      expect(useImageUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          onError: onErrorMock,
          onSuccess: onSuccessMock
        })
      )
    })
  })

  describe('Live Regions and Screen Reader Support', () => {
    it('announces image count changes', () => {
      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        imageCount: 2
      })

      render(<ImageUploadZone />)
      
      const statusRegion = screen.getByText('2 images selected')
      expect(statusRegion).toHaveAttribute('aria-live', 'polite')
      expect(statusRegion).toHaveClass('sr-only')
    })

    it('handles singular vs plural image count', () => {
      useImageUpload.mockReturnValue({
        ...defaultHookReturn,
        imageCount: 1
      })

      render(<ImageUploadZone />)
      
      expect(screen.getByText('1 image selected')).toBeInTheDocument()
    })
  })

  describe('Integration with useImageUpload Hook', () => {
    it('passes correct configuration to hook', () => {
      render(
        <ImageUploadZone
          maxImages={5}
          maxFileSize={2048}
          onError={vi.fn()}
          onSuccess={vi.fn()}
        />
      )
      
      expect(useImageUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          maxImages: 5,
          maxFileSize: 2048
        })
      )
    })

    it('uses hook return values correctly', () => {
      const mockHookReturn = {
        images: [createMockImage('1')],
        addImages: vi.fn(),
        removeImage: vi.fn(),
        clearAllImages: vi.fn(),
        canAddMore: false,
        remainingSlots: 0,
        errors: [],
        imageCount: 1
      }

      useImageUpload.mockReturnValue(mockHookReturn)

      render(<ImageUploadZone />)
      
      expect(screen.getByText('Maximum images reached')).toBeInTheDocument()
      expect(screen.getByText('Selected Images (1/10)')).toBeInTheDocument()
    })
  })
})
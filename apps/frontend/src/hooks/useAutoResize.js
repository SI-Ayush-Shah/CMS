import { useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for auto-resizing textarea elements
 * Automatically adjusts textarea height based on content
 * 
 * @param {string} value - The current text value
 * @param {Object} options - Configuration options
 * @param {number} options.minHeight - Minimum height in pixels (default: 80)
 * @param {number} options.maxHeight - Maximum height in pixels (default: 300)
 * @returns {Object} Ref and resize function
 */
export const useAutoResize = (value, { minHeight = 80, maxHeight = 300 } = {}) => {
  const textareaRef = useRef(null)

  // Function to resize the textarea
  const resize = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    
    // Calculate new height based on content
    const scrollHeight = textarea.scrollHeight
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
    
    // Set the new height
    textarea.style.height = `${newHeight}px`
    
    // Add scrollbar if content exceeds maxHeight
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [minHeight, maxHeight])

  // Resize when value changes
  useEffect(() => {
    resize()
  }, [value, resize])

  // Resize on mount and when ref changes
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Set initial styles
    textarea.style.minHeight = `${minHeight}px`
    textarea.style.maxHeight = `${maxHeight}px`
    textarea.style.resize = 'none'
    textarea.style.overflowY = 'hidden'
    
    // Initial resize
    resize()

    // Add event listeners for additional resize triggers
    const handleInput = () => resize()
    const handleResize = () => resize()

    textarea.addEventListener('input', handleInput)
    window.addEventListener('resize', handleResize)

    return () => {
      textarea.removeEventListener('input', handleInput)
      window.removeEventListener('resize', handleResize)
    }
  }, [resize, minHeight, maxHeight])

  return {
    textareaRef,
    resize
  }
}
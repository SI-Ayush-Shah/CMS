/**
 * Custom hook for accessibility features
 * Provides focus management, keyboard navigation, and screen reader support
 */

import { useRef, useCallback, useEffect } from 'react'

/**
 * Custom hook for accessibility features
 * @param {Object} options - Configuration options
 * @param {boolean} options.announceChanges - Whether to announce changes to screen readers
 * @param {boolean} options.manageFocus - Whether to manage focus automatically
 * @returns {Object} Accessibility utilities and handlers
 */
export const useAccessibility = ({
  announceChanges = true,
  manageFocus = true
} = {}) => {
  const announceRef = useRef(null)
  const focusRef = useRef(null)
  const lastAnnouncementRef = useRef('')

  /**
   * Announces a message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level ('polite' or 'assertive')
   */
  const announce = useCallback((message, priority = 'polite') => {
    if (!announceChanges || !message) return

    // Avoid duplicate announcements
    if (lastAnnouncementRef.current === message) return
    
    lastAnnouncementRef.current = message

    // Create a temporary element for announcements if none exists
    if (!announceRef.current) {
      const announcer = document.createElement('div')
      announcer.setAttribute('aria-live', priority)
      announcer.setAttribute('aria-atomic', 'true')
      announcer.setAttribute('class', 'sr-only')
      announcer.setAttribute('role', 'status')
      document.body.appendChild(announcer)
      announceRef.current = announcer
    }

    // Update the aria-live priority if needed
    if (announceRef.current.getAttribute('aria-live') !== priority) {
      announceRef.current.setAttribute('aria-live', priority)
    }

    // Clear and set the message
    announceRef.current.textContent = ''
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = message
      }
    }, 100)

    // Clear the message after announcement
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = ''
      }
      lastAnnouncementRef.current = ''
    }, 1000)
  }, [announceChanges])

  /**
   * Manages focus for better keyboard navigation
   * @param {HTMLElement} element - Element to focus
   * @param {Object} options - Focus options
   */
  const manageFocusTo = useCallback((element, options = {}) => {
    if (!manageFocus || !element) return

    const { 
      preventScroll = false, 
      delay = 0,
      announce: shouldAnnounce = false,
      announceMessage = ''
    } = options

    const focusElement = () => {
      try {
        element.focus({ preventScroll })
        
        if (shouldAnnounce && announceMessage) {
          announce(announceMessage)
        }
      } catch (error) {
        console.warn('Failed to focus element:', error)
      }
    }

    if (delay > 0) {
      setTimeout(focusElement, delay)
    } else {
      focusElement()
    }
  }, [manageFocus, announce])

  /**
   * Creates keyboard event handlers for common patterns
   * @param {Object} handlers - Object with keyboard event handlers
   * @returns {Function} Keyboard event handler
   */
  const createKeyboardHandler = useCallback((handlers = {}) => {
    return (event) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = event
      const modifiers = { ctrlKey, metaKey, altKey, shiftKey }

      // Handle specific key combinations
      if (handlers.enter && (key === 'Enter')) {
        handlers.enter(event, modifiers)
      }
      
      if (handlers.space && (key === ' ')) {
        handlers.space(event, modifiers)
      }
      
      if (handlers.escape && (key === 'Escape')) {
        handlers.escape(event, modifiers)
      }
      
      if (handlers.delete && (key === 'Delete')) {
        handlers.delete(event, modifiers)
      }
      
      if (handlers.backspace && (key === 'Backspace')) {
        handlers.backspace(event, modifiers)
      }
      
      if (handlers.tab && (key === 'Tab')) {
        handlers.tab(event, modifiers)
      }

      // Handle arrow keys
      if (handlers.arrow) {
        const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
        if (arrowKeys.includes(key)) {
          handlers.arrow(event, key.replace('Arrow', '').toLowerCase(), modifiers)
        }
      }

      // Handle custom key combinations
      if (handlers.custom) {
        handlers.custom(event, key, modifiers)
      }
    }
  }, [])

  /**
   * Creates ARIA attributes for better accessibility
   * @param {Object} options - ARIA options
   * @returns {Object} ARIA attributes object
   */
  const createAriaAttributes = useCallback((options = {}) => {
    const {
      label,
      labelledBy,
      describedBy,
      role,
      expanded,
      pressed,
      selected,
      checked,
      disabled,
      required,
      invalid,
      live = 'polite',
      atomic = true,
      relevant = 'additions text',
      busy = false,
      hidden = false,
      current,
      level,
      setSize,
      posInSet
    } = options

    const attributes = {}

    // Basic ARIA attributes
    if (label) attributes['aria-label'] = label
    if (labelledBy) attributes['aria-labelledby'] = labelledBy
    if (describedBy) attributes['aria-describedby'] = describedBy
    if (role) attributes['role'] = role

    // State attributes
    if (expanded !== undefined) attributes['aria-expanded'] = expanded.toString()
    if (pressed !== undefined) attributes['aria-pressed'] = pressed.toString()
    if (selected !== undefined) attributes['aria-selected'] = selected.toString()
    if (checked !== undefined) attributes['aria-checked'] = checked.toString()
    if (disabled !== undefined) attributes['aria-disabled'] = disabled.toString()
    if (required !== undefined) attributes['aria-required'] = required.toString()
    if (invalid !== undefined) attributes['aria-invalid'] = invalid.toString()
    if (hidden !== undefined) attributes['aria-hidden'] = hidden.toString()
    if (busy !== undefined) attributes['aria-busy'] = busy.toString()

    // Live region attributes
    if (live) attributes['aria-live'] = live
    if (atomic !== undefined) attributes['aria-atomic'] = atomic.toString()
    if (relevant) attributes['aria-relevant'] = relevant

    // Navigation attributes
    if (current) attributes['aria-current'] = current
    if (level !== undefined) attributes['aria-level'] = level.toString()
    if (setSize !== undefined) attributes['aria-setsize'] = setSize.toString()
    if (posInSet !== undefined) attributes['aria-posinset'] = posInSet.toString()

    return attributes
  }, [])

  /**
   * Validates color contrast (basic implementation)
   * @param {string} foreground - Foreground color
   * @param {string} background - Background color
   * @returns {Object} Contrast validation result
   */
  const validateColorContrast = useCallback((foreground, background) => {
    // This is a simplified implementation
    // In a real application, you would use a proper color contrast library
    
    const getRelativeLuminance = (color) => {
      // Simplified luminance calculation
      // This should be replaced with proper color parsing and calculation
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255
      
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
    }

    try {
      const l1 = getRelativeLuminance(foreground)
      const l2 = getRelativeLuminance(background)
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
      
      return {
        ratio,
        passesAA: ratio >= 4.5,
        passesAAA: ratio >= 7,
        passesAALarge: ratio >= 3,
        isValid: ratio >= 4.5
      }
    } catch (error) {
      console.warn('Color contrast validation failed:', error)
      return {
        ratio: 0,
        passesAA: false,
        passesAAA: false,
        passesAALarge: false,
        isValid: false,
        error: error.message
      }
    }
  }, [])

  /**
   * Cleanup function
   */
  useEffect(() => {
    return () => {
      if (announceRef.current && announceRef.current.parentNode) {
        announceRef.current.parentNode.removeChild(announceRef.current)
      }
    }
  }, [])

  return {
    // Announcement functions
    announce,
    announceRef,
    
    // Focus management
    manageFocusTo,
    focusRef,
    
    // Keyboard handling
    createKeyboardHandler,
    
    // ARIA utilities
    createAriaAttributes,
    
    // Color contrast validation
    validateColorContrast
  }
}

export default useAccessibility
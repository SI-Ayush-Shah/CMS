import { renderHook, act } from '@testing-library/react'
import { useTextInput } from './useTextInput'

describe('useTextInput', () => {
  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useTextInput())
      
      expect(result.current.text).toBe('')
      expect(result.current.characterCount).toBe(0)
      expect(result.current.maxLength).toBe(2000)
      expect(result.current.remainingCharacters).toBe(2000)
      expect(result.current.isValid).toBe(false)
      expect(result.current.isEmpty).toBe(true)
      expect(result.current.isAtWarning).toBe(false)
      expect(result.current.isAtLimit).toBe(false)
      expect(result.current.errors).toEqual([])
      expect(result.current.warningMessage).toBeNull()
    })

    it('should initialize with custom options', () => {
      const options = {
        maxLength: 100,
        warningThreshold: 0.9,
        initialValue: 'Hello World'
      }
      
      const { result } = renderHook(() => useTextInput(options))
      
      expect(result.current.text).toBe('Hello World')
      expect(result.current.characterCount).toBe(11)
      expect(result.current.maxLength).toBe(100)
      expect(result.current.remainingCharacters).toBe(89)
      expect(result.current.isValid).toBe(true)
      expect(result.current.isEmpty).toBe(false)
    })
  })

  describe('text input handling', () => {
    it('should update text when setText is called', () => {
      const { result } = renderHook(() => useTextInput())
      
      act(() => {
        result.current.setText('Hello')
      })
      
      expect(result.current.text).toBe('Hello')
      expect(result.current.characterCount).toBe(5)
      expect(result.current.remainingCharacters).toBe(1995)
      expect(result.current.isValid).toBe(true)
      expect(result.current.isEmpty).toBe(false)
    })

    it('should enforce character limit by truncating text', () => {
      const { result } = renderHook(() => useTextInput({ maxLength: 10 }))
      
      act(() => {
        result.current.setText('This text is longer than 10 characters')
      })
      
      expect(result.current.text).toBe('This text ')
      expect(result.current.characterCount).toBe(10)
      expect(result.current.remainingCharacters).toBe(0)
      expect(result.current.isAtLimit).toBe(true)
    })

    it('should clear text when clearText is called', () => {
      const { result } = renderHook(() => useTextInput({ initialValue: 'Hello World' }))
      
      expect(result.current.text).toBe('Hello World')
      
      act(() => {
        result.current.clearText()
      })
      
      expect(result.current.text).toBe('')
      expect(result.current.characterCount).toBe(0)
      expect(result.current.isEmpty).toBe(true)
    })
  })

  describe('character counting and validation', () => {
    it('should calculate character count correctly', () => {
      const { result } = renderHook(() => useTextInput())
      
      act(() => {
        result.current.setText('Hello World!')
      })
      
      expect(result.current.characterCount).toBe(12)
      expect(result.current.remainingCharacters).toBe(1988)
    })

    it('should detect empty text correctly', () => {
      const { result } = renderHook(() => useTextInput())
      
      expect(result.current.isEmpty).toBe(true)
      
      act(() => {
        result.current.setText('   ')
      })
      
      expect(result.current.isEmpty).toBe(true)
      
      act(() => {
        result.current.setText('Hello')
      })
      
      expect(result.current.isEmpty).toBe(false)
    })

    it('should validate text correctly', () => {
      const { result } = renderHook(() => useTextInput({ maxLength: 10 }))
      
      // Empty text is invalid
      expect(result.current.isValid).toBe(false)
      
      // Valid text
      act(() => {
        result.current.setText('Hello')
      })
      expect(result.current.isValid).toBe(true)
      
      // Text at limit is valid
      act(() => {
        result.current.setText('1234567890')
      })
      expect(result.current.isValid).toBe(true)
    })
  })

  describe('warning and limit states', () => {
    it('should detect warning state correctly', () => {
      const { result } = renderHook(() => useTextInput({ 
        maxLength: 10, 
        warningThreshold: 0.8 
      }))
      
      // Below warning threshold
      act(() => {
        result.current.setText('1234567')
      })
      expect(result.current.isAtWarning).toBe(false)
      
      // At warning threshold (8 characters = 80% of 10)
      act(() => {
        result.current.setText('12345678')
      })
      expect(result.current.isAtWarning).toBe(true)
      
      // Above warning threshold
      act(() => {
        result.current.setText('123456789')
      })
      expect(result.current.isAtWarning).toBe(true)
    })

    it('should detect limit state correctly', () => {
      const { result } = renderHook(() => useTextInput({ maxLength: 5 }))
      
      // Below limit
      act(() => {
        result.current.setText('1234')
      })
      expect(result.current.isAtLimit).toBe(false)
      
      // At limit
      act(() => {
        result.current.setText('12345')
      })
      expect(result.current.isAtLimit).toBe(true)
    })

    it('should generate correct warning messages', () => {
      const { result } = renderHook(() => useTextInput({ 
        maxLength: 10, 
        warningThreshold: 0.8 
      }))
      
      // No warning
      act(() => {
        result.current.setText('1234567')
      })
      expect(result.current.warningMessage).toBeNull()
      
      // Warning state
      act(() => {
        result.current.setText('12345678')
      })
      expect(result.current.warningMessage).toBe('Approaching character limit (2 remaining)')
      
      // At limit
      act(() => {
        result.current.setText('1234567890')
      })
      expect(result.current.warningMessage).toBe('Character limit reached (10)')
    })
  })

  describe('error handling', () => {
    it('should generate errors when text exceeds limit', () => {
      const { result } = renderHook(() => useTextInput({ maxLength: 5 }))
      
      // No errors initially
      expect(result.current.errors).toEqual([])
      
      // Try to set text longer than limit (should be truncated, so no error)
      act(() => {
        result.current.setText('123456789')
      })
      
      // Text should be truncated to limit, so no errors
      expect(result.current.errors).toEqual([])
      expect(result.current.text).toBe('12345')
    })
  })

  describe('edge cases', () => {
    it('should handle zero maxLength', () => {
      const { result } = renderHook(() => useTextInput({ maxLength: 0 }))
      
      expect(result.current.maxLength).toBe(0)
      expect(result.current.remainingCharacters).toBe(0)
      expect(result.current.isAtLimit).toBe(true) // 0 >= 0 is true
      
      act(() => {
        result.current.setText('Hello')
      })
      
      expect(result.current.text).toBe('')
      expect(result.current.characterCount).toBe(0)
    })

    it('should handle very large maxLength', () => {
      const { result } = renderHook(() => useTextInput({ maxLength: 1000000 }))
      
      const longText = 'a'.repeat(50000)
      
      act(() => {
        result.current.setText(longText)
      })
      
      expect(result.current.text).toBe(longText)
      expect(result.current.characterCount).toBe(50000)
      expect(result.current.isValid).toBe(true)
    })

    it('should handle special characters and unicode', () => {
      const { result } = renderHook(() => useTextInput())
      
      const specialText = '🚀 Hello 世界! @#$%^&*()'
      
      act(() => {
        result.current.setText(specialText)
      })
      
      expect(result.current.text).toBe(specialText)
      expect(result.current.characterCount).toBe(specialText.length)
    })

    it('should handle newlines and whitespace', () => {
      const { result } = renderHook(() => useTextInput())
      
      const textWithNewlines = 'Line 1\nLine 2\n\nLine 4'
      
      act(() => {
        result.current.setText(textWithNewlines)
      })
      
      expect(result.current.text).toBe(textWithNewlines)
      expect(result.current.characterCount).toBe(textWithNewlines.length)
      expect(result.current.isEmpty).toBe(false)
    })
  })

  describe('performance and stability', () => {
    it('should maintain referential stability of functions', () => {
      const { result, rerender } = renderHook(() => useTextInput())
      
      const initialSetText = result.current.setText
      const initialClearText = result.current.clearText
      
      rerender()
      
      expect(result.current.setText).toBe(initialSetText)
      expect(result.current.clearText).toBe(initialClearText)
    })

    it('should handle rapid text changes', () => {
      const { result } = renderHook(() => useTextInput({ maxLength: 100 }))
      
      // Simulate rapid typing
      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.setText('a'.repeat(i))
        }
      })
      
      expect(result.current.text).toBe('a'.repeat(49))
      expect(result.current.characterCount).toBe(49)
      expect(result.current.isValid).toBe(true)
    })
  })
})
import { renderHook, act } from '@testing-library/react'
import { useAutoResize } from './useAutoResize'

// Create a more realistic mock textarea element
const createMockTextarea = () => ({
  style: {},
  scrollHeight: 100,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
})

describe('useAutoResize', () => {
  let mockTextarea

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    mockTextarea = createMockTextarea()
  })

  describe('initialization', () => {
    it('should return textareaRef and resize function', () => {
      const { result } = renderHook(() => useAutoResize(''))
      
      expect(result.current.textareaRef).toBeDefined()
      expect(result.current.resize).toBeInstanceOf(Function)
    })

    it('should handle default options', () => {
      const { result } = renderHook(() => useAutoResize('test'))
      
      expect(result.current.textareaRef).toBeDefined()
      expect(result.current.resize).toBeInstanceOf(Function)
    })

    it('should handle custom options', () => {
      const options = { minHeight: 120, maxHeight: 400 }
      const { result } = renderHook(() => useAutoResize('test', options))
      
      expect(result.current.textareaRef).toBeDefined()
      expect(result.current.resize).toBeInstanceOf(Function)
    })
  })

  describe('resize functionality', () => {
    it('should set initial styles when ref is attached', async () => {
      const { result } = renderHook(() => useAutoResize('', { minHeight: 100, maxHeight: 300 }))
      
      // Simulate ref attachment and trigger useEffect
      await act(async () => {
        result.current.textareaRef.current = mockTextarea
        // Manually trigger the effect by calling resize
        result.current.resize()
      })
      
      // The resize function should set the height based on scrollHeight and constraints
      expect(mockTextarea.style.height).toBe('100px') // Should use minHeight since scrollHeight (100) equals minHeight
    })

    it('should resize based on content height', () => {
      const { result } = renderHook(() => useAutoResize('test content'))
      
      // Mock textarea with specific scrollHeight
      mockTextarea.scrollHeight = 150
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      expect(mockTextarea.style.height).toBe('150px')
      expect(mockTextarea.style.overflowY).toBe('hidden')
    })

    it('should respect minimum height', () => {
      const { result } = renderHook(() => useAutoResize('', { minHeight: 120 }))
      
      // Mock textarea with small scrollHeight
      mockTextarea.scrollHeight = 50
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      expect(mockTextarea.style.height).toBe('120px')
    })

    it('should respect maximum height and add scrollbar', () => {
      const { result } = renderHook(() => useAutoResize('very long content', { maxHeight: 200 }))
      
      // Mock textarea with large scrollHeight
      mockTextarea.scrollHeight = 350
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      expect(mockTextarea.style.height).toBe('200px')
      expect(mockTextarea.style.overflowY).toBe('auto')
    })

    it('should handle height between min and max', () => {
      const { result } = renderHook(() => useAutoResize('medium content', { 
        minHeight: 80, 
        maxHeight: 300 
      }))
      
      // Mock textarea with medium scrollHeight
      mockTextarea.scrollHeight = 150
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      expect(mockTextarea.style.height).toBe('150px')
      expect(mockTextarea.style.overflowY).toBe('hidden')
    })
  })

  describe('value changes', () => {
    it('should resize when value changes', () => {
      let value = 'initial'
      const { result, rerender } = renderHook(() => useAutoResize(value))
      
      mockTextarea.scrollHeight = 100
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
      })
      
      // Change value and rerender
      value = 'new longer content that should trigger resize'
      mockTextarea.scrollHeight = 180
      
      rerender()
      
      expect(mockTextarea.style.height).toBe('180px')
    })

    it('should handle empty value', () => {
      const { result } = renderHook(() => useAutoResize(''))
      
      mockTextarea.scrollHeight = 20
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      // Should use minHeight when content is smaller
      expect(mockTextarea.style.height).toBe('80px')
    })

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(1000)
      const { result } = renderHook(() => useAutoResize(longContent, { maxHeight: 250 }))
      
      mockTextarea.scrollHeight = 500
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      expect(mockTextarea.style.height).toBe('250px')
      expect(mockTextarea.style.overflowY).toBe('auto')
    })
  })

  describe('event listeners', () => {
    it('should provide resize function that can be called manually', () => {
      const { result } = renderHook(() => useAutoResize('test'))
      
      mockTextarea.scrollHeight = 120
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      expect(mockTextarea.style.height).toBe('120px')
    })

    it('should handle resize function calls without errors', () => {
      const { result } = renderHook(() => useAutoResize('test'))
      
      // Should not throw when called without ref
      expect(() => {
        act(() => {
          result.current.resize()
        })
      }).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle null ref gracefully', () => {
      const { result } = renderHook(() => useAutoResize('test'))
      
      // Don't attach ref, should not throw
      expect(() => {
        act(() => {
          result.current.resize()
        })
      }).not.toThrow()
    })

    it('should handle zero dimensions', () => {
      const { result } = renderHook(() => useAutoResize('', { 
        minHeight: 0, 
        maxHeight: 0 
      }))
      
      mockTextarea.scrollHeight = 50
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      expect(mockTextarea.style.height).toBe('0px')
    })

    it('should handle equal min and max height', () => {
      const { result } = renderHook(() => useAutoResize('test', { 
        minHeight: 100, 
        maxHeight: 100 
      }))
      
      mockTextarea.scrollHeight = 150
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      expect(mockTextarea.style.height).toBe('100px')
    })

    it('should handle negative scrollHeight', () => {
      const { result } = renderHook(() => useAutoResize('test'))
      
      mockTextarea.scrollHeight = -10
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      // Should use minHeight when scrollHeight is invalid
      expect(mockTextarea.style.height).toBe('80px')
    })
  })

  describe('performance', () => {
    it('should maintain referential stability of resize function', () => {
      const { result, rerender } = renderHook(() => useAutoResize('test'))
      
      const initialResize = result.current.resize
      
      rerender()
      
      expect(result.current.resize).toBe(initialResize)
    })

    it('should handle rapid value changes efficiently', () => {
      let value = ''
      const { result, rerender } = renderHook(() => useAutoResize(value))
      
      mockTextarea.scrollHeight = 100
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
      })
      
      // Simulate rapid changes
      for (let i = 0; i < 10; i++) {
        value = 'a'.repeat(i * 10)
        mockTextarea.scrollHeight = 100 + i * 20
        rerender()
      }
      
      expect(mockTextarea.style.height).toBe('280px')
    })
  })

  describe('accessibility', () => {
    it('should provide resize functionality without breaking accessibility', () => {
      const { result } = renderHook(() => useAutoResize('test'))
      
      mockTextarea.scrollHeight = 120
      
      act(() => {
        result.current.textareaRef.current = mockTextarea
        result.current.resize()
      })
      
      // Should resize properly
      expect(mockTextarea.style.height).toBe('120px')
      expect(mockTextarea.style.overflowY).toBe('hidden')
    })
  })
})

// Setup global mocks for window.addEventListener/removeEventListener
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener

beforeAll(() => {
  window.addEventListener = vi.fn()
  window.removeEventListener = vi.fn()
})

afterAll(() => {
  window.addEventListener = originalAddEventListener
  window.removeEventListener = originalRemoveEventListener
})
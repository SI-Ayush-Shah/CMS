/**
 * Integration tests for comprehensive error handling and recovery
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import { enhanceError, ErrorRecoveryManager, ErrorCategory, ErrorSeverity } from '../utils/errorHandling'
import { useLoadingState, LoadingType } from '../hooks/useLoadingState'
import { renderHook } from '@testing-library/react'

describe('Error Handling Integration', () => {
  describe('enhanceError', () => {
    it('should enhance basic errors with user-friendly messages', () => {
      const originalError = new Error('Network request failed')
      const enhanced = enhanceError(originalError, { type: 'network' })

      expect(enhanced.category).toBe(ErrorCategory.NETWORK)
      expect(enhanced.userMessage).toContain('Network')
      expect(enhanced.originalError).toBe(originalError)
      expect(enhanced.errorId).toBeDefined()
      expect(enhanced.timestamp).toBeDefined()
    })

    it('should classify network errors correctly', () => {
      const axiosError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      }

      const enhanced = enhanceError(axiosError)
      expect(enhanced.category).toBe(ErrorCategory.NETWORK)
      expect(enhanced.retryable).toBe(true)
      expect(enhanced.userMessage).toContain('timeout')
    })

    it('should handle validation errors', () => {
      const validationError = new Error('Required field missing')
      const enhanced = enhanceError(validationError, { type: 'validation' })

      expect(enhanced.category).toBe(ErrorCategory.VALIDATION)
      expect(enhanced.severity).toBe(ErrorSeverity.LOW)
      expect(enhanced.retryable).toBe(false)
    })

    it('should handle upload errors', () => {
      const uploadError = new Error('File too large')
      const enhanced = enhanceError(uploadError, { type: 'upload' })

      expect(enhanced.category).toBe(ErrorCategory.UPLOAD)
      expect(enhanced.severity).toBe(ErrorSeverity.MEDIUM)
      expect(enhanced.retryable).toBe(true)
    })
  })

  describe('ErrorRecoveryManager', () => {
    let recoveryManager
    let mockOnRetry
    let mockOnReset

    beforeEach(() => {
      mockOnRetry = vi.fn()
      mockOnReset = vi.fn()
      
      recoveryManager = new ErrorRecoveryManager({
        onRetry: mockOnRetry,
        onReset: mockOnReset,
        maxRetries: 3
      })
    })

    it('should execute retry recovery action', async () => {
      const error = enhanceError(new Error('Test error'), { type: 'network' })
      mockOnRetry.mockResolvedValue(true)

      const result = await recoveryManager.executeRecovery(error, 'retry')
      
      expect(result).toBe(true)
      expect(mockOnRetry).toHaveBeenCalledWith(error, expect.any(Object))
    })

    it('should execute reset recovery action', async () => {
      const error = enhanceError(new Error('Test error'), { type: 'validation' })

      const result = await recoveryManager.executeRecovery(error, 'reset')
      
      expect(result).toBe(true)
      expect(mockOnReset).toHaveBeenCalledWith(error, expect.any(Object))
    })

    it('should handle retry failures', async () => {
      const error = enhanceError(new Error('Test error'), { type: 'network' })
      mockOnRetry.mockRejectedValue(new Error('Retry failed'))

      const result = await recoveryManager.executeRecovery(error, 'retry')
      
      expect(result).toBe(false)
    })
  })

  describe('useLoadingState', () => {
    it('should manage multiple concurrent operations', async () => {
      const { result } = renderHook(() => useLoadingState())

      await act(async () => {
        // Start multiple operations
        const op1 = result.current.startOperation('upload', {
          type: LoadingType.UPLOAD,
          message: 'Uploading...'
        })
        
        const op2 = result.current.startOperation('process', {
          type: LoadingType.PROCESS,
          message: 'Processing...'
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.activeOperations).toHaveLength(2)

        // Complete one operation
        op1.complete('upload result')
        
        expect(result.current.activeOperations).toHaveLength(1)
        expect(result.current.completedOperations).toHaveLength(1)

        // Fail the other operation
        op2.fail(new Error('Processing failed'))
        
        expect(result.current.isLoading).toBe(false)
        expect(result.current.hasErrors).toBe(true)
        expect(result.current.errorOperations).toHaveLength(1)
      })
    })

    it('should handle operation cancellation', async () => {
      const { result } = renderHook(() => useLoadingState())

      await act(async () => {
        const operation = result.current.startOperation('test', {
          type: LoadingType.PROCESS,
          cancellable: true
        })

        expect(result.current.isLoading).toBe(true)

        operation.cancel()

        expect(result.current.isLoading).toBe(false)
        expect(result.current.getOperation('test').state).toBe('cancelled')
      })
    })

    it('should track progress updates', async () => {
      const { result } = renderHook(() => useLoadingState())

      await act(async () => {
        const operation = result.current.startOperation('progress-test', {
          type: LoadingType.UPLOAD
        })

        operation.updateProgress(25, 'Quarter done')
        expect(result.current.getOperationProgress('progress-test')).toBe(25)

        operation.updateProgress(75, 'Almost there')
        expect(result.current.getOperationProgress('progress-test')).toBe(75)

        operation.complete()
        expect(result.current.getOperationProgress('progress-test')).toBe(100)
      })
    })

    it('should handle operation timeouts', async () => {
      const mockOnTimeout = vi.fn()
      const { result } = renderHook(() => useLoadingState({
        defaultTimeout: 100, // Very short timeout for testing
        onTimeout: mockOnTimeout
      }))

      await act(async () => {
        result.current.startOperation('timeout-test', {
          type: LoadingType.PROCESS,
          timeout: 100
        })

        // Wait for timeout
        await new Promise(resolve => setTimeout(resolve, 150))

        expect(mockOnTimeout).toHaveBeenCalledWith('timeout-test', 100)
        expect(result.current.getOperation('timeout-test').state).toBe('timeout')
      })
    })
  })

  describe('Network Error Detection', () => {
    it('should detect connection errors', () => {
      const connectionError = {
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND api.example.com'
      }

      const enhanced = enhanceError(connectionError)
      expect(enhanced.category).toBe(ErrorCategory.NETWORK)
      expect(enhanced.userMessage).toContain('connection')
    })

    it('should detect timeout errors', () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      }

      const enhanced = enhanceError(timeoutError)
      expect(enhanced.category).toBe(ErrorCategory.NETWORK)
      expect(enhanced.userMessage).toContain('timeout')
    })

    it('should detect server errors', () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      const enhanced = enhanceError(serverError)
      expect(enhanced.category).toBe(ErrorCategory.NETWORK)
      expect(enhanced.userMessage).toContain('Server error')
    })
  })

  describe('Error Recovery Workflows', () => {
    it('should provide appropriate recovery actions for different error types', () => {
      // Network error should suggest retry and check connection
      const networkError = enhanceError(new Error('Network failed'), { type: 'network' })
      expect(networkError.recoveryActions).toContain('retry')
      expect(networkError.recoveryActions).toContain('check_connection')

      // Validation error should suggest reset
      const validationError = enhanceError(new Error('Invalid input'), { type: 'validation' })
      expect(validationError.recoveryActions).toContain('reset')

      // Upload error should suggest retry
      const uploadError = enhanceError(new Error('Upload failed'), { type: 'upload' })
      expect(uploadError.recoveryActions).toContain('retry')
    })

    it('should handle error severity levels correctly', () => {
      const lowSeverityError = enhanceError(new Error('Warning'), { type: 'validation' })
      expect(lowSeverityError.severity).toBe(ErrorSeverity.LOW)

      const mediumSeverityError = enhanceError(new Error('Upload failed'), { type: 'upload' })
      expect(mediumSeverityError.severity).toBe(ErrorSeverity.MEDIUM)

      const highSeverityError = enhanceError(new Error('Connection lost'), { 
        type: 'network',
        severity: ErrorSeverity.HIGH 
      })
      expect(highSeverityError.severity).toBe(ErrorSeverity.HIGH)
    })
  })
})
/**
 * Comprehensive loading state management hook
 * Provides centralized loading state management with support for multiple
 * concurrent operations, progress tracking, and timeout handling
 */

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Loading operation states
 */
export const LoadingState = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  TIMEOUT: "timeout",
  CANCELLED: "cancelled",
};

/**
 * Loading operation types for better categorization
 */
export const LoadingType = {
  SUBMIT: "submit",
  UPLOAD: "upload",
  FETCH: "fetch",
  PROCESS: "process",
  SAVE: "save",
  DELETE: "delete",
  VALIDATE: "validate",
};

/**
 * Custom hook for managing loading states with support for multiple operations
 * @param {Object} options - Configuration options
 * @param {number} options.defaultTimeout - Default timeout for operations in ms
 * @param {Function} options.onTimeout - Callback when operation times out
 * @param {Function} options.onError - Callback when operation fails
 * @param {Function} options.onSuccess - Callback when operation succeeds
 * @returns {Object} Loading state management object
 */
export const useLoadingState = (options = {}) => {
  const {
    defaultTimeout = 30000, // 30 seconds
    onTimeout = null,
    onError = null,
    onSuccess = null,
  } = options;

  // State for tracking multiple loading operations
  const [operations, setOperations] = useState({});
  const [globalState, setGlobalState] = useState(LoadingState.IDLE);

  // Refs for cleanup
  const timeoutsRef = useRef({});
  const abortControllersRef = useRef({});

  /**
   * Starts a loading operation
   * @param {string} operationId - Unique identifier for the operation
   * @param {Object} config - Operation configuration
   * @returns {Object} Operation control object
   */
  const startOperation = useCallback(
    (operationId, config = {}) => {
      const {
        type = LoadingType.PROCESS,
        timeout = defaultTimeout,
        message = "Loading...",
        progress = 0,
        cancellable = false,
      } = config;

      // Create abort controller if operation is cancellable
      let abortController = null;
      if (cancellable) {
        abortController = new AbortController();
        abortControllersRef.current[operationId] = abortController;
      }

      // Set up timeout if specified
      let timeoutId = null;
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          // Abort if cancellable
          const controller = abortControllersRef.current[operationId];
          if (controller) {
            try {
              controller.abort();
            } catch {}
            delete abortControllersRef.current[operationId];
          }

          setOperations((prev) => ({
            ...prev,
            [operationId]: {
              ...prev[operationId],
              state: LoadingState.TIMEOUT,
              endTime: Date.now(),
              error: new Error(`Operation timed out after ${timeout}ms`),
            },
          }));

          if (onTimeout) {
            onTimeout(operationId, timeout);
          }
        }, timeout);

        timeoutsRef.current[operationId] = timeoutId;
      }

      // Update operation state
      setOperations((prev) => ({
        ...prev,
        [operationId]: {
          id: operationId,
          type,
          state: LoadingState.LOADING,
          message,
          progress,
          startTime: Date.now(),
          endTime: null,
          timeout,
          cancellable,
          abortController,
          error: null,
          result: null,
        },
      }));

      // Update global state
      setGlobalState(LoadingState.LOADING);

      return {
        operationId,
        abortController,
        updateProgress: (newProgress, newMessage) =>
          updateProgress(operationId, newProgress, newMessage),
        complete: (result) => completeOperation(operationId, result),
        fail: (error) => failOperation(operationId, error),
        cancel: () => cancelOperation(operationId),
      };
    },
    [defaultTimeout, onTimeout]
  );

  /**
   * Updates progress for an operation
   * @param {string} operationId - Operation identifier
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} message - Optional progress message
   */
  const updateProgress = useCallback((operationId, progress, message) => {
    setOperations((prev) => {
      const operation = prev[operationId];
      if (!operation || operation.state !== LoadingState.LOADING) {
        return prev;
      }

      return {
        ...prev,
        [operationId]: {
          ...operation,
          progress: Math.max(0, Math.min(100, progress)),
          message: message || operation.message,
        },
      };
    });
  }, []);

  /**
   * Completes an operation successfully
   * @param {string} operationId - Operation identifier
   * @param {*} result - Operation result
   */
  const completeOperation = useCallback(
    (operationId, result = null) => {
      // Clear timeout
      if (timeoutsRef.current[operationId]) {
        clearTimeout(timeoutsRef.current[operationId]);
        delete timeoutsRef.current[operationId];
      }

      // Clear abort controller
      if (abortControllersRef.current[operationId]) {
        delete abortControllersRef.current[operationId];
      }

      setOperations((prev) => {
        const operation = prev[operationId];
        if (!operation) {
          return prev;
        }

        const updatedOperation = {
          ...operation,
          state: LoadingState.SUCCESS,
          progress: 100,
          endTime: Date.now(),
          result,
        };

        if (onSuccess) {
          onSuccess(operationId, result, updatedOperation);
        }

        return {
          ...prev,
          [operationId]: updatedOperation,
        };
      });
    },
    [onSuccess]
  );

  /**
   * Fails an operation with an error
   * @param {string} operationId - Operation identifier
   * @param {Error} error - Error object
   */
  const failOperation = useCallback(
    (operationId, error) => {
      // Clear timeout
      if (timeoutsRef.current[operationId]) {
        clearTimeout(timeoutsRef.current[operationId]);
        delete timeoutsRef.current[operationId];
      }

      // Clear abort controller
      if (abortControllersRef.current[operationId]) {
        delete abortControllersRef.current[operationId];
      }

      setOperations((prev) => {
        const operation = prev[operationId];
        if (!operation) {
          return prev;
        }

        const updatedOperation = {
          ...operation,
          state: LoadingState.ERROR,
          endTime: Date.now(),
          error,
        };

        if (onError) {
          onError(operationId, error, updatedOperation);
        }

        return {
          ...prev,
          [operationId]: updatedOperation,
        };
      });
    },
    [onError]
  );

  /**
   * Cancels an operation
   * @param {string} operationId - Operation identifier
   */
  const cancelOperation = useCallback((operationId) => {
    // Clear timeout
    if (timeoutsRef.current[operationId]) {
      clearTimeout(timeoutsRef.current[operationId]);
      delete timeoutsRef.current[operationId];
    }

    // Abort the operation if it has an abort controller
    const abortController = abortControllersRef.current[operationId];
    if (abortController) {
      abortController.abort();
      delete abortControllersRef.current[operationId];
    }

    setOperations((prev) => {
      const operation = prev[operationId];
      if (!operation) {
        return prev;
      }

      return {
        ...prev,
        [operationId]: {
          ...operation,
          state: LoadingState.CANCELLED,
          endTime: Date.now(),
        },
      };
    });
  }, []);

  /**
   * Removes an operation from tracking
   * @param {string} operationId - Operation identifier
   */
  const removeOperation = useCallback((operationId) => {
    // Clean up any remaining timeouts or controllers
    if (timeoutsRef.current[operationId]) {
      clearTimeout(timeoutsRef.current[operationId]);
      delete timeoutsRef.current[operationId];
    }

    if (abortControllersRef.current[operationId]) {
      delete abortControllersRef.current[operationId];
    }

    setOperations((prev) => {
      const { [operationId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Clears all completed operations
   */
  const clearCompleted = useCallback(() => {
    setOperations((prev) => {
      const filtered = {};
      Object.values(prev).forEach((operation) => {
        if (operation.state === LoadingState.LOADING) {
          filtered[operation.id] = operation;
        }
      });
      return filtered;
    });
  }, []);

  /**
   * Cancels all active operations
   */
  const cancelAll = useCallback(() => {
    Object.keys(operations).forEach((operationId) => {
      const operation = operations[operationId];
      if (operation.state === LoadingState.LOADING) {
        cancelOperation(operationId);
      }
    });
  }, [operations, cancelOperation]);

  /**
   * Wraps an async function with loading state management
   * @param {Function} asyncFunction - The async function to wrap
   * @param {Object} config - Operation configuration
   * @returns {Function} Wrapped function
   */
  const withLoadingState = useCallback(
    (asyncFunction, config = {}) => {
      return async (...args) => {
        const operationId =
          config.operationId ||
          `operation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const operation = startOperation(operationId, config);

        try {
          const result = await asyncFunction(...args);
          operation.complete(result);
          return result;
        } catch (error) {
          // Check if operation was cancelled
          if (error.name === "AbortError") {
            // Operation was cancelled, don't treat as error
            return null;
          }

          operation.fail(error);
          throw error;
        }
      };
    },
    [startOperation]
  );

  // Update global state based on operations
  useEffect(() => {
    const operationList = Object.values(operations);

    if (operationList.length === 0) {
      setGlobalState(LoadingState.IDLE);
      return;
    }

    const hasLoading = operationList.some(
      (op) => op.state === LoadingState.LOADING
    );
    const hasError = operationList.some(
      (op) =>
        op.state === LoadingState.ERROR || op.state === LoadingState.TIMEOUT
    );

    if (hasLoading) {
      setGlobalState(LoadingState.LOADING);
    } else if (hasError) {
      setGlobalState(LoadingState.ERROR);
    } else {
      setGlobalState(LoadingState.SUCCESS);
    }
  }, [operations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      Object.values(timeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });

      // Abort all operations
      Object.values(abortControllersRef.current).forEach((controller) => {
        controller.abort();
      });
    };
  }, []);

  // Computed values
  const operationList = Object.values(operations);
  const activeOperations = operationList.filter(
    (op) => op.state === LoadingState.LOADING
  );
  const completedOperations = operationList.filter(
    (op) =>
      op.state === LoadingState.SUCCESS ||
      op.state === LoadingState.ERROR ||
      op.state === LoadingState.TIMEOUT ||
      op.state === LoadingState.CANCELLED
  );
  const errorOperations = operationList.filter(
    (op) => op.state === LoadingState.ERROR || op.state === LoadingState.TIMEOUT
  );

  const isLoading = activeOperations.length > 0;
  const hasErrors = errorOperations.length > 0;
  const progress =
    activeOperations.length > 0
      ? activeOperations.reduce((sum, op) => sum + op.progress, 0) /
        activeOperations.length
      : 0;

  return {
    // State
    operations,
    globalState,
    isLoading,
    hasErrors,
    progress,

    // Operation lists
    operationList,
    activeOperations,
    completedOperations,
    errorOperations,

    // Actions
    startOperation,
    updateProgress,
    completeOperation,
    failOperation,
    cancelOperation,
    removeOperation,
    clearCompleted,
    cancelAll,

    // Utilities
    withLoadingState,

    // Getters
    getOperation: (operationId) => operations[operationId],
    isOperationLoading: (operationId) =>
      operations[operationId]?.state === LoadingState.LOADING,
    getOperationProgress: (operationId) =>
      operations[operationId]?.progress || 0,
    getOperationError: (operationId) => operations[operationId]?.error,

    // Stats
    stats: {
      total: operationList.length,
      active: activeOperations.length,
      completed: completedOperations.length,
      errors: errorOperations.length,
      averageProgress: progress,
    },
  };
};

/**
 * Hook for simple loading state (single operation)
 * @param {Object} options - Configuration options
 * @returns {Object} Simple loading state object
 */
export const useSimpleLoadingState = (options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
  }, []);

  const updateProgress = useCallback((newProgress) => {
    setProgress(Math.max(0, Math.min(100, newProgress)));
  }, []);

  const completeLoading = useCallback(() => {
    setIsLoading(false);
    setProgress(100);
  }, []);

  const failLoading = useCallback((error) => {
    setIsLoading(false);
    setError(error);
  }, []);

  const resetLoading = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setProgress(0);
  }, []);

  const withLoading = useCallback(
    (asyncFunction) => {
      return async (...args) => {
        startLoading();
        try {
          const result = await asyncFunction(...args);
          completeLoading();
          return result;
        } catch (error) {
          failLoading(error);
          throw error;
        }
      };
    },
    [startLoading, completeLoading, failLoading]
  );

  return {
    isLoading,
    error,
    progress,
    hasError: !!error,
    startLoading,
    updateProgress,
    completeLoading,
    failLoading,
    resetLoading,
    withLoading,
  };
};

export default useLoadingState;

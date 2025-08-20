import axios from "axios";

/**
 * Enhanced Axios configuration with comprehensive error handling and retry logic
 */

// Network error types for better error classification
export const NetworkErrorTypes = {
  TIMEOUT: "timeout",
  CONNECTION: "connection",
  SERVER_ERROR: "server_error",
  CLIENT_ERROR: "client_error",
  UNKNOWN: "unknown",
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // Base delay in ms
  retryDelayMultiplier: 2, // Exponential backoff multiplier
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrorCodes: ["ECONNABORTED", "ENOTFOUND", "ECONNRESET", "ETIMEDOUT"],
};

/**
 * Determines if an error is retryable
 * @param {Object} error - Axios error object
 * @returns {boolean} Whether the error should be retried
 */
const isRetryableError = (error) => {
  // Network errors (no response)
  if (!error.response) {
    return (
      RETRY_CONFIG.retryableErrorCodes.includes(error.code) ||
      error.message.includes("timeout") ||
      error.message.includes("Network Error")
    );
  }

  // HTTP status code errors
  return RETRY_CONFIG.retryableStatusCodes.includes(error.response.status);
};

/**
 * Calculates retry delay with exponential backoff
 * @param {number} retryCount - Current retry attempt (0-based)
 * @returns {number} Delay in milliseconds
 */
const calculateRetryDelay = (retryCount) => {
  return (
    RETRY_CONFIG.retryDelay *
    Math.pow(RETRY_CONFIG.retryDelayMultiplier, retryCount)
  );
};

/**
 * Classifies network errors for better user messaging
 * @param {Object} error - Axios error object
 * @returns {Object} Error classification with type and user message
 */
export const classifyNetworkError = (error) => {
  // No response received (network issues)
  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return {
        type: NetworkErrorTypes.TIMEOUT,
        message:
          "Request timed out. Please check your connection and try again.",
        isRetryable: true,
      };
    }

    if (error.code === "ENOTFOUND" || error.message.includes("Network Error")) {
      return {
        type: NetworkErrorTypes.CONNECTION,
        message:
          "Unable to connect to the server. Please check your internet connection.",
        isRetryable: true,
      };
    }

    return {
      type: NetworkErrorTypes.CONNECTION,
      message: "Network error occurred. Please try again.",
      isRetryable: true,
    };
  }

  // Server responded with error status
  const status = error.response.status;

  if (status >= 500) {
    return {
      type: NetworkErrorTypes.SERVER_ERROR,
      message: "Server error occurred. Please try again in a moment.",
      isRetryable: true,
    };
  }

  if (status === 429) {
    return {
      type: NetworkErrorTypes.SERVER_ERROR,
      message: "Too many requests. Please wait a moment and try again.",
      isRetryable: true,
    };
  }

  if (status >= 400 && status < 500) {
    return {
      type: NetworkErrorTypes.CLIENT_ERROR,
      message:
        error.response.data?.message ||
        "Request failed. Please check your input and try again.",
      isRetryable: false,
    };
  }

  return {
    type: NetworkErrorTypes.UNKNOWN,
    message: "An unexpected error occurred. Please try again.",
    isRetryable: false,
  };
};

// Create axios instance with default configuration
// TODO: Update baseURL when backend API is available
const apiClient = axios.create({
  // Use relative base by default to leverage Vite dev proxy and avoid CORS in development
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: import.meta.env.VITE_API_TIMEOUT || 60000,
});

// Request interceptor for adding auth tokens and retry metadata
apiClient.interceptors.request.use(
  (config) => {
    // Initialize retry count if not present
    if (!config.metadata) {
      config.metadata = { retryCount: 0 };
    }

    // TODO: Add authentication token when auth is implemented
    // const token = localStorage.getItem('authToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }

    // Add request timestamp for timeout tracking
    config.metadata.startTime = Date.now();

    // Set Content-Type only when sending a body
    if (config.data && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic and enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (import.meta.env.VITE_NODE_ENV === "development") {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`
      );
    }

    return response;
  },
  async (error) => {
    const config = error.config;

    // Ensure metadata exists
    if (!config.metadata) {
      config.metadata = { retryCount: 0 };
    }

    // Classify the error
    const errorClassification = classifyNetworkError(error);

    // Add classification to error object for downstream handling
    error.classification = errorClassification;

    // Log error details in development
    if (import.meta.env.VITE_NODE_ENV === "development") {
      const duration = config.metadata.startTime
        ? Date.now() - config.metadata.startTime
        : "unknown";
      console.error(
        `❌ ${config.method?.toUpperCase()} ${config.url} (${duration}ms)`,
        {
          status: error.response?.status,
          type: errorClassification.type,
          retryCount: config.metadata.retryCount,
          isRetryable: errorClassification.isRetryable,
        }
      );
    }

    // Check if we should retry
    const shouldRetry =
      errorClassification.isRetryable &&
      config.metadata.retryCount < RETRY_CONFIG.maxRetries &&
      !config.skipRetry; // Allow requests to opt out of retry

    if (shouldRetry) {
      config.metadata.retryCount += 1;

      // Calculate delay for this retry
      const delay = calculateRetryDelay(config.metadata.retryCount - 1);

      // Log retry attempt in development
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.log(
          `🔄 Retrying request (attempt ${config.metadata.retryCount}/${RETRY_CONFIG.maxRetries}) after ${delay}ms`
        );
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return apiClient(config);
    }

    // No retry - reject with enhanced error
    return Promise.reject(error);
  }
);

/**
 * Creates a request with custom retry configuration
 * @param {Object} config - Axios request config
 * @param {Object} retryOptions - Custom retry options
 * @returns {Promise} Axios request promise
 */
export const createRetryableRequest = (config, retryOptions = {}) => {
  const enhancedConfig = {
    ...config,
    metadata: {
      retryCount: 0,
      customRetryConfig: { ...RETRY_CONFIG, ...retryOptions },
    },
  };

  return apiClient(enhancedConfig);
};

/**
 * Creates a request that skips automatic retry
 * @param {Object} config - Axios request config
 * @returns {Promise} Axios request promise
 */
export const createNonRetryableRequest = (config) => {
  return apiClient({
    ...config,
    skipRetry: true,
  });
};

/**
 * Checks if the client is online
 * @returns {boolean} Online status
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Waits for the client to come back online
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<boolean>} Resolves when online or timeout
 */
export const waitForOnline = (timeout = 30000) => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener("online", onlineHandler);
      resolve(false);
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener("online", onlineHandler);
      resolve(true);
    };

    window.addEventListener("online", onlineHandler);
  });
};

export { apiClient };

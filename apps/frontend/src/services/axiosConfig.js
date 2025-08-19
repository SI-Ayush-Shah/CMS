import axios from 'axios'

// Create axios instance with default configuration
// TODO: Update baseURL when backend API is available
const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth tokens, etc.
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add authentication token when auth is implemented
    // const token = localStorage.getItem('authToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // TODO: Add global error handling logic
    // Handle common error scenarios (401, 403, 500, etc.)
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export { apiClient }
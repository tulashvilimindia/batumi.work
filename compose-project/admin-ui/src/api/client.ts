import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add API key to all requests
apiClient.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('adminApiKey')
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey
  }
  return config
})

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored API key on unauthorized
      localStorage.removeItem('adminApiKey')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default apiClient

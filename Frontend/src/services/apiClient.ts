import axios from 'axios'

/**
 * Central Axios instance for future Spring Boot REST integration.
 * Base URL reads from Vite env; falls back to localhost for local dev.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Example: attach JWT from storage when backend is ready
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tournament_os_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

import axios from 'axios'

/**
 * Central Axios instance for Spring Boot REST integration.
 * Base URL reads from Vite env; falls back to the Vite proxy path for local dev.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ── Request: attach JWT ────────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tournament_os_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response: handle expired / invalid sessions ────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    // 401 = backend explicitly rejected the token
    // 403 on an endpoint that allows all authenticated users = token is missing/invalid
    if (status === 401 || status === 403) {
      // Signal AuthContext to clear state and redirect to /login
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
    }
    return Promise.reject(error)
  },
)

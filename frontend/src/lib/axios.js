import axios from 'axios'
import { STORAGE_KEYS } from './constants'

/**
 * Resolved API root (no trailing slash).
 * Dev default talks straight to the Node server (same as backend CORS for localhost:5173).
 * Set VITE_API_BASE_URL if the API is not on 127.0.0.1:5000.
 */
export function getApiBaseURL() {
  const env = import.meta.env.VITE_API_BASE_URL
  if (typeof env === 'string' && env.trim() !== '') {
    return env.trim().replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    const port = String(import.meta.env.VITE_API_PORT ?? '5000').trim() || '5000'
    return `http://127.0.0.1:${port}/api`
  }
  return 'http://127.0.0.1:5000/api'
}

/** True when the browser could not reach the API (backend down, wrong port, or proxy upstream missing). */
export function isApiUnreachable(error) {
  if (!error) return false
  const st = error.response?.status
  if (st === 502 || st === 503) return true
  if (error.response && st !== 502 && st !== 503) return false
  const code = error.code
  if (code === 'ERR_NETWORK' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT') return true
  const msg = String(error.message || '')
  if (/network error/i.test(msg)) return true
  if (/connection refused/i.test(msg)) return true
  if (error.request && !error.response) return true
  return false
}

export function describeApiUnreachable() {
  const base = getApiBaseURL()
  const portHint =
    import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL
      ? ` Check backend PORT in backend/.env matches VITE_API_PORT in frontend/.env (default 5000).`
      : ''
  return `Cannot reach the API (${base}). Start the backend: cd backend && npm start.${portHint} Or set VITE_API_BASE_URL in frontend/.env.`
}

const noCacheHeaders = {
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
}

const defaultApi = axios.create({
  baseURL: getApiBaseURL(),
  headers: { ...noCacheHeaders },
})

defaultApi.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function createApiClient({ getToken }) {
  const api = axios.create({
    baseURL: getApiBaseURL(),
    headers: { ...noCacheHeaders },
  })

  api.interceptors.request.use((config) => {
    const token = getToken?.()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  return api
}

export function getStoredToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  } catch {
    return null
  }
}

export function setStoredToken(token) {
  try {
    if (!token) localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    else localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
  } catch {
    // ignore
  }
}

export const api = defaultApi
export default defaultApi


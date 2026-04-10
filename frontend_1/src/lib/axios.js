import axios from 'axios'
import { STORAGE_KEYS } from './constants'

const defaultApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
})

defaultApi.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function createApiClient({ getToken }) {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
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


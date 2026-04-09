import { create } from 'zustand'
import { createApiClient, getStoredToken, setStoredToken } from '../../lib/axios'

const api = createApiClient({ getToken: () => getStoredToken() })

export const useAuthStore = create((set, get) => ({
  token: getStoredToken(),
  user: null,
  status: 'idle', // idle | loading | authed | guest
  error: null,

  setToken: (token) => {
    setStoredToken(token)
    set({ token })
  },

  logout: () => {
    setStoredToken(null)
    set({ token: null, user: null, status: 'guest', error: null })
  },

  login: async ({ email, password }) => {
    set({ status: 'loading', error: null })
    const { data } = await api.post('/auth/login', { email, password })
    setStoredToken(data.token)
    set({ token: data.token, user: data.user, status: 'authed' })
    return data
  },

  hydrateMe: async () => {
    const token = get().token
    if (!token) {
      set({ status: 'guest', user: null })
      return null
    }

    set({ status: 'loading', error: null })
    try {
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      set({ user: data.user, status: 'authed' })
      return data.user
    } catch (err) {
      setStoredToken(null)
      set({ token: null, user: null, status: 'guest', error: 'Session expired' })
      return null
    }
  },
}))


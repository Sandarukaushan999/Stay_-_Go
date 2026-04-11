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

  isLogoutModalOpen: false,

  openLogoutModal: () => set({ isLogoutModalOpen: true }),
  closeLogoutModal: () => set({ isLogoutModalOpen: false }),

  logout: () => {
    setStoredToken(null)
    set({ token: null, user: null, status: 'guest', error: null, isLogoutModalOpen: false })
  },

  login: async ({ email, password }) => {
    set({ status: 'loading', error: null })
    const { data } = await api.post('/auth/login', { email, password })

    if (data.twoFactorRequired) {
      set({ status: 'guest' }) // user needs to input OTP, not yet authed
      return data // { twoFactorRequired: true, userId }
    }

    setStoredToken(data.token)
    set({ token: data.token, user: data.user, status: 'authed' })
    return data
  },

  verifyOtp: async (userId, otp) => {
    set({ status: 'loading', error: null })
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp })
      setStoredToken(data.token)
      set({ token: data.token, user: data.user, status: 'authed' })
      return data
    } catch (err) {
      set({ status: 'guest', error: 'Invalid or expired OTP' })
      throw err
    }
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

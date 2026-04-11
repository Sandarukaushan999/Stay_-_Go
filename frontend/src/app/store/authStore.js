import { create } from 'zustand'
import { createApiClient, getStoredToken, setStoredToken } from '../../lib/axios'
import { useSocketStore } from './socketStore'

const api = createApiClient({ getToken: () => getStoredToken() })

/** Single in-flight /auth/me so AppProviders + pages do not stampede and race each other. */
let hydrateMePromise = null

export const useAuthStore = create((set, get) => ({
  token: getStoredToken(),
  user: null,
  // With a stored token, start in loading so ProtectedRoute does not flash the wrong screen before hydrateMe runs.
  status: getStoredToken() ? 'loading' : 'guest', // loading | authed | guest
  error: null,

  setToken: (token) => {
    setStoredToken(token)
    set({ token })
  },

  isLogoutModalOpen: false,

  openLogoutModal: () => set({ isLogoutModalOpen: true }),
  closeLogoutModal: () => set({ isLogoutModalOpen: false }),

  logout: () => {
    useSocketStore.getState().disconnect()
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

<<<<<<< HEAD
  hydrateMe: async ({ force = false } = {}) => {
=======
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
>>>>>>> 461d32b321f3780c45ad6f481ab155cffd87c2b3
    const token = get().token
    if (!token) {
      set({ status: 'guest', user: null, error: null })
      return null
    }

    if (!force && get().status === 'authed' && get().user) {
      return get().user
    }

    if (hydrateMePromise) return hydrateMePromise

    hydrateMePromise = (async () => {
      set({ status: 'loading', error: null })
      try {
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const user = res?.data?.user
        if (!user || typeof user !== 'object') {
          throw new Error('Invalid session payload')
        }
        set({ user, status: 'authed', error: null })
        return user
      } catch (err) {
        const httpStatus = err?.response?.status
        if (httpStatus === 401 || httpStatus === 403) {
          setStoredToken(null)
          set({ token: null, user: null, status: 'guest', error: 'Session expired' })
          return null
        }
        const existingUser = get().user
        if (existingUser) {
          set({ status: 'authed', error: null })
          return existingUser
        }
        set({ status: 'guest', user: null, error: null })
        return null
      } finally {
        hydrateMePromise = null
      }
    })()

    return hydrateMePromise
  },
}))

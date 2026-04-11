import { create } from 'zustand'
import { io } from 'socket.io-client'
import { getSocketURL } from '../../lib/axios'

export const useSocketStore = create((set, get) => ({
  socket: null,
  status: 'disconnected',
  socketUrl: null,
  joinedUserId: null,
  error: null,

  connect: ({ userId } = {}) => {
    const nextUrl = getSocketURL()
    const existing = get().socket
    const nextUserId = userId != null ? String(userId) : null

    if (existing && get().socketUrl === nextUrl) {
      if (nextUserId && get().joinedUserId !== nextUserId) {
        if (existing.connected) existing.emit('join:user', nextUserId)
        set({ joinedUserId: nextUserId })
      }

      if (!existing.connected && !existing.active) {
        set({ status: 'connecting', error: null })
        existing.connect()
      }

      return existing
    }

    if (existing) existing.disconnect()

    const socket = io(nextUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      const joined = get().joinedUserId
      if (joined) socket.emit('join:user', joined)
      set({ status: 'connected', error: null })
    })
    socket.on('connect_error', (err) => {
      set({ status: 'error', error: err?.message ?? 'Socket connection failed' })
    })
    socket.on('disconnect', () => set({ status: 'disconnected' }))

    set({
      socket,
      status: socket.connected ? 'connected' : 'connecting',
      socketUrl: nextUrl,
      joinedUserId: nextUserId,
      error: null,
    })

    return socket
  },

  disconnect: () => {
    const s = get().socket
    if (s) s.disconnect()
    set({ socket: null, status: 'disconnected', socketUrl: null, joinedUserId: null, error: null })
  },
}))

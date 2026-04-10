import { create } from 'zustand'
import { io } from 'socket.io-client'

export const useSocketStore = create((set, get) => ({
  socket: null,
  status: 'disconnected',

  connect: ({ userId } = {}) => {
    if (get().socket) return get().socket
    const socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000', {
      transports: ['websocket'],
    })
    socket.on('connect', () => set({ status: 'connected' }))
    socket.on('disconnect', () => set({ status: 'disconnected' }))
    if (userId) socket.emit('join:user', userId)
    set({ socket })
    return socket
  },

  disconnect: () => {
    const s = get().socket
    if (s) s.disconnect()
    set({ socket: null, status: 'disconnected' })
  },
}))


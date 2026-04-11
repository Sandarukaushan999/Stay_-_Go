import { Server } from 'socket.io'
import { env } from './env.js'

let ioRef = null
const noopIo = {
  to() {
    return this
  },
  emit() {},
}

export function createSocketServer(httpServer) {
  const allowedOrigins = Array.from(
    new Set([
      env.CLIENT_URL,
      ...(env.CLIENT_URLS ?? []),
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ])
  )

  const io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        return callback(new Error(`Socket.IO CORS blocked origin: ${origin}`))
      },
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    socket.on('join:user', (userId) => socket.join(`user:${userId}`))
    socket.on('join:trip', (tripId) => socket.join(`trip:${tripId}`))
    socket.on('leave:trip', (tripId) => socket.leave(`trip:${tripId}`))
    socket.on('join:admin', () => socket.join('admin'))
    socket.on('disconnect', () => {})
  })

  ioRef = io
  return io
}

export function getIo() {
  return ioRef ?? noopIo
}

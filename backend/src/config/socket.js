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
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
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

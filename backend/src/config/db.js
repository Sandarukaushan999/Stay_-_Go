import mongoose from 'mongoose'
import { env } from './env.js'
import { MongoMemoryServer } from 'mongodb-memory-server'

let memoryServer = null

export async function connectDb() {
  mongoose.set('strictQuery', true)
  const urisToTry = [env.MONGO_URI, env.MONGO_FALLBACK_URI].filter(Boolean)

  for (const uri of urisToTry) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
      console.log('[DB] Connected to MongoDB')
      return
    } catch (err) {
      // try next
    }
  }

  const isDev = (env.NODE_ENV ?? 'development') !== 'production'
  if (!isDev) throw new Error('Failed to connect to MongoDB (and no dev fallback allowed).')

  // Dev-only fallback: in-memory MongoDB
  console.warn('[DB] No local MongoDB found. Using in-memory fallback (data resets on restart).')
  console.warn('[DB] FIX: Set MONGO_URI in .env to a MongoDB Atlas connection string.')
  memoryServer = await MongoMemoryServer.create()
  await mongoose.connect(memoryServer.getUri())
  console.log('[DB] Connected to in-memory MongoDB (ephemeral)')
}


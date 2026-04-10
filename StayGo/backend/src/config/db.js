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
      return
    } catch (err) {
      // try next
    }
  }

  const isDev = (env.NODE_ENV ?? 'development') !== 'production'
  if (!isDev) throw new Error('Failed to connect to MongoDB (and no dev fallback allowed).')

  // Dev-only fallback for when neither Atlas nor local Mongo is reachable.
  memoryServer = await MongoMemoryServer.create()
  await mongoose.connect(memoryServer.getUri())
}


import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'

import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { errorMiddleware } from './common/middlewares/error.middleware.js'

export function createApp() {
  const app = express()

  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }))
  const allowedOrigins = Array.from(
    new Set([env.CLIENT_URL, ...(env.CLIENT_URLS ?? []), 'http://localhost:5173', 'http://localhost:5174'])
  )
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        return callback(new Error(`CORS blocked origin: ${origin}`))
      },
      credentials: true,
    })
  )
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  app.use('/api', apiRouter)
  app.use('/uploads', express.static('uploads'))

  app.use(errorMiddleware)

  return app
}


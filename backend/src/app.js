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

  // JSON APIs must not use conditional GET (304): browsers/XHR often deliver an empty body for 304,
  // which breaks axios clients that expect JSON (e.g. /auth/me wiping the session).
  app.set('etag', false)

  app.use(helmet())
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

  app.use(
    '/api',
    (req, res, next) => {
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        Pragma: 'no-cache',
      })
      next()
    },
    apiRouter
  )

  app.use(errorMiddleware)

  return app
}


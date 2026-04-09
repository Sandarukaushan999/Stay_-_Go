import { ApiError } from '../utils/ApiError.js'

export function errorMiddleware(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500
  const message = err instanceof ApiError ? err.message : 'Internal Server Error'

  const payload = {
    success: false,
    message,
  }

  if (err instanceof ApiError && err.details !== undefined) {
    payload.details = err.details
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err?.stack
  }

  res.status(statusCode).json(payload)
}


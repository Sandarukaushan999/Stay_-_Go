import { ApiError } from '../utils/ApiError.js'
import fs from 'fs'

export function errorMiddleware(err, req, res, next) {
  console.error("GLOBAL_ERROR_CAUGHT:", err.name, err.message, err, err.stack);
  fs.appendFileSync("error_debug.log", new Date().toISOString() + " | " + err.name + " | " + err.message + "\n");
  let statusCode = 500
  let message = 'Internal Server Error'

  if (err instanceof ApiError) {
    statusCode = err.statusCode
    message = err.message
  } else if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors).map(val => val.message).join(', ')
  } else if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `${field} is already in use.`
  } else if (err.message) {
    message = err.message
  }

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


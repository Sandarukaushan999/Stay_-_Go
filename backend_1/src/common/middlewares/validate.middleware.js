import { ApiError } from '../utils/ApiError.js'

export function validateBody(schema) {
  return function validateBodyMiddleware(req, res, next) {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return next(new ApiError(400, 'Validation error', result.error.flatten()))
    }
    req.body = result.data
    next()
  }
}


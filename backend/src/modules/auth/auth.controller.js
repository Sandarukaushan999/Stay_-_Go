import { asyncHandler } from '../../common/utils/asyncHandler.js'
import * as authService from './auth.service.js'
import { User } from '../users/user.model.js'

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body)
  res.status(201).json({ success: true, ...result })
})

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body)
  res.json({ success: true, ...result })
})

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean()
  res.json({ success: true, user: authService.sanitizeUser(user) })
})


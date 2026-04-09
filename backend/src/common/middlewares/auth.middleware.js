import { ApiError } from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { User } from '../../modules/users/user.model.js'
import mongoose from 'mongoose'

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Missing Authorization header')
    }

    const token = header.slice('Bearer '.length)
    let decoded
    try {
      decoded = verifyAccessToken(token)
    } catch {
      throw new ApiError(401, 'Invalid token')
    }

    const userId = decoded?.sub
    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new ApiError(401, 'Invalid token')
    }

    const user = await User.findById(userId).lean()
    if (!user) throw new ApiError(401, 'User not found')
    if (user.isBlocked) throw new ApiError(403, 'User is blocked')

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      campusId: user.campusId ?? null,
      hasVehicle: Boolean(user.hasVehicle),
      riderVerificationStatus: user.riderVerificationStatus ?? 'none',
    }

    next()
  } catch (err) {
    next(err)
  }
}


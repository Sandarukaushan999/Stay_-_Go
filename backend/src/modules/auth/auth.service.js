import { User } from '../users/user.model.js'
import { ApiError } from '../../common/utils/ApiError.js'
import { hashPassword, verifyPassword } from '../../common/utils/password.js'
import { signAccessToken } from '../../common/utils/jwt.js'
import { env } from '../../config/env.js'

export async function register({ fullName, email, password, role }) {
  const normalizedRole = role ?? 'student'
  if (!env.PUBLIC_REGISTER) {
    const allowed = normalizedRole === 'admin' || normalizedRole === 'super_admin'
    if (!allowed) throw new ApiError(403, 'Only admins can self-register. Students are created in Admin → User Management.')
  }

  const existing = await User.findOne({ email }).lean()
  if (existing) throw new ApiError(409, 'Email already registered')

  const passwordHash = await hashPassword(password)
  const isDriverSignup = role === 'rider'
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    role: isDriverSignup ? 'student' : normalizedRole,
    isVerified: true,
    riderVerificationStatus: isDriverSignup ? 'pending' : 'none',
    riderAppliedAt: isDriverSignup ? new Date() : null,
  })

  const token = signAccessToken({ sub: user._id.toString(), role: user.role })
  return { user: sanitizeUser(user), token }
}

export async function login({ email, password }) {
  const user = await User.findOne({ email })
  if (!user) throw new ApiError(401, 'Invalid email or password')
  if (user.isBlocked) throw new ApiError(403, 'User is blocked')

  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) throw new ApiError(401, 'Invalid email or password')

  const token = signAccessToken({ sub: user._id.toString(), role: user.role })
  return { user: sanitizeUser(user), token }
}

export function sanitizeUser(userDoc) {
  const u = userDoc.toObject ? userDoc.toObject() : userDoc
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, __v, ...safe } = u
  safe.id = safe._id?.toString?.() ?? safe._id
  delete safe._id
  return safe
}


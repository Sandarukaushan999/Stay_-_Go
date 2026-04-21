import { User } from '../users/user.model.js'
import { ApiError } from '../../common/utils/ApiError.js'
import { hashPassword, verifyPassword } from '../../common/utils/password.js'
import { signAccessToken } from '../../common/utils/jwt.js'
import { env } from '../../config/env.js'

export async function register(payload) {
  const normalizedRole = payload.role ?? 'student'

  if (env.PUBLIC_REGISTER) {
    if (normalizedRole === 'super_admin') throw new ApiError(403, 'Super admin registration is disabled.')
    if (!env.PUBLIC_REGISTER_ROLES.includes(normalizedRole)) {
      throw new ApiError(403, 'This role cannot be registered publicly.')
    }
  } else {
    // When PUBLIC_REGISTER is disabled: allow only admin bootstrapping
    const allowed = normalizedRole === 'admin' || normalizedRole === 'super_admin'
    if (!allowed) {
      throw new ApiError(403, 'Registration is disabled. Contact admin.')
    }
  }

  const existing = await User.findOne({ email: payload.email }).lean()
  if (existing) throw new ApiError(409, 'Email already registered')

  if (normalizedRole === 'student') {
    if (!payload.campusId) throw new ApiError(400, 'campusId is required for students')
  }

  const passwordHash = await hashPassword(payload.password)
  const wantsRider = normalizedRole === 'student' && Boolean(payload.hasVehicle)
  const vehicleType = payload.vehicleType ?? null
  const autoSeat =
    vehicleType === 'bike' ? 1 : vehicleType === 'car' ? 3 : vehicleType === 'van' ? 7 : 0

  const user = await User.create({
    fullName: payload.fullName,
    email: payload.email,
    passwordHash,
    role: normalizedRole,

    phone: payload.phone ?? null,
    studentId: payload.studentId ?? null,
    campusId: payload.campusId != null ? String(payload.campusId).trim().toLowerCase() : null,
    emergencyContact: payload.emergencyContact ?? null,

    hasVehicle: wantsRider,
    vehicleType: wantsRider ? vehicleType : null,
    vehicleNumber: wantsRider ? payload.vehicleNumber ?? null : null,
    seatCount: wantsRider ? autoSeat : 0,
    residenceLocation: normalizedRole === 'student' && !wantsRider ? payload.residenceLocation ?? null : null,
    vehicleOriginLocation: wantsRider ? payload.vehicleOriginLocation ?? null : null,

    isVerified: true,
    riderVerificationStatus: wantsRider ? 'pending' : 'none',
    riderAppliedAt: wantsRider ? new Date() : null,
    lastLogin: new Date(),
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

  user.lastLogin = new Date()
  await user.save()

  const token = signAccessToken({ sub: user._id.toString(), role: user.role })
  return { user: sanitizeUser(user), token }
}

export function sanitizeUser(userDoc) {
  const u = userDoc.toObject ? userDoc.toObject() : userDoc
  const passwordCheck = u.passwordHash
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, __v, ...safe } = u
  safe.id = safe._id?.toString?.() ?? safe._id
  delete safe._id
  if (passwordCheck !== undefined) {
    safe.hasPassword = passwordCheck !== 'GOOGLE_OAUTH_NO_PASSWORD'
  }
  return safe
}

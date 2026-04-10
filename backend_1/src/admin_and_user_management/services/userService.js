import { ApiError } from '../../common/utils/ApiError.js'
import { User } from '../models/User.js'
import { hashPassword } from '../../common/utils/password.js'

export async function listUsers({ q, role, page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, Number(page) || 1)
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20))

  const filter = {}
  if (role) filter.role = role
  if (q) {
    filter.$or = [
      { email: { $regex: q, $options: 'i' } },
      { fullName: { $regex: q, $options: 'i' } },
      { studentId: { $regex: q, $options: 'i' } },
    ]
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    User.countDocuments(filter),
  ])

  return {
    items: items.map(sanitizeUser),
    page: safePage,
    limit: safeLimit,
    total,
  }
}

export async function createUser(payload) {
  const { fullName, email, password, role } = payload
  const existing = await User.findOne({ email }).lean()
  if (existing) throw new ApiError(409, 'Email already registered')

  const passwordHash = await hashPassword(password)
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    role,
    phone: payload.phone ?? null,
    studentId: payload.studentId ?? null,
    campusId: payload.campusId ?? null,
    emergencyContact: payload.emergencyContact ?? null,

    hasVehicle: Boolean(payload.hasVehicle),
    vehicleType: payload.vehicleType ?? null,
    vehicleNumber: payload.vehicleNumber ?? null,
    seatCount: payload.seatCount ?? 0,

    residenceLocation: payload.residenceLocation ?? null,
    vehicleOriginLocation: payload.vehicleOriginLocation ?? null,

    isVerified: true,
  })
  return sanitizeUser(user)
}

export async function setBlocked(userId, isBlocked) {
  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: Boolean(isBlocked) },
    { new: true }
  ).lean()
  if (!user) throw new ApiError(404, 'User not found')
  return sanitizeUser(user)
}

export async function updateUserRole(userId, role) {
  const validRoles = ['student', 'rider', 'technician', 'admin', 'super_admin']
  if (!validRoles.includes(role)) {
    throw new ApiError(400, 'Invalid role assignment')
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).lean()
  if (!user) throw new ApiError(404, 'User not found')
  return sanitizeUser(user)
}

export async function approveRider(userId, approved = true) {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')
  user.role = approved ? 'rider' : 'student'
  user.riderVerificationStatus = approved ? 'approved' : 'rejected'
  user.isVerified = true
  await user.save()
  return sanitizeUser(user)
}

export async function listPendingRiders({ page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, Number(page) || 1)
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20))

  const filter = { riderVerificationStatus: 'pending' }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ riderAppliedAt: -1, createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    User.countDocuments(filter),
  ])

  return { items: items.map(sanitizeUser), page: safePage, limit: safeLimit, total }
}

export async function dashboardCounts() {
  const [
    totalUsers,
    students,
    riders,
    technicians,
    admins,
    blockedUsers,
    verifiedUsers,
    pendingRiderApprovals,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'rider' }),
    User.countDocuments({ role: 'technician' }),
    User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
    User.countDocuments({ isBlocked: true }),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ riderVerificationStatus: 'pending' }),
  ])

  return {
    totalUsers,
    students,
    riders,
    technicians,
    admins,
    blockedUsers,
    verifiedUsers,
    pendingRiderApprovals,
  }
}

export function sanitizeUser(userDoc) {
  const u = userDoc?.toObject ? userDoc.toObject() : userDoc
  if (!u) return null
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, __v, ...safe } = u
  safe.id = safe._id?.toString?.() ?? safe._id
  delete safe._id
  return safe
}


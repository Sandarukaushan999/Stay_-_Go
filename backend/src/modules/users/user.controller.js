import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { ApiError } from '../../common/utils/ApiError.js'
import { hashPassword, verifyPassword } from '../../common/utils/password.js'
import { User } from './user.model.js'
import fs from 'fs'
import { StudentProfile } from '../../roommate/models/StudentProfile.js'
import { RoommateNotification } from '../../roommate/models/RoommateNotification.js'
import { IssueReport } from '../../roommate/models/IssueReport.js'
import { Trip } from '../ride_sharing/models/Trip.js'
import { AdminActionLog } from '../admin/models/AdminActionLog.js'
import { ISSUE_STATUS } from '../../roommate/constants/enums.js'

const ACTIVE_TRIP_STATUSES = ['to_pickup', 'to_university', 'overdue', 'in_progress']

export const getMyDashboardStats = asyncHandler(async (req, res) => {
  const user = req.user
  const stats = {}

  if (user.role === 'student' || user.role === 'rider') {
    const profile = await StudentProfile.findOne({ userId: user.id }).select('_id').lean()
    stats.unreadNotifications = profile
      ? await RoommateNotification.countDocuments({ studentId: profile._id, isRead: false })
      : 0

    stats.activeRidesJoined = await Trip.countDocuments({
      passengerId: user.id,
      status: { $in: ACTIVE_TRIP_STATUSES },
    })
  }

  if (user.role === 'rider') {
    stats.activeRidesOffered = await Trip.countDocuments({
      riderId: user.id,
      status: { $in: ACTIVE_TRIP_STATUSES },
    })
  }

  if (user.role === 'technician') {
    const [openIssues, resolvedIssues] = await Promise.all([
      IssueReport.countDocuments({ status: { $in: [ISSUE_STATUS.SUBMITTED, ISSUE_STATUS.IN_PROGRESS] } }),
      IssueReport.countDocuments({ status: ISSUE_STATUS.RESOLVED }),
    ])
    stats.openIssues = openIssues
    stats.resolvedIssues = resolvedIssues
  }

  res.json({ success: true, stats })
})

export const getMyAccountProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-__v').lean()
  if (!user) throw new ApiError(404, 'User not found')

  user.hasPassword = user.passwordHash !== 'GOOGLE_OAUTH_NO_PASSWORD'
  delete user.passwordHash

  user.id = user._id.toString()
  delete user._id
  res.json({ success: true, user })
})

export const updateMyAccountProfile = asyncHandler(async (req, res) => {
  const updates = { ...req.body }

  delete updates.passwordHash
  delete updates.role
  delete updates.email
  delete updates.isVerified
  delete updates.isBlocked
  delete updates.riderVerificationStatus
  delete updates.rating
  delete updates.complaintCount
  delete updates.is2FAEnabled
  delete updates.otp
  delete updates.otpExpires

  if (updates.systemSettings) {
    const systemSettings = updates.systemSettings
    delete updates.systemSettings
    for (const [key, value] of Object.entries(systemSettings)) {
      updates[`systemSettings.${key}`] = value
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true })
    .select('-passwordHash -__v')
    .lean()

  if (!user) throw new ApiError(404, 'User not found')

  user.id = user._id.toString()
  delete user._id
  res.json({ success: true, message: 'Profile updated successfully', user })
})

export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided')
  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError(404, 'User not found')

  if (user.profileImage && !user.profileImage.startsWith('http')) {
    try {
      if (fs.existsSync(user.profileImage)) fs.unlinkSync(user.profileImage)
    } catch { /* ignore error */ }
  }

  const imagePath = req.file.path.replace(/\\/g, '/')
  user.profileImage = imagePath
  await user.save()

  // Return fresh sanitized object to update frontend immediately
  const freshUser = await User.findById(req.user.id).select('-passwordHash -__v').lean()
  freshUser.id = freshUser._id.toString()
  delete freshUser._id
  res.json({ success: true, message: 'Profile picture updated', user: freshUser })
})

export const deleteProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError(404, 'User not found')
  if (!user.profileImage) throw new ApiError(400, 'No profile picture to remove')

  if (!user.profileImage.startsWith('http')) {
    try {
      if (fs.existsSync(user.profileImage)) fs.unlinkSync(user.profileImage)
    } catch { /* ignore error */ }
  }

  // Restore Google ID image if present, else null
  // We can default back to googleId picture if we check Google or we can just null it out.
  user.profileImage = null
  await user.save()

  const freshUser = await User.findById(req.user.id).select('-passwordHash -__v').lean()
  freshUser.id = freshUser._id.toString()
  delete freshUser._id

  res.json({ success: true, message: 'Profile picture removed', user: freshUser })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!newPassword) throw new ApiError(400, 'New password is required')

  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError(404, 'User not found')

  if (user.passwordHash !== 'GOOGLE_OAUTH_NO_PASSWORD') {
    if (!currentPassword) throw new ApiError(400, 'Current password is required')
    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) throw new ApiError(401, 'Incorrect current password')
  }

  user.passwordHash = await hashPassword(newPassword)
  await user.save()

  if (user.role === 'admin' || user.role === 'super_admin') {
    await AdminActionLog.create({
      adminId: user._id,
      actionType: 'PASSWORD_CHANGE',
      description: 'Admin changed account password',
    })
  }

  res.json({ success: true, message: 'Password successfully updated' })
})

export const getAdminLogs = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    throw new ApiError(403, 'Forbidden')
  }

  const logs = await AdminActionLog.find({ adminId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  res.json({ success: true, logs })
})


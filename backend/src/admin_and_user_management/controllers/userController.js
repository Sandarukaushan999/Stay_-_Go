import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { User } from '../models/User.js'
import { RoommateNotification } from '../../roommate/models/RoommateNotification.js'
import { IssueReport } from '../../roommate/models/IssueReport.js'
import { Trip } from '../../modules/ride_sharing/models/Trip.js'

export const getMyDashboardStats = asyncHandler(async (req, res) => {
  const user = req.user
  const stats = {}

  if (user.role === 'student' || user.role === 'rider') {
    // Both roles can use roommate matching, check notifications
    const unreadNotifications = await RoommateNotification.countDocuments({ 
      studentId: user.id, // Assuming studentId map or via StudentProfile
      isRead: false 
    })
    stats.unreadNotifications = unreadNotifications
    
    // Check rides joined
    const activeRidesJoined = await Trip.countDocuments({
      'passengers.userId': user.id,
      status: { $in: ['SCHEDULED', 'ACTIVE'] }
    })
    stats.activeRidesJoined = activeRidesJoined
  }

  if (user.role === 'rider') {
    const activeRidesOffered = await Trip.countDocuments({
      driver: user.id,
      status: { $in: ['SCHEDULED', 'ACTIVE'] }
    })
    stats.activeRidesOffered = activeRidesOffered
  }

  if (user.role === 'technician') {
    // Technician wants to see all issues that are not resolved, or assigned to them in the future
    const openIssues = await IssueReport.countDocuments({
      status: { $in: ['SUBMITTED', 'IN_PROGRESS'] }
    })
    const resolvedIssues = await IssueReport.countDocuments({
      status: 'RESOLVED'
    })
    stats.openIssues = openIssues
    stats.resolvedIssues = resolvedIssues
  }

  res.json({ success: true, stats })
})

export const getMyAccountProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash -__v').lean()
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }
  
  // Transform _id to id
  user.id = user._id.toString()
  delete user._id

  res.json({ success: true, user })
})

export const updateMyAccountProfile = asyncHandler(async (req, res) => {
  const updates = { ...req.body }
  
  // Prevent sensitive fields from being updated directly via this endpoint
  delete updates.passwordHash
  delete updates.role
  delete updates.email
  delete updates.isVerified
  delete updates.isBlocked
  delete updates.riderVerificationStatus
  delete updates.rating
  if (updates.systemSettings) {
    const sysOpts = updates.systemSettings
    delete updates.systemSettings
    for (const key in sysOpts) {
      if (Object.prototype.hasOwnProperty.call(sysOpts, key)) {
        updates[`systemSettings.${key}`] = sysOpts[key]
      }
    }
  }
  
  if (updates.ridePreferences) {
    const ridePrefs = updates.ridePreferences
    delete updates.ridePreferences
    for (const key in ridePrefs) {
      if (Object.prototype.hasOwnProperty.call(ridePrefs, key)) {
        updates[`ridePreferences.${key}`] = ridePrefs[key]
      }
    }
  }

  if (updates.privacySettings) {
    const privSet = updates.privacySettings
    delete updates.privacySettings
    for (const key in privSet) {
      if (Object.prototype.hasOwnProperty.call(privSet, key)) {
        updates[`privacySettings.${key}`] = privSet[key]
      }
    }
  }

  if (updates.sessionManagement) {
    const sessSet = updates.sessionManagement
    delete updates.sessionManagement
    for (const key in sessSet) {
      if (Object.prototype.hasOwnProperty.call(sessSet, key)) {
        updates[`sessionManagement.${key}`] = sessSet[key]
      }
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-passwordHash -__v').lean()

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  // Transform _id to id
  user.id = user._id.toString()
  delete user._id

  res.json({ success: true, message: 'Profile updated successfully', user })
})

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image provided.' })
  }

  const avatarUrl = `/uploads/profiles/${req.file.filename}`

  const user = await User.findById(req.user.id)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  user.profileImage = avatarUrl
  await user.save()

  // Track action slightly if admin, though typically for standard users it's ignored
  const safeUser = user.toObject()
  delete safeUser.passwordHash
  delete safeUser.__v
  safeUser.id = safeUser._id.toString()
  delete safeUser._id

  res.json({ success: true, message: 'Avatar updated successfully', profileImage: avatarUrl, user: safeUser })
})

import { hashPassword, verifyPassword } from '../../common/utils/password.js'

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both current and new passwords are required' })
  }

  const user = await User.findById(req.user.id)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  const isMatch = await verifyPassword(currentPassword, user.passwordHash)
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Incorrect current password' })
  }

  user.passwordHash = await hashPassword(newPassword)
  await user.save()

  // Track action
  const { AdminActionLog } = await import('../models/AdminActionLog.js')
  if (user.role === 'admin' || user.role === 'super_admin') {
    await AdminActionLog.create({
      adminId: user._id,
      actionType: 'PASSWORD_CHANGE',
      description: 'Admin securely changed their account password'
    })
  }

  res.json({ success: true, message: 'Password successfully updated' })
})

export const getAdminLogs = asyncHandler(async (req, res) => {
  const { AdminActionLog } = await import('../models/AdminActionLog.js')
  const logs = await AdminActionLog.find({ adminId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()
  
  res.json({ success: true, logs })
})

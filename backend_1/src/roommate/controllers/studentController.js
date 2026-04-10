import { StudentProfile } from '../models/StudentProfile.js'
import { ApiError } from '../../common/utils/ApiError.js'

function isProfileComplete(data) {
  const ObjectOrUndefined = (val) => val !== undefined && val !== null && val !== ''
  
  const required = [
    'firstName', 'lastName', 'email', 'gender', 'age', 
    'sleepSchedule', 'cleanliness', 'socialHabits', 'studyHabits'
  ]
  return required.every((f) => ObjectOrUndefined(data[f]))
}

// POST /api/roommate/profile - creates or updates (upsert)
export const createProfile = async (req, res, next) => {
  try {
    const userId = req.user.id

    const profileData = {
      userId,
      ...req.body,
    }
    
    // Automatically use name/email from auth user if not provided
    if (!profileData.firstName) profileData.firstName = req.user.fullName?.split(' ')[0] || ''
    if (!profileData.lastName) profileData.lastName = req.user.fullName?.split(' ').slice(1).join(' ') || ''
    if (!profileData.email) profileData.email = req.user.email || ''

    profileData.profileCompleted = isProfileComplete(profileData)

    // Upsert: create if not exists, update if exists
    const profile = await StudentProfile.findOneAndUpdate(
      { userId },
      { $set: profileData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.status(200).json({ success: true, message: 'Profile saved successfully', data: profile })
  } catch (err) {
    next(err)
  }
}

// GET /api/roommate/profile/me
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) return res.json({ success: true, message: 'Profile not found, please create one.', data: null })
    
    res.json({ success: true, message: 'Profile retrieved', data: profile })
  } catch (err) {
    next(err)
  }
}

// PUT /api/roommate/profile/me
export const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) throw new ApiError(404, 'Profile not found')

    if (profile.finalLockCompleted) {
      throw new ApiError(403, 'Profile cannot be edited after roommate lock')
    }

    Object.assign(profile, req.body)
    profile.profileCompleted = isProfileComplete(profile.toObject())
    await profile.save()

    res.json({ success: true, message: 'Profile updated successfully', data: profile })
  } catch (err) {
    next(err)
  }
}

// GET /api/roommate/profile/:id — public-safe summary
export const getStudentById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findById(req.params.id)
      .select('-whatsApp -__v')
      .populate('userId', 'fullName hasVehicle')

    if (!profile) throw new ApiError(404, 'Student not found')
    res.json({ success: true, message: 'Student retrieved', data: profile })
  } catch (err) {
    next(err)
  }
}

import { RoomPreference } from '../models/RoomPreference.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { ApiError } from '../../common/utils/ApiError.js'

function isRoomPrefComplete(data) {
  const ObjectOrUndefined = (val) => val !== undefined && val !== null && val !== ''
  const required = ['block', 'floor', 'acType', 'roomPosition', 'capacity']
  return required.every((f) => ObjectOrUndefined(data[f]))
}

// POST /api/roommate/preferences
export const createOrUpdatePreference = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) throw new ApiError(404, 'You must create a roommate profile first.')
    if (!profile.profileCompleted) throw new ApiError(400, 'Complete your profile first.')
    if (profile.finalLockCompleted) throw new ApiError(403, 'Preferences locked after matching.')

    let pref = await RoomPreference.findOne({ studentId: profile._id })
    if (!pref) {
      pref = new RoomPreference({ studentId: profile._id })
    }

    Object.assign(pref, req.body)
    await pref.save()

    if (isRoomPrefComplete(pref.toObject())) {
      await StudentProfile.updateOne(
        { _id: profile._id },
        { $set: { roomPreferenceCompleted: true } }
      )
    }

    res.status(200).json({ success: true, message: 'Preference saved', data: pref })
  } catch (err) {
    next(err)
  }
}

// GET /api/roommate/preferences/me
export const getMyPreference = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) return res.json({ success: true, data: null })

    const pref = await RoomPreference.findOne({ studentId: profile._id })
    res.json({ success: true, message: 'Preference retrieved', data: pref })
  } catch (err) {
    next(err)
  }
}

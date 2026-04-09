import { asyncHandler } from '../../../common/utils/asyncHandler.js'
import { User } from '../../users/user.model.js'
import { ApiError } from '../../../common/utils/ApiError.js'

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean()
  if (!user) throw new ApiError(404, 'User not found')
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, __v, ...safe } = user
  safe.id = safe._id.toString()
  delete safe._id
  res.json({ success: true, data: safe })
})

export const updateAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { availability },
    { new: true }
  ).lean()
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, __v, ...safe } = user
  safe.id = safe._id.toString()
  delete safe._id
  res.json({ success: true, data: safe })
})

export const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { currentLocation: { lat, lng } },
    { new: true }
  ).lean()
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, __v, ...safe } = user
  safe.id = safe._id.toString()
  delete safe._id
  res.json({ success: true, data: safe })
})

export const applyForRider = asyncHandler(async (req, res) => {
  // student applies -> pending verification; rider role only after admin approval
  const update = {
    riderVerificationStatus: 'pending',
    riderAppliedAt: new Date(),
    vehicleNumber: req.body.vehicleNumber ?? null,
    vehicleType: req.body.vehicleType ?? null,
    seatCount: req.body.seatCount ?? 0,
  }

  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).lean()
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, __v, ...safe } = user
  safe.id = safe._id.toString()
  delete safe._id
  res.json({ success: true, data: safe })
})


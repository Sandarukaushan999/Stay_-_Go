import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { RideRequest } from '../../modules/ride_sharing/models/RideRequest.js'
import { User } from '../models/User.js'

export const rideRequests = asyncHandler(async (req, res) => {
  const { status } = req.query
  const filter = {}
  if (status) filter.status = status
  const items = await RideRequest.find(filter).sort({ requestedAt: -1 }).limit(200).lean()
  res.json({ success: true, items })
})

export const activeRiders = asyncHandler(async (req, res) => {
  const { campusId } = req.query
  const filter = { role: 'rider', availability: 'online', isBlocked: false }
  if (campusId) filter.campusId = campusId
  const items = await User.find(filter).sort({ updatedAt: -1 }).limit(200).lean()
  const data = items.map((u) => ({
    id: u._id.toString(),
    fullName: u.fullName,
    campusId: u.campusId,
    currentLocation: u.currentLocation ?? null,
    vehicleType: u.vehicleType,
    vehicleNumber: u.vehicleNumber,
    seatCount: u.seatCount,
    rating: u.rating,
    complaintCount: u.complaintCount,
  }))
  res.json({ success: true, items: data })
})


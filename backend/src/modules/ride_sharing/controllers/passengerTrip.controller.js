import { asyncHandler } from '../../../common/utils/asyncHandler.js'
import { Trip } from '../models/Trip.js'

export const myActiveTrip = asyncHandler(async (req, res) => {
  const passengerId = req.user.id
  const trip = await Trip.findOne({
    passengerId,
    status: { $in: ['to_pickup', 'to_university', 'overdue'] },
  })
    .sort({ startedAt: -1 })
    .populate('riderId', 'fullName phone vehicleType vehicleNumber')
    .lean()

  res.json({ success: true, data: trip ?? null })
})


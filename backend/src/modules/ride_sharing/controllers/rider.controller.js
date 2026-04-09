import { asyncHandler } from '../../../common/utils/asyncHandler.js'
import * as inboxService from '../services/riderInbox.service.js'
import { Trip } from '../models/Trip.js'
import { User } from '../../users/user.model.js'

export const openRequests = asyncHandler(async (req, res) => {
  const rider = await User.findById(req.user.id).lean()
  const capacityPassengers = Math.max(0, Number(rider?.seatCount ?? 0) - 1)
  const activeTrips = await Trip.find({
    riderId: req.user.id,
    status: { $in: ['to_pickup', 'to_university', 'overdue'] },
  }).lean()
  const used = activeTrips.reduce((sum, t) => sum + Number(t.seatCount ?? 1), 0)
  const remainingSeats = Math.max(0, capacityPassengers - used)

  const items = await inboxService.listOpenRequests({ campusId: req.user.campusId ?? req.query?.campusId })
  const withAccept = items.map((r) => ({
    ...r,
    canAccept: Number(r.seatCount ?? 1) <= remainingSeats,
    remainingSeats,
  }))
  res.json({ success: true, data: withAccept })
})


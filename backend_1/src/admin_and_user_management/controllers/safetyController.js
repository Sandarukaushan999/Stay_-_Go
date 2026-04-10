import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { Trip } from '../../modules/ride_sharing/models/Trip.js'

export const safetyAlerts = asyncHandler(async (req, res) => {
  const items = await Trip.find({
    status: { $in: ['overdue', 'to_pickup', 'to_university'] },
    $or: [{ suspiciousStopFlag: true }, { noUpdateFlag: true }, { status: 'overdue' }],
  })
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean()

  res.json({ success: true, items })
})


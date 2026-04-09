import { RideRequest } from '../models/RideRequest.js'

export async function listOpenRequests({ campusId } = {}) {
  const filter = { status: 'requested' }
  if (campusId) filter.campusId = campusId
  const items = await RideRequest.find(filter)
    .populate('passengerId', 'fullName phone studentId emergencyContact campusId')
    .sort({ requestedAt: -1 })
    .limit(200)
    .lean()
  return items
}


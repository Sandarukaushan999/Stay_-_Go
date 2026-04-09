import { RideRequest } from '../models/RideRequest.js'

export async function listOpenRequests({ campusId } = {}) {
  const filter = { status: 'requested' }
  if (campusId) filter.campusId = campusId
  const items = await RideRequest.find(filter).sort({ requestedAt: -1 }).limit(200).lean()
  return items
}


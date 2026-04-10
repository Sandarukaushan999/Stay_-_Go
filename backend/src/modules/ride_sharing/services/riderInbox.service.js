import { RideRequest } from '../models/RideRequest.js'

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function listOpenRequests({ campusId } = {}) {
  const filter = { status: 'requested' }
  const c = campusId != null ? String(campusId).trim() : ''
  if (c) {
    // Match campus slugs case-insensitively (e.g. UOC-main vs uoc-main).
    filter.campusId = { $regex: new RegExp(`^${escapeRegex(c)}$`, 'i') }
  }
  const items = await RideRequest.find(filter)
    .populate('passengerId', 'fullName phone studentId emergencyContact campusId')
    .sort({ requestedAt: -1 })
    .limit(200)
    .lean()
  return items
}


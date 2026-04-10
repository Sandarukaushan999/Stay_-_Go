import { ApiError } from '../../../common/utils/ApiError.js'
import { SOSAlert } from '../models/SOSAlert.js'
import { Trip } from '../models/Trip.js'

export async function createSos({ tripId, createdBy, message, severity, location }) {
  const trip = await Trip.findById(tripId).lean()
  if (!trip) throw new ApiError(404, 'Trip not found')

  const sos = await SOSAlert.create({
    tripId: trip._id,
    riderId: trip.riderId,
    passengerId: trip.passengerId,
    createdBy,
    message: message ?? '',
    severity: severity ?? 'high',
    location: location ?? trip.currentLocation ?? null,
    status: 'pending',
  })

  return sos.toObject()
}

export async function listSos({ status } = {}) {
  const filter = {}
  if (status) filter.status = status
  const items = await SOSAlert.find(filter).sort({ createdAt: -1 }).limit(200).lean()
  return items
}

export async function acknowledgeSos(id) {
  const sos = await SOSAlert.findByIdAndUpdate(
    id,
    { status: 'acknowledged', acknowledgedAt: new Date() },
    { new: true }
  ).lean()
  if (!sos) throw new ApiError(404, 'SOS not found')
  return sos
}

export async function resolveSos(id) {
  const sos = await SOSAlert.findByIdAndUpdate(
    id,
    { status: 'resolved', resolvedAt: new Date() },
    { new: true }
  ).lean()
  if (!sos) throw new ApiError(404, 'SOS not found')
  return sos
}


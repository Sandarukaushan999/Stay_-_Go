import { ApiError } from '../../../common/utils/ApiError.js'
import { Trip } from '../models/Trip.js'
import mongoose from 'mongoose'

const ACTIVE_TRIP_STATUSES = ['to_pickup', 'to_university', 'overdue', 'in_progress']

export async function createDemoTrip({ riderId, passengerId, origin, destination, expectedDurationSeconds }) {
  if (!mongoose.isValidObjectId(riderId) || !mongoose.isValidObjectId(passengerId)) {
    throw new ApiError(400, 'Invalid riderId/passengerId')
  }

  const bufferMinutes = 10
  const now = new Date()
  const bufferedDeadlineAt = expectedDurationSeconds
    ? new Date(now.getTime() + (expectedDurationSeconds + bufferMinutes * 60) * 1000)
    : new Date(now.getTime() + bufferMinutes * 60 * 1000)

  const trip = await Trip.create({
    riderId,
    passengerId,
    origin,
    destination,
    expectedDurationSeconds: expectedDurationSeconds ?? null,
    bufferMinutes,
    bufferedDeadlineAt,
    currentLocation: origin,
    lastMovementAt: now,
    status: 'to_pickup',
    startedAt: now,
  })

  return trip.toObject()
}

export async function updateLocation({ tripId, lat, lng }) {
  const now = new Date()
  const trip = await Trip.findByIdAndUpdate(
    tripId,
    { currentLocation: { lat, lng }, lastMovementAt: now },
    { new: true }
  ).lean()
  if (!trip) throw new ApiError(404, 'Trip not found')
  return trip
}

export async function listActiveTrips() {
  const items = await Trip.find({ status: { $in: ACTIVE_TRIP_STATUSES } })
    .populate('riderId', 'fullName phone vehicleType vehicleNumber')
    .populate('passengerId', 'fullName phone studentId')
    .sort({ startedAt: -1 })
    .limit(200)
    .lean()
  return items
}

export async function listOverdueTrips() {
  const now = new Date()
  const items = await Trip.find({
    status: { $in: ['to_pickup', 'to_university', 'in_progress'] },
    bufferedDeadlineAt: { $lt: now },
  })
    .sort({ bufferedDeadlineAt: 1 })
    .limit(200)
    .lean()
  return items
}

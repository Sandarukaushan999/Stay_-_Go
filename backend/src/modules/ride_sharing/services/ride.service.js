import { ApiError } from '../../../common/utils/ApiError.js'
import { RideRequest } from '../models/RideRequest.js'
import { Trip } from '../models/Trip.js'
import { User } from '../../users/user.model.js'
import { env } from '../../../config/env.js'

export async function requestRide({ passengerId, campusId, origin, destination, seatCount, femaleOnly }) {
  const rr = await RideRequest.create({
    passengerId,
    campusId: campusId ?? null,
    origin,
    destination,
    seatCount: seatCount ?? 1,
    femaleOnly: Boolean(femaleOnly),
    status: 'requested',
    requestedAt: new Date(),
  })
  return rr.toObject()
}

export async function myRequests(passengerId) {
  const items = await RideRequest.find({ passengerId }).sort({ requestedAt: -1 }).limit(50).lean()
  return items
}

async function osrmEtaSeconds({ from, to }) {
  const url = `${env.OSRM_BASE_URL}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`
  const r = await fetch(url, { headers: { 'user-agent': 'stay-go-dev' } })
  if (!r.ok) return null
  const data = await r.json()
  const dur = data?.routes?.[0]?.duration
  return typeof dur === 'number' ? dur : null
}

export async function nearbyRiders({ campusId, pickup }) {
  const filter = {
    role: 'rider',
    isBlocked: false,
    isVerified: true,
    availability: 'online',
  }
  if (campusId) filter.campusId = campusId

  const riders = await User.find(filter).limit(50).lean()

  // Compute ETA to pickup for top N riders that have a location.
  const withLoc = riders.filter((r) => r.currentLocation?.lat && r.currentLocation?.lng)
  const top = withLoc.slice(0, 10)

  const enriched = await Promise.all(
    top.map(async (r) => {
      const etaSeconds = pickup ? await osrmEtaSeconds({ from: r.currentLocation, to: pickup }) : null
      return {
        id: r._id.toString(),
        fullName: r.fullName,
        rating: r.rating,
        complaintCount: r.complaintCount,
        availability: r.availability,
        vehicleType: r.vehicleType,
        vehicleNumber: r.vehicleNumber,
        seatCount: r.seatCount,
        etaSeconds,
      }
    })
  )

  enriched.sort((a, b) => {
    if (a.etaSeconds == null && b.etaSeconds == null) return (b.rating ?? 0) - (a.rating ?? 0)
    if (a.etaSeconds == null) return 1
    if (b.etaSeconds == null) return -1
    return a.etaSeconds - b.etaSeconds
  })

  return enriched
}

export async function acceptRide({ rideRequestId, riderId }) {
  const rr = await RideRequest.findById(rideRequestId)
  if (!rr) throw new ApiError(404, 'Ride request not found')
  if (rr.status !== 'requested') throw new ApiError(409, 'Ride request not available')

  rr.status = 'accepted'
  rr.riderId = riderId
  rr.acceptedAt = new Date()
  await rr.save()

  // Create a trip immediately to support monitoring.
  const now = new Date()
  const trip = await Trip.create({
    rideRequestId: rr._id,
    riderId,
    passengerId: rr.passengerId,
    origin: rr.origin,
    destination: rr.destination,
    expectedDurationSeconds: null,
    bufferMinutes: 10,
    bufferedDeadlineAt: new Date(now.getTime() + 20 * 60 * 1000),
    currentLocation: rr.origin,
    lastMovementAt: now,
    status: 'to_pickup',
    startedAt: now,
  })

  return { rideRequest: rr.toObject(), trip: trip.toObject() }
}

export async function cancelRide({ rideRequestId, userId }) {
  const rr = await RideRequest.findById(rideRequestId)
  if (!rr) throw new ApiError(404, 'Ride request not found')
  const isOwner = rr.passengerId.toString() === userId || rr.riderId?.toString?.() === userId
  if (!isOwner) throw new ApiError(403, 'Forbidden')

  rr.status = 'cancelled'
  rr.cancelledAt = new Date()
  await rr.save()

  await Trip.updateMany({ rideRequestId: rr._id, status: 'in_progress' }, { status: 'cancelled' })

  return rr.toObject()
}

export async function completeRide({ rideRequestId, riderId }) {
  const rr = await RideRequest.findById(rideRequestId)
  if (!rr) throw new ApiError(404, 'Ride request not found')
  if (rr.riderId?.toString?.() !== riderId) throw new ApiError(403, 'Forbidden')

  rr.status = 'completed'
  rr.completedAt = new Date()
  await rr.save()

  await Trip.updateMany(
    { rideRequestId: rr._id, status: 'in_progress' },
    { status: 'completed', completedAt: new Date() }
  )

  return rr.toObject()
}


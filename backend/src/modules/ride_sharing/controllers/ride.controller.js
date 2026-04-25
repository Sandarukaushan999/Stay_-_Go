import { asyncHandler } from '../../../common/utils/asyncHandler.js'
import * as rideService from '../services/ride.service.js'
import { getIo } from '../../../config/socket.js'

export const requestRide = asyncHandler(async (req, res) => {
  if (!req.user.campusId) {
    return res.status(400).json({ success: false, message: 'campusId missing on your profile' })
  }
  const rr = await rideService.requestRide({
    passengerId: req.user.id,
    campusId: req.user.campusId,
    origin: req.body.origin,
    destination: req.body.destination,
    seatCount: req.body.seatCount,
    femaleOnly: req.body.femaleOnly,
  })
  getIo().to('admin').emit('ride:request', { rideRequest: rr })
  getIo().emit('ride:new_request', { rideRequest: rr })
  res.status(201).json({ success: true, data: rr })
})

export const nearbyRiders = asyncHandler(async (req, res) => {
  const pickup = req.query?.lat && req.query?.lng ? { lat: Number(req.query.lat), lng: Number(req.query.lng) } : null
  const campusId = req.user.campusId ?? req.query?.campusId
  const items = await rideService.nearbyRiders({ campusId, pickup })
  res.json({ success: true, data: items })
})

export const myRequests = asyncHandler(async (req, res) => {
  const items = await rideService.myRequests(req.user.id)
  res.json({ success: true, data: items })
})

export const acceptRide = asyncHandler(async (req, res) => {
  const result = await rideService.acceptRide({ rideRequestId: req.params.id, riderId: req.user.id })
  getIo().to('admin').emit('trip:status', { tripId: result.trip._id.toString(), status: result.trip.status, trip: result.trip })
  res.json({ success: true, data: result })
})

export const startRide = asyncHandler(async (req, res) => {
  // In this simplified flow, accept already creates an in_progress trip.
  // "start" is kept for API compatibility with your frontend component.
  const result = await rideService.acceptRide({ rideRequestId: req.params.id, riderId: req.user.id })
  getIo().to('admin').emit('trip:status', { tripId: result.trip._id.toString(), status: result.trip.status, trip: result.trip })
  res.json({ success: true, data: result })
})

export const cancelRide = asyncHandler(async (req, res) => {
  const rr = await rideService.cancelRide({ rideRequestId: req.params.id, userId: req.user.id })
  res.json({ success: true, data: rr })
})

export const completeRide = asyncHandler(async (req, res) => {
  const rr = await rideService.completeRide({ rideRequestId: req.params.id, riderId: req.user.id })
  res.json({ success: true, data: rr })
})

export const submitFeedback = asyncHandler(async (req, res) => {
  const rr = await rideService.submitRideFeedback({
    rideRequestId: req.params.id,
    passengerId: req.user.id,
    rating: req.body.rating,
    complaint: req.body.complaint,
    complaintText: req.body.complaintText,
  })
  res.json({ success: true, data: rr })
})

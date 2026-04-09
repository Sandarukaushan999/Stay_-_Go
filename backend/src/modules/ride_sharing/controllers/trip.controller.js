import { asyncHandler } from '../../../common/utils/asyncHandler.js'
import * as tripService from '../services/trip.service.js'
import * as sosService from '../services/sos.service.js'
import { getIo } from '../../../config/socket.js'

export const demoStartTrip = asyncHandler(async (req, res) => {
  const { passengerId, origin, destination, expectedDurationSeconds } = req.body
  const riderId = req.user.id

  const trip = await tripService.createDemoTrip({
    riderId,
    passengerId,
    origin,
    destination,
    expectedDurationSeconds,
  })

  getIo().to('admin').emit('trip:status', { tripId: trip._id?.toString?.() ?? trip.id, status: trip.status, trip })
  res.status(201).json({ success: true, trip })
})

export const locationUpdate = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body
  const trip = await tripService.updateLocation({ tripId: req.params.id, lat, lng })

  getIo().to(`trip:${trip._id.toString()}`).emit('trip:location', { tripId: trip._id.toString(), location: trip.currentLocation })
  getIo().to('admin').emit('trip:location', { tripId: trip._id.toString(), location: trip.currentLocation })

  res.json({ success: true, trip })
})

export const sos = asyncHandler(async (req, res) => {
  const sos = await sosService.createSos({
    tripId: req.params.id,
    createdBy: req.user.id,
    message: req.body?.message,
    severity: req.body?.severity,
    location: req.body?.location,
  })

  getIo().to('admin').emit('ride:sos', { sos })
  res.status(201).json({ success: true, sos })
})


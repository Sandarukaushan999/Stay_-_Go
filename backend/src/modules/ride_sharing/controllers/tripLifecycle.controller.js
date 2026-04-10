import { asyncHandler } from '../../../common/utils/asyncHandler.js'
import { Trip } from '../models/Trip.js'
import { RideRequest } from '../models/RideRequest.js'
import { ApiError } from '../../../common/utils/ApiError.js'
import { getIo } from '../../../config/socket.js'

export const confirmPickup = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
  if (!trip) throw new ApiError(404, 'Trip not found')
  if (trip.riderId.toString() !== req.user.id) throw new ApiError(403, 'Forbidden')

  trip.status = 'to_university'
  trip.pickedUpAt = new Date()
  await trip.save()

  getIo().to('admin').emit('trip:status', { tripId: trip._id.toString(), status: trip.status, trip: trip.toObject() })
  getIo().to(`trip:${trip._id.toString()}`).emit('trip:status', {
    tripId: trip._id.toString(),
    status: trip.status,
    trip: trip.toObject(),
  })
  res.json({ success: true, trip: trip.toObject() })
})

export const finishTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
  if (!trip) throw new ApiError(404, 'Trip not found')
  const uid = req.user.id
  const allowed = trip.passengerId.toString() === uid || trip.riderId.toString() === uid
  if (!allowed) throw new ApiError(403, 'Forbidden')

  trip.status = 'completed'
  trip.completedAt = new Date()
  await trip.save()

  if (trip.rideRequestId) {
    await RideRequest.updateOne(
      { _id: trip.rideRequestId },
      {
        $set: {
          status: 'completed',
          completedAt: trip.completedAt,
        },
      }
    )
  }

  getIo().to('admin').emit('trip:status', { tripId: trip._id.toString(), status: trip.status, trip: trip.toObject() })
  getIo().to(`trip:${trip._id.toString()}`).emit('trip:status', {
    tripId: trip._id.toString(),
    status: trip.status,
    trip: trip.toObject(),
  })
  res.json({ success: true, trip: trip.toObject() })
})


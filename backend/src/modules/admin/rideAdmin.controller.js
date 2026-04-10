import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { RideRequest } from '../ride_sharing/models/RideRequest.js'
import { Trip } from '../ride_sharing/models/Trip.js'
import { SOSAlert } from '../ride_sharing/models/SOSAlert.js'
import { ApiError } from '../../common/utils/ApiError.js'
import { User } from '../users/user.model.js'

const ACTIVE_TRIP_STATUSES = ['to_pickup', 'to_university', 'overdue', 'in_progress']

function rowsToCountMap(rows, defaults) {
  const out = { ...defaults }
  for (const row of rows) {
    const key = row?._id
    if (key && Object.prototype.hasOwnProperty.call(out, key)) {
      out[key] = row.count
    }
  }
  return out
}

function buildUtcDayKeys(days) {
  const now = new Date()
  const startUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1))
  return Array.from({ length: days }, (_, idx) => {
    const d = new Date(startUtc + idx * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
  })
}

function rowsToDateMap(rows) {
  const map = {}
  for (const row of rows) {
    if (row?._id) map[row._id] = row.count
  }
  return map
}

function toShortDayLabel(dayKey) {
  const d = new Date(`${dayKey}T00:00:00Z`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function mapSosAlert(alert) {
  const id = alert?._id?.toString?.() ?? null
  const trip = alert?.tripId
  const rider = alert?.riderId
  const passenger = alert?.passengerId
  const createdBy = alert?.createdBy
  return {
    id,
    createdAt: alert?.createdAt ?? null,
    status: alert?.status ?? null,
    severity: alert?.severity ?? null,
    message: alert?.message ?? '',
    location: alert?.location ?? null,
    trip: trip
      ? {
          id: trip._id?.toString?.() ?? null,
          status: trip.status ?? null,
          startedAt: trip.startedAt ?? null,
          bufferedDeadlineAt: trip.bufferedDeadlineAt ?? null,
          currentLocation: trip.currentLocation ?? null,
        }
      : null,
    rider: rider
      ? {
          id: rider._id?.toString?.() ?? null,
          fullName: rider.fullName ?? null,
          email: rider.email ?? null,
          phone: rider.phone ?? null,
          campusId: rider.campusId ?? null,
          vehicleType: rider.vehicleType ?? null,
          vehicleNumber: rider.vehicleNumber ?? null,
        }
      : null,
    passenger: passenger
      ? {
          id: passenger._id?.toString?.() ?? null,
          fullName: passenger.fullName ?? null,
          email: passenger.email ?? null,
          phone: passenger.phone ?? null,
          campusId: passenger.campusId ?? null,
          studentId: passenger.studentId ?? null,
        }
      : null,
    createdBy: createdBy
      ? {
          id: createdBy._id?.toString?.() ?? null,
          fullName: createdBy.fullName ?? null,
          role: createdBy.role ?? null,
        }
      : null,
  }
}

function mapSafetyTrip(trip) {
  return {
    id: trip?._id?.toString?.() ?? null,
    status: trip?.status ?? null,
    startedAt: trip?.startedAt ?? null,
    bufferedDeadlineAt: trip?.bufferedDeadlineAt ?? null,
    lastMovementAt: trip?.lastMovementAt ?? null,
    suspiciousStopFlag: Boolean(trip?.suspiciousStopFlag),
    noUpdateFlag: Boolean(trip?.noUpdateFlag),
    autoSosTriggered: Boolean(trip?.autoSosTriggered),
    currentLocation: trip?.currentLocation ?? null,
    rider: trip?.riderId
      ? {
          id: trip.riderId._id?.toString?.() ?? null,
          fullName: trip.riderId.fullName ?? null,
          phone: trip.riderId.phone ?? null,
          vehicleType: trip.riderId.vehicleType ?? null,
          vehicleNumber: trip.riderId.vehicleNumber ?? null,
        }
      : null,
    passenger: trip?.passengerId
      ? {
          id: trip.passengerId._id?.toString?.() ?? null,
          fullName: trip.passengerId.fullName ?? null,
          phone: trip.passengerId.phone ?? null,
          studentId: trip.passengerId.studentId ?? null,
          campusId: trip.passengerId.campusId ?? null,
        }
      : null,
  }
}

export const rideDashboard = asyncHandler(async (req, res) => {
  const dayKeys = buildUtcDayKeys(7)
  const windowStart = new Date(`${dayKeys[0]}T00:00:00Z`)

  const [
    rideStatusRows,
    sosStatusRows,
    sosSeverityRows,
    requestTrendRows,
    completedTrendRows,
    cancelledTrendRows,
    activeTrips,
    onlineRiders,
    safetyAlertsCount,
    recentSosRaw,
    safetyWatchlistRaw,
  ] = await Promise.all([
    RideRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    SOSAlert.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    SOSAlert.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
    RideRequest.aggregate([
      { $match: { requestedAt: { $gte: windowStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$requestedAt', timezone: 'UTC' } },
          count: { $sum: 1 },
        },
      },
    ]),
    RideRequest.aggregate([
      { $match: { status: 'completed', completedAt: { $gte: windowStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt', timezone: 'UTC' } },
          count: { $sum: 1 },
        },
      },
    ]),
    RideRequest.aggregate([
      { $match: { status: 'cancelled', cancelledAt: { $gte: windowStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$cancelledAt', timezone: 'UTC' } },
          count: { $sum: 1 },
        },
      },
    ]),
    Trip.countDocuments({ status: { $in: ACTIVE_TRIP_STATUSES } }),
    User.countDocuments({ role: 'rider', availability: 'online', isBlocked: false }),
    Trip.countDocuments({
      status: { $in: ACTIVE_TRIP_STATUSES },
      $or: [{ suspiciousStopFlag: true }, { noUpdateFlag: true }, { status: 'overdue' }],
    }),
    SOSAlert.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('tripId', 'status startedAt bufferedDeadlineAt currentLocation')
      .populate('riderId', 'fullName email phone campusId vehicleType vehicleNumber')
      .populate('passengerId', 'fullName email phone campusId studentId')
      .populate('createdBy', 'fullName role')
      .lean(),
    Trip.find({
      status: { $in: ACTIVE_TRIP_STATUSES },
      $or: [{ suspiciousStopFlag: true }, { noUpdateFlag: true }, { status: 'overdue' }],
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate('riderId', 'fullName phone vehicleType vehicleNumber')
      .populate('passengerId', 'fullName phone studentId campusId')
      .lean(),
  ])

  const rideStatus = rowsToCountMap(rideStatusRows, {
    requested: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
  })
  const sosStatus = rowsToCountMap(sosStatusRows, {
    pending: 0,
    acknowledged: 0,
    resolved: 0,
  })
  const sosSeverity = rowsToCountMap(sosSeverityRows, {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  })

  const requestsByDay = rowsToDateMap(requestTrendRows)
  const completedByDay = rowsToDateMap(completedTrendRows)
  const cancelledByDay = rowsToDateMap(cancelledTrendRows)

  const dailyRideTrend = dayKeys.map((key) => ({
    day: key,
    label: toShortDayLabel(key),
    requests: requestsByDay[key] ?? 0,
    completed: completedByDay[key] ?? 0,
    cancelled: cancelledByDay[key] ?? 0,
  }))

  const totalRequests =
    rideStatus.requested + rideStatus.accepted + rideStatus.completed + rideStatus.cancelled
  const completedOrCancelled = rideStatus.completed + rideStatus.cancelled
  const completionRate =
    completedOrCancelled > 0 ? Math.round((rideStatus.completed / completedOrCancelled) * 100) : 0
  const totalSos = sosStatus.pending + sosStatus.acknowledged + sosStatus.resolved

  res.json({
    success: true,
    data: {
      generatedAt: new Date().toISOString(),
      kpis: {
        totalRequests,
        activeTrips,
        onlineRiders,
        safetyAlerts: safetyAlertsCount,
        pendingSos: sosStatus.pending,
        acknowledgedSos: sosStatus.acknowledged,
        resolvedSos: sosStatus.resolved,
        totalSos,
        completedRides: rideStatus.completed,
        cancelledRides: rideStatus.cancelled,
        completionRate,
      },
      rideStatus: [
        { key: 'requested', label: 'Requested', count: rideStatus.requested },
        { key: 'accepted', label: 'Accepted', count: rideStatus.accepted },
        { key: 'completed', label: 'Completed', count: rideStatus.completed },
        { key: 'cancelled', label: 'Cancelled', count: rideStatus.cancelled },
      ],
      dailyRideTrend,
      sosSeverity: [
        { key: 'low', label: 'Low', count: sosSeverity.low },
        { key: 'medium', label: 'Medium', count: sosSeverity.medium },
        { key: 'high', label: 'High', count: sosSeverity.high },
        { key: 'critical', label: 'Critical', count: sosSeverity.critical },
      ],
      recentSos: recentSosRaw.map(mapSosAlert),
      safetyWatchlist: safetyWatchlistRaw.map(mapSafetyTrip),
    },
  })
})

export const rideRequests = asyncHandler(async (req, res) => {
  const { status } = req.query
  const filter = {}
  if (status) filter.status = status
  const items = await RideRequest.find(filter).sort({ requestedAt: -1 }).limit(200).lean()
  res.json({ success: true, items })
})

export const activeRiders = asyncHandler(async (req, res) => {
  const { campusId } = req.query
  const filter = { role: 'rider', availability: 'online', isBlocked: false }
  if (campusId) filter.campusId = campusId
  const items = await User.find(filter).sort({ updatedAt: -1 }).limit(200).lean()
  const data = items.map((u) => ({
    id: u._id.toString(),
    fullName: u.fullName,
    campusId: u.campusId,
    currentLocation: u.currentLocation ?? null,
    vehicleType: u.vehicleType,
    vehicleNumber: u.vehicleNumber,
    seatCount: u.seatCount,
    rating: u.rating,
    complaintCount: u.complaintCount,
  }))
  res.json({ success: true, items: data })
})

export const cancelRideRequest = asyncHandler(async (req, res) => {
  const rr = await RideRequest.findById(req.params.id)
  if (!rr) throw new ApiError(404, 'Ride request not found')

  rr.status = 'cancelled'
  rr.cancelledAt = new Date()
  await rr.save()

  await Trip.updateMany(
    { rideRequestId: rr._id, status: { $in: ['to_pickup', 'to_university', 'overdue', 'in_progress'] } },
    { status: 'cancelled' }
  )

  res.json({ success: true, data: rr.toObject() })
})

export const deleteRideRequest = asyncHandler(async (req, res) => {
  const rr = await RideRequest.findById(req.params.id)
  if (!rr) throw new ApiError(404, 'Ride request not found')

  await Trip.deleteMany({ rideRequestId: rr._id })
  await RideRequest.deleteOne({ _id: rr._id })

  res.json({ success: true, message: 'Ride request deleted' })
})

import { Trip } from '../modules/ride_sharing/models/Trip.js'
import { SOSAlert } from '../modules/ride_sharing/models/SOSAlert.js'
import { getIo } from '../config/socket.js'

export function startSafetyMonitorJob({
  intervalMs = 15000,
  noUpdateMs = 2 * 60 * 1000,
  suspiciousStopMs = 3 * 60 * 1000,
} = {}) {
  const timer = setInterval(async () => {
    const now = new Date()

    // Overdue -> auto SOS once.
    const overdueTrips = await Trip.find({
      status: { $in: ['to_pickup', 'to_university'] },
      bufferedDeadlineAt: { $ne: null, $lt: now },
      autoSosTriggered: false,
    })
      .limit(50)
      .lean()

    for (const t of overdueTrips) {
      await Trip.updateOne({ _id: t._id }, { status: 'overdue', autoSosTriggered: true })
      const sos = await SOSAlert.create({
        tripId: t._id,
        riderId: t.riderId,
        passengerId: t.passengerId,
        createdBy: t.passengerId,
        severity: 'high',
        message: 'AUTO SOS: trip exceeded expected time window',
        location: t.currentLocation ?? null,
        status: 'pending',
      })
      try {
        getIo().to('admin').emit('ride:sos', { sos: sos.toObject() })
      } catch {
        // ignore if socket not ready
      }
    }

    // No updates flag
    await Trip.updateMany(
      {
        status: { $in: ['to_pickup', 'to_university', 'overdue'] },
        lastMovementAt: { $ne: null, $lt: new Date(now.getTime() - noUpdateMs) },
      },
      { noUpdateFlag: true }
    )

    // Suspicious stop flag
    await Trip.updateMany(
      {
        status: { $in: ['to_pickup', 'to_university', 'overdue'] },
        lastMovementAt: { $ne: null, $lt: new Date(now.getTime() - suspiciousStopMs) },
      },
      { suspiciousStopFlag: true }
    )
  }, intervalMs)

  return () => clearInterval(timer)
}


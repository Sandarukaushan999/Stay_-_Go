import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { User } from '../../modules/users/user.model.js'
import { Trip } from '../../modules/ride_sharing/models/Trip.js'
import { SOSAlert } from '../../modules/ride_sharing/models/SOSAlert.js'

/**
 * GET /api/admin/analytics
 * Returns all data needed for the admin analytics dashboard.
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd   = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  /* ── KPI cards ──────────────────────────────────────────── */
  const [tripsToday, activeRides, incidentCount, completedToday, totalToday] = await Promise.all([
    Trip.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
    Trip.countDocuments({ status: { $in: ['to_pickup', 'to_university', 'overdue'] } }),
    SOSAlert.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
    Trip.countDocuments({ status: 'completed', completedAt: { $gte: todayStart, $lt: todayEnd } }),
    Trip.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
  ])

  const completionRate = totalToday > 0
    ? Math.round((completedToday / totalToday) * 100)
    : 0

  /* ── Trips over last 7 days (line chart) ────────────────── */
  const tripsOverTime = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayStart)
    dayStart.setDate(dayStart.getDate() - i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const count = await Trip.countDocuments({
      createdAt: { $gte: dayStart, $lt: dayEnd },
    })

    tripsOverTime.push({
      day: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      trips: count,
    })
  }

  /* ── Peak usage hours (bar chart) — from existing trips ─── */
  const hourAgg = await Trip.aggregate([
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Build 0-23 array, fill missing hours with 0
  const hourMap = {}
  hourAgg.forEach((h) => { hourMap[h._id] = h.count })
  const peakHours = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    rides: hourMap[h] ?? 0,
  }))

  /* ── User distribution (pie chart) ─────────────────────── */
  const [students, riders, technicians, admins] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'rider' }),
    User.countDocuments({ role: 'technician' }),
    User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
  ])

  const userDistribution = [
    { name: 'Students',     value: students,    color: '#6366f1' },
    { name: 'Riders',       value: riders,       color: '#10b981' },
    { name: 'Technicians',  value: technicians,  color: '#f59e0b' },
    { name: 'Admins',       value: admins,       color: '#ec4899' },
  ]

  /* ── Incidents over last 7 days (area chart) ────────────── */
  const incidentsOverTime = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayStart)
    dayStart.setDate(dayStart.getDate() - i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const count = await SOSAlert.countDocuments({
      createdAt: { $gte: dayStart, $lt: dayEnd },
    })

    incidentsOverTime.push({
      day: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      incidents: count,
    })
  }

  res.json({
    success: true,
    data: {
      kpi: { tripsToday, activeRides, incidentCount, completionRate },
      tripsOverTime,
      peakHours,
      userDistribution,
      incidentsOverTime,
    },
  })
})

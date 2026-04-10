import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'
import { useSocketStore } from '../../../app/store/socketStore'

const severityTone = {
  low: 'border-emerald-700/60 bg-emerald-900/30 text-emerald-200',
  medium: 'border-amber-700/60 bg-amber-900/30 text-amber-200',
  high: 'border-orange-700/60 bg-orange-900/30 text-orange-200',
  critical: 'border-red-700/60 bg-red-900/30 text-red-200',
}

const statusTone = {
  pending: 'border-red-700/60 bg-red-900/30 text-red-200',
  acknowledged: 'border-amber-700/60 bg-amber-900/30 text-amber-200',
  resolved: 'border-emerald-700/60 bg-emerald-900/30 text-emerald-200',
}

const barPaletteRide = ['#60a5fa', '#818cf8', '#22d3ee', '#f97316']
const barPaletteSos = ['#10b981', '#f59e0b', '#f97316', '#ef4444']

function buildUtcDayKeys(days) {
  const now = new Date()
  const startUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1))
  return Array.from({ length: days }, (_, idx) => {
    const d = new Date(startUtc + idx * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
  })
}

function getUtcDayKey(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10)
}

function toShortDayLabel(dayKey) {
  const d = new Date(`${dayKey}T00:00:00Z`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

function formatLocation(location) {
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') return '-'
  return `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
}

function shortId(id) {
  if (!id) return '-'
  return String(id).slice(-10)
}

function normalizeIncomingSos(raw) {
  if (!raw) return null
  const id = raw.id ?? raw._id ?? null
  if (!id) return null
  return {
    id,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    status: raw.status ?? 'pending',
    severity: raw.severity ?? 'high',
    message: raw.message ?? '',
    location: raw.location ?? null,
    trip:
      raw.trip ??
      (raw.tripId
        ? {
            id: typeof raw.tripId === 'string' ? raw.tripId : raw.tripId?._id ?? null,
            status: raw.tripId?.status ?? null,
          }
        : null),
    rider:
      raw.rider ??
      (raw.riderId && typeof raw.riderId === 'object'
        ? {
            id: raw.riderId._id ?? null,
            fullName: raw.riderId.fullName ?? null,
            phone: raw.riderId.phone ?? null,
            email: raw.riderId.email ?? null,
          }
        : raw.riderId
          ? { id: raw.riderId }
          : null),
    passenger:
      raw.passenger ??
      (raw.passengerId && typeof raw.passengerId === 'object'
        ? {
            id: raw.passengerId._id ?? null,
            fullName: raw.passengerId.fullName ?? null,
            phone: raw.passengerId.phone ?? null,
            email: raw.passengerId.email ?? null,
            studentId: raw.passengerId.studentId ?? null,
          }
        : raw.passengerId
          ? { id: raw.passengerId }
          : null),
    createdBy:
      raw.createdBy && typeof raw.createdBy === 'object'
        ? {
            id: raw.createdBy._id ?? null,
            fullName: raw.createdBy.fullName ?? null,
            role: raw.createdBy.role ?? null,
          }
        : raw.createdBy
          ? { id: raw.createdBy }
          : null,
  }
}

function buildDashboardFromLegacy({ rideRequests, activeRiders, activeTrips, sosAlerts, safetyAlerts }) {
  const rideCounts = { requested: 0, accepted: 0, completed: 0, cancelled: 0 }
  for (const request of rideRequests) {
    if (Object.prototype.hasOwnProperty.call(rideCounts, request?.status)) {
      rideCounts[request.status] += 1
    }
  }

  const sosStatusCounts = { pending: 0, acknowledged: 0, resolved: 0 }
  const sosSeverityCounts = { low: 0, medium: 0, high: 0, critical: 0 }
  for (const alert of sosAlerts) {
    if (Object.prototype.hasOwnProperty.call(sosStatusCounts, alert?.status)) sosStatusCounts[alert.status] += 1
    if (Object.prototype.hasOwnProperty.call(sosSeverityCounts, alert?.severity)) sosSeverityCounts[alert.severity] += 1
  }

  const dayKeys = buildUtcDayKeys(7)
  const requestByDay = Object.fromEntries(dayKeys.map((k) => [k, 0]))
  const completedByDay = Object.fromEntries(dayKeys.map((k) => [k, 0]))
  const cancelledByDay = Object.fromEntries(dayKeys.map((k) => [k, 0]))

  for (const request of rideRequests) {
    const reqKey = getUtcDayKey(request?.requestedAt)
    if (reqKey && requestByDay[reqKey] !== undefined) requestByDay[reqKey] += 1

    const completedKey = getUtcDayKey(request?.completedAt)
    if (completedKey && completedByDay[completedKey] !== undefined) completedByDay[completedKey] += 1

    const cancelledKey = getUtcDayKey(request?.cancelledAt)
    if (cancelledKey && cancelledByDay[cancelledKey] !== undefined) cancelledByDay[cancelledKey] += 1
  }

  const dailyRideTrend = dayKeys.map((key) => ({
    day: key,
    label: toShortDayLabel(key),
    requests: requestByDay[key] ?? 0,
    completed: completedByDay[key] ?? 0,
    cancelled: cancelledByDay[key] ?? 0,
  }))

  const totalRequests = rideRequests.length
  const completedOrCancelled = rideCounts.completed + rideCounts.cancelled
  const completionRate = completedOrCancelled > 0 ? Math.round((rideCounts.completed / completedOrCancelled) * 100) : 0
  const totalSos = sosAlerts.length

  return {
    generatedAt: new Date().toISOString(),
    kpis: {
      totalRequests,
      activeTrips: activeTrips.length,
      onlineRiders: activeRiders.length,
      safetyAlerts: safetyAlerts.length,
      pendingSos: sosStatusCounts.pending,
      acknowledgedSos: sosStatusCounts.acknowledged,
      resolvedSos: sosStatusCounts.resolved,
      totalSos,
      completedRides: rideCounts.completed,
      cancelledRides: rideCounts.cancelled,
      completionRate,
    },
    rideStatus: [
      { key: 'requested', label: 'Requested', count: rideCounts.requested },
      { key: 'accepted', label: 'Accepted', count: rideCounts.accepted },
      { key: 'completed', label: 'Completed', count: rideCounts.completed },
      { key: 'cancelled', label: 'Cancelled', count: rideCounts.cancelled },
    ],
    dailyRideTrend,
    sosSeverity: [
      { key: 'low', label: 'Low', count: sosSeverityCounts.low },
      { key: 'medium', label: 'Medium', count: sosSeverityCounts.medium },
      { key: 'high', label: 'High', count: sosSeverityCounts.high },
      { key: 'critical', label: 'Critical', count: sosSeverityCounts.critical },
    ],
    recentSos: [...sosAlerts]
      .sort((a, b) => new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime())
      .slice(0, 20)
      .map((a) => ({
        id: a?._id ?? a?.id ?? null,
        createdAt: a?.createdAt ?? null,
        status: a?.status ?? null,
        severity: a?.severity ?? null,
        message: a?.message ?? '',
        location: a?.location ?? null,
        trip: a?.tripId ? { id: String(a.tripId), status: null } : null,
        rider: a?.riderId ? { id: String(a.riderId), fullName: null, phone: null, email: null } : null,
        passenger: a?.passengerId
          ? { id: String(a.passengerId), fullName: null, phone: null, email: null, studentId: null }
          : null,
      })),
    safetyWatchlist: safetyAlerts.slice(0, 20).map((t) => ({
      id: t?._id ?? t?.id ?? null,
      status: t?.status ?? null,
      startedAt: t?.startedAt ?? null,
      bufferedDeadlineAt: t?.bufferedDeadlineAt ?? null,
      lastMovementAt: t?.lastMovementAt ?? null,
      suspiciousStopFlag: Boolean(t?.suspiciousStopFlag),
      noUpdateFlag: Boolean(t?.noUpdateFlag),
      autoSosTriggered: Boolean(t?.autoSosTriggered),
      currentLocation: t?.currentLocation ?? null,
      rider: t?.riderId ? { id: String(t.riderId), fullName: null, phone: null } : null,
      passenger: t?.passengerId ? { id: String(t.passengerId), fullName: null, phone: null } : null,
    })),
  }
}

function KpiCard({ label, value, hint, accent = 'slate' }) {
  const accentClass =
    accent === 'red'
      ? 'from-red-600/20 to-red-900/5 border-red-800/50'
      : accent === 'emerald'
        ? 'from-emerald-600/20 to-emerald-900/5 border-emerald-800/50'
        : accent === 'blue'
          ? 'from-blue-600/20 to-blue-900/5 border-blue-800/50'
          : accent === 'amber'
            ? 'from-amber-600/20 to-amber-900/5 border-amber-800/50'
            : 'from-slate-700/20 to-slate-900/5 border-slate-800'

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${accentClass}`}>
      <div className="text-xs uppercase tracking-wide text-slate-300">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-xs text-slate-400">{hint}</div>
    </div>
  )
}

function TrendLineChart({ data }) {
  const points = useMemo(() => {
    const values = data.flatMap((item) => [item.requests ?? 0, item.completed ?? 0])
    const maxValue = Math.max(1, ...values)
    const width = 640
    const height = 220
    const leftPad = 38
    const rightPad = 16
    const topPad = 16
    const bottomPad = 30
    const graphWidth = width - leftPad - rightPad
    const graphHeight = height - topPad - bottomPad
    const stepX = data.length > 1 ? graphWidth / (data.length - 1) : graphWidth / 2

    function toPoint(idx, value) {
      const x = leftPad + idx * stepX
      const y = topPad + graphHeight - (value / maxValue) * graphHeight
      return `${x},${y}`
    }

    const requestPoints = data.map((item, idx) => toPoint(idx, item.requests ?? 0)).join(' ')
    const completedPoints = data.map((item, idx) => toPoint(idx, item.completed ?? 0)).join(' ')

    return { maxValue, width, height, leftPad, rightPad, topPad, bottomPad, requestPoints, completedPoints }
  }, [data])

  if (!data.length) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">No trend data yet.</div>
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Ride Trend (Last 7 Days)</h3>
          <p className="text-sm text-slate-400">Requests vs completed rides</p>
        </div>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            Requests
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Completed
          </div>
        </div>
      </div>

      <svg className="h-64 w-full" viewBox={`0 0 ${points.width} ${points.height}`} role="img" aria-label="Ride trend line chart">
        <line
          x1={points.leftPad}
          y1={points.topPad}
          x2={points.leftPad}
          y2={points.height - points.bottomPad}
          stroke="#334155"
          strokeWidth="1"
        />
        <line
          x1={points.leftPad}
          y1={points.height - points.bottomPad}
          x2={points.width - points.rightPad}
          y2={points.height - points.bottomPad}
          stroke="#334155"
          strokeWidth="1"
        />

        <polyline fill="none" stroke="#38bdf8" strokeWidth="3" points={points.requestPoints} />
        <polyline fill="none" stroke="#34d399" strokeWidth="3" points={points.completedPoints} />

        {data.map((item, idx) => {
          const stepX =
            data.length > 1
              ? (points.width - points.leftPad - points.rightPad) / (data.length - 1)
              : (points.width - points.leftPad - points.rightPad) / 2
          const x = points.leftPad + idx * stepX
          return (
            <text key={item.day} x={x} y={points.height - 8} textAnchor="middle" fill="#94a3b8" fontSize="11">
              {item.label}
            </text>
          )
        })}

        <text x="8" y={points.topPad + 8} fill="#94a3b8" fontSize="10">
          {points.maxValue}
        </text>
      </svg>
    </div>
  )
}

function VerticalBarChart({ title, subtitle, data, palette }) {
  const maxValue = Math.max(1, ...data.map((item) => item.count ?? 0))
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400">{subtitle}</p>

      {!data.length ? (
        <div className="mt-6 text-sm text-slate-400">No data yet.</div>
      ) : (
        <div className="mt-6">
          <div className="flex h-48 items-end gap-3">
            {data.map((item, idx) => {
              const pct = Math.max(6, Math.round(((item.count ?? 0) / maxValue) * 100))
              return (
                <div key={item.key} className="flex flex-1 flex-col items-center">
                  <div className="mb-2 text-xs font-medium text-slate-300">{item.count ?? 0}</div>
                  <div className="relative flex h-36 w-full items-end rounded-xl bg-slate-800/50 p-1">
                    <div
                      className="w-full rounded-lg"
                      style={{ height: `${pct}%`, backgroundColor: palette[idx % palette.length] }}
                    />
                  </div>
                  <div className="mt-2 text-center text-xs text-slate-400">{item.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RideDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [actionLoadingKey, setActionLoadingKey] = useState('')

  const socket = useSocketStore((s) => s.socket)
  const connect = useSocketStore((s) => s.connect)
  const refreshTimerRef = useRef(null)
  const legacyApiModeRef = useRef(false)

  const loadLegacyDashboard = useCallback(async () => {
    const [{ data: requestsData }, { data: ridersData }, { data: activeTripsData }, { data: sosData }, { data: safetyData }] =
      await Promise.all([
        api.get('/admin/rides/requests'),
        api.get('/admin/riders/active'),
        api.get('/admin/trips/active'),
        api.get('/admin/sos'),
        api.get('/admin/safety/alerts'),
      ])

    return buildDashboardFromLegacy({
      rideRequests: requestsData?.items ?? [],
      activeRiders: ridersData?.items ?? [],
      activeTrips: activeTripsData?.items ?? [],
      sosAlerts: sosData?.items ?? [],
      safetyAlerts: safetyData?.items ?? [],
    })
  }, [])

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        if (legacyApiModeRef.current) {
          const legacyData = await loadLegacyDashboard()
          setData(legacyData)
          setLastUpdated(new Date())
          return
        }

        try {
          const { data: response } = await api.get('/admin/rides/dashboard')
          setData(response?.data ?? null)
          setLastUpdated(new Date())
          return
        } catch (err) {
          if (err?.response?.status !== 404) throw err
          legacyApiModeRef.current = true
          const legacyData = await loadLegacyDashboard()
          setData(legacyData)
          setLastUpdated(new Date())
        }
      } catch {
        setError('Failed to load ride dashboard')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [loadLegacyDashboard]
  )

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) return
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null
      load({ silent: true })
    }, 1200)
  }, [load])

  useEffect(() => {
    load()
    const interval = setInterval(() => load({ silent: true }), 30000)
    return () => {
      clearInterval(interval)
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [load])

  useEffect(() => {
    const s = socket ?? connect()
    s.emit('join:admin')

    function onSos(evt) {
      const incoming = normalizeIncomingSos(evt?.sos)
      if (!incoming) return

      setData((prev) => {
        if (!prev) return prev
        const existing = prev.recentSos ?? []
        const nextRecent = [incoming, ...existing.filter((row) => row.id !== incoming.id)].slice(0, 20)
        const prevKpis = prev.kpis ?? {}
        return {
          ...prev,
          kpis: {
            ...prevKpis,
            pendingSos: incoming.status === 'pending' ? (prevKpis.pendingSos ?? 0) + 1 : prevKpis.pendingSos ?? 0,
            totalSos: (prevKpis.totalSos ?? 0) + 1,
          },
          recentSos: nextRecent,
        }
      })

      scheduleRefresh()
    }

    function onRideRequest() {
      scheduleRefresh()
    }

    function onTripStatus() {
      scheduleRefresh()
    }

    s.on('ride:sos', onSos)
    s.on('ride:request', onRideRequest)
    s.on('trip:status', onTripStatus)

    return () => {
      s.off('ride:sos', onSos)
      s.off('ride:request', onRideRequest)
      s.off('trip:status', onTripStatus)
    }
  }, [socket, connect, scheduleRefresh])

  async function actOnAlert(id, action) {
    if (!id) return
    const loadingKey = `${action}:${id}`
    setActionLoadingKey(loadingKey)
    setError(null)
    try {
      if (action === 'acknowledge') await api.patch(`/admin/sos/${id}/acknowledge`)
      if (action === 'resolve') await api.patch(`/admin/sos/${id}/resolve`)
      await load({ silent: true })
    } catch {
      setError(`Failed to ${action} alert`)
    } finally {
      setActionLoadingKey('')
    }
  }

  const kpis = data?.kpis ?? {}
  const rideStatus = data?.rideStatus ?? []
  const dailyRideTrend = data?.dailyRideTrend ?? []
  const sosSeverity = data?.sosSeverity ?? []
  const recentSos = data?.recentSos ?? []
  const safetyWatchlist = data?.safetyWatchlist ?? []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Ride Dashboard</h1>
            <p className="mt-2 text-slate-400">Real-time monitoring for ride analytics, SOS alerts, and rider/passenger safety details.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-slate-400">
              <div>Last updated</div>
              <div className="text-slate-200">{lastUpdated ? lastUpdated.toLocaleTimeString() : '-'}</div>
            </div>
            <button
              type="button"
              onClick={() => load({ silent: false })}
              className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
            >
              Refresh now
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">{error}</div>
        ) : null}

        {loading && !data ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-slate-400">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Total Requests" value={kpis.totalRequests ?? 0} hint="All ride requests processed" accent="blue" />
              <KpiCard label="Active Trips" value={kpis.activeTrips ?? 0} hint="Trips currently in motion or overdue" accent="emerald" />
              <KpiCard label="Online Riders" value={kpis.onlineRiders ?? 0} hint="Riders available right now" accent="slate" />
              <KpiCard label="Pending SOS" value={kpis.pendingSos ?? 0} hint="Immediate follow-up required" accent="red" />
              <KpiCard label="Safety Alerts" value={kpis.safetyAlerts ?? 0} hint="Trips with risk flags" accent="amber" />
              <KpiCard label="Completed Rides" value={kpis.completedRides ?? 0} hint="Total completed rides" accent="emerald" />
              <KpiCard label="Cancelled Rides" value={kpis.cancelledRides ?? 0} hint="Total cancelled rides" accent="slate" />
              <KpiCard label="Completion Rate" value={`${kpis.completionRate ?? 0}%`} hint="Completed vs completed+cancelled" accent="blue" />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <TrendLineChart data={dailyRideTrend} />
              <VerticalBarChart title="Ride Status Overview" subtitle="Requested, accepted, completed, cancelled" data={rideStatus} palette={barPaletteRide} />
              <div className="xl:col-span-2">
                <VerticalBarChart title="SOS Severity Distribution" subtitle="Current urgency mix across all alerts" data={sosSeverity} palette={barPaletteSos} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="border-b border-slate-800 p-4">
                <h2 className="text-lg font-semibold">Real-Time SOS Alerts</h2>
                <p className="text-sm text-slate-400">Rider and passenger details are shown for immediate response coordination.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="bg-slate-950">
                    <tr className="text-slate-300">
                      <th className="p-3">Time</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Rider</th>
                      <th className="p-3">Passenger</th>
                      <th className="p-3">Trip</th>
                      <th className="p-3">Message</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900/30">
                    {recentSos.length ? (
                      recentSos.map((alert) => {
                        const ackKey = `acknowledge:${alert.id}`
                        const resolveKey = `resolve:${alert.id}`
                        return (
                          <tr key={alert.id} className="border-t border-slate-800 align-top">
                            <td className="p-3 text-slate-300">{formatDateTime(alert.createdAt)}</td>
                            <td className="p-3">
                              <span
                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                                  severityTone[alert.severity] ?? 'border-slate-700 bg-slate-800 text-slate-200'
                                }`}
                              >
                                {alert.severity ?? 'unknown'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                                  statusTone[alert.status] ?? 'border-slate-700 bg-slate-800 text-slate-200'
                                }`}
                              >
                                {alert.status ?? 'unknown'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-200">
                              <div className="font-medium">{alert.rider?.fullName ?? shortId(alert.rider?.id)}</div>
                              <div className="text-xs text-slate-400">{alert.rider?.phone ?? '-'}</div>
                              <div className="text-xs text-slate-500">{alert.rider?.email ?? '-'}</div>
                            </td>
                            <td className="p-3 text-slate-200">
                              <div className="font-medium">{alert.passenger?.fullName ?? shortId(alert.passenger?.id)}</div>
                              <div className="text-xs text-slate-400">{alert.passenger?.phone ?? '-'}</div>
                              <div className="text-xs text-slate-500">{alert.passenger?.studentId ?? '-'}</div>
                            </td>
                            <td className="p-3 text-slate-300">
                              <div className="font-mono text-xs">{shortId(alert.trip?.id)}</div>
                              <div className="text-xs">{alert.trip?.status ?? '-'}</div>
                            </td>
                            <td className="p-3 text-slate-200">{alert.message || '-'}</td>
                            <td className="p-3 text-slate-300">{formatLocation(alert.location ?? alert.trip?.currentLocation)}</td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                {alert.status === 'pending' ? (
                                  <button
                                    type="button"
                                    onClick={() => actOnAlert(alert.id, 'acknowledge')}
                                    disabled={actionLoadingKey === ackKey}
                                    className="rounded-lg border border-amber-700 px-2 py-1 text-xs text-amber-200 hover:bg-amber-900/20 disabled:opacity-50"
                                  >
                                    {actionLoadingKey === ackKey ? 'Working...' : 'Acknowledge'}
                                  </button>
                                ) : null}

                                {alert.status !== 'resolved' ? (
                                  <button
                                    type="button"
                                    onClick={() => actOnAlert(alert.id, 'resolve')}
                                    disabled={actionLoadingKey === resolveKey}
                                    className="rounded-lg border border-emerald-700 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900/20 disabled:opacity-50"
                                  >
                                    {actionLoadingKey === resolveKey ? 'Working...' : 'Resolve'}
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td className="p-4 text-slate-400" colSpan={9}>
                          No SOS alerts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <h2 className="text-lg font-semibold">Safety Watchlist</h2>
              <p className="text-sm text-slate-400">Trips flagged for suspicious stop, no updates, or overdue status.</p>

              {safetyWatchlist.length ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {safetyWatchlist.map((trip) => (
                    <div key={trip.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs text-slate-400">Trip</div>
                          <div className="font-mono text-sm text-slate-200">{shortId(trip.id)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Status</div>
                          <div className="text-sm font-medium text-slate-200">{trip.status ?? '-'}</div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border border-slate-800 p-2">
                          <div className="text-slate-400">Rider</div>
                          <div className="text-slate-200">{trip.rider?.fullName ?? '-'}</div>
                          <div className="text-slate-500">{trip.rider?.phone ?? '-'}</div>
                        </div>
                        <div className="rounded-lg border border-slate-800 p-2">
                          <div className="text-slate-400">Passenger</div>
                          <div className="text-slate-200">{trip.passenger?.fullName ?? '-'}</div>
                          <div className="text-slate-500">{trip.passenger?.phone ?? '-'}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {trip.suspiciousStopFlag ? (
                          <span className="rounded-full border border-amber-700/60 bg-amber-900/30 px-2 py-1 text-xs text-amber-200">
                            Suspicious Stop
                          </span>
                        ) : null}
                        {trip.noUpdateFlag ? (
                          <span className="rounded-full border border-orange-700/60 bg-orange-900/30 px-2 py-1 text-xs text-orange-200">
                            No Location Updates
                          </span>
                        ) : null}
                        {trip.status === 'overdue' ? (
                          <span className="rounded-full border border-red-700/60 bg-red-900/30 px-2 py-1 text-xs text-red-200">
                            Overdue
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 text-xs text-slate-400">
                        Last movement: <span className="text-slate-300">{formatDateTime(trip.lastMovementAt)}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Last location: <span className="text-slate-300">{formatLocation(trip.currentLocation)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
                  No flagged trips right now.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

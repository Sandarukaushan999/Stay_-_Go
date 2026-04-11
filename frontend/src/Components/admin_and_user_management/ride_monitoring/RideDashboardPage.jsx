import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'
import { useSocketStore } from '../../../app/store/socketStore'
import { CalendarRange, ChevronDown, ChevronUp, RefreshCw, Sparkles } from 'lucide-react'

const severityTone = {
  low: 'border-[#BAF91A]/40 bg-[#E2FF99]/30 text-[#101312]',
  medium: 'border-amber-400/50 bg-amber-50 text-amber-950',
  high: 'border-orange-400/50 bg-orange-50 text-orange-950',
  critical: 'border-[#876DFF]/50 bg-[#876DFF]/15 text-[#101312]',
}

const statusTone = {
  pending: 'border-[#876DFF]/40 bg-[#876DFF]/10 text-[#101312]',
  acknowledged: 'border-amber-400/50 bg-amber-50 text-amber-950',
  resolved: 'border-[#BAF91A]/50 bg-[#E2FF99]/50 text-[#101312]',
}

const barPaletteRide = ['#876DFF', '#BAF91A', '#E2FF99', '#101312']
const barPaletteSos = ['#E2FF99', '#BAF91A', '#876DFF', '#101312']

const TABLE_PREVIEW = 10
const MAX_RANGE_DAYS = 60

function utcTodayKey() {
  const n = new Date()
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())).toISOString().slice(0, 10)
}

function defaultRangeKeys() {
  const toKey = utcTodayKey()
  const d = new Date(`${toKey}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() - 6)
  return { from: d.toISOString().slice(0, 10), to: toKey }
}

function windowFromKeys(fromKey, toKey) {
  return {
    windowStart: new Date(`${fromKey}T00:00:00.000Z`),
    windowEnd: new Date(`${toKey}T23:59:59.999Z`),
  }
}

function validateDateRangeInput(from, to) {
  const re = /^\d{4}-\d{2}-\d{2}$/
  if (!re.test(from) || !re.test(to)) return 'Use YYYY-MM-DD for both dates (UTC).'
  if (from > to) return 'Start date must be on or before end date.'
  const start = new Date(`${from}T00:00:00.000Z`)
  const end = new Date(`${to}T00:00:00.000Z`)
  const days = Math.round((end - start) / 86400000) + 1
  if (days > MAX_RANGE_DAYS) return `Range cannot exceed ${MAX_RANGE_DAYS} days.`
  return null
}

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

function isLikelyObjectId(id) {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)
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

function buildDashboardFromLegacy({ rideRequests, activeRiders, activeTrips, sosAlerts, safetyAlerts }, range) {
  const { windowStart, windowEnd } = range
    ? windowFromKeys(range.from, range.to)
    : { windowStart: null, windowEnd: null }

  const filterReq = (r) => {
    if (!windowStart || !windowEnd) return true
    const t = r?.requestedAt ? new Date(r.requestedAt).getTime() : 0
    return t >= windowStart.getTime() && t <= windowEnd.getTime()
  }
  const filterSos = (a) => {
    if (!windowStart || !windowEnd) return true
    const t = a?.createdAt ? new Date(a.createdAt).getTime() : 0
    return t >= windowStart.getTime() && t <= windowEnd.getTime()
  }

  const rr = windowStart ? rideRequests.filter(filterReq) : rideRequests
  const sosForTable = windowStart ? sosAlerts.filter(filterSos) : sosAlerts

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

  const dayKeys = range ? buildDayKeysInclusive(range.from, range.to) : buildUtcDayKeys(7)
  const requestByDay = Object.fromEntries(dayKeys.map((k) => [k, 0]))
  const completedByDay = Object.fromEntries(dayKeys.map((k) => [k, 0]))
  const cancelledByDay = Object.fromEntries(dayKeys.map((k) => [k, 0]))

  for (const request of rr) {
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
    range: range ?? { from: dayKeys[0], to: dayKeys[dayKeys.length - 1], days: dayKeys.length },
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
    recentSos: [...sosForTable]
      .sort((a, b) => new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime())
      .slice(0, 200)
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
    safetyWatchlist: safetyAlerts.slice(0, 200).map((t) => ({
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

function buildDayKeysInclusive(fromKey, toKey) {
  const keys = []
  for (let t = new Date(`${fromKey}T00:00:00.000Z`).getTime(); t <= new Date(`${toKey}T00:00:00.000Z`).getTime(); t += 86400000) {
    keys.push(new Date(t).toISOString().slice(0, 10))
  }
  return keys
}

function KpiCard({ label, value, hint, tone }) {
  const ring =
    tone === 'alert'
      ? 'shadow-[0_0_0_1px_rgba(135,109,255,0.35)]'
      : tone === 'live'
        ? 'shadow-[0_0_0_1px_rgba(186,249,26,0.45)]'
        : 'shadow-[0_0_0_1px_rgba(16,19,18,0.08)]'

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-[#101312]/10 bg-gradient-to-br from-white via-[#fafdf4] to-[#f2f7e8] p-4 ${ring}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#E2FF99]/40 blur-2xl transition group-hover:bg-[#BAF91A]/30" />
      <div className="relative text-[10px] font-semibold uppercase tracking-[0.14em] text-[#101312]/50">{label}</div>
      <div className="relative mt-2 text-3xl font-bold tracking-tight text-[#101312]">{value}</div>
      <div className="relative mt-1.5 text-xs leading-snug text-[#101312]/60">{hint}</div>
    </div>
  )
}

function TrendComboChart({ data }) {
  const layout = useMemo(() => {
    const values = data.flatMap((item) => [item.requests ?? 0, item.completed ?? 0, item.cancelled ?? 0])
    const maxValue = Math.max(1, ...values)
    const width = 720
    const height = 260
    const leftPad = 44
    const rightPad = 14
    const topPad = 18
    const bottomPad = 36
    const gw = width - leftPad - rightPad
    const gh = height - topPad - bottomPad
    const n = Math.max(1, data.length)
    const barW = Math.min(28, (gw / n) * 0.45)
    const step = gw / Math.max(1, n - 0.5)

    const bars = data.map((item, idx) => {
      const x = leftPad + idx * step - barW / 2
      const h = ((item.requests ?? 0) / maxValue) * gh
      const y = topPad + gh - h
      return { x, y, h, w: barW, v: item.requests ?? 0 }
    })

    const linePts = data
      .map((item, idx) => {
        const x = leftPad + idx * step
        const y = topPad + gh - ((item.completed ?? 0) / maxValue) * gh
        return `${x},${y}`
      })
      .join(' ')

    const cancelPts = data
      .map((item, idx) => {
        const x = leftPad + idx * step
        const y = topPad + gh - ((item.cancelled ?? 0) / maxValue) * gh
        return `${x},${y}`
      })
      .join(' ')

    return { width, height, leftPad, topPad, gw, gh, bars, linePts, cancelPts, maxValue, step, bottomPad }
  }, [data])

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-[#101312]/10 bg-white/80 p-6 text-sm text-[#101312]/65 backdrop-blur-sm">
        No trend data for this range.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#101312]/10 bg-gradient-to-b from-white/95 to-[#f9fce9]/90 p-5 shadow-[0_20px_50px_rgba(16,19,18,0.07)] backdrop-blur-md">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#101312]">Ride trend</h3>
          <p className="text-sm text-[#101312]/65">Bars: requests · Solid line: completed · Dashed: cancelled</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-[#101312]/75">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#876DFF]" /> Requests
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 bg-[#BAF91A]" /> Completed
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 border-t-2 border-dotted border-[#101312]/40" /> Cancelled
          </span>
        </div>
      </div>

      <svg className="h-[280px] w-full" viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label="Ride trend chart">
        <defs>
          <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#876DFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#876DFF" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#BAF91A" />
            <stop offset="100%" stopColor="#E2FF99" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = layout.topPad + layout.gh * (1 - pct)
          return (
            <line
              key={pct}
              x1={layout.leftPad}
              y1={y}
              x2={layout.width - 14}
              y2={y}
              stroke="#101312"
              strokeOpacity="0.06"
              strokeWidth="1"
            />
          )
        })}

        {layout.bars.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={Math.max(b.h, 0)} rx="6" fill="url(#reqGrad)" stroke="#876DFF" strokeOpacity="0.35" strokeWidth="1" />
        ))}

        <polyline fill="none" stroke="url(#lineGlow)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={layout.linePts} />
        <polyline fill="none" stroke="#101312" strokeWidth="1.5" strokeDasharray="5 5" strokeOpacity="0.45" points={layout.cancelPts} />

        {data.map((item, idx) => {
          const x = layout.leftPad + idx * layout.step
          return (
            <text key={item.day} x={x} y={layout.height - 10} textAnchor="middle" fill="#101312" fillOpacity="0.55" fontSize="11" fontWeight="600">
              {item.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

function VerticalBarChart({ title, subtitle, data, palette }) {
  const maxValue = Math.max(1, ...data.map((item) => item.count ?? 0))
  return (
    <div className="rounded-2xl border border-[#101312]/10 bg-white/90 p-5 shadow-[0_16px_40px_rgba(16,19,18,0.06)] backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-[#101312]">{title}</h3>
      <p className="text-sm text-[#101312]/65">{subtitle}</p>

      {!data.length ? (
        <div className="mt-6 text-sm text-[#101312]/55">No data yet.</div>
      ) : (
        <div className="mt-6">
          <div className="flex h-52 items-end gap-2 sm:gap-3">
            {data.map((item, idx) => {
              const pct = Math.max(8, Math.round(((item.count ?? 0) / maxValue) * 100))
              return (
                <div key={item.key} className="flex flex-1 flex-col items-center">
                  <div className="mb-1 text-xs font-bold text-[#101312]">{item.count ?? 0}</div>
                  <div className="relative flex h-40 w-full items-end rounded-xl bg-[#101312]/[0.04] p-1 ring-1 ring-[#101312]/08">
                    <div
                      className="w-full rounded-lg shadow-[0_8px_20px_rgba(16,19,18,0.12)] transition hover:brightness-110"
                      style={{ height: `${pct}%`, background: `linear-gradient(180deg, ${palette[idx % palette.length]} 0%, ${palette[idx % palette.length]}cc 100%)` }}
                    />
                  </div>
                  <div className="mt-2 text-center text-[11px] font-medium text-[#101312]/65">{item.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function DataTableSection({
  title,
  subtitle,
  rows,
  columns,
  expanded,
  onToggleExpand,
  emptyText,
}) {
  const visible = expanded ? rows : rows.slice(0, TABLE_PREVIEW)
  const hasMore = rows.length > TABLE_PREVIEW

  return (
    <div className="overflow-hidden rounded-2xl border border-[#101312]/10 bg-white/95 shadow-[0_20px_50px_rgba(16,19,18,0.07)] backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#101312]/08 bg-gradient-to-r from-[#E2FF99]/25 to-transparent px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-[#101312]">{title}</h2>
          <p className="text-sm text-[#101312]/65">{subtitle}</p>
        </div>
        {hasMore ? (
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#101312]/15 bg-white px-3 py-2 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]/50"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                See more ({rows.length - TABLE_PREVIEW} more) <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#101312]/08 bg-[#fafdf4] text-[11px] font-semibold uppercase tracking-wide text-[#101312]/55">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((row, ri) => (
                <tr key={row.id ?? ri} className="border-b border-[#101312]/06 align-top odd:bg-white even:bg-[#fafdf4]/40">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-[#101312]/85">
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-[#101312]/55" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function RideDashboardPage() {
  const defaults = useMemo(() => defaultRangeKeys(), [])
  const [draftFrom, setDraftFrom] = useState(defaults.from)
  const [draftTo, setDraftTo] = useState(defaults.to)
  const [appliedFrom, setAppliedFrom] = useState(defaults.from)
  const [appliedTo, setAppliedTo] = useState(defaults.to)
  const [filterError, setFilterError] = useState(null)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [actionLoadingKey, setActionLoadingKey] = useState('')
  const [sosExpanded, setSosExpanded] = useState(false)
  const [watchExpanded, setWatchExpanded] = useState(false)

  const socket = useSocketStore((s) => s.socket)
  const connect = useSocketStore((s) => s.connect)
  const refreshTimerRef = useRef(null)
  const legacyApiModeRef = useRef(false)

  const appliedRange = useMemo(() => ({ from: appliedFrom, to: appliedTo }), [appliedFrom, appliedTo])

  const loadLegacyDashboard = useCallback(async () => {
    const [{ data: requestsData }, { data: ridersData }, { data: activeTripsData }, { data: sosData }, { data: safetyData }] =
      await Promise.all([
        api.get('/admin/rides/requests'),
        api.get('/admin/riders/active'),
        api.get('/admin/trips/active'),
        api.get('/admin/sos'),
        api.get('/admin/safety/alerts'),
      ])

    return buildDashboardFromLegacy(
      {
        rideRequests: requestsData?.items ?? [],
        activeRiders: ridersData?.items ?? [],
        activeTrips: activeTripsData?.items ?? [],
        sosAlerts: sosData?.items ?? [],
        safetyAlerts: safetyData?.items ?? [],
      },
      appliedRange
    )
  }, [appliedRange])

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
          const { data: response } = await api.get('/admin/rides/dashboard', {
            params: { from: appliedFrom, to: appliedTo },
          })
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
      } catch (e) {
        const msg = e?.response?.data?.message
        const details = e?.response?.data?.details
        setError(msg || (details ? 'Invalid dashboard filters' : null) || 'Failed to load ride dashboard')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [appliedFrom, appliedTo, loadLegacyDashboard]
  )

  function applyFilters() {
    const err = validateDateRangeInput(draftFrom, draftTo)
    setFilterError(err)
    if (err) return
    setAppliedFrom(draftFrom)
    setAppliedTo(draftTo)
    setSosExpanded(false)
    setWatchExpanded(false)
  }

  useEffect(() => {
    load()
  }, [appliedFrom, appliedTo, load])

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) return
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null
      load({ silent: true })
    }, 1200)
  }, [load])

  useEffect(() => {
    const interval = setInterval(() => load({ silent: true }), 30000)
    return () => clearInterval(interval)
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
        const nextRecent = [incoming, ...existing.filter((row) => row.id !== incoming.id)].slice(0, 200)
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

    s.on('ride:sos', onSos)
    s.on('ride:request', scheduleRefresh)
    s.on('trip:status', scheduleRefresh)

    return () => {
      s.off('ride:sos', onSos)
      s.off('ride:request', scheduleRefresh)
      s.off('trip:status', scheduleRefresh)
    }
  }, [socket, connect, scheduleRefresh])

  const actOnAlert = useCallback(
    async (id, action) => {
      if (!id || !isLikelyObjectId(String(id))) {
        setError('Invalid alert id')
        return
      }
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
    },
    [load]
  )

  const kpis = data?.kpis ?? {}
  const rideStatus = data?.rideStatus ?? []
  const dailyRideTrend = data?.dailyRideTrend ?? []
  const sosSeverity = data?.sosSeverity ?? []
  const recentSos = data?.recentSos ?? []
  const safetyWatchlist = data?.safetyWatchlist ?? []
  const rangeMeta = data?.range

  const sosColumns = [
      { key: 't', label: 'Time', render: (a) => formatDateTime(a.createdAt) },
      {
        key: 'sev',
        label: 'Severity',
        render: (a) => (
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${severityTone[a.severity] ?? 'border-[#101312]/15 bg-[#101312]/05'}`}>
            {a.severity ?? '—'}
          </span>
        ),
      },
      {
        key: 'st',
        label: 'Status',
        render: (a) => (
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusTone[a.status] ?? 'border-[#101312]/15 bg-[#101312]/05'}`}>
            {a.status ?? '—'}
          </span>
        ),
      },
      {
        key: 'r',
        label: 'Rider',
        render: (a) => (
          <div>
            <div className="font-medium text-[#101312]">{a.rider?.fullName ?? shortId(a.rider?.id)}</div>
            <div className="text-xs text-[#101312]/55">{a.rider?.phone ?? '—'}</div>
            <div className="text-xs text-[#101312]/45">{a.rider?.email ?? '—'}</div>
          </div>
        ),
      },
      {
        key: 'p',
        label: 'Passenger',
        render: (a) => (
          <div>
            <div className="font-medium text-[#101312]">{a.passenger?.fullName ?? shortId(a.passenger?.id)}</div>
            <div className="text-xs text-[#101312]/55">{a.passenger?.phone ?? '—'}</div>
            <div className="text-xs text-[#101312]/45">{a.passenger?.studentId ?? '—'}</div>
          </div>
        ),
      },
      {
        key: 'trip',
        label: 'Trip',
        render: (a) => (
          <div>
            <div className="font-mono text-xs">{shortId(a.trip?.id)}</div>
            <div className="text-xs text-[#101312]/55">{a.trip?.status ?? '—'}</div>
          </div>
        ),
      },
      { key: 'msg', label: 'Message', render: (a) => <span className="text-[#101312]/80">{a.message || '—'}</span> },
      { key: 'loc', label: 'Location', render: (a) => formatLocation(a.location ?? a.trip?.currentLocation) },
      {
        key: 'act',
        label: 'Actions',
        render: (a) => {
          const ackKey = `acknowledge:${a.id}`
          const resolveKey = `resolve:${a.id}`
          return (
            <div className="flex flex-wrap gap-2">
              {a.status === 'pending' ? (
                <button
                  type="button"
                  onClick={() => actOnAlert(a.id, 'acknowledge')}
                  disabled={actionLoadingKey === ackKey}
                  className="rounded-lg border border-amber-300/80 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950 transition hover:bg-amber-100 disabled:opacity-50"
                >
                  {actionLoadingKey === ackKey ? '…' : 'Acknowledge'}
                </button>
              ) : null}
              {a.status !== 'resolved' ? (
                <button
                  type="button"
                  onClick={() => actOnAlert(a.id, 'resolve')}
                  disabled={actionLoadingKey === resolveKey}
                  className="rounded-lg border border-[#BAF91A] bg-[#E2FF99]/60 px-2.5 py-1 text-xs font-semibold text-[#101312] transition hover:bg-[#BAF91A]/50 disabled:opacity-50"
                >
                  {actionLoadingKey === resolveKey ? '…' : 'Resolve'}
                </button>
              ) : null}
            </div>
          )
        },
      },
    ]

  return (
    <AdminLayout>
      <div
        className="space-y-8"
        style={{ fontFamily: '"Poppins", "Manrope", "Trebuchet MS", sans-serif' }}
      >
        <div className="relative overflow-hidden rounded-[28px] border border-[#101312]/10 bg-gradient-to-br from-[#101312] via-[#1a2420] to-[#101312] p-6 text-white shadow-[0_24px_60px_rgba(16,19,18,0.25)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#BAF91A]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#876DFF]/20 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex max-w-xl items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#BAF91A] text-[#101312]">
                <Sparkles className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ride command center</h1>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Real-time monitoring for ride analytics, SOS alerts, and rider/passenger safety — scoped by the date
                  range you choose.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <div className="text-right text-xs text-white/60">
                <div>Last updated</div>
                <div className="font-medium text-white">{lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</div>
              </div>
              <button
                type="button"
                onClick={() => load({ silent: false })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh now
              </button>
            </div>
          </div>

          <div className="relative mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/55">
              <CalendarRange className="h-4 w-4 text-[#BAF91A]" />
              Date range (UTC)
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-white/55">From</span>
                <input
                  type="date"
                  value={draftFrom}
                  onChange={(e) => setDraftFrom(e.target.value)}
                  className="rounded-xl border border-white/15 bg-[#101312]/40 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[#BAF91A]/50"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-white/55">To</span>
                <input
                  type="date"
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                  className="rounded-xl border border-white/15 bg-[#101312]/40 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[#BAF91A]/50"
                />
              </label>
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-xl bg-[#BAF91A] px-5 py-2.5 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00]"
              >
                Apply range
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = defaultRangeKeys()
                  setDraftFrom(d.from)
                  setDraftTo(d.to)
                  setFilterError(null)
                  setAppliedFrom(d.from)
                  setAppliedTo(d.to)
                }}
                className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Last 7 days
              </button>
            </div>
            {filterError ? <p className="mt-2 text-sm text-rose-300">{filterError}</p> : null}
            {rangeMeta ? (
              <p className="mt-2 text-xs text-white/50">
                Charts &amp; SOS list use <strong className="text-white/70">{rangeMeta.from}</strong> →{' '}
                <strong className="text-white/70">{rangeMeta.to}</strong> ({rangeMeta.days} days)
              </p>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
            {error}
          </div>
        ) : null}

        {loading && !data ? (
          <div className="rounded-2xl border border-[#101312]/10 bg-white/90 p-10 text-center text-[#101312]/65 backdrop-blur-sm">
            Loading dashboard…
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Total requests" value={kpis.totalRequests ?? 0} hint="All ride requests (system)" tone="default" />
              <KpiCard label="Active trips" value={kpis.activeTrips ?? 0} hint="In motion or overdue" tone="live" />
              <KpiCard label="Online riders" value={kpis.onlineRiders ?? 0} hint="Available now" tone="live" />
              <KpiCard label="Pending SOS" value={kpis.pendingSos ?? 0} hint="Needs immediate follow-up" tone="alert" />
              <KpiCard label="Safety alerts" value={kpis.safetyAlerts ?? 0} hint="Trips with risk flags" tone="default" />
              <KpiCard label="Completed rides" value={kpis.completedRides ?? 0} hint="Lifetime completed" tone="default" />
              <KpiCard label="Cancelled rides" value={kpis.cancelledRides ?? 0} hint="Lifetime cancelled" tone="default" />
              <KpiCard label="Completion rate" value={`${kpis.completionRate ?? 0}%`} hint="Completed ÷ (completed + cancelled)" tone="default" />
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <TrendComboChart data={dailyRideTrend} />
              <VerticalBarChart title="Ride status" subtitle="Requested · accepted · completed · cancelled" data={rideStatus} palette={barPaletteRide} />
              <div className="xl:col-span-2">
                <VerticalBarChart title="SOS severity" subtitle="Urgency mix (all alerts)" data={sosSeverity} palette={barPaletteSos} />
              </div>
            </div>

            <DataTableSection
              title="Real-time SOS alerts"
              subtitle="Latest records in the selected range (up to 200 loaded). First 10 shown until you expand."
              rows={recentSos}
              columns={sosColumns}
              expanded={sosExpanded}
              onToggleExpand={() => setSosExpanded((e) => !e)}
              emptyText="No SOS alerts in this range."
            />

            <div className="overflow-hidden rounded-2xl border border-[#101312]/10 bg-white/95 shadow-[0_20px_50px_rgba(16,19,18,0.07)] backdrop-blur-md">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#101312]/08 bg-gradient-to-r from-[#876DFF]/10 to-transparent px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#101312]">Safety watchlist</h2>
                  <p className="text-sm text-[#101312]/65">Trips flagged for suspicious stop, stale updates, or overdue.</p>
                </div>
                {safetyWatchlist.length > TABLE_PREVIEW ? (
                  <button
                    type="button"
                    onClick={() => setWatchExpanded((e) => !e)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#101312]/15 bg-white px-3 py-2 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]/50"
                  >
                    {watchExpanded ? (
                      <>
                        Show less <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        See more <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                ) : null}
              </div>

              {safetyWatchlist.length ? (
                <div className="grid gap-4 p-5 lg:grid-cols-2">
                  {(watchExpanded ? safetyWatchlist : safetyWatchlist.slice(0, TABLE_PREVIEW)).map((trip) => (
                    <div
                      key={trip.id}
                      className="rounded-2xl border border-[#101312]/10 bg-gradient-to-br from-white to-[#fafdf4] p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wide text-[#101312]/45">Trip</div>
                          <div className="font-mono text-sm font-semibold text-[#101312]">{shortId(trip.id)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium uppercase tracking-wide text-[#101312]/45">Status</div>
                          <div className="text-sm font-semibold text-[#101312]">{trip.status ?? '—'}</div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl border border-[#101312]/08 bg-white/80 p-2.5">
                          <div className="text-[#101312]/50">Rider</div>
                          <div className="font-medium text-[#101312]">{trip.rider?.fullName ?? '—'}</div>
                          <div className="text-[#101312]/45">{trip.rider?.phone ?? '—'}</div>
                        </div>
                        <div className="rounded-xl border border-[#101312]/08 bg-white/80 p-2.5">
                          <div className="text-[#101312]/50">Passenger</div>
                          <div className="font-medium text-[#101312]">{trip.passenger?.fullName ?? '—'}</div>
                          <div className="text-[#101312]/45">{trip.passenger?.phone ?? '—'}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {trip.suspiciousStopFlag ? (
                          <span className="rounded-full border border-amber-300/60 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-950">
                            Suspicious stop
                          </span>
                        ) : null}
                        {trip.noUpdateFlag ? (
                          <span className="rounded-full border border-orange-300/60 bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-950">
                            No updates
                          </span>
                        ) : null}
                        {trip.status === 'overdue' ? (
                          <span className="rounded-full border border-[#876DFF]/40 bg-[#876DFF]/10 px-2 py-1 text-xs font-semibold text-[#101312]">
                            Overdue
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 text-xs text-[#101312]/55">
                        Last movement: <span className="text-[#101312]">{formatDateTime(trip.lastMovementAt)}</span>
                      </div>
                      <div className="mt-1 text-xs text-[#101312]/55">
                        Location: <span className="text-[#101312]">{formatLocation(trip.currentLocation)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-sm text-[#101312]/55">No flagged trips right now.</div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

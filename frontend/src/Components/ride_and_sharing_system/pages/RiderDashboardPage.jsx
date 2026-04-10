import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '../../../app/store/authStore'
import { rideApi } from '../services/rideApi'
import IncomingRideRequests from '../rider/IncomingRideRequests'

function StatCard({ label, value, hint, accent = 'slate' }) {
  const accents = {
    slate: 'border-slate-800 bg-slate-900/50',
    emerald: 'border-emerald-800/60 bg-emerald-950/25',
    violet: 'border-violet-800/50 bg-violet-950/30',
    amber: 'border-amber-800/50 bg-amber-950/25',
    sky: 'border-sky-800/50 bg-sky-950/25',
  }
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${accents[accent] ?? accents.slate}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-50">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  )
}

function BarRow({ label, value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="tabular-nums text-slate-300">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function RiderDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const hydrateMe = useAuthStore((s) => s.hydrateMe)
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tripActionId, setTripActionId] = useState(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await rideApi.riderDashboard()
      setDash(res.data.data ?? null)
    } catch {
      setDash(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard, user?.id])

  async function onConfirmPickup(tripId) {
    if (!tripId || user?.role !== 'rider') return
    const id = String(tripId)
    setTripActionId(id)
    try {
      await rideApi.confirmPickup(id)
      await loadDashboard()
    } finally {
      setTripActionId(null)
    }
  }

  async function onFinishTrip(tripId) {
    if (!tripId) return
    const id = String(tripId)
    setTripActionId(id)
    try {
      await rideApi.finishTrip(id)
      await loadDashboard()
    } finally {
      setTripActionId(null)
    }
  }

  const bs = dash?.byStatus ?? {}
  const maxBar = Math.max(bs.completed ?? 0, bs.accepted ?? 0, bs.cancelled ?? 0, bs.requested ?? 0, 1)
  const activeCount = dash?.activeTrips?.length ?? 0
  const isApprovedRider = user?.role === 'rider'

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/50 px-6 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">Ride Sharing Workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">Ride Dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            Monitor campus demand, active trips, and your performance. Stay online to receive requests; use the map below
            to review routes before accepting.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-sm text-slate-200">
              <span className="text-slate-500">Signed in as </span>
              <span className="font-medium">{user?.fullName ?? 'Rider'}</span>
            </div>
            <div className="rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-sm text-slate-200">
              Campus: <span className="font-medium text-violet-200">{user?.campusId ?? '—'}</span>
            </div>
            <div className="rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-sm text-slate-200">
              Vehicle:{' '}
              <span className="font-medium capitalize text-slate-100">
                {user?.vehicleType ?? '—'} {user?.vehicleNumber ? `• ${user.vehicleNumber}` : ''}
              </span>
            </div>
            {!isApprovedRider ? (
              <div className="rounded-full border border-amber-700/60 bg-amber-950/40 px-4 py-2 text-xs text-amber-200">
                Rider approval: <span className="font-semibold">{user?.riderVerificationStatus ?? 'pending'}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 text-sm text-slate-400">Loading analytics…</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Campus queue"
              value={dash?.openCampusQueue ?? 0}
              hint="Open ride requests on your campus"
              accent="violet"
            />
            <StatCard
              label="Your active trips"
              value={activeCount}
              hint={`${dash?.usedSeats ?? 0} / ${dash?.capacityPassengers ?? 0} passenger seats in use`}
              accent="emerald"
            />
            <StatCard
              label="Completed today"
              value={dash?.completedToday ?? 0}
              hint="Rides marked complete today"
              accent="sky"
            />
            <StatCard
              label="30-day completion"
              value={dash?.completionRate != null ? `${dash.completionRate}%` : '—'}
              hint={
                dash?.completionRate != null
                  ? `Completed ${dash?.completedLast30d ?? 0} vs cancelled ${dash?.cancelledLast30d ?? 0} (30d)`
                  : 'Not enough finished rides yet'
              }
              accent="amber"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-slate-100">Active trips</h2>
              {!dash?.activeTrips?.length ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/20 p-8 text-center text-sm text-slate-500">
                  No live trips. Accept a request below to start tracking pickup and drop-off.
                </div>
              ) : (
                <div className="grid gap-3">
                  {dash.activeTrips.map((t) => (
                    <div
                      key={t._id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-mono text-slate-500">Trip {String(t._id).slice(-12)}</div>
                          <div className="mt-1 text-sm font-medium capitalize text-slate-200">
                            Status: <span className="text-violet-300">{t.status?.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="mt-2 text-xs text-slate-400">
                            Seats: {t.seatCount ?? 1} • Started {t.startedAt ? new Date(t.startedAt).toLocaleString() : '—'}
                          </div>
                          {t.passengerId ? (
                            <div className="mt-2 text-xs text-slate-300">
                              Passenger: <span className="font-medium">{t.passengerId.fullName}</span> •{' '}
                              <span className="font-mono">{t.passengerId.phone ?? '—'}</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {t.status === 'to_pickup' || t.status === 'overdue' ? (
                            <button
                              type="button"
                              disabled={!isApprovedRider || tripActionId === String(t._id)}
                              onClick={() => onConfirmPickup(t._id)}
                              className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                            >
                              Confirm pickup
                            </button>
                          ) : null}
                          {t.status === 'to_university' || t.status === 'overdue' ? (
                            <button
                              type="button"
                              disabled={tripActionId === String(t._id)}
                              onClick={() => onFinishTrip(t._id)}
                              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                            >
                              Finish at campus
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-100">Performance</h2>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-slate-400">Rating</span>
                  <span className="text-2xl font-semibold text-amber-200 tabular-nums">
                    {typeof dash?.rating === 'number' ? dash.rating.toFixed(1) : '—'}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-slate-800 pt-3">
                  <span className="text-sm text-slate-400">Complaints</span>
                  <span className="text-lg font-medium text-slate-200 tabular-nums">{dash?.complaintCount ?? 0}</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-slate-800 pt-3">
                  <span className="text-sm text-slate-400">Rides accepted (30d)</span>
                  <span className="text-lg font-medium text-slate-200 tabular-nums">{dash?.acceptedLast30d ?? 0}</span>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Availability: <span className="text-slate-300">{dash?.availability ?? user?.availability ?? '—'}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <h3 className="text-sm font-semibold text-slate-200">Lifetime mix</h3>
                <p className="mt-1 text-xs text-slate-500">All-time ride request outcomes assigned to you</p>
                <div className="mt-4 space-y-4">
                  <BarRow label="Completed" value={bs.completed ?? 0} max={maxBar} />
                  <BarRow label="Accepted (active pipeline)" value={bs.accepted ?? 0} max={maxBar} />
                  <BarRow label="Cancelled" value={bs.cancelled ?? 0} max={maxBar} />
                  <BarRow label="Requested (legacy)" value={bs.requested ?? 0} max={maxBar} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  hydrateMe()
                  loadDashboard()
                }}
                className="w-full rounded-xl border border-slate-700 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                Refresh profile & analytics
              </button>
            </div>
          </div>
        </>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Operations</h2>
        <IncomingRideRequests onWorkspaceRefresh={loadDashboard} />
      </div>
    </div>
  )
}

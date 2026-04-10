import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '../../../app/store/authStore'
import { rideApi } from '../services/rideApi'
import IncomingRideRequests from '../rider/IncomingRideRequests'

function StatCard({ label, value, hint }) {
  return (
    <article className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-950 tabular-nums">{value}</div>
      {hint ? <div className="mt-2 text-xs text-slate-600">{hint}</div> : null}
    </article>
  )
}

function ProgressRow({ label, value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="tabular-nums text-slate-800">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString()
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

  const byStatus = dash?.byStatus ?? {}
  const maxBar = Math.max(byStatus.completed ?? 0, byStatus.accepted ?? 0, byStatus.cancelled ?? 0, byStatus.requested ?? 0, 1)
  const activeCount = dash?.activeTrips?.length ?? 0
  const isApprovedRider = user?.role === 'rider'

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Rider Workspace</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Ride Dashboard</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700">
          Monitor campus queue, active pickups, ride completion quality, and trip outcomes. Accept requests in real
          time and complete journey stages directly from this workspace.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-slate-300 bg-emerald-100 px-2.5 py-1 font-semibold text-slate-800">
            Rider: {user?.fullName ?? 'Rider'}
          </span>
          <span className="rounded-full border border-slate-300 bg-emerald-100 px-2.5 py-1 font-semibold text-slate-800">
            Campus: {user?.campusId ?? '-'}
          </span>
          <span className="rounded-full border border-slate-300 bg-emerald-100 px-2.5 py-1 font-semibold text-slate-800">
            Vehicle: {user?.vehicleType ?? '-'} {user?.vehicleNumber ? `(${user.vehicleNumber})` : ''}
          </span>
          {!isApprovedRider && (
            <span className="rounded-full border border-violet-300 bg-violet-50 px-2.5 py-1 font-semibold text-violet-800">
              Rider approval: {user?.riderVerificationStatus ?? 'pending'}
            </span>
          )}
        </div>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-300 bg-white p-5 text-sm text-slate-600">Loading analytics...</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Campus Queue" value={dash?.openCampusQueue ?? 0} hint="Open ride requests at your campus" />
            <StatCard
              label="Your Active Trips"
              value={activeCount}
              hint={`${dash?.usedSeats ?? 0} / ${dash?.capacityPassengers ?? 0} seats currently in use`}
            />
            <StatCard label="Completed Today" value={dash?.completedToday ?? 0} hint="Trips completed today" />
            <StatCard
              label="30-Day Completion"
              value={dash?.completionRate != null ? `${dash.completionRate}%` : '-'}
              hint={
                dash?.completionRate != null
                  ? `Completed ${dash?.completedLast30d ?? 0} vs cancelled ${dash?.cancelledLast30d ?? 0}`
                  : 'Not enough completed rides yet'
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900">Active Trips</h3>
              {!dash?.activeTrips?.length ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
                  No live trips right now. Accept a request below to start pickup and destination tracking.
                </div>
              ) : (
                <div className="grid gap-3">
                  {dash.activeTrips.map((trip) => (
                    <article key={trip._id} className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-mono text-slate-600">Trip {String(trip._id).slice(-12)}</div>
                          <div className="mt-1 text-sm font-semibold capitalize text-slate-900">
                            Status: <span className="text-violet-700">{trip.status?.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="mt-2 text-xs text-slate-700">
                            Seats: {trip.seatCount ?? 1} - Started: {formatDateTime(trip.startedAt)}
                          </div>
                          {trip.passengerId ? (
                            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700">
                              Passenger: <span className="font-semibold">{trip.passengerId.fullName}</span> -{' '}
                              <span className="font-mono">{trip.passengerId.phone ?? '-'}</span>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(trip.status === 'to_pickup' || trip.status === 'overdue') && (
                            <button
                              type="button"
                              disabled={!isApprovedRider || tripActionId === String(trip._id)}
                              onClick={() => onConfirmPickup(trip._id)}
                              className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                            >
                              Confirm pickup
                            </button>
                          )}

                          {(trip.status === 'to_university' || trip.status === 'overdue') && (
                            <button
                              type="button"
                              disabled={tripActionId === String(trip._id)}
                              onClick={() => onFinishTrip(trip._id)}
                              className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                            >
                              Finish at campus
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Performance</h3>

              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-700">Rating</span>
                  <span className="text-2xl font-semibold text-slate-900 tabular-nums">
                    {typeof dash?.rating === 'number' ? dash.rating.toFixed(1) : '-'}
                  </span>
                </div>
                <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-700">
                  Complaints: <span className="font-semibold text-slate-900">{dash?.complaintCount ?? 0}</span>
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  Accepted (30d): <span className="font-semibold text-slate-900">{dash?.acceptedLast30d ?? 0}</span>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  Availability: <span className="font-semibold text-slate-800">{dash?.availability ?? user?.availability ?? '-'}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900">Lifetime Mix</h4>
                <p className="mt-1 text-xs text-slate-600">All-time outcomes across your assigned ride requests.</p>
                <div className="mt-4 space-y-4">
                  <ProgressRow label="Completed" value={byStatus.completed ?? 0} max={maxBar} />
                  <ProgressRow label="Accepted (pipeline)" value={byStatus.accepted ?? 0} max={maxBar} />
                  <ProgressRow label="Cancelled" value={byStatus.cancelled ?? 0} max={maxBar} />
                  <ProgressRow label="Requested (legacy)" value={byStatus.requested ?? 0} max={maxBar} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  hydrateMe()
                  loadDashboard()
                }}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-emerald-100"
              >
                Refresh profile and analytics
              </button>
            </aside>
          </div>
        </>
      )}

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Operations</h3>
        <IncomingRideRequests onWorkspaceRefresh={loadDashboard} />
      </section>
    </section>
  )
}

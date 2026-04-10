import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '../../../app/store/authStore'
import { rideApi } from '../services/rideApi'
import IncomingRideRequests from '../rider/IncomingRideRequests'

function StatCard({ label, value, hint }) {
  return (
    <article className="rounded-2xl border border-[#101312]/12 bg-white p-4 shadow-[0_8px_24px_rgba(16,19,18,0.06)]">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#876DFF]">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-[#101312] tabular-nums">{value}</div>
      {hint ? <div className="mt-2 text-xs text-[#101312]/65">{hint}</div> : null}
    </article>
  )
}

function ProgressRow({ label, value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-[#101312]/70">
        <span>{label}</span>
        <span className="tabular-nums font-semibold text-[#101312]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#edf5d0]">
        <div className="h-full rounded-full bg-[#876DFF] transition-all duration-500" style={{ width: `${pct}%` }} />
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
    <section className="space-y-5">
      <div className="rounded-3xl border border-[#101312]/15 bg-white p-4 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#101312] sm:text-xl">Rider Workspace</h2>
          <button
            type="button"
            onClick={() => {
              hydrateMe()
              loadDashboard()
            }}
            className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[#101312]/15 bg-[#E2FF99] px-2.5 py-1 font-semibold text-[#101312]">
            Rider: {user?.fullName ?? 'Rider'}
          </span>
          <span className="rounded-full border border-[#101312]/15 bg-[#E2FF99] px-2.5 py-1 font-semibold text-[#101312]">
            Campus: {user?.campusId ?? '-'}
          </span>
          <span className="rounded-full border border-[#101312]/15 bg-[#E2FF99] px-2.5 py-1 font-semibold text-[#101312]">
            Vehicle: {user?.vehicleType ?? '-'} {user?.vehicleNumber ? `(${user.vehicleNumber})` : ''}
          </span>
          {!isApprovedRider ? (
            <span className="rounded-full border border-[#876DFF]/35 bg-[#876DFF]/10 px-2.5 py-1 font-semibold text-[#4a35b6]">
              Approval: {user?.riderVerificationStatus ?? 'pending'}
            </span>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[#101312]/15 bg-white p-5 text-sm text-[#101312]/65">Loading rider data...</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Campus Queue" value={dash?.openCampusQueue ?? 0} hint="Open ride requests at your campus" />
            <StatCard
              label="Active Trips"
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

          <div className="grid gap-5 lg:grid-cols-3">
            <section className="space-y-3 lg:col-span-2">
              <h3 className="text-lg font-semibold text-[#101312]">Active Trips</h3>

              {!dash?.activeTrips?.length ? (
                <div className="rounded-3xl border border-dashed border-[#101312]/25 bg-white p-6 text-center text-sm text-[#101312]/65">
                  No live trips right now. Accept a request below to start pickup and destination tracking.
                </div>
              ) : (
                <div className="grid gap-3">
                  {dash.activeTrips.map((trip) => (
                    <article key={trip._id} className="rounded-2xl border border-[#101312]/12 bg-white p-4 shadow-[0_8px_24px_rgba(16,19,18,0.06)]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-xs font-mono text-[#101312]/65">Trip {String(trip._id).slice(-12)}</div>
                          <div className="mt-1 text-sm font-semibold capitalize text-[#101312]">
                            Status:{' '}
                            <span className="rounded-full border border-[#876DFF]/35 bg-[#876DFF]/10 px-2 py-0.5 text-[11px] text-[#4a35b6]">
                              {trip.status?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-[#101312]/72">
                            Seats: {trip.seatCount ?? 1} • Started: {formatDateTime(trip.startedAt)}
                          </div>
                          {trip.passengerId ? (
                            <div className="mt-2 rounded-lg border border-[#101312]/10 bg-[#f9fce9] p-2.5 text-xs text-[#101312]/75">
                              Passenger: <span className="font-semibold text-[#101312]">{trip.passengerId.fullName}</span> •{' '}
                              <span className="font-mono">{trip.passengerId.phone ?? '-'}</span>
                            </div>
                          ) : null}
                        </div>

                        <div className="grid w-full gap-2 sm:w-auto">
                          {(trip.status === 'to_pickup' || trip.status === 'overdue') && (
                            <button
                              type="button"
                              disabled={!isApprovedRider || tripActionId === String(trip._id)}
                              onClick={() => onConfirmPickup(trip._id)}
                              className="rounded-xl border border-[#876DFF]/35 bg-[#876DFF]/10 px-3 py-2 text-xs font-semibold text-[#4a35b6] transition hover:bg-[#876DFF]/20 disabled:opacity-50"
                            >
                              Confirm pickup
                            </button>
                          )}

                          {(trip.status === 'to_university' || trip.status === 'overdue') && (
                            <button
                              type="button"
                              disabled={tripActionId === String(trip._id)}
                              onClick={() => onFinishTrip(trip._id)}
                              className="rounded-xl bg-[#BAF91A] px-3 py-2 text-xs font-semibold text-[#101312] transition hover:bg-[#a9ea00] disabled:opacity-50"
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
            </section>

            <aside className="space-y-4">
              <section className="rounded-3xl border border-[#101312]/12 bg-white p-5 shadow-[0_8px_24px_rgba(16,19,18,0.06)]">
                <h3 className="text-base font-semibold text-[#101312]">Performance</h3>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-sm text-[#101312]/75">Rating</span>
                  <span className="text-2xl font-semibold text-[#101312] tabular-nums">
                    {typeof dash?.rating === 'number' ? dash.rating.toFixed(1) : '-'}
                  </span>
                </div>
                <div className="mt-3 border-t border-[#101312]/10 pt-3 text-sm text-[#101312]/75">
                  Complaints: <span className="font-semibold text-[#101312]">{dash?.complaintCount ?? 0}</span>
                </div>
                <div className="mt-2 text-sm text-[#101312]/75">
                  Accepted (30d): <span className="font-semibold text-[#101312]">{dash?.acceptedLast30d ?? 0}</span>
                </div>
                <div className="mt-2 text-xs text-[#101312]/65">
                  Availability: <span className="font-semibold text-[#101312]">{dash?.availability ?? user?.availability ?? '-'}</span>
                </div>
              </section>

              <section className="rounded-3xl border border-[#101312]/12 bg-white p-5 shadow-[0_8px_24px_rgba(16,19,18,0.06)]">
                <h4 className="text-sm font-semibold text-[#101312]">Lifetime Mix</h4>
                <p className="mt-1 text-xs text-[#101312]/65">All-time outcomes across your assigned ride requests.</p>
                <div className="mt-4 space-y-4">
                  <ProgressRow label="Completed" value={byStatus.completed ?? 0} max={maxBar} />
                  <ProgressRow label="Accepted (pipeline)" value={byStatus.accepted ?? 0} max={maxBar} />
                  <ProgressRow label="Cancelled" value={byStatus.cancelled ?? 0} max={maxBar} />
                  <ProgressRow label="Requested (legacy)" value={byStatus.requested ?? 0} max={maxBar} />
                </div>
              </section>
            </aside>
          </div>
        </>
      )}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[#101312]">Operations</h3>
        <IncomingRideRequests onWorkspaceRefresh={loadDashboard} />
      </section>
    </section>
  )
}

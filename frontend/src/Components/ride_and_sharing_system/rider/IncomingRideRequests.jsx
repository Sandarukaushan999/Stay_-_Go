import { useEffect, useState } from 'react'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../app/store/authStore'
import { rideApi } from '../services/rideApi'
import MapPicker from '../../shared/maps/MapPicker'
import { mapsApi } from '../services/mapsApi'

function DashChip({ children }) {
  return (
    <span className="rounded-full border border-[#101312]/15 bg-white px-2 py-1 text-[11px] font-semibold text-[#101312]/75">
      {children}
    </span>
  )
}

export default function IncomingRideRequests({ onWorkspaceRefresh }) {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(null)
  const [selected, setSelected] = useState(null)
  const [routeLine, setRouteLine] = useState(null)
  const [etaSeconds, setEtaSeconds] = useState(null)
  const [availability, setAvailabilityValue] = useState(user?.availability ?? 'offline')
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  useEffect(() => {
    setAvailabilityValue(user?.availability ?? 'offline')
  }, [user?.availability])

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/ride-sharing/rides/open-requests')
      setItems(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user?.campusId])

  async function accept(id) {
    if (user?.role !== 'rider') return
    const res = await rideApi.acceptRide(id)
    const payload = res?.data?.data
    if (payload?.rideRequest) {
      setActive(payload.rideRequest)
      await selectRequest(payload.rideRequest)
    }
    await load()
    onWorkspaceRefresh?.()
  }

  async function selectRequest(r) {
    setSelected(r)
    setRouteLine(null)
    setEtaSeconds(null)
    try {
      const origin = user?.currentLocation ?? user?.vehicleOriginLocation
      if (!origin || !r?.origin) return
      const res = await mapsApi.routePreview({ origin, destination: r.origin })
      const coords = res.data.data?.geometry?.coordinates
      if (Array.isArray(coords)) setRouteLine(coords.map(([lng, lat]) => [lat, lng]))
      const dur = res.data.data?.expectedDurationSeconds
      if (typeof dur === 'number') setEtaSeconds(dur)
    } catch {
      // Keep UI stable on route preview failure.
    }
  }

  async function setAvailability(next) {
    if (user?.role !== 'rider') return
    setAvailabilityLoading(true)
    try {
      await api.put('/ride-sharing/profile/me/availability', { availability: next })
      setAvailabilityValue(next)
      onWorkspaceRefresh?.()
    } finally {
      setAvailabilityLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border border-[#101312]/15 bg-white p-4 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-5">
      <div className="rounded-2xl border border-[#101312]/12 bg-[#f9fce9] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-[#101312]">Availability</div>
            <div className="text-xs text-[#101312]/65">
              {user?.role === 'rider'
                ? 'Set online to receive new campus requests.'
                : `Waiting for admin approval (${user?.riderVerificationStatus ?? 'pending'}).`}
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
            <button
              type="button"
              disabled={availabilityLoading || user?.role !== 'rider'}
              onClick={() => setAvailability('offline')}
              className={
                availability === 'offline'
                  ? 'rounded-xl bg-[#101312] px-3 py-2 text-sm font-semibold text-white'
                  : 'rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]'
              }
            >
              Offline
            </button>
            <button
              type="button"
              disabled={availabilityLoading || user?.role !== 'rider'}
              onClick={() => setAvailability('online')}
              className={
                availability === 'online'
                  ? 'rounded-xl bg-[#BAF91A] px-3 py-2 text-sm font-semibold text-[#101312]'
                  : 'rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]'
              }
            >
              Online
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#101312]">Incoming Ride Requests</h3>
          <p className="text-xs text-[#101312]/65">Open requests from your campus with route preview and passenger detail.</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await load()
            onWorkspaceRefresh?.()
          }}
          className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
        >
          Refresh
        </button>
      </div>

      {loading ? <div className="mt-3 text-sm text-[#101312]/65">Loading...</div> : null}

      {active?.origin ? (
        <div className="mt-4 rounded-2xl border border-[#BAF91A]/45 bg-[#E2FF99] p-4">
          <div className="text-sm font-semibold text-[#101312]">Current Pickup</div>
          <div className="mt-1 text-xs text-[#101312]/72">
            Job ID <span className="font-mono">{String(active._id)}</span> • Seats: {active.seatCount ?? 1}
          </div>
          {active?.passengerId ? (
            <div className="mt-2 rounded-lg border border-[#101312]/10 bg-white p-3 text-xs text-[#101312]/75">
              <div>
                Passenger: <span className="font-semibold text-[#101312]">{active.passengerId.fullName ?? '-'}</span>
              </div>
              <div className="mt-1">
                Mobile: <span className="font-mono">{active.passengerId.phone ?? '-'}</span> • Student ID:{' '}
                <span className="font-mono">{active.passengerId.studentId ?? '-'}</span>
              </div>
              <div className="mt-1">
                Emergency: <span className="font-mono">{active.passengerId.emergencyContact ?? '-'}</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {selected?.origin ? (
        <div className="mt-4 rounded-2xl border border-[#101312]/12 bg-[#f9fce9] p-3 sm:p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#101312]/72">
            <div>Fastest route to passenger pickup</div>
            {typeof etaSeconds === 'number' ? <div>ETA: {Math.max(1, Math.round(etaSeconds / 60))} min</div> : null}
          </div>
          <MapPicker
            value={selected.origin}
            readonly
            polyline={routeLine}
            height={250}
            valueIconKind="pickup"
            markers={
              user?.currentLocation?.lat && user?.currentLocation?.lng
                ? [{ ...user.currentLocation, label: 'You (Rider)', iconKind: 'rider' }]
                : user?.vehicleOriginLocation?.lat && user?.vehicleOriginLocation?.lng
                  ? [{ ...user.vehicleOriginLocation, label: 'Start', iconKind: 'rider' }]
                  : []
            }
          />
        </div>
      ) : null}

      {items.length ? (
        <div className="mt-4 grid gap-3">
          {items.map((r) => (
            <article key={r._id} className="rounded-2xl border border-[#101312]/12 bg-[#f9fce9] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-[#101312]">
                  Job ID <span className="font-mono text-xs">{String(r._id)}</span>
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => selectRequest(r)}
                    className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
                  >
                    View route
                  </button>
                  <button
                    type="button"
                    onClick={() => accept(r._id)}
                    disabled={user?.role !== 'rider' || r.canAccept === false}
                    className="rounded-xl bg-[#BAF91A] px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00] disabled:opacity-60"
                  >
                    Accept
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <DashChip>Seats: {r.seatCount}</DashChip>
                <DashChip>Remaining: {r.remainingSeats ?? '-'}</DashChip>
                <DashChip>Female only: {r.femaleOnly ? 'yes' : 'no'}</DashChip>
              </div>

              {r.passengerId ? (
                <div className="mt-3 rounded-lg border border-[#101312]/10 bg-white p-3 text-xs text-[#101312]/75">
                  <div>
                    Passenger: <span className="font-semibold text-[#101312]">{r.passengerId.fullName ?? '-'}</span>
                  </div>
                  <div className="mt-1">
                    Mobile: <span className="font-mono">{r.passengerId.phone ?? '-'}</span> • Student ID:{' '}
                    <span className="font-mono">{r.passengerId.studentId ?? '-'}</span>
                  </div>
                  <div className="mt-1">
                    Emergency: <span className="font-mono">{r.passengerId.emergencyContact ?? '-'}</span>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-[#101312]/10 bg-[#f9fce9] p-4 text-sm text-[#101312]/65">No open requests.</div>
      )}
    </section>
  )
}

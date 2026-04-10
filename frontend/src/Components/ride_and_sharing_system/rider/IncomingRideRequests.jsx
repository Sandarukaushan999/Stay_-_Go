import { useEffect, useState } from 'react'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../app/store/authStore'
import { rideApi } from '../services/rideApi'
import MapPicker from '../../shared/maps/MapPicker'
import { mapsApi } from '../services/mapsApi'

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
      // Use rider current location if present; otherwise vehicle origin/start.
      const origin = user?.currentLocation ?? user?.vehicleOriginLocation
      if (!origin || !r?.origin) return
      const res = await mapsApi.routePreview({ origin, destination: r.origin })
      const coords = res.data.data?.geometry?.coordinates
      if (Array.isArray(coords)) {
        setRouteLine(coords.map(([lng, lat]) => [lat, lng]))
      }
      const dur = res.data.data?.expectedDurationSeconds
      if (typeof dur === 'number') setEtaSeconds(dur)
    } catch {
      // ignore
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-200">Availability</div>
            <div className="text-xs text-slate-400">
              {user?.role === 'rider'
                ? 'Set online to receive requests.'
                : `Waiting for admin approval (${user?.riderVerificationStatus ?? 'pending'}).`}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={availabilityLoading || user?.role !== 'rider'}
              onClick={() => setAvailability('offline')}
              className={
                availability === 'offline'
                  ? 'rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900'
                  : 'rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900'
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
                  ? 'rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white'
                  : 'rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900'
              }
            >
              Online
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Ride Requests</div>
          <div className="text-sm text-slate-400">Open requests from your campus.</div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await load()
            onWorkspaceRefresh?.()
          }}
          className="rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
        >
          Refresh
        </button>
      </div>

      {loading ? <div className="mt-3 text-sm text-slate-400">Loading...</div> : null}

      {active?.origin ? (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <div className="text-sm font-semibold text-slate-200">Current pickup</div>
          <div className="mt-1 text-xs text-slate-400">
            Job ID <span className="font-mono">{String(active._id)}</span> • Seats: {active.seatCount ?? 1}
          </div>
          {active?.passengerId ? (
            <div className="mt-2 text-xs text-slate-300">
              <div>
                Passenger: <span className="font-medium">{active.passengerId.fullName ?? '—'}</span>
              </div>
              <div>
                Mobile: <span className="font-mono">{active.passengerId.phone ?? '—'}</span> • Student ID:{' '}
                <span className="font-mono">{active.passengerId.studentId ?? '—'}</span>
              </div>
              <div>
                Emergency: <span className="font-mono">{active.passengerId.emergencyContact ?? '—'}</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {selected?.origin ? (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-300">
            <div>Fastest route to passenger pickup</div>
            {typeof etaSeconds === 'number' ? (
              <div className="text-xs text-slate-400">ETA: {Math.max(1, Math.round(etaSeconds / 60))} min</div>
            ) : null}
          </div>
          <MapPicker
            value={selected.origin}
            readonly
            polyline={routeLine}
            height={240}
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
        <div className="mt-3 grid gap-2">
          {items.map((r) => (
            <div key={r._id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-200">
                  Job ID <span className="font-mono text-xs">{String(r._id)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => selectRequest(r)}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
                  >
                    View route
                  </button>
                  <button
                    type="button"
                    onClick={() => accept(r._id)}
                    disabled={user?.role !== 'rider' || r.canAccept === false}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    Accept
                  </button>
                </div>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Seats needed: {r.seatCount} • Remaining seats: {r.remainingSeats ?? '—'} • Female only:{' '}
                {r.femaleOnly ? 'yes' : 'no'}
              </div>

              {r.passengerId ? (
                <div className="mt-2 text-xs text-slate-300">
                  <div>
                    Passenger: <span className="font-medium">{r.passengerId.fullName ?? '—'}</span>
                  </div>
                  <div>
                    Mobile: <span className="font-mono">{r.passengerId.phone ?? '—'}</span> • Student ID:{' '}
                    <span className="font-mono">{r.passengerId.studentId ?? '—'}</span>
                  </div>
                  <div>
                    Emergency: <span className="font-mono">{r.passengerId.emergencyContact ?? '—'}</span>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 text-sm text-slate-400">No open requests.</div>
      )}
    </div>
  )
}


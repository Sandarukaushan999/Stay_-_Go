import { useEffect, useMemo, useState } from 'react'
import api from '../../../lib/axios'
import { mapsApi } from '../services/mapsApi'
import MapPicker from '../../shared/maps/MapPicker'
import { rideApi } from '../services/rideApi'
import { useAuthStore } from '../../../app/store/authStore'
import PassengerSafetyCountdown from './PassengerSafetyCountdown'

const SLIIT = { lat: 6.9147, lng: 79.9720 }

function toLatLngLine(coords) {
  if (!Array.isArray(coords)) return null
  return coords.map(([lng, lat]) => [lat, lng])
}

export default function PassengerLiveTripMap() {
  const user = useAuthStore((s) => s.user)
  const [trip, setTrip] = useState(null)
  const [legToPickup, setLegToPickup] = useState(null)
  const [legToCampus, setLegToCampus] = useState(null)
  const [etaToPickup, setEtaToPickup] = useState(null)
  const [etaToCampus, setEtaToCampus] = useState(null)
  const [requestPickup, setRequestPickup] = useState(null)
  const [requestSeatCount, setRequestSeatCount] = useState(1)
  const [requestFemaleOnly, setRequestFemaleOnly] = useState(false)
  const [requestPreview, setRequestPreview] = useState(null)
  const [requestMessage, setRequestMessage] = useState(null)

  async function load() {
    try {
      const res = await api.get('/ride-sharing/trips/my-active')
      setTrip(res.data.data || null)
    } catch {
      // If auth expires or backend temporarily restarts, don't crash the UI.
      setTrip(null)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (user?.residenceLocation?.lat && user?.residenceLocation?.lng) {
      setRequestPickup(user.residenceLocation)
    } else {
      setRequestPickup({ lat: 6.9271, lng: 79.8612 })
    }
  }, [user?.residenceLocation?.lat, user?.residenceLocation?.lng])

  const pickup = useMemo(() => trip?.origin ?? null, [trip?._id])
  const riderLoc = useMemo(() => trip?.currentLocation ?? null, [trip?.currentLocation?.lat, trip?.currentLocation?.lng])
  const status = trip?.status

  useEffect(() => {
    async function build() {
      setLegToPickup(null)
      setLegToCampus(null)
      setEtaToPickup(null)
      setEtaToCampus(null)
      if (!trip || !pickup?.lat || !pickup?.lng) return

      // Red: rider -> passenger pickup (while coming / overdue)
      if (riderLoc?.lat && riderLoc?.lng && (status === 'to_pickup' || status === 'overdue')) {
        const r1 = await mapsApi.routePreview({ origin: riderLoc, destination: pickup })
        const coords1 = r1.data.data?.geometry?.coordinates
        setLegToPickup(toLatLngLine(coords1))
        setEtaToPickup(r1.data.data?.expectedDurationSeconds ?? null)
      }

      // Blue: pickup -> SLIIT (always show for active trip planning)
      if (status === 'to_pickup' || status === 'to_university' || status === 'overdue') {
        const r2 = await mapsApi.routePreview({ origin: pickup, destination: SLIIT })
        const coords2 = r2.data.data?.geometry?.coordinates
        setLegToCampus(toLatLngLine(coords2))
        setEtaToCampus(r2.data.data?.expectedDurationSeconds ?? null)
      }
    }
    build().catch(() => {})
  }, [trip?._id, pickup?.lat, pickup?.lng, riderLoc?.lat, riderLoc?.lng, status])

  async function previewRequestRoute() {
    if (!requestPickup) return
    setRequestPreview(null)
    const res = await mapsApi.routePreview({ origin: requestPickup, destination: SLIIT })
    setRequestPreview(res.data.data ?? null)
  }

  async function submitRequest() {
    if (!requestPickup) return
    setRequestMessage(null)
    const payload = {
      origin: requestPickup,
      destination: SLIIT,
      seatCount: Number(requestSeatCount ?? 1),
      femaleOnly: Boolean(requestFemaleOnly),
    }
    const res = await rideApi.requestRide(payload)
    setRequestMessage(`Ride request created: ${res.data.data._id}`)
    await load()
  }

  const polylines = [
    legToPickup ? { positions: legToPickup, color: '#ef4444', weight: 6, opacity: 0.95 } : null, // red
    legToCampus ? { positions: legToCampus, color: '#3b82f6', weight: 6, opacity: 0.95 } : null, // blue
  ].filter(Boolean)

  // Pickup uses `value` on MapPicker (passenger icon); avoid duplicating that marker here.
  const markers = [
    trip && riderLoc?.lat && riderLoc?.lng ? { ...riderLoc, label: 'Rider', iconKind: 'rider' } : null,
    { ...SLIIT, label: 'SLIIT', iconKind: 'uni' },
  ].filter(Boolean)

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Live Trip</div>
          {trip ? (
            <div className="mt-1 text-xs text-slate-400">
              Status: {trip.status} • Trip ID <span className="font-mono">{String(trip._id)}</span>
            </div>
          ) : (
            <div className="mt-1 text-xs text-slate-400">No active trip yet. Use Ride Request below.</div>
          )}
          {trip?.riderId ? (
            <div className="mt-2 text-xs text-slate-300">
              Rider: <span className="font-medium">{trip.riderId.fullName ?? '—'}</span> •{' '}
              <span className="font-mono">{trip.riderId.phone ?? '—'}</span> • {trip.riderId.vehicleType ?? 'vehicle'}{' '}
              {trip.riderId.vehicleNumber ? `(${trip.riderId.vehicleNumber})` : ''}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
        >
          Refresh
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        {status === 'to_pickup' ? (
          <div>
            Rider → your pickup route (red){' '}
            {typeof etaToPickup === 'number' ? <span>• ETA {Math.max(1, Math.round(etaToPickup / 60))} min</span> : null}
          </div>
        ) : null}
        {status === 'to_university' ? (
          <div>
            Pickup → SLIIT route (blue){' '}
            {typeof etaToCampus === 'number' ? <span>• ETA {Math.max(1, Math.round(etaToCampus / 60))} min</span> : null}
          </div>
        ) : null}
        {status === 'to_pickup' || status === 'overdue' ? (
          <div>
            Pickup → SLIIT route (blue){' '}
            {typeof etaToCampus === 'number' ? <span>• ETA {Math.max(1, Math.round(etaToCampus / 60))} min</span> : null}
          </div>
        ) : null}
      </div>

      {trip && ['to_pickup', 'to_university', 'overdue'].includes(trip.status) ? (
        <PassengerSafetyCountdown
          tripId={String(trip._id)}
          tripStatus={trip.status}
          etaToPickupSec={etaToPickup}
          etaToCampusSec={etaToCampus}
          pickupLocation={pickup?.lat != null && pickup?.lng != null ? pickup : null}
        />
      ) : null}

      <div className="mt-3">
        <MapPicker
          value={(pickup?.lat && pickup?.lng ? pickup : requestPickup) ?? null}
          onChange={(v) => setRequestPickup(v)}
          readonly={Boolean(trip)}
          polylines={polylines}
          markers={markers}
          valueIconKind="pickup"
          height={360}
        />
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
        <div className="text-sm font-semibold text-slate-200">Ride Request</div>
        <div className="mt-1 text-xs text-slate-400">Single map mode: select pickup on the map above, destination is SLIIT.</div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-slate-300">Seats</span>
            <input
              type="number"
              min="1"
              max="4"
              value={requestSeatCount}
              onChange={(e) => setRequestSeatCount(Number(e.target.value))}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200 sm:mt-6">
            <input
              type="checkbox"
              checked={requestFemaleOnly}
              onChange={(e) => setRequestFemaleOnly(e.target.checked)}
            />
            Female only
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={previewRequestRoute}
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900 disabled:opacity-60"
            disabled={!requestPickup}
          >
            Preview Route
          </button>
          <button
            type="button"
            onClick={submitRequest}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
            disabled={!requestPickup}
          >
            Request Ride
          </button>
        </div>

        {requestPreview ? (
          <div className="mt-2 text-sm text-slate-300">
            Distance {(requestPreview.distanceMeters / 1000).toFixed(2)} km • ETA{' '}
            {Math.max(1, Math.round((requestPreview.expectedDurationSeconds ?? 0) / 60))} min
          </div>
        ) : null}
        {requestMessage ? <div className="mt-2 text-sm text-slate-400">{requestMessage}</div> : null}
      </div>
    </section>
  )
}


import { useEffect, useState } from 'react'
import api from '../../../lib/axios'
import { mapsApi } from '../services/mapsApi'
import MapPicker from '../../shared/maps/MapPicker'
import { rideApi } from '../services/rideApi'
import { useAuthStore } from '../../../app/store/authStore'
import PassengerSafetyCountdown from './PassengerSafetyCountdown'

const SLIIT = { lat: 6.9147, lng: 79.9720 }
const PICKUP_ROUTE_COLOR = '#876DFF'
const CAMPUS_ROUTE_COLOR = '#BAF91A'

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
  const [requestPickup, setRequestPickup] = useState(() =>
    user?.residenceLocation?.lat && user?.residenceLocation?.lng ? user.residenceLocation : null
  )
  const [requestSeatCount, setRequestSeatCount] = useState(1)
  const [requestFemaleOnly, setRequestFemaleOnly] = useState(false)
  const [requestPreview, setRequestPreview] = useState(null)
  const [requestMessage, setRequestMessage] = useState(null)

  const fallbackPickup =
    user?.residenceLocation?.lat && user?.residenceLocation?.lng
      ? user.residenceLocation
      : { lat: 6.9271, lng: 79.8612 }

  async function load() {
    try {
      const res = await api.get('/ride-sharing/trips/my-active')
      setTrip(res.data.data || null)
    } catch {
      // If auth expires or backend temporarily restarts, do not crash the UI.
      setTrip(null)
    }
  }

  useEffect(() => {
    const initial = setTimeout(() => {
      load().catch(() => {})
    }, 0)
    const t = setInterval(() => {
      load().catch(() => {})
    }, 4000)
    return () => {
      clearTimeout(initial)
      clearInterval(t)
    }
  }, [])

  const pickup = trip?.origin ?? null
  const riderLoc = trip?.currentLocation ?? null
  const status = trip?.status

  useEffect(() => {
    async function build() {
      const activeTrip = trip
      const pickupPoint = activeTrip?.origin ?? null
      const riderPoint = activeTrip?.currentLocation ?? null
      const tripStatus = activeTrip?.status
      setLegToPickup(null)
      setLegToCampus(null)
      setEtaToPickup(null)
      setEtaToCampus(null)
      if (!activeTrip || !pickupPoint?.lat || !pickupPoint?.lng) return

      if (riderPoint?.lat && riderPoint?.lng && (tripStatus === 'to_pickup' || tripStatus === 'overdue')) {
        const r1 = await mapsApi.routePreview({ origin: riderPoint, destination: pickupPoint })
        const coords1 = r1.data.data?.geometry?.coordinates
        setLegToPickup(toLatLngLine(coords1))
        setEtaToPickup(r1.data.data?.expectedDurationSeconds ?? null)
      }

      if (tripStatus === 'to_pickup' || tripStatus === 'to_university' || tripStatus === 'overdue') {
        const r2 = await mapsApi.routePreview({ origin: pickupPoint, destination: SLIIT })
        const coords2 = r2.data.data?.geometry?.coordinates
        setLegToCampus(toLatLngLine(coords2))
        setEtaToCampus(r2.data.data?.expectedDurationSeconds ?? null)
      }
    }
    build().catch(() => {})
  }, [trip])

  async function previewRequestRoute() {
    const pickupPoint = requestPickup ?? fallbackPickup
    if (!pickupPoint) return
    setRequestPreview(null)
    const res = await mapsApi.routePreview({ origin: pickupPoint, destination: SLIIT })
    setRequestPreview(res.data.data ?? null)
  }

  async function submitRequest() {
    const pickupPoint = requestPickup ?? fallbackPickup
    if (!pickupPoint) return
    setRequestMessage(null)
    const payload = {
      origin: pickupPoint,
      destination: SLIIT,
      seatCount: Number(requestSeatCount ?? 1),
      femaleOnly: Boolean(requestFemaleOnly),
    }
    const res = await rideApi.requestRide(payload)
    setRequestMessage(`Ride request created: ${res.data.data._id}`)
    await load()
  }

  const polylines = [
    legToPickup ? { positions: legToPickup, color: PICKUP_ROUTE_COLOR, weight: 6, opacity: 0.95 } : null,
    legToCampus ? { positions: legToCampus, color: CAMPUS_ROUTE_COLOR, weight: 6, opacity: 0.95 } : null,
  ].filter(Boolean)

  // Pickup uses `value` in MapPicker (passenger icon), so keep markers list clean.
  const markers = [
    trip && riderLoc?.lat && riderLoc?.lng ? { ...riderLoc, label: 'Rider', iconKind: 'rider' } : null,
    { ...SLIIT, label: 'SLIIT', iconKind: 'uni' },
  ].filter(Boolean)

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-950">Live Trip</div>
          {trip ? (
            <div className="mt-1 text-xs text-slate-600">
              Status: {trip.status} - Trip ID <span className="font-mono">{String(trip._id)}</span>
            </div>
          ) : (
            <div className="mt-1 text-xs text-slate-600">No active trip yet. Use Ride Request below.</div>
          )}
          {trip?.riderId ? (
            <div className="mt-2 text-xs text-slate-700">
              Rider: <span className="font-medium">{trip.riderId.fullName ?? '--'}</span> -{' '}
              <span className="font-mono">{trip.riderId.phone ?? '--'}</span> - {trip.riderId.vehicleType ?? 'vehicle'}{' '}
              {trip.riderId.vehicleNumber ? `(${trip.riderId.vehicleNumber})` : ''}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 transition hover:bg-emerald-100"
        >
          Refresh
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-600">
        {status === 'to_pickup' ? (
          <div>
            Rider to your pickup route (violet){' '}
            {typeof etaToPickup === 'number' ? <span>- ETA {Math.max(1, Math.round(etaToPickup / 60))} min</span> : null}
          </div>
        ) : null}
        {status === 'to_university' ? (
          <div>
            Pickup to SLIIT route (lime){' '}
            {typeof etaToCampus === 'number' ? <span>- ETA {Math.max(1, Math.round(etaToCampus / 60))} min</span> : null}
          </div>
        ) : null}
        {status === 'to_pickup' || status === 'overdue' ? (
          <div>
            Pickup to SLIIT route (lime){' '}
            {typeof etaToCampus === 'number' ? <span>- ETA {Math.max(1, Math.round(etaToCampus / 60))} min</span> : null}
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
          value={(pickup?.lat && pickup?.lng ? pickup : requestPickup ?? fallbackPickup) ?? null}
          onChange={(v) => setRequestPickup(v)}
          readonly={Boolean(trip)}
          polylines={polylines}
          markers={markers}
          valueIconKind="pickup"
          height={360}
        />
      </div>

      <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4">
        <div className="text-sm font-semibold text-slate-900">Ride Request</div>
        <div className="mt-1 text-xs text-slate-600">Single map mode: select pickup on the map above, destination is SLIIT.</div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Seats</span>
            <input
              type="number"
              min="1"
              max="4"
              value={requestSeatCount}
              onChange={(e) => setRequestSeatCount(Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-800 sm:mt-6">
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
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 transition hover:bg-emerald-100 disabled:opacity-60"
            disabled={!requestPickup && !fallbackPickup}
          >
            Preview Route
          </button>
          <button
            type="button"
            onClick={submitRequest}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
            disabled={!requestPickup && !fallbackPickup}
          >
            Request Ride
          </button>
        </div>

        {requestPreview ? (
          <div className="mt-2 text-sm text-slate-700">
            Distance {(requestPreview.distanceMeters / 1000).toFixed(2)} km - ETA{' '}
            {Math.max(1, Math.round((requestPreview.expectedDurationSeconds ?? 0) / 60))} min
          </div>
        ) : null}
        {requestMessage ? <div className="mt-2 text-sm text-slate-700">{requestMessage}</div> : null}
      </div>
    </section>
  )
}

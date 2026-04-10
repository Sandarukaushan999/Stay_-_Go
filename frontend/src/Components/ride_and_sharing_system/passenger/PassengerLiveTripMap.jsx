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
  const [requestError, setRequestError] = useState(null)

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
    setRequestError(null)
    try {
      const res = await mapsApi.routePreview({ origin: pickupPoint, destination: SLIIT })
      setRequestPreview(res.data.data ?? null)
    } catch (err) {
      setRequestError(err?.response?.data?.message ?? 'Could not preview route right now.')
    }
  }

  async function submitRequest() {
    const pickupPoint = requestPickup ?? fallbackPickup
    if (!pickupPoint) return
    setRequestMessage(null)
    setRequestError(null)
    const payload = {
      origin: pickupPoint,
      destination: SLIIT,
      seatCount: Number(requestSeatCount ?? 1),
      femaleOnly: Boolean(requestFemaleOnly),
    }
    try {
      const res = await rideApi.requestRide(payload)
      setRequestMessage(`Ride request created: ${res.data.data._id}`)
      await load()
    } catch (err) {
      setRequestError(err?.response?.data?.message ?? 'Could not create ride request.')
    }
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
    <section className="overflow-hidden rounded-3xl border border-[#101312]/15 bg-white shadow-[0_10px_30px_rgba(16,19,18,0.08)]">
      <div className="border-b border-[#101312]/10 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-base font-semibold text-[#101312] sm:text-lg">Live Trip</div>
              {trip ? (
                <span className="rounded-full border border-[#101312]/15 bg-[#E2FF99] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#101312]">
                  {trip.status?.replace(/_/g, ' ')}
                </span>
              ) : (
                <span className="rounded-full border border-[#101312]/15 bg-[#f6f8ef] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#101312]/70">
                  No active trip
                </span>
              )}
            </div>

            {trip ? (
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-[#101312]/15 bg-white px-2 py-1 font-mono text-[#101312]/75">
                  {String(trip._id).slice(-12)}
                </span>
                {trip?.riderId?.fullName ? (
                  <span className="rounded-full border border-[#101312]/15 bg-white px-2 py-1 text-[#101312]/75">
                    {trip.riderId.fullName}
                  </span>
                ) : null}
                {trip?.riderId?.phone ? (
                  <span className="rounded-full border border-[#101312]/15 bg-white px-2 py-1 font-mono text-[#101312]/75">
                    {trip.riderId.phone}
                  </span>
                ) : null}
                <span className="rounded-full border border-[#101312]/15 bg-white px-2 py-1 text-[#101312]/75">
                  {trip?.riderId?.vehicleType ?? 'vehicle'} {trip?.riderId?.vehicleNumber ? `(${trip.riderId.vehicleNumber})` : ''}
                </span>
              </div>
            ) : (
              <div className="mt-2 text-xs text-[#101312]/65">Create a request below to start live tracking.</div>
            )}
          </div>

          <button
            type="button"
            onClick={load}
            className="w-full rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99] sm:w-auto"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#101312]/72">
          {status === 'to_pickup' ? (
            <span className="rounded-full border border-[#876DFF]/35 bg-[#876DFF]/10 px-2 py-1 font-medium text-[#4a35b6]">
              Rider to pickup route
              {typeof etaToPickup === 'number' ? ` • ETA ${Math.max(1, Math.round(etaToPickup / 60))} min` : ''}
            </span>
          ) : null}
          {status === 'to_university' || status === 'to_pickup' || status === 'overdue' ? (
            <span className="rounded-full border border-[#BAF91A]/45 bg-[#E2FF99] px-2 py-1 font-medium text-[#101312]">
              Pickup to SLIIT route
              {typeof etaToCampus === 'number' ? ` • ETA ${Math.max(1, Math.round(etaToCampus / 60))} min` : ''}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <MapPicker
          value={(pickup?.lat && pickup?.lng ? pickup : requestPickup ?? fallbackPickup) ?? null}
          onChange={(v) => setRequestPickup(v)}
          readonly={Boolean(trip)}
          polylines={polylines}
          markers={markers}
          valueIconKind="pickup"
          height={340}
        />
      </div>

      {trip && ['to_pickup', 'to_university', 'overdue'].includes(trip.status) ? (
        <div className="px-3 pb-3 sm:px-5 sm:pb-5">
          <PassengerSafetyCountdown
            tripId={String(trip._id)}
            tripStatus={trip.status}
            etaToPickupSec={etaToPickup}
            etaToCampusSec={etaToCampus}
            pickupLocation={pickup?.lat != null && pickup?.lng != null ? pickup : null}
          />
        </div>
      ) : null}

      <div className="border-t border-[#101312]/10 bg-[#f9fce9] p-4 sm:p-5">
        <div className="text-sm font-semibold text-[#101312]">Ride Request</div>
        <div className="mt-1 text-xs text-[#101312]/65">Select your pickup on map. Destination is fixed to SLIIT.</div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-[#101312]/80">Seats</span>
            <input
              type="number"
              min="1"
              max="4"
              value={requestSeatCount}
              onChange={(e) => setRequestSeatCount(Number(e.target.value))}
              className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-[#101312]/15 bg-white px-3 py-2 text-sm text-[#101312] sm:self-end">
            <input
              type="checkbox"
              checked={requestFemaleOnly}
              onChange={(e) => setRequestFemaleOnly(e.target.checked)}
              className="h-4 w-4 accent-[#876DFF]"
            />
            Female only
          </label>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={previewRequestRoute}
            className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99] disabled:opacity-60"
            disabled={!requestPickup && !fallbackPickup}
          >
            Preview Route
          </button>
          <button
            type="button"
            onClick={submitRequest}
            className="rounded-xl bg-[#BAF91A] px-4 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00] disabled:opacity-60"
            disabled={!requestPickup && !fallbackPickup}
          >
            Request Ride
          </button>
        </div>

        {requestPreview ? (
          <div className="mt-2 rounded-lg border border-[#101312]/10 bg-white p-2.5 text-sm text-[#101312]/75">
            Distance {(requestPreview.distanceMeters / 1000).toFixed(2)} km • ETA{' '}
            {Math.max(1, Math.round((requestPreview.expectedDurationSeconds ?? 0) / 60))} min
          </div>
        ) : null}
        {requestMessage ? (
          <div className="mt-2 rounded-lg border border-[#101312]/10 bg-white p-2.5 text-sm text-[#101312]/75">{requestMessage}</div>
        ) : null}
        {requestError ? (
          <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-sm text-rose-700">{requestError}</div>
        ) : null}
      </div>
    </section>
  )
}

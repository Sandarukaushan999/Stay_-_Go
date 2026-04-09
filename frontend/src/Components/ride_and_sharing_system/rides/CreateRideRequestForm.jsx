import { useEffect, useState } from 'react'
import { rideApi } from '../services/rideApi'
import { mapsApi } from '../services/mapsApi'
import MapPicker from '../../shared/maps/MapPicker'
import { useAuthStore } from '../../../app/store/authStore'

export default function CreateRideRequestForm({ onPickupChange }) {
  const user = useAuthStore((s) => s.user)

  const [form, setForm] = useState({
    campusId: '',
    seatCount: 1,
    femaleOnly: false,
    origin: user?.residenceLocation ?? { lat: 6.9271, lng: 79.8612 },
    destination: { lat: 6.9271, lng: 79.8612 },
  })
  const [route, setRoute] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (user?.campusId) setForm((p) => ({ ...p, campusId: user.campusId }))
    if (user?.residenceLocation) setForm((p) => ({ ...p, origin: user.residenceLocation }))
  }, [user?.campusId, user?.residenceLocation])

  useEffect(() => {
    onPickupChange?.(form.origin)
  }, [form.origin?.lat, form.origin?.lng])

  async function previewRoute() {
    const res = await mapsApi.routePreview({ origin: form.origin, destination: form.destination })
    setRoute(res.data.data)
  }

  async function submit(e) {
    e.preventDefault()
    setMessage(null)
    const res = await rideApi.requestRide(form)
    setMessage(`Ride request created: ${res.data.data._id}`)
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Request a Ride</h3>
        <button
          type="button"
          onClick={previewRoute}
          className="rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
        >
          Preview Route
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <div className="text-sm text-slate-300 mb-2">Pickup location</div>
          <MapPicker value={form.origin} onChange={(v) => setForm((p) => ({ ...p, origin: v }))} height={260} />
        </div>

        <div>
          <div className="text-sm text-slate-300 mb-2">Destination (University)</div>
          <MapPicker value={form.destination} onChange={(v) => setForm((p) => ({ ...p, destination: v }))} height={260} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Seats</span>
          <input
            type="number"
            min="1"
            max="4"
            value={form.seatCount}
            onChange={(e) => setForm((p) => ({ ...p, seatCount: Number(e.target.value) }))}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-200 sm:mt-6">
          <input
            type="checkbox"
            checked={form.femaleOnly}
            onChange={(e) => setForm((p) => ({ ...p, femaleOnly: e.target.checked }))}
          />
          Female only
        </label>
      </div>

      {route ? (
        <div className="mt-3 text-sm text-slate-300">
          Distance {(route.distanceMeters / 1000).toFixed(2)} km • ETA {Math.round(route.expectedDurationSeconds / 60)} min
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500" type="submit">
          Request Ride
        </button>
      </div>

      {message ? <div className="mt-2 text-sm text-slate-400">{message}</div> : null}
    </form>
  )
}

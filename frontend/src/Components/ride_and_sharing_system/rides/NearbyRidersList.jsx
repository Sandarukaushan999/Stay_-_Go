import { useEffect, useState } from 'react'
import { rideApi } from '../services/rideApi'
import { useAuthStore } from '../../../app/store/authStore'

export default function NearbyRidersList({ pickup }) {
  const user = useAuthStore((s) => s.user)
  const [rows, setRows] = useState([])

  useEffect(() => {
    const params = {
      campusId: user?.campusId ?? undefined,
      lat: pickup?.lat,
      lng: pickup?.lng,
    }
    rideApi.nearbyRiders(params).then((res) => setRows(res.data.data || []))
  }, [user?.campusId, pickup?.lat, pickup?.lng])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <h3 className="text-lg font-semibold">Fastest Riders</h3>
      <p className="mt-1 text-sm text-slate-400">
        Sorted by OSRM ETA to your pickup point (same university/campus only).
      </p>

      {rows.length === 0 ? (
        <div className="mt-4 text-sm text-slate-400">No riders online right now.</div>
      ) : (
        <div className="mt-4 grid gap-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-slate-100">{r.fullName}</div>
                <div className="text-xs text-slate-400">
                  ETA {typeof r.etaSeconds === 'number' ? `${Math.round(r.etaSeconds / 60)} min` : '—'}
                </div>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {r.vehicleType ?? 'vehicle'} {r.vehicleNumber ? `• ${r.vehicleNumber}` : ''} • seats {r.seatCount ?? 0}{' '}
                • rating {r.rating ?? 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../app/store/authStore'
import { rideApi } from '../services/rideApi'

export default function IncomingRideRequests() {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/ride-sharing/rides/open-requests', { params: { campusId: user?.campusId } })
      setItems(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user?.campusId])

  async function accept(id) {
    await rideApi.acceptRide(id)
    await load()
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Ride Requests</div>
          <div className="text-sm text-slate-400">Open requests from your campus.</div>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
        >
          Refresh
        </button>
      </div>

      {loading ? <div className="mt-3 text-sm text-slate-400">Loading...</div> : null}

      {items.length ? (
        <div className="mt-3 grid gap-2">
          {items.map((r) => (
            <div key={r._id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-200">
                  Request <span className="font-mono text-xs">{String(r._id).slice(-10)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => accept(r._id)}
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Accept
                </button>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Seats: {r.seatCount} • Female only: {r.femaleOnly ? 'yes' : 'no'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 text-sm text-slate-400">No open requests.</div>
      )}
    </div>
  )
}


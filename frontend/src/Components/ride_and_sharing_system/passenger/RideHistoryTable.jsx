import { useEffect, useState } from 'react'
import { rideApi } from '../services/rideApi'

export default function RideHistoryTable() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const response = await rideApi.myRequests()
      setRows(response.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function cancelRequest(id) {
    await rideApi.cancelRide(id)
    await load()
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Ride History</h3>
        <button type="button" onClick={load} className="rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900">
          Refresh
        </button>
      </div>
      {loading ? <div className="mt-3 text-sm text-slate-400">Loading...</div> : null}
      {rows.length ? (
        <div className="mt-3 grid gap-2">
          {rows.map((r) => {
            const canCancel = r.status === 'requested' || r.status === 'accepted'
            return (
              <div key={r._id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Request <span className="font-mono">{String(r._id)}</span>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-slate-300">{r.status}</div>
                </div>
                <div className="mt-1 text-xs text-slate-400">{new Date(r.requestedAt).toLocaleString()}</div>
                {r.riderId ? (
                  <div className="mt-2 text-xs text-slate-200">
                    Rider: <span className="font-medium">{r.riderId.fullName ?? '—'}</span> •{' '}
                    <span className="font-mono">{r.riderId.phone ?? '—'}</span> • {r.riderId.vehicleType ?? 'vehicle'}{' '}
                    {r.riderId.vehicleNumber ? `(${r.riderId.vehicleNumber})` : ''}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-500">No rider assigned yet.</div>
                )}
                {canCancel ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => cancelRequest(r._id)}
                      className="rounded-xl border border-rose-800 px-3 py-2 text-sm text-rose-300 hover:bg-rose-950/40"
                    >
                      Cancel Request
                    </button>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-3 text-sm text-slate-400">No requests yet.</div>
      )}
    </section>
  )
}


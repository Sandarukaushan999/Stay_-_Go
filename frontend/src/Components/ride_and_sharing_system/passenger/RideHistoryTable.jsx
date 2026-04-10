import { useEffect, useState } from 'react'
import { rideApi } from '../services/rideApi'

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString()
}

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
    <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Ride History</h3>
          <p className="text-xs text-slate-600">Request timeline, rider assignment, and cancellation control.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 transition hover:bg-emerald-100"
        >
          Refresh
        </button>
      </div>

      {loading ? <div className="mt-3 text-sm text-slate-600">Loading...</div> : null}

      {rows.length ? (
        <div className="mt-4 grid gap-3">
          {rows.map((r) => {
            const canCancel = r.status === 'requested' || r.status === 'accepted'
            return (
              <article key={r._id} className="rounded-xl border border-slate-300 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    Request <span className="font-mono">{String(r._id)}</span>
                  </div>
                  <div className="rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                    {r.status}
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-600">{formatDate(r.requestedAt)}</div>

                {r.riderId ? (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                    <div>
                      Rider: <span className="font-semibold">{r.riderId.fullName ?? '-'}</span>
                    </div>
                    <div className="mt-1">
                      Mobile: <span className="font-mono">{r.riderId.phone ?? '-'}</span>
                    </div>
                    <div className="mt-1">
                      Vehicle: {r.riderId.vehicleType ?? 'vehicle'} {r.riderId.vehicleNumber ? `(${r.riderId.vehicleNumber})` : ''}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                    No rider assigned yet.
                  </div>
                )}

                {canCancel ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => cancelRequest(r._id)}
                      className="rounded-xl border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800 transition hover:bg-violet-100"
                    >
                      Cancel Request
                    </button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-3 text-sm text-slate-600">No requests yet.</div>
      )}
    </section>
  )
}

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
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const response = await rideApi.myRequests()
      setRows(response.data.data || [])
    } catch (err) {
      setRows([])
      setError(err?.response?.data?.message ?? 'Could not load ride history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function cancelRequest(id) {
    setError(null)
    try {
      await rideApi.cancelRide(id)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Could not cancel this request.')
    }
  }

  return (
    <section className="rounded-3xl border border-[#101312]/15 bg-white p-4 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#101312]">Ride History</h3>
          <p className="text-xs text-[#101312]/65">Request timeline, rider assignment, and cancellation control.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
        >
          Refresh
        </button>
      </div>

      {loading ? <div className="mt-3 text-sm text-[#101312]/65">Loading...</div> : null}
      {error ? <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

      {rows.length ? (
        <div className="mt-4 grid gap-3">
          {rows.map((r) => {
            const canCancel = r.status === 'requested' || r.status === 'accepted'
            return (
              <article key={r._id} className="rounded-2xl border border-[#101312]/12 bg-[#f9fce9] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-[#101312]/65">
                    Request <span className="font-mono">{String(r._id)}</span>
                  </div>
                  <div className="rounded-full border border-[#101312]/15 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#101312]/75">
                    {r.status}
                  </div>
                </div>

                <div className="mt-2 text-xs text-[#101312]/65">{formatDate(r.requestedAt)}</div>

                {r.riderId ? (
                  <div className="mt-3 rounded-lg border border-[#101312]/10 bg-white p-3 text-xs text-[#101312]/75">
                    <div>
                      Rider: <span className="font-semibold text-[#101312]">{r.riderId.fullName ?? '-'}</span>
                    </div>
                    <div className="mt-1">
                      Mobile: <span className="font-mono">{r.riderId.phone ?? '-'}</span>
                    </div>
                    <div className="mt-1">
                      Vehicle: {r.riderId.vehicleType ?? 'vehicle'} {r.riderId.vehicleNumber ? `(${r.riderId.vehicleNumber})` : ''}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-[#101312]/10 bg-white p-3 text-xs text-[#101312]/65">
                    No rider assigned yet.
                  </div>
                )}

                {canCancel ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => cancelRequest(r._id)}
                      className="w-full rounded-xl border border-[#876DFF]/35 bg-[#876DFF]/10 px-3 py-2 text-sm font-semibold text-[#4a35b6] transition hover:bg-[#876DFF]/20 sm:w-auto"
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
        <div className="mt-3 rounded-xl border border-[#101312]/10 bg-[#f9fce9] p-4 text-sm text-[#101312]/65">
          No requests yet.
        </div>
      )}
    </section>
  )
}

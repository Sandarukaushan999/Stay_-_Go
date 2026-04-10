import { useEffect, useState } from 'react'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'

export default function RideRequestsPage() {
  const [status, setStatus] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load(nextStatus = status) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/rides/requests', { params: nextStatus ? { status: nextStatus } : {} })
      setItems(data.items ?? [])
    } catch {
      setError('Failed to load ride requests')
    } finally {
      setLoading(false)
    }
  }

  async function cancelRequest(id) {
    try {
      await api.patch(`/admin/rides/requests/${id}/cancel`)
      await load(status)
    } catch {
      setError('Failed to cancel ride request')
    }
  }

  async function deleteRequest(id) {
    try {
      await api.delete(`/admin/rides/requests/${id}`)
      await load(status)
    } catch {
      setError('Failed to delete ride request')
    }
  }

  useEffect(() => {
    load(status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold">Ride Requests</h1>
        <p className="mt-2 text-slate-400">Monitor requested/accepted/completed/cancelled rides.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { label: 'All', value: '' },
            { label: 'requested', value: 'requested' },
            { label: 'accepted', value: 'accepted' },
            { label: 'completed', value: 'completed' },
            { label: 'cancelled', value: 'cancelled' },
          ].map((x) => (
            <button
              key={x.label}
              type="button"
              onClick={() => setStatus(x.value)}
              className={
                status === x.value
                  ? 'rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white'
                  : 'rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900'
              }
            >
              {x.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => load(status)}
            className="rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">{error}</div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950">
              <tr className="text-slate-300">
                <th className="p-3">Request</th>
                <th className="p-3">Campus</th>
                <th className="p-3">Passenger</th>
                <th className="p-3">Rider</th>
                <th className="p-3">Seats</th>
                <th className="p-3">Status</th>
                <th className="p-3">Requested</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/30">
              {loading ? (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((r) => (
                  <tr key={r._id} className="border-t border-slate-800">
                    <td className="p-3 font-mono text-xs text-slate-200">{String(r._id).slice(-10)}</td>
                    <td className="p-3 text-slate-300">{r.campusId ?? '—'}</td>
                    <td className="p-3 font-mono text-xs text-slate-300">{String(r.passengerId).slice(-10)}</td>
                    <td className="p-3 font-mono text-xs text-slate-300">
                      {r.riderId ? String(r.riderId).slice(-10) : '—'}
                    </td>
                    <td className="p-3 text-slate-300">{r.seatCount}</td>
                    <td className="p-3 text-slate-300">{r.status}</td>
                    <td className="p-3 text-slate-300">
                      {r.requestedAt ? new Date(r.requestedAt).toLocaleString() : '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => cancelRequest(r._id)}
                          disabled={r.status === 'cancelled' || r.status === 'completed'}
                          className="rounded-lg border border-amber-700 px-2 py-1 text-xs text-amber-300 hover:bg-amber-900/20 disabled:opacity-40"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRequest(r._id)}
                          className="rounded-lg border border-rose-700 px-2 py-1 text-xs text-rose-300 hover:bg-rose-900/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={8}>
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}


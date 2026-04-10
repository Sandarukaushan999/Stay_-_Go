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
      <div className="rounded-3xl border border-[#101312]/15 bg-white p-5 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-6">
        <h1 className="text-2xl font-semibold text-[#101312]">Ride Requests</h1>
        <p className="mt-2 text-[#101312]/70">Monitor requested/accepted/completed/cancelled rides.</p>

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
                  ? 'rounded-xl bg-[#BAF91A] px-3 py-2 text-sm font-semibold text-[#101312]'
                  : 'rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]'
              }
            >
              {x.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => load(status)}
            className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
          >
            Refresh
          </button>
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div> : null}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#101312]/12 bg-white">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-[#101312]">
              <tr className="text-white">
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
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td className="p-3 text-[#101312]/65" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((r) => (
                  <tr key={r._id} className="border-t border-[#101312]/10">
                    <td className="p-3 font-mono text-xs text-[#101312]">{String(r._id).slice(-10)}</td>
                    <td className="p-3 text-[#101312]/82">{r.campusId ?? '-'}</td>
                    <td className="p-3 font-mono text-xs text-[#101312]/82">{String(r.passengerId).slice(-10)}</td>
                    <td className="p-3 font-mono text-xs text-[#101312]/82">{r.riderId ? String(r.riderId).slice(-10) : '-'}</td>
                    <td className="p-3 text-[#101312]/82">{r.seatCount}</td>
                    <td className="p-3 text-[#101312]/82">{r.status}</td>
                    <td className="p-3 text-[#101312]/82">{r.requestedAt ? new Date(r.requestedAt).toLocaleString() : '-'}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => cancelRequest(r._id)}
                          disabled={r.status === 'cancelled' || r.status === 'completed'}
                          className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-40"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRequest(r._id)}
                          className="rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-[#101312]/65" colSpan={8}>
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

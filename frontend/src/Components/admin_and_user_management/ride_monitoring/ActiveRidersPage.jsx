import { useEffect, useState } from 'react'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'

export default function ActiveRidersPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/riders/active')
      setItems(data.items ?? [])
    } catch {
      setError('Failed to load active riders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AdminLayout>
      <div className="rounded-3xl border border-[#101312]/15 bg-white p-5 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#101312]">Active Riders</h1>
            <p className="mt-2 text-[#101312]/70">Currently online riders (same campus filtering will be added).</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
          >
            Refresh
          </button>
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div> : null}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#101312]/12 bg-white">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-[#101312]">
              <tr className="text-white">
                <th className="p-3">Name</th>
                <th className="p-3">Campus</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Seats</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Complaints</th>
                <th className="p-3">Location</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td className="p-3 text-[#101312]/65" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((r) => (
                  <tr key={r.id} className="border-t border-[#101312]/10">
                    <td className="p-3 text-[#101312]">{r.fullName}</td>
                    <td className="p-3 text-[#101312]/82">{r.campusId ?? '-'}</td>
                    <td className="p-3 text-[#101312]/82">
                      {r.vehicleType ?? '-'} {r.vehicleNumber ? `(${r.vehicleNumber})` : ''}
                    </td>
                    <td className="p-3 text-[#101312]/82">{r.seatCount ?? '-'}</td>
                    <td className="p-3 text-[#101312]/82">{r.rating ?? '-'}</td>
                    <td className="p-3 text-[#101312]/82">{r.complaintCount ?? 0}</td>
                    <td className="p-3 text-[#101312]/82">
                      {r.currentLocation
                        ? `${Number(r.currentLocation.lat).toFixed(5)}, ${Number(r.currentLocation.lng).toFixed(5)}`
                        : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-[#101312]/65" colSpan={7}>
                    No riders online
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

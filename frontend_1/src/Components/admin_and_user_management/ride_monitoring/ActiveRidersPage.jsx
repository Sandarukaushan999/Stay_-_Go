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
      <div>
        <h1 className="text-2xl font-semibold">Active Riders</h1>
        <p className="mt-2 text-slate-400">Currently online riders (same campus filtering will be added).</p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">{error}</div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950">
              <tr className="text-slate-300">
                <th className="p-3">Name</th>
                <th className="p-3">Campus</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Seats</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Complaints</th>
                <th className="p-3">Location</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/30">
              {loading ? (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((r) => (
                  <tr key={r.id} className="border-t border-slate-800">
                    <td className="p-3 text-slate-100">{r.fullName}</td>
                    <td className="p-3 text-slate-300">{r.campusId ?? '—'}</td>
                    <td className="p-3 text-slate-300">
                      {r.vehicleType ?? '—'} {r.vehicleNumber ? `(${r.vehicleNumber})` : ''}
                    </td>
                    <td className="p-3 text-slate-300">{r.seatCount ?? '—'}</td>
                    <td className="p-3 text-slate-300">{r.rating ?? '—'}</td>
                    <td className="p-3 text-slate-300">{r.complaintCount ?? 0}</td>
                    <td className="p-3 text-slate-300">
                      {r.currentLocation
                        ? `${Number(r.currentLocation.lat).toFixed(5)}, ${Number(r.currentLocation.lng).toFixed(5)}`
                        : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={7}>
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


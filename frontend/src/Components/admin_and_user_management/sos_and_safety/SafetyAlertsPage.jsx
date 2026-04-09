import { useEffect, useState } from 'react'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'

export default function SafetyAlertsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/safety/alerts')
      setItems(data.items ?? [])
    } catch {
      setError('Failed to load safety alerts')
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
        <h1 className="text-2xl font-semibold">Safety Alerts</h1>
        <p className="mt-2 text-slate-400">Overdue trips, suspicious stops, and no-update alerts.</p>

        <div className="mt-4">
          <button
            type="button"
            onClick={load}
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
                <th className="p-3">Trip</th>
                <th className="p-3">Status</th>
                <th className="p-3">Suspicious Stop</th>
                <th className="p-3">No Updates</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Last Move</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/30">
              {loading ? (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((t) => (
                  <tr key={t._id} className="border-t border-slate-800">
                    <td className="p-3 font-mono text-xs text-slate-200">{String(t._id).slice(-10)}</td>
                    <td className="p-3 text-slate-300">{t.status}</td>
                    <td className="p-3 text-slate-300">{t.suspiciousStopFlag ? 'yes' : 'no'}</td>
                    <td className="p-3 text-slate-300">{t.noUpdateFlag ? 'yes' : 'no'}</td>
                    <td className="p-3 text-slate-300">
                      {t.bufferedDeadlineAt ? new Date(t.bufferedDeadlineAt).toLocaleString() : '—'}
                    </td>
                    <td className="p-3 text-slate-300">
                      {t.lastMovementAt ? new Date(t.lastMovementAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={6}>
                    No alerts
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


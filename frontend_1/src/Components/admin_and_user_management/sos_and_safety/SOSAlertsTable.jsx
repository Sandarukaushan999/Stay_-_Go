import { useEffect, useState } from 'react'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'
import { useSocketStore } from '../../../app/store/socketStore'

export default function SOSAlertsTable() {
  const [status, setStatus] = useState('pending')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const socket = useSocketStore((s) => s.socket)
  const connect = useSocketStore((s) => s.connect)

  async function load(nextStatus = status) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/sos', { params: { status: nextStatus } })
      setItems(data.items ?? [])
    } catch {
      setError('Failed to load SOS alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    const s = socket ?? connect()
    s.emit('join:admin')
    function onSos(evt) {
      const sos = evt?.sos
      if (!sos) return
      if (status !== 'pending' || sos.status !== 'pending') return
      setItems((prev) => [sos, ...prev])
    }
    s.on('ride:sos', onSos)
    return () => s.off('ride:sos', onSos)
  }, [socket, connect, status])

  async function acknowledge(id) {
    await api.patch(`/admin/sos/${id}/acknowledge`)
    await load(status)
  }

  async function resolve(id) {
    await api.patch(`/admin/sos/${id}/resolve`)
    await load(status)
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold">SOS Alerts</h1>
        <p className="mt-2 text-slate-400">Incoming SOS alerts stream here in real-time.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {['pending', 'acknowledged', 'resolved'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={
                status === s
                  ? 'rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white'
                  : 'rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900'
              }
            >
              {s}
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
          <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950">
              <tr className="text-slate-300">
                <th className="p-3">Time</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Trip</th>
                <th className="p-3">Message</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
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
                items.map((a) => (
                  <tr key={a._id ?? a.id} className="border-t border-slate-800">
                    <td className="p-3 text-slate-300">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="p-3 text-slate-300">{a.severity}</td>
                    <td className="p-3 text-slate-300 font-mono text-xs">{String(a.tripId).slice(-10)}</td>
                    <td className="p-3 text-slate-200">{a.message || '—'}</td>
                    <td className="p-3 text-slate-300">
                      {a.location ? `${a.location.lat.toFixed(5)}, ${a.location.lng.toFixed(5)}` : '—'}
                    </td>
                    <td className="p-3 text-slate-300">{a.status}</td>
                    <td className="p-3 flex gap-2">
                      {a.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => acknowledge(a._id ?? a.id)}
                          className="rounded-xl border border-slate-800 px-3 py-1.5 hover:bg-slate-900"
                        >
                          Acknowledge
                        </button>
                      ) : null}
                      {a.status !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => resolve(a._id ?? a.id)}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-500"
                        >
                          Resolve
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={7}>
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


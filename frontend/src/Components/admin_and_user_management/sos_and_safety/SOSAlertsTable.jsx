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
    try {
      await api.patch(`/admin/sos/${id}/acknowledge`)
      await load(status)
    } catch {
      setError('Failed to acknowledge SOS alert')
    }
  }

  async function resolve(id) {
    try {
      await api.patch(`/admin/sos/${id}/resolve`)
      await load(status)
    } catch {
      setError('Failed to resolve SOS alert')
    }
  }

  return (
    <AdminLayout>
      <div className="rounded-3xl border border-[#101312]/15 bg-white p-5 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-6">
        <h1 className="text-2xl font-semibold text-[#101312]">SOS Alerts</h1>
        <p className="mt-2 text-[#101312]/70">Incoming SOS alerts stream here in real-time.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {['pending', 'acknowledged', 'resolved'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={
                status === s
                  ? 'rounded-xl bg-[#BAF91A] px-3 py-2 text-sm font-semibold text-[#101312]'
                  : 'rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]'
              }
            >
              {s}
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
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-[#101312]">
              <tr className="text-white">
                <th className="p-3">Time</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Trip</th>
                <th className="p-3">Message</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
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
                items.map((a) => (
                  <tr key={a._id ?? a.id} className="border-t border-[#101312]/10">
                    <td className="p-3 text-[#101312]/82">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}</td>
                    <td className="p-3 text-[#101312]/82">{a.severity}</td>
                    <td className="p-3 font-mono text-xs text-[#101312]/82">{String(a.tripId).slice(-10)}</td>
                    <td className="p-3 text-[#101312]/88">{a.message || '-'}</td>
                    <td className="p-3 text-[#101312]/82">
                      {a.location ? `${a.location.lat.toFixed(5)}, ${a.location.lng.toFixed(5)}` : '-'}
                    </td>
                    <td className="p-3 text-[#101312]/82">{a.status}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {a.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => acknowledge(a._id ?? a.id)}
                            className="rounded-xl border border-[#101312]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
                          >
                            Acknowledge
                          </button>
                        ) : null}
                        {a.status !== 'resolved' ? (
                          <button
                            type="button"
                            onClick={() => resolve(a._id ?? a.id)}
                            className="rounded-xl bg-[#BAF91A] px-3 py-1.5 text-xs font-semibold text-[#101312] transition hover:bg-[#a9ea00]"
                          >
                            Resolve
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-[#101312]/65" colSpan={7}>
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

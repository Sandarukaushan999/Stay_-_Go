import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'
import { useSocketStore } from '../../../app/store/socketStore'

export default function LiveTripsTable() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const socket = useSocketStore((s) => s.socket)
  const connect = useSocketStore((s) => s.connect)

  const byId = useMemo(() => new Map(items.map((t) => [t._id ?? t.id, t])), [items])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/trips/active')
      setItems(data.items ?? [])
    } catch {
      setError('Failed to load active trips')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const s = socket ?? connect()
    s.emit('join:admin')

    function onLoc(evt) {
      const id = evt.tripId
      const trip = byId.get(id)
      if (!trip) return
      const updated = { ...trip, currentLocation: evt.location }
      setItems((prev) => prev.map((t) => ((t._id ?? t.id) === id ? updated : t)))
    }

    function onStatus(evt) {
      const id = evt.tripId
      if (!id || !evt.trip) return
      setItems((prev) => {
        const exists = prev.some((t) => (t._id ?? t.id) === id)
        if (exists) return prev.map((t) => ((t._id ?? t.id) === id ? evt.trip : t))
        return [evt.trip, ...prev]
      })
    }

    s.on('trip:location', onLoc)
    s.on('trip:status', onStatus)
    return () => {
      s.off('trip:location', onLoc)
      s.off('trip:status', onStatus)
    }
  }, [socket, connect, byId])

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold">Live Trip Monitoring</h1>
        <p className="mt-2 text-slate-400">Real-time trip location updates stream into this table.</p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950">
              <tr className="text-slate-300">
                <th className="p-3">Trip</th>
                <th className="p-3">Rider</th>
                <th className="p-3">Passenger</th>
                <th className="p-3">Started</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
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
                items.map((t) => {
                  const id = t._id ?? t.id
                  return (
                    <tr key={id} className="border-t border-slate-800">
                      <td className="p-3 text-slate-100 font-mono text-xs">{String(id).slice(-10)}</td>
                      <td className="p-3 text-slate-300 font-mono text-xs">{String(t.riderId).slice(-10)}</td>
                      <td className="p-3 text-slate-300 font-mono text-xs">{String(t.passengerId).slice(-10)}</td>
                      <td className="p-3 text-slate-300">
                        {t.startedAt ? new Date(t.startedAt).toLocaleString() : '—'}
                      </td>
                      <td className="p-3 text-slate-300">
                        {t.bufferedDeadlineAt ? new Date(t.bufferedDeadlineAt).toLocaleString() : '—'}
                      </td>
                      <td className="p-3 text-slate-300">
                        {t.currentLocation ? `${t.currentLocation.lat.toFixed(5)}, ${t.currentLocation.lng.toFixed(5)}` : '—'}
                      </td>
                      <td className="p-3 text-slate-300">{t.status}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={7}>
                    No active trips
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


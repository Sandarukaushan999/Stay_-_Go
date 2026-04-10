import { useEffect, useState } from 'react'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'

export default function RiderApprovalsTable() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/riders/pending', { params: { page: 1, limit: 50 } })
      setItems(data.items ?? [])
    } catch (e) {
      setError('Failed to load pending riders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function decide(userId, approved) {
    await api.patch(`/admin/riders/${userId}/approve`, { approved })
    await load()
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold">Rider Approvals</h1>
        <p className="mt-2 text-slate-400">Approve or reject pending driver applications.</p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950">
              <tr className="text-slate-300">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Applied</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/30">
              {loading ? (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((u) => (
                  <tr key={u.id} className="border-t border-slate-800">
                    <td className="p-3 text-slate-100">{u.fullName}</td>
                    <td className="p-3 text-slate-300">{u.email}</td>
                    <td className="p-3 text-slate-300">
                      {u.riderAppliedAt ? new Date(u.riderAppliedAt).toLocaleString() : '—'}
                    </td>
                    <td className="p-3 text-slate-300">{u.riderVerificationStatus ?? 'pending'}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => decide(u.id, true)}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-500"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => decide(u.id, false)}
                        className="rounded-xl border border-slate-800 px-3 py-1.5 hover:bg-slate-900"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={5}>
                    No pending approvals
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


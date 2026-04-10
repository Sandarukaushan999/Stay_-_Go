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
    } catch {
      setError('Failed to load pending riders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function decide(userId, approved) {
    try {
      await api.patch(`/admin/riders/${userId}/approve`, { approved })
      await load()
    } catch {
      setError('Failed to update rider approval')
    }
  }

  return (
    <AdminLayout>
      <div className="rounded-3xl border border-[#101312]/15 bg-white p-5 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-6">
        <h1 className="text-2xl font-semibold text-[#101312]">Rider Approvals</h1>
        <p className="mt-2 text-[#101312]/70">Approve or reject pending driver applications.</p>

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div> : null}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#101312]/12 bg-white">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-[#101312]">
              <tr className="text-white">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Applied</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td className="p-3 text-[#101312]/65" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((u) => (
                  <tr key={u.id} className="border-t border-[#101312]/10">
                    <td className="p-3 text-[#101312]">{u.fullName}</td>
                    <td className="p-3 text-[#101312]/82">{u.email}</td>
                    <td className="p-3 text-[#101312]/82">{u.riderAppliedAt ? new Date(u.riderAppliedAt).toLocaleString() : '-'}</td>
                    <td className="p-3 text-[#101312]/82">{u.riderVerificationStatus ?? 'pending'}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => decide(u.id, true)}
                          className="rounded-xl bg-[#BAF91A] px-3 py-1.5 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00]"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(u.id, false)}
                          className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-[#101312]/65" colSpan={5}>
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

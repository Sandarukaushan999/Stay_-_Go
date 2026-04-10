import { useEffect, useState } from 'react'
import { useAuthStore } from '../../../app/store/authStore'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    api
      .get('/admin/dashboard')
      .then((res) => {
        if (!alive) return
        setCounts(res.data.counts)
      })
      .catch(() => {
        if (!alive) return
        setError('Failed to load dashboard')
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <AdminLayout>
      <div className="rounded-3xl border border-[#101312]/15 bg-white p-5 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-6">
        <h1 className="text-2xl font-semibold text-[#101312]">Dashboard Home</h1>
        <p className="mt-2 text-[#101312]/70">
          Signed in as <span className="font-semibold text-[#101312]">{user?.email}</span>
        </p>

        {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Total Users" value={counts?.totalUsers} />
          <StatCard label="Students" value={counts?.students} />
          <StatCard label="Riders" value={counts?.riders} />
          <StatCard label="Technicians" value={counts?.technicians} />
          <StatCard label="Admins" value={counts?.admins} />
          <StatCard label="Verified" value={counts?.verifiedUsers} />
          <StatCard label="Blocked" value={counts?.blockedUsers} />
          <StatCard label="Pending Rider Approvals" value={counts?.pendingRiderApprovals} />
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#101312]/12 bg-gradient-to-br from-[#f9fce9] to-white p-4 shadow-[0_6px_20px_rgba(16,19,18,0.05)]">
      <div className="text-sm text-[#101312]/68">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[#101312]">{value ?? '—'}</div>
    </div>
  )
}

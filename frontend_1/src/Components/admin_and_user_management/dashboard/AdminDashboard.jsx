import { useAuthStore } from '../../../app/store/authStore'
import { useEffect, useState } from 'react'
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
      <div>
        <h1 className="text-2xl font-semibold">Dashboard Home</h1>
        <p className="mt-2 text-slate-400">
          Signed in as <span className="text-slate-200">{user?.email}</span>
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
            {error}
          </div>
        ) : null}

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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value ?? '—'}</div>
    </div>
  )
}


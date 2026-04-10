import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'

export default function AdminTopNavbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [q, setQ] = useState('')

  return (
    <header className="sticky top-0 z-20 border-b border-slate-300 bg-slate-50/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[180px]">
          <div className="text-sm font-semibold text-slate-900">Stay &amp; Go Admin</div>
          <div className="text-[11px] text-slate-600">Unified control center</div>
        </div>

        <div className="flex-1 min-w-[220px] max-w-xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users, trips, or alerts..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-emerald-100"
            type="button"
            onClick={() => navigate('/admin/sos-alerts')}
          >
            SOS Alerts
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-emerald-100"
            type="button"
          >
            Notifications
          </button>
          <div className="hidden rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 lg:block">
            {user?.fullName ?? 'Admin'}
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-emerald-100"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

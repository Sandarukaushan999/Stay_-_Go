import { useState } from 'react'
import { useAuthStore } from '../../../app/store/authStore'

export default function AdminTopNavbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [q, setQ] = useState('')

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between gap-4">
      <div className="min-w-[180px]">
        <div className="text-sm font-semibold text-slate-100">Stay & Go Admin</div>
        <div className="text-[11px] text-slate-500">Unified control center</div>
      </div>

      <div className="flex-1 max-w-xl">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users, trips, tickets..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm hover:bg-slate-900" type="button">
          SOS Alerts
        </button>
        <button className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm hover:bg-slate-900" type="button">
          Notifications
        </button>
        <div className="text-sm text-slate-400">{user?.fullName}</div>
        <button
          onClick={logout}
          className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm hover:bg-slate-900"
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  )
}


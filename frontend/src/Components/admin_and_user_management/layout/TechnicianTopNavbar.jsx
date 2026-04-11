import { useState } from 'react'
import { useAuthStore } from '../../../app/store/authStore'

export default function TechnicianTopNavbar() {
  const user = useAuthStore((s) => s.user)
  const openLogoutModal = useAuthStore((s) => s.openLogoutModal)
  const [q, setQ] = useState('')

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between gap-4">
      <div className="min-w-[180px]">
        <div className="text-sm font-semibold text-slate-100">Stay & Go Technician</div>
        <div className="text-[11px] text-slate-500">Service and Support</div>
      </div>

      <div className="flex-1 max-w-xl">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search assigned jobs or room details..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 text-slate-200"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm hover:bg-slate-900" type="button">
          Alerts
        </button>
        <button className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm hover:bg-slate-900" type="button">
          Tasks
        </button>
        <div className="text-sm font-semibold text-slate-300">{user?.fullName}</div>
        <button
          onClick={openLogoutModal}
          className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm hover:bg-slate-900 text-rose-400 border-rose-900/30"
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

import { useState } from 'react'
import { useAuthStore } from '../../../app/store/authStore'

export default function AdminTopNavbar() {
  const user = useAuthStore((s) => s.user)
  const openLogoutModal = useAuthStore((s) => s.openLogoutModal)
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
        <div className="flex items-center gap-3 px-2 border-l border-slate-800 ml-1 pl-4">
          {user?.profileImage ? (
            <img 
              src={user.profileImage.startsWith('http') ? user.profileImage : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '') + user.profileImage} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full object-cover border border-slate-700 shadow-sm" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center font-bold text-xs border border-fuchsia-500/30">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
          )}
          <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-200 leading-tight">{user?.fullName}</span>
              <span className="text-[10px] text-fuchsia-400 uppercase tracking-widest font-bold leading-tight">{(user?.role || 'admin').replace('_', ' ')}</span>
          </div>
        </div>
        <button
          onClick={openLogoutModal}
          className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm hover:bg-slate-900"
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  )
}


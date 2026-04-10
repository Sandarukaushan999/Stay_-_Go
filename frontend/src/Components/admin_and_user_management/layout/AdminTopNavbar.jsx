import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'

export default function AdminTopNavbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [q, setQ] = useState('')

  return (
    <header className="sticky top-0 z-20 border-b border-[#101312]/15 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[180px]">
          <div className="text-sm font-semibold text-[#101312]">STAY &amp; GO Admin</div>
          <div className="text-[11px] text-[#101312]/65">Unified control center</div>
        </div>

        <div className="flex-1 min-w-[220px] max-w-xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users, trips, or alerts..."
            className="w-full rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm text-[#101312] outline-none focus:ring-2 focus:ring-[#876DFF]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-[#101312]/20 bg-white px-3 py-1.5 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
            type="button"
            onClick={() => navigate('/admin/sos-alerts')}
          >
            SOS Alerts
          </button>
          <button
            className="rounded-xl border border-[#101312]/20 bg-white px-3 py-1.5 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
            type="button"
          >
            Notifications
          </button>
          <div className="hidden rounded-xl border border-[#101312]/20 bg-white px-3 py-1.5 text-sm text-[#101312]/80 xl:block">
            {user?.fullName ?? 'Admin'}
          </div>
          <button
            onClick={logout}
            className="rounded-xl bg-[#BAF91A] px-3 py-1.5 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00]"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

import { useState } from 'react'
import { useAuthStore } from '../../../app/store/authStore'
import UserAvatarChip from './UserAvatarChip'

export default function TechnicianTopNavbar() {
  const logout = useAuthStore((s) => s.logout)
  const [q, setQ] = useState('')

  return (
    <header className="h-14 border-b px-4 flex items-center justify-between gap-4 transition-colors duration-300" style={{ background: 'var(--admin-surface-2)', borderColor: 'var(--admin-border)' }}>
      <div className="min-w-[180px]">
        <div className="text-sm font-semibold transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>Stay &amp; Go Technician</div>
        <div className="text-[11px] transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>Service and Support</div>
      </div>

      <div className="flex-1 max-w-xl">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search assigned jobs or room details..."
          className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-300"
          style={{ background: 'var(--admin-input-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-xl border px-3 py-1.5 text-sm transition-colors duration-300 hover:bg-[var(--admin-surface-hover)]" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }} type="button">
          Alerts
        </button>
        <button className="rounded-xl border px-3 py-1.5 text-sm transition-colors duration-300 hover:bg-[var(--admin-surface-hover)]" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }} type="button">
          Tasks
        </button>

        {/* Avatar + name + "Technician" role badge — auto detects theme, click goes to /profile */}
        <UserAvatarChip theme="auto" />

        <button
          onClick={logout}
          className="rounded-xl border border-rose-500/30 px-3 py-1.5 text-sm hover:bg-rose-500/10 text-rose-500 transition-colors duration-300"
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

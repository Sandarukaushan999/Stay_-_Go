import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'
import UserAvatarChip from './UserAvatarChip'

export default function AdminTopNavbar() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const [q, setQ] = useState('')

  return (
    <header
      className="sticky top-0 z-20 border-b px-4 py-3 backdrop-blur sm:px-6 lg:px-8 transition-colors duration-300"
      style={{
        background: 'var(--admin-surface)',
        borderColor: 'var(--admin-border)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="min-w-[180px]">
          <div className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
            STAY &amp; GO Admin
          </div>
          <div className="text-[11px]" style={{ color: 'var(--admin-text-muted)' }}>
            Unified control center
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[220px] max-w-xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users, trips, or alerts..."
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#876DFF] transition-colors duration-300"
            style={{
              background: 'var(--admin-input-bg)',
              borderColor: 'var(--admin-border)',
              color: 'var(--admin-text)',
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors duration-200 hover:bg-[#BAF91A]/15 hover:text-[#BAF91A]"
            style={{
              borderColor: 'var(--admin-border)',
              background: 'transparent',
              color: 'var(--admin-text)',
            }}
            type="button"
            onClick={() => navigate('/admin/sos-alerts')}
          >
            SOS Alerts
          </button>
          <button
            className="rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors duration-200 hover:bg-[#BAF91A]/15 hover:text-[#BAF91A]"
            style={{
              borderColor: 'var(--admin-border)',
              background: 'transparent',
              color: 'var(--admin-text)',
            }}
            type="button"
          >
            Notifications
          </button>

          <UserAvatarChip theme="auto" />

          <button
            onClick={logout}
            className="rounded-xl bg-[#BAF91A] px-3 py-1.5 text-sm font-semibold transition hover:bg-[#a9ea00]"
            style={{ color: '#101312' }}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

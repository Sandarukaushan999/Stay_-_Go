import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'

function HeaderLink({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-emerald-100 hover:text-slate-950"
    >
      {label}
    </button>
  )
}

export default function TopNavbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="sticky top-0 z-20 border-b border-slate-300 bg-slate-50/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-semibold"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
              iD
            </span>
            STAY &amp; GO
          </button>
          <div className="hidden text-xs text-slate-500 md:block">Ride Sharing Workspace</div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <HeaderLink label="Home" onClick={() => navigate('/')} />
          <HeaderLink label="Rides" onClick={() => navigate('/rides')} />
          <HeaderLink label="Workspace" onClick={() => navigate('/rides/workspace')} />
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <HeaderLink label="Admin Ride Dashboard" onClick={() => navigate('/admin/ride-dashboard')} />
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-600 sm:block">
            {user?.fullName ?? 'Guest'}
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-emerald-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

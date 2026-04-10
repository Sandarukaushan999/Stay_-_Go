import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'

function HeaderLink({ label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
        active
          ? 'bg-[#E2FF99] text-[#101312]'
          : 'text-[#101312]/80 hover:bg-[#E2FF99]/70 hover:text-[#101312]'
      }`}
    >
      {label}
    </button>
  )
}

export default function TopNavbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isStudent = user?.role === 'student'
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  return (
    <header className="sticky top-0 z-20 border-b border-[#101312]/15 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(isStudent ? '/student/dashboard' : '/')}
            className="inline-flex items-center gap-2 rounded-lg border border-[#101312]/20 bg-white px-2.5 py-2 text-sm font-semibold text-[#101312]"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#BAF91A] text-[10px] font-bold text-[#101312]">
              iD
            </span>
            STAY &amp; GO
          </button>
          <div className="hidden text-xs text-[#101312]/65 md:block">
            {isStudent ? 'Student & ride hub' : 'Ride Sharing Workspace'}
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <HeaderLink label="Home" onClick={() => navigate('/')} active={pathname === '/'} />
          {isStudent ? (
            <HeaderLink
              label="Dashboard"
              onClick={() => navigate('/student/dashboard')}
              active={pathname === '/student/dashboard'}
            />
          ) : null}
          <HeaderLink label="Rides" onClick={() => navigate('/rides')} active={pathname === '/rides'} />
          <HeaderLink
            label="Workspace"
            onClick={() => navigate('/rides/workspace')}
            active={pathname === '/rides/workspace'}
          />
          <HeaderLink
            label="Maintenance"
            onClick={() => navigate('/maintenance')}
            active={pathname === '/maintenance'}
          />
          {['student', 'rider', 'technician'].includes(user?.role) && (
            <HeaderLink
              label="Roommates"
              onClick={() => navigate('/roommate/dashboard')}
              active={pathname.startsWith('/roommate')}
            />
          )}
          {isAdmin && (
            <>
              <HeaderLink label="Roommate admin" onClick={() => navigate('/admin/roommate-dashboard')} />
              <HeaderLink label="Admin Ride Dashboard" onClick={() => navigate('/admin/ride-dashboard')} />
              <HeaderLink label="Admin" onClick={() => navigate('/admin')} active={pathname.startsWith('/admin')} />
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg border border-[#101312]/20 bg-white px-2.5 py-2 text-xs text-[#101312]/70 sm:block">
            {user?.fullName ?? 'Guest'}
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-[#101312]/20 bg-white px-3 py-2 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

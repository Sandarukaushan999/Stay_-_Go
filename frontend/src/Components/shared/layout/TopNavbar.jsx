import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'
import UserAvatarChip from '../../admin_and_user_management/layout/UserAvatarChip'

function HeaderLink({ label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
        active
          ? 'bg-[#E2FF99] text-[#101312] font-semibold'
          : 'text-[#101312]/70 hover:bg-[#E2FF99]/70 hover:text-[#101312]'
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
    <header className="sticky top-0 z-20 border-b border-[#101312]/10 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 transition-colors duration-300 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(isStudent ? '/student/dashboard' : '/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#101312] hover:opacity-80 transition-opacity"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#BAF91A] text-[10px] font-bold text-[#101312]">
              iD
            </span>
            STAY &amp; GO
          </button>
          <div className="hidden text-xs text-[#101312]/50 md:block">
            Smart campus platform
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          <HeaderLink label="Home" onClick={() => navigate('/')} active={pathname === '/'} />
          {isStudent ? (
            <HeaderLink
              label="Dashboard"
              onClick={() => navigate('/student/dashboard')}
              active={pathname === '/student/dashboard'}
            />
          ) : null}
          <HeaderLink
            label="Rides"
            onClick={() => navigate('/rides')}
            active={pathname === '/rides' || pathname === '/rides/workspace'}
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          <UserAvatarChip theme="light" />
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-[#101312]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99] hover:border-[#BAF91A]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

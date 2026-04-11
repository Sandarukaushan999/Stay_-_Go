import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'

function HeaderLink({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-xs font-medium text-[#101312]/80 transition hover:bg-[#E2FF99] hover:text-[#101312]"
    >
      {label}
    </button>
  )
}

export default function TopNavbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const openLogoutModal = useAuthStore((s) => s.openLogoutModal)
  const getDashboardPath = () => {
    if (!user) return '/'
    if (user.role === 'admin' || user.role === 'super_admin') return '/admin'
    if (user.role === 'student') return '/student/dashboard'
    if (user.role === 'rider') return '/rider/dashboard'
    if (user.role === 'technician') return '/technician/dashboard'
    return '/'
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#101312]/15 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg border border-[#101312]/20 bg-white px-2.5 py-2 text-sm font-semibold text-[#101312]"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#BAF91A] text-[10px] font-bold text-[#101312]">
              iD
            </span>
            STAY &amp; GO
          </button>
          <div className="hidden text-xs text-[#101312]/65 md:block">Ride Sharing Workspace</div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <HeaderLink label="Home" onClick={() => navigate('/')} />
          <HeaderLink label="Rides" onClick={() => navigate('/rides')} />
          <HeaderLink label="Roommate" onClick={() => navigate('/roommate/dashboard')} />
          <HeaderLink label="Workspace" onClick={() => navigate('/rides/workspace')} />
          <HeaderLink label="Maintenance" onClick={() => navigate('/maintenance')} />
          <HeaderLink label="Dashboard" onClick={() => navigate(getDashboardPath())} />
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <HeaderLink label="Admin Ride Dashboard" onClick={() => navigate('/admin/ride-dashboard')} />
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="hidden items-center gap-2 rounded-lg border border-[#101312]/20 bg-white px-2.5 py-1.5 text-xs text-[#101312]/70 sm:flex hover:bg-[#E2FF99] hover:text-[#101312] transition cursor-pointer text-left"
            >
              {user.profileImage ? (
                <img src={user.profileImage.startsWith('http') ? user.profileImage : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '') + user.profileImage} alt="" className="w-6 h-6 rounded-full object-cover border border-[#101312]/20 shadow-sm" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-[#101312] flex items-center justify-center font-bold text-[10px]">
                  {user.fullName?.charAt(0)}
                </div>
              )}
              <div>
                  <span className="font-medium text-[#101312]">{user.fullName}</span>{' '}
                  <span className="capitalize text-[10px]">({user.role?.replace('_', ' ')})</span>
              </div>
            </button>
          ) : (
            <div className="hidden rounded-lg border border-[#101312]/20 bg-white px-2.5 py-2 text-xs text-[#101312]/70 sm:block">
              Guest
            </div>
          )}
          <button
            type="button"
            onClick={openLogoutModal}
            className="rounded-lg border border-[#101312]/20 bg-white px-3 py-2 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

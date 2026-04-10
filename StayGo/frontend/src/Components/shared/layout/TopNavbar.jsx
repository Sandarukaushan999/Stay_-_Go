import { useAuthStore } from '../../../app/store/authStore'
import { Link } from 'react-router-dom'

export default function TopNavbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">S</div>
            StayGo
        </div>
        <nav className="flex gap-4">
            <Link to={user?.role === 'admin' || user?.role === 'super_admin' ? '/admin' : `/${user?.role}/dashboard`} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/rides" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Ride Sharing</Link>
            <Link to="/roommate/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Roommate Matching</Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Link 
          to="/profile" 
          className="text-sm font-medium text-slate-300 hover:text-emerald-400 hover:underline transition-colors cursor-pointer"
        >
          {user?.fullName ?? ''}
        </Link>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-700 px-4 py-1.5 text-sm font-medium hover:bg-slate-800 text-slate-300 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}


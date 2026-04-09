import { useAuthStore } from '../../../app/store/authStore'

export default function TopNavbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between">
      <div className="text-sm text-slate-300">Smart Campus Platform</div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-400">{user?.fullName ?? ''}</div>
        <button
          onClick={logout}
          className="rounded-xl border border-slate-800 px-3 py-1.5 text-sm hover:bg-slate-900"
        >
          Logout
        </button>
      </div>
    </header>
  )
}


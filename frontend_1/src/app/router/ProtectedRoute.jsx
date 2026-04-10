import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-screen grid place-items-center text-slate-300">
        Loading...
      </div>
    )
  }

  if (status !== 'authed') {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}


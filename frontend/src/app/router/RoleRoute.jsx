import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function RoleRoute({ allow }) {
  const user = useAuthStore((s) => s.user)
  const role = user?.role
  const allowed = Array.isArray(allow) ? allow : [allow]

  if (!role) return <Navigate to="/unauthorized" replace />
  if (!allowed.includes(role)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}


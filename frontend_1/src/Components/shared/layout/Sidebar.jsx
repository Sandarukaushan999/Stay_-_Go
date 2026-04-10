import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'

const base =
  'block rounded-xl px-3 py-2 text-sm transition border border-transparent hover:bg-slate-900 hover:border-slate-800'

function Item({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${base} ${isActive ? 'bg-slate-900 border-slate-800 text-white' : 'text-slate-300'}`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  return (
    <aside className="w-72 shrink-0 border-r border-slate-800 bg-slate-950 p-4">
      <div className="mb-4">
        <div className="text-lg font-semibold">Stay & Go</div>
        <div className="text-xs text-slate-400">{user?.role ?? 'guest'}</div>
      </div>

      <div className="space-y-1">
        <div className="px-2 pt-2 text-[11px] uppercase tracking-wide text-slate-500">
          Overview
        </div>
        <Item to="/" end>
          Home
        </Item>

        {isAdmin ? (
          <>
            <div className="px-2 pt-4 text-[11px] uppercase tracking-wide text-slate-500">Admin</div>
            <Item to="/admin">Admin Dashboard</Item>
            <Item to="/admin/users">User Management</Item>
            <Item to="/admin/ride-monitoring">Ride Monitoring</Item>
          </>
        ) : null}
      </div>
    </aside>
  )
}


import { NavLink } from 'react-router-dom'

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

export default function AdminSidebar() {
  return (
    <aside className="w-72 shrink-0 border-r border-slate-800 bg-slate-950 p-4">
      <div className="mb-4">
        <div className="text-lg font-semibold">Stay & Go</div>
        <div className="text-xs text-slate-400">Admin Control Center</div>
      </div>

      <div className="space-y-1">
        <Section title="Overview" />
        <Item to="/admin" end>
          Dashboard Home
        </Item>
        <Item to="/admin/campus-summary">Campus Summary</Item>

        <Section title="User Management" />
        <Item to="/admin/users">All Users</Item>
        <Item to="/admin/students">Students</Item>
        <Item to="/admin/riders">Riders</Item>
        <Item to="/admin/technicians">Technicians</Item>
        <Item to="/admin/verification-requests">Verification Requests</Item>

        <Section title="Ride Sharing Workspace" />
        <Item to="/admin/ride-dashboard">Ride Dashboard</Item>
        <Item to="/admin/rider-approvals">Rider Approvals</Item>
        <Item to="/admin/live-trips">Live Trip Monitoring</Item>
        <Item to="/admin/ride-requests">Ride Requests</Item>
        <Item to="/admin/active-riders">Active Riders</Item>
        <Item to="/admin/sos-alerts">SOS Alerts</Item>

        <Section title="Roommate Workspace" />
        <Item to="/admin/roommate-dashboard">Roommate Dashboard</Item>
        <Item to="/admin/match-profiles">Match Profiles</Item>
        <Item to="/admin/roommate-reports">Reports & Blocks</Item>
        <Item to="/admin/match-analytics">Match Analytics</Item>

        <Section title="Maintenance Workspace" />
        <Item to="/maintenance">Maintenance Dashboard</Item>

        <Section title="Communication" />
        <Item to="/admin/notifications">Notifications</Item>
        <Item to="/admin/announcements">Announcements</Item>
        <Item to="/admin/complaints">Complaint Center</Item>

        <Section title="System" />
        <Item to="/admin/profile">Admin Profile</Item>
        <Item to="/admin/access-settings">Access Settings</Item>
        <Item to="/admin/dashboard-settings">Dashboard Settings</Item>
      </div>
    </aside>
  )
}

function Section({ title }) {
  return (
    <div className="px-2 pt-4 text-[11px] uppercase tracking-wide text-slate-500">{title}</div>
  )
}

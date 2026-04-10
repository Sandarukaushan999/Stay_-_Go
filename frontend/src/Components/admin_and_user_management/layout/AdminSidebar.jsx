import { NavLink } from 'react-router-dom'

const base =
  'block rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition hover:border-[#101312]/20 hover:bg-[#E2FF99] hover:text-[#101312]'

function Item({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${base} ${
          isActive ? 'border-[#101312]/20 bg-white text-[#101312] shadow-[0_2px_10px_rgba(16,19,18,0.06)]' : 'text-[#101312]/78'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function AdminSidebar() {
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-[#101312]/15 bg-white/90 p-4 backdrop-blur lg:block">
      <div className="mb-4 rounded-2xl border border-[#101312]/12 bg-gradient-to-br from-[#E2FF99] to-white p-3">
        <div className="text-lg font-semibold text-[#101312]">STAY &amp; GO</div>
        <div className="text-xs text-[#101312]/70">Admin Control Center</div>
      </div>

      <div className="h-[calc(100vh-112px)] space-y-1 overflow-y-auto pr-1">
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
        <Item to="/admin/roommate-reports">Reports &amp; Blocks</Item>
        <Item to="/admin/match-analytics">Match Analytics</Item>

        <Section title="Maintenance Workspace" />
        <Item to="/admin/maintenance">Maintenance Dashboard</Item>

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
  return <div className="px-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#876DFF]">{title}</div>
}

import { NavLink } from 'react-router-dom'

const baseLink =
  'block rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition-all duration-200'

function Item({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${baseLink} ${
          isActive
            ? 'border-[#BAF91A]/40 bg-[#BAF91A]/15 text-[#BAF91A] shadow-[0_2px_10px_rgba(186,249,26,0.12)]'
            : 'text-[var(--admin-text)] opacity-70 hover:opacity-100 hover:bg-[#BAF91A]/10 hover:text-[#BAF91A]'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function AdminSidebar() {
  return (
    <aside
      className="hidden h-screen w-72 shrink-0 border-r p-4 backdrop-blur lg:block transition-colors duration-300"
      style={{
        background: 'var(--admin-surface)',
        borderColor: 'var(--admin-border)',
      }}
    >
      {/* Logo */}
      <div
        className="mb-4 rounded-2xl border p-3 transition-colors duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(186,249,26,0.15), rgba(186,249,26,0.05))',
          borderColor: 'var(--admin-border)',
        }}
      >
        <div className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>
          STAY &amp; GO
        </div>
        <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
          Admin Control Center
        </div>
      </div>

      <div className="h-[calc(100vh-112px)] space-y-1 overflow-y-auto pr-1">
        <Section title="System" className="pt-2" />
        <Item to="/admin/profile">Admin Profile</Item>
        <Item to="/admin/access-settings">Access Settings</Item>
        <Item to="/admin/dashboard-settings">Dashboard Settings</Item>

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
      </div>
    </aside>
  )
}

function Section({ title, className = '' }) {
  return (
    <div
      className={`px-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] ${className}`.trim()}
      style={{ color: '#876DFF' }}
    >
      {title}
    </div>
  )
}

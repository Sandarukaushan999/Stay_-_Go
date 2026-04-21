import { NavLink } from 'react-router-dom'

const base =
  'block rounded-xl px-3 py-2 text-sm transition-all duration-300 border border-transparent'

function Item({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${base} ${isActive ? 'bg-[var(--admin-surface-hover)] border-[var(--admin-border)]' : ''}`
      }
      style={({ isActive }) => ({
        color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)'
      })}
    >
      {children}
    </NavLink>
  )
}

function Section({ title }) {
  return (
    <div className="px-2 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wide transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>{title}</div>
  )
}

export default function TechnicianSidebar() {
  return (
    <aside className="w-72 shrink-0 border-r flex flex-col h-screen sticky top-0 transition-colors duration-300" style={{ background: 'var(--admin-surface-2)', borderColor: 'var(--admin-border)' }}>
      <div className="p-4 shrink-0 border-b transition-colors duration-300" style={{ borderColor: 'var(--admin-border)' }}>
        <div className="text-lg font-bold transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>Technician Portal</div>
        <div className="text-xs font-semibold transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>Maintenance & Technical</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 pb-16 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 transition-colors">
        
        <Section title="Overview" />
        <Item to="/technician/dashboard" end>Dashboard Home</Item>
        <Item to="/technician/performance">Performance Summary</Item>

        <Section title="Job Management" />
        <Item to="/technician/jobs">All Jobs</Item>
        <Item to="/technician/jobs/assigned">Assigned Jobs</Item>
        <Item to="/technician/jobs/pending">Pending Requests</Item>
        <Item to="/technician/jobs/completed">Completed Jobs</Item>

        <Section title="Service Workspace" />
        <Item to="/technician/tasks/active">Active Tasks</Item>
        <Item to="/technician/tasks/tracking">Live Job Tracking</Item>
        <Item to="/technician/tasks/requests">Job Requests</Item>

        <Section title="Hostel Maintenance" />
        <Item to="/technician/maintenance">Maintenance Tickets</Item>

        <Section title="Availability" />
        <Item to="/technician/availability">Set Availability</Item>
        <Item to="/technician/schedule">Working Hours</Item>

        <Section title="Profile & Settings" />
        <Item to="/technician/profile">My Profile</Item>
        <Item to="/technician/verification">Documents & Verification</Item>
        <Item to="/technician/notifications">Notifications</Item>
        <Item to="/technician/security">Security Settings</Item>
        <Item to="/technician/appearance">Appearance Settings</Item>

      </div>
    </aside>
  )
}

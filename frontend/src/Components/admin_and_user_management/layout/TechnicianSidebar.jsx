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

function Section({ title }) {
  return (
    <div className="px-2 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</div>
  )
}

export default function TechnicianSidebar() {
  return (
    <aside className="w-72 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col h-screen sticky top-0">
      <div className="p-4 shrink-0 border-b border-slate-800/50">
        <div className="text-lg font-bold text-white">Technician Portal</div>
        <div className="text-xs font-semibold text-slate-400">Maintenance & Technical</div>
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

      </div>
    </aside>
  )
}

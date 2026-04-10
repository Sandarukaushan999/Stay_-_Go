// StatusBadge component - shows the current status of a ticket
// Each status has a different color so users can quickly identify ticket state

const statusConfig = {
  submitted: { label: 'Submitted', classes: 'bg-slate-100 text-slate-700' },
  assigned: { label: 'Assigned', classes: 'bg-violet-100 text-violet-700' },
  in_progress: { label: 'In Progress', classes: 'bg-emerald-100 text-emerald-800' },
  resolved: { label: 'Resolved', classes: 'bg-emerald-200 text-emerald-900' },
  closed: { label: 'Closed', classes: 'bg-slate-100 text-slate-500' },
  rejected: { label: 'Rejected', classes: 'bg-violet-100 text-violet-700' },
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, classes: 'bg-slate-100 text-slate-600' }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}

export default StatusBadge

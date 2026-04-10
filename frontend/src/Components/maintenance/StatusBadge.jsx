// StatusBadge component - shows the current status of a ticket
// Each status has a different color so users can quickly identify ticket state

const statusConfig = {
  submitted: { label: 'Submitted', classes: 'bg-slate-700 text-slate-200' },
  assigned: { label: 'Assigned', classes: 'bg-violet-900/60 text-violet-200' },
  in_progress: { label: 'In Progress', classes: 'bg-amber-900/60 text-amber-200' },
  resolved: { label: 'Resolved', classes: 'bg-emerald-900/60 text-emerald-200' },
  closed: { label: 'Closed', classes: 'bg-slate-800 text-slate-400' },
  rejected: { label: 'Rejected', classes: 'bg-red-900/60 text-red-200' },
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, classes: 'bg-slate-700 text-slate-300' }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}

export default StatusBadge

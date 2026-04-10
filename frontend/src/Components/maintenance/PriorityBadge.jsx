// PriorityBadge component - shows how urgent a ticket is
// Emergency = most urgent (violet), High = emerald, Medium = violet, Low = default

const priorityConfig = {
  low: { label: 'Low', classes: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', classes: 'bg-violet-100 text-violet-700' },
  high: { label: 'High', classes: 'bg-emerald-200 text-emerald-900' },
  emergency: { label: 'Emergency', classes: 'bg-violet-200 text-violet-900' },
}

function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || { label: priority, classes: 'bg-slate-100 text-slate-600' }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}

export default PriorityBadge

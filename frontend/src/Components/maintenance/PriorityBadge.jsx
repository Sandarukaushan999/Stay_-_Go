// PriorityBadge component - shows how urgent a ticket is
// Emergency = most urgent (red), High = orange, Medium = yellow, Low = default

const priorityConfig = {
  low: { label: 'Low', classes: 'bg-slate-800 text-slate-300' },
  medium: { label: 'Medium', classes: 'bg-blue-900/60 text-blue-200' },
  high: { label: 'High', classes: 'bg-orange-900/60 text-orange-200' },
  emergency: { label: 'Emergency', classes: 'bg-red-900/60 text-red-200' },
}

function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || { label: priority, classes: 'bg-slate-800 text-slate-300' }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}

export default PriorityBadge

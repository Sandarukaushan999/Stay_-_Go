// PriorityBadge component - shows how urgent a ticket is
// Using hardcoded colors because tailwind config remaps standard color scales

const priorityConfig = {
  low: { label: 'Low', classes: 'bg-[#101312]/5 text-[#101312]/75 border border-[#101312]/10' },
  medium: { label: 'Medium', classes: 'bg-[#876DFF]/10 text-[#876DFF] border border-[#876DFF]/20' },
  high: { label: 'High', classes: 'bg-[#f59e0b]/10 text-[#d97706] border border-[#f59e0b]/20' },
  emergency: { label: 'Emergency', classes: 'bg-[#e53e3e]/10 text-[#e53e3e] border border-[#e53e3e]/20' },
}

function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || { label: priority, classes: 'bg-[#101312]/5 text-[#101312]/75 border border-[#101312]/10' }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  )
}

export default PriorityBadge

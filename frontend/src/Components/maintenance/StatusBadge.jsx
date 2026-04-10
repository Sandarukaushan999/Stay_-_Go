// StatusBadge component - shows the current status of a ticket
// Using hardcoded colors because tailwind config remaps standard color scales

const statusConfig = {
  submitted: { label: 'Submitted', classes: 'bg-[#101312]/5 text-[#101312]/80 border border-[#101312]/10' },
  assigned: { label: 'Assigned', classes: 'bg-[#876DFF]/10 text-[#876DFF] border border-[#876DFF]/20' },
  in_progress: { label: 'In Progress', classes: 'bg-[#BAF91A]/20 text-[#101312] border border-[#BAF91A]/40' },
  resolved: { label: 'Resolved', classes: 'bg-[#22c55e]/10 text-[#16a34a] border border-[#22c55e]/20' },
  closed: { label: 'Closed', classes: 'bg-[#101312]/5 text-[#101312]/75 border border-[#101312]/10' },
  rejected: { label: 'Rejected', classes: 'bg-[#e53e3e]/10 text-[#e53e3e] border border-[#e53e3e]/20' },
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, classes: 'bg-[#101312]/5 text-[#101312]/75 border border-[#101312]/10' }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  )
}

export default StatusBadge

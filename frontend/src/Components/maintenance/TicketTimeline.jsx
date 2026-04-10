// TicketTimeline component - vertical status history timeline

const statusLabels = {
  submitted: 'Ticket Submitted',
  assigned: 'Technician Assigned',
  in_progress: 'Work Started',
  resolved: 'Issue Resolved',
  closed: 'Ticket Closed',
  rejected: 'Ticket Rejected',
}

function TicketTimeline({ statusHistory = [] }) {
  function formatDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-LK', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (statusHistory.length === 0) {
    return <p className="text-sm text-[#101312]/75">No status history available yet.</p>
  }

  return (
    <div className="space-y-0">
      {statusHistory.map((entry, index) => {
        const isLast = index === statusHistory.length - 1
        return (
          <div key={index} className="flex gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${isLast ? 'bg-[#BAF91A]' : 'bg-[#101312]/20'}`} />
              {!isLast && <span className="w-px flex-1 bg-[#101312]/10" />}
            </div>

            {/* Content */}
            <div className="pb-5">
              <p className={`text-sm font-medium ${isLast ? 'text-[#101312]' : 'text-[#101312]/80'}`}>
                {statusLabels[entry.status] || entry.status}
              </p>
              <p className="mt-0.5 text-xs text-[#101312]/75">{formatDate(entry.changedAt)}</p>
              {entry.changedBy && (
                <p className="text-xs text-[#101312]/75">
                  by {typeof entry.changedBy === 'object' ? (entry.changedBy.fullName || entry.changedBy.name) : 'System'}
                </p>
              )}
              {entry.note && (
                <p className="mt-1 text-xs text-[#101312]/80">{entry.note}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TicketTimeline

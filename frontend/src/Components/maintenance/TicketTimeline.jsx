// TicketTimeline component - shows the history of a ticket as a vertical timeline
// Each step shows: status change, who did it, when, and any notes

const statusLabels = {
  submitted: 'Ticket Submitted',
  assigned: 'Technician Assigned',
  in_progress: 'Work Started',
  resolved: 'Issue Resolved',
  closed: 'Ticket Closed',
  rejected: 'Ticket Rejected',
}

function TicketTimeline({ statusHistory = [] }) {
  // Format date to readable format
  function formatDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-LK', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (statusHistory.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-sm text-slate-500">No status history available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {statusHistory.map((entry, index) => {
        const isLast = index === statusHistory.length - 1
        return (
          <div key={index} className="flex gap-3">
            {/* Timeline marker - dot + line */}
            <div className="flex flex-col items-center">
              <span className={`mt-1 h-3 w-3 rounded-full ${isLast ? 'bg-violet-500' : 'bg-slate-600'}`} />
              {!isLast && <span className="w-px flex-1 bg-slate-700" />}
            </div>

            {/* Content */}
            <div className={`pb-4 ${isLast ? '' : ''}`}>
              <p className={`text-sm font-medium ${isLast ? 'text-violet-300' : 'text-slate-200'}`}>
                {statusLabels[entry.status] || entry.status}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{formatDate(entry.changedAt)}</p>
              {entry.changedBy && (
                <p className="text-xs text-slate-500">
                  by {typeof entry.changedBy === 'object' ? (entry.changedBy.fullName || entry.changedBy.name) : 'System'}
                </p>
              )}
              {entry.note && (
                <p className="mt-1 text-xs text-slate-400">{entry.note}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TicketTimeline

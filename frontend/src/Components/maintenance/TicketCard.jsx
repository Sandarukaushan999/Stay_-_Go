// TicketCard component - shows a summary of one ticket in a card layout
// Priority color left border, category icons, hover arrow

import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

// Category icons for quick visual scanning
const categoryIcons = {
  plumbing: '🔧', electrical: '⚡', furniture: '🪑',
  cleaning: '🧹', network: '🌐', other: '📋',
}

const categoryLabels = {
  plumbing: 'Plumbing', electrical: 'Electrical', furniture: 'Furniture',
  cleaning: 'Cleaning', network: 'Network', other: 'Other',
}

// Priority left-border colors
const priorityBorder = {
  low: 'border-l-slate-400',
  medium: 'border-l-violet-400',
  high: 'border-l-emerald-500',
  emergency: 'border-l-violet-600',
}

function TicketCard({ ticket, onClick }) {
  // Format date to simple readable format like "25 Mar 2026"
  function formatDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-LK', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  return (
    <article
      className={`group relative cursor-pointer rounded-2xl border border-slate-200 border-l-4 ${priorityBorder[ticket.priority] || 'border-l-slate-400'} bg-white p-4 transition hover:border-slate-300 hover:shadow-md`}
      onClick={onClick}
    >
      {/* Top row - ticket ID and date */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-mono">{ticket.ticketId}</span>
        <span>{formatDate(ticket.createdAt)}</span>
      </div>

      {/* Title */}
      <h3 className="mt-2 text-sm font-semibold text-slate-950">{ticket.title}</h3>

      {/* Category + location */}
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
        <span>{categoryIcons[ticket.category] || '📋'} {categoryLabels[ticket.category] || ticket.category}</span>
        <span>Block {ticket.hostelBlock} · Room {ticket.roomNumber}</span>
      </div>

      {/* Bottom row - badges */}
      <div className="mt-3 flex items-center gap-2">
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
      </div>

      {/* Hover arrow */}
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-0 transition group-hover:opacity-100" aria-hidden="true">→</span>
    </article>
  )
}

export default TicketCard

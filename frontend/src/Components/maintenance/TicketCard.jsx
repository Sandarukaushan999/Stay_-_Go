// TicketCard component - shows a summary of one ticket in a card layout
// Using hardcoded colors for consistency with team's custom tailwind config

import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

const categoryIcons = {
  plumbing: '🔧', electrical: '⚡', furniture: '🪑',
  cleaning: '🧹', network: '🌐', other: '📋',
}

const categoryLabels = {
  plumbing: 'Plumbing', electrical: 'Electrical', furniture: 'Furniture',
  cleaning: 'Cleaning', network: 'Network', other: 'Other',
}

// Priority left-border colors (hardcoded hex)
const priorityBorder = {
  low: 'border-l-[#101312]/20',
  medium: 'border-l-[#876DFF]',
  high: 'border-l-[#f59e0b]',
  emergency: 'border-l-[#e53e3e]',
}

function TicketCard({ ticket, onClick }) {
  function formatDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-LK', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  return (
    <article
      className={`group relative cursor-pointer rounded-2xl border border-[#101312]/10 border-l-4 ${priorityBorder[ticket.priority] || 'border-l-[#101312]/20'} bg-white p-4 shadow-[0_2px_8px_rgba(16,19,18,0.04)] transition hover:shadow-[0_8px_24px_rgba(16,19,18,0.08)]`}
      onClick={onClick}
    >
      {/* Top row */}
      <div className="flex items-center justify-between text-xs text-[#101312]/75">
        <span className="font-mono">{ticket.ticketId}</span>
        <span>{formatDate(ticket.createdAt)}</span>
      </div>

      {/* Title */}
      <h3 className="mt-2 text-sm font-semibold text-[#101312]">{ticket.title}</h3>

      {/* Category + location */}
      <div className="mt-2 flex items-center gap-3 text-xs text-[#101312]/75">
        <span>{categoryIcons[ticket.category] || '📋'} {categoryLabels[ticket.category] || ticket.category}</span>
        <span>Block {ticket.hostelBlock} · Room {ticket.roomNumber}</span>
      </div>

      {/* Bottom row - badges */}
      <div className="mt-3 flex items-center gap-2">
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
      </div>

      {/* Hover arrow */}
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#101312]/20 opacity-0 transition group-hover:opacity-100" aria-hidden="true">→</span>
    </article>
  )
}

export default TicketCard

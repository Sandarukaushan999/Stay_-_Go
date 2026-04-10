// MyTickets component - student view of all their maintenance tickets
// Shows status overview cards, filter bar, and a grid of ticket cards

import { useState, useMemo } from 'react'
import TicketCard from './TicketCard'
import TicketFilters from './TicketFilters'

// Status definitions with hardcoded colors
const statusList = [
  { key: 'submitted', label: 'Submitted', text: 'text-[#101312]/75', activeBg: 'bg-[#BAF91A]/15', borderColor: 'border-[#101312]/10' },
  { key: 'assigned', label: 'Assigned', text: 'text-[#876DFF]', activeBg: 'bg-[#876DFF]/10', borderColor: 'border-[#876DFF]/30' },
  { key: 'in_progress', label: 'In Progress', text: 'text-[#d97706]', activeBg: 'bg-[#f59e0b]/10', borderColor: 'border-[#f59e0b]/30' },
  { key: 'resolved', label: 'Resolved', text: 'text-[#16a34a]', activeBg: 'bg-[#22c55e]/10', borderColor: 'border-[#22c55e]/30' },
  { key: 'closed', label: 'Closed', text: 'text-[#101312]/75', activeBg: 'bg-[#101312]/5', borderColor: 'border-[#101312]/10' },
  { key: 'rejected', label: 'Rejected', text: 'text-[#e53e3e]', activeBg: 'bg-[#e53e3e]/10', borderColor: 'border-[#e53e3e]/30' },
]

const priorityWeight = { emergency: 4, high: 3, medium: 2, low: 1 }

function MyTickets({ tickets = [], onSelectTicket }) {
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' })
  const [sortBy, setSortBy] = useState('newest')

  // Count tickets per status
  const statusCounts = useMemo(() => {
    const counts = {}
    for (const s of statusList) counts[s.key] = 0
    for (const ticket of tickets) {
      if (counts[ticket.status] !== undefined) counts[ticket.status] += 1
    }
    return counts
  }, [tickets])

  // Client-side filtering and sorting
  const filteredTickets = useMemo(() => {
    let result = [...tickets]
    if (filters.status) result = result.filter((t) => t.status === filters.status)
    if (filters.priority) result = result.filter((t) => t.priority === filters.priority)
    if (filters.category) result = result.filter((t) => t.category === filters.category)

    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    else if (sortBy === 'priority') result.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0))

    return result
  }, [tickets, filters, sortBy])

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <div>
        <h2 className="text-lg font-semibold text-[#101312]">My Tickets</h2>
        <p className="mt-1 text-sm text-[#101312]/75">
          {tickets.length} total ticket{tickets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status overview cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statusList.map((s) => {
          const isActive = filters.status === s.key
          return (
            <button
              key={s.key}
              type="button"
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? `${s.activeBg} ${s.borderColor} shadow-sm`
                  : 'border-[#101312]/10 bg-white hover:shadow-sm'
              }`}
              onClick={() => setFilters((prev) => ({
                ...prev,
                status: prev.status === s.key ? '' : s.key,
              }))}
              aria-label={`Filter by ${s.label}`}
            >
              <p className="text-2xl font-bold text-[#101312]">{statusCounts[s.key]}</p>
              <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <TicketFilters
        filters={filters}
        onFilterChange={setFilters}
        showCategory
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultCount={filteredTickets.length}
        totalCount={tickets.length}
      />

      {/* Ticket grid or empty state */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.ticketId || ticket._id}
              ticket={ticket}
              onClick={() => onSelectTicket(ticket)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#101312]/10 bg-white py-16 text-center shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
          <p className="text-3xl">📭</p>
          <p className="mt-3 text-sm font-medium text-[#101312]">No tickets found</p>
          <p className="mt-1 text-xs text-[#101312]/80">
            {tickets.length === 0
              ? 'You have not submitted any maintenance tickets yet.'
              : 'Try adjusting your filters to see more results.'}
          </p>
          {tickets.length > 0 && (
            <button
              type="button"
              className="mt-4 rounded-xl border border-[#101312]/15 bg-white px-4 py-2 text-xs text-[#101312] transition hover:bg-[#E2FF99]"
              onClick={() => setFilters({ status: '', priority: '', category: '' })}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default MyTickets

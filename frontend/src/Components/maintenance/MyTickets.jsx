// MyTickets component - student view of all their maintenance tickets
// Shows status overview cards, filter bar, and a grid of ticket cards

import { useState, useMemo } from 'react'
import TicketCard from './TicketCard'
import TicketFilters from './TicketFilters'

// Status definitions with colors for the overview cards
const statusList = [
  { key: 'submitted', label: 'Submitted', bg: 'bg-slate-800', text: 'text-slate-200', accent: 'border-slate-600' },
  { key: 'assigned', label: 'Assigned', bg: 'bg-violet-900/30', text: 'text-violet-300', accent: 'border-violet-600' },
  { key: 'in_progress', label: 'In Progress', bg: 'bg-amber-900/30', text: 'text-amber-300', accent: 'border-amber-600' },
  { key: 'resolved', label: 'Resolved', bg: 'bg-emerald-900/30', text: 'text-emerald-300', accent: 'border-emerald-600' },
  { key: 'closed', label: 'Closed', bg: 'bg-slate-800/60', text: 'text-slate-400', accent: 'border-slate-600' },
  { key: 'rejected', label: 'Rejected', bg: 'bg-red-900/30', text: 'text-red-300', accent: 'border-red-600' },
]

// Priority weights for sorting (higher number = more urgent)
const priorityWeight = { emergency: 4, high: 3, medium: 2, low: 1 }

function MyTickets({ tickets = [], onSelectTicket }) {
  // Filter state shared with TicketFilters component
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  })

  // Sort state
  const [sortBy, setSortBy] = useState('newest')

  // Count tickets for each status (used in the overview cards)
  const statusCounts = useMemo(() => {
    const counts = {}
    for (const s of statusList) {
      counts[s.key] = 0
    }
    for (const ticket of tickets) {
      if (counts[ticket.status] !== undefined) {
        counts[ticket.status] += 1
      }
    }
    return counts
  }, [tickets])

  // Apply client-side filtering and sorting
  const filteredTickets = useMemo(() => {
    let result = [...tickets]

    // Filter by status
    if (filters.status) {
      result = result.filter((t) => t.status === filters.status)
    }

    // Filter by priority
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority)
    }

    // Filter by category
    if (filters.category) {
      result = result.filter((t) => t.category === filters.category)
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortBy === 'priority') {
      result.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0))
    }

    return result
  }, [tickets, filters, sortBy])

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100">My Tickets</h2>
        <p className="mt-1 text-sm text-slate-400">
          {tickets.length} total ticket{tickets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status overview cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statusList.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`rounded-2xl border-l-4 ${s.accent} ${s.bg} px-4 py-3 text-left transition hover:brightness-110`}
            onClick={() => setFilters((prev) => ({
              ...prev,
              status: prev.status === s.key ? '' : s.key,
            }))}
            aria-label={`Filter by ${s.label}`}
          >
            <p className="text-2xl font-bold text-slate-100">{statusCounts[s.key]}</p>
            <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filter bar - reuses TicketFilters component */}
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
        // Empty state
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 py-16 text-center">
          <p className="text-3xl">📭</p>
          <p className="mt-3 text-sm font-medium text-slate-300">No tickets found</p>
          <p className="mt-1 text-xs text-slate-500">
            {tickets.length === 0
              ? 'You have not submitted any maintenance tickets yet.'
              : 'Try adjusting your filters to see more results.'}
          </p>
          {tickets.length > 0 && (
            <button
              type="button"
              className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs text-slate-300 transition hover:bg-slate-700"
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

// AdminTickets component - admin ticket management view
// Table of all tickets with filtering, pagination, assign/reject modals

import { useState, useMemo } from 'react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import TicketFilters from './TicketFilters'

const TICKETS_PER_PAGE = 15

const statusList = ['submitted', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected']

const categoryLabels = {
  plumbing: 'Plumbing', electrical: 'Electrical', furniture: 'Furniture',
  cleaning: 'Cleaning', network: 'Network', other: 'Other',
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-LK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function AdminTickets({ tickets = [], technicians = [], onSelectTicket, onAssign, onReject }) {
  // Filter state
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', search: '' })
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)

  // Assign modal state
  const [assignModal, setAssignModal] = useState({ open: false, ticketId: null })
  const [selectedTechId, setSelectedTechId] = useState('')

  // Reject modal state
  const [rejectModal, setRejectModal] = useState({ open: false, ticketId: null })
  const [rejectReason, setRejectReason] = useState('')

  // Count tickets by status
  const statusCounts = useMemo(() => {
    const counts = {}
    statusList.forEach((s) => { counts[s] = 0 })
    tickets.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status]++
    })
    return counts
  }, [tickets])

  // Apply filters
  const filtered = useMemo(() => {
    let result = [...tickets]

    if (filters.status) result = result.filter((t) => t.status === filters.status)
    if (filters.priority) result = result.filter((t) => t.priority === filters.priority)
    if (filters.category) result = result.filter((t) => t.category === filters.category)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((t) =>
        (t.ticketId && t.ticketId.toLowerCase().includes(q)) ||
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.submittedBy && (typeof t.submittedBy === 'object' ? t.submittedBy.fullName : t.submittedBy || '').toLowerCase().includes(q))
      )
    }

    // Sort
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    else if (sortBy === 'priority') {
      const order = { emergency: 0, high: 1, medium: 2, low: 3 }
      result.sort((a, b) => (order[a.priority] ?? 4) - (order[b.priority] ?? 4))
    }

    return result
  }, [tickets, filters, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / TICKETS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * TICKETS_PER_PAGE, currentPage * TICKETS_PER_PAGE)

  // Reset page when filters change
  function handleFilterChange(newFilters) {
    setFilters(newFilters)
    setPage(1)
  }

  // Assign handlers
  function openAssignModal(e, ticketId) {
    e.stopPropagation()
    setAssignModal({ open: true, ticketId })
    setSelectedTechId('')
  }

  function confirmAssign() {
    if (selectedTechId && assignModal.ticketId) {
      onAssign(assignModal.ticketId, selectedTechId)
    }
    setAssignModal({ open: false, ticketId: null })
    setSelectedTechId('')
  }

  // Reject handlers
  function openRejectModal(e, ticketId) {
    e.stopPropagation()
    setRejectModal({ open: true, ticketId })
    setRejectReason('')
  }

  function confirmReject() {
    if (rejectReason.length >= 10 && rejectModal.ticketId) {
      onReject(rejectModal.ticketId, rejectReason)
    }
    setRejectModal({ open: false, ticketId: null })
    setRejectReason('')
  }

  return (
    <div className="space-y-4">
      {/* Status count badges */}
      <div className="flex flex-wrap gap-2">
        {statusList.map((status) => (
          <button
            key={status}
            type="button"
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              filters.status === status
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
            onClick={() => handleFilterChange({ ...filters, status: filters.status === status ? '' : status })}
          >
            {status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Filters */}
      <TicketFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        showSearch={true}
        showCategory={true}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultCount={filtered.length}
        totalCount={tickets.length}
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">Ticket ID</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Submitted By</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                  No tickets found.
                </td>
              </tr>
            )}
            {paged.map((ticket) => (
              <tr
                key={ticket.ticketId || ticket._id}
                className="cursor-pointer border-b border-slate-100 transition hover:bg-emerald-50/50"
                onClick={() => onSelectTicket(ticket)}
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">{ticket.ticketId}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-slate-950">{ticket.title}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{categoryLabels[ticket.category] || ticket.category}</td>
                <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                <td className="px-4 py-3 text-xs text-slate-600">{typeof ticket.submittedBy === 'object' ? ticket.submittedBy?.fullName : ticket.submittedBy}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDate(ticket.createdAt)}</td>
                <td className="px-4 py-3">
                  {ticket.status === 'submitted' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-[#BAF91A] px-2.5 py-1 text-xs font-medium text-[#101312] transition hover:bg-[#a9ea00]"
                        onClick={(e) => openAssignModal(e, ticket._id || ticket.ticketId)}
                      >
                        Assign
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-violet-500"
                        onClick={(e) => openRejectModal(e, ticket._id || ticket.ticketId)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-white"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-white"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setAssignModal({ open: false, ticketId: null })}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-950">Assign Technician</h3>
            <p className="mt-1 text-xs text-slate-500">Select a technician for ticket {assignModal.ticketId}</p>

            <select
              className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              aria-label="Select technician"
            >
              <option value="">Choose technician...</option>
              {technicians.map((tech) => (
                <option key={tech._id || tech.id} value={tech._id || tech.id}>
                  {tech.fullName || tech.name || 'Unknown'}
                </option>
              ))}
            </select>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-emerald-50"
                onClick={() => setAssignModal({ open: false, ticketId: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-[#BAF91A] px-4 py-1.5 text-xs font-medium text-[#101312] transition hover:bg-[#a9ea00] disabled:opacity-40"
                disabled={!selectedTechId}
                onClick={confirmAssign}
              >
                Confirm Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setRejectModal({ open: false, ticketId: null })}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-950">Reject Ticket</h3>
            <p className="mt-1 text-xs text-slate-500">Provide a reason for rejecting ticket {rejectModal.ticketId}</p>

            <textarea
              className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500"
              rows={4}
              placeholder="Reason for rejection (min 10 characters)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              aria-label="Rejection reason"
            />
            {rejectReason.length > 0 && rejectReason.length < 10 && (
              <p className="mt-1 text-xs text-violet-600">{10 - rejectReason.length} more characters required</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-emerald-50"
                onClick={() => setRejectModal({ open: false, ticketId: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-violet-500 disabled:opacity-40"
                disabled={rejectReason.length < 10}
                onClick={confirmReject}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTickets

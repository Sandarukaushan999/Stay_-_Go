// DownloadReports - Admin report generator with date range, filters, preview, and print-based PDF
// Uses window.print() for PDF export (no external library needed)

import { useState, useMemo } from 'react'

const hostelBlocks = ['All', 'A', 'B', 'C', 'D', 'E', 'F']
const priorityOptions = ['All', 'low', 'medium', 'high', 'emergency']
const statusOptions = ['All', 'submitted', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected']

const statusLabels = {
  submitted: 'Submitted',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected',
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  emergency: 'Emergency',
}

function DownloadReports({ tickets }) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [blockFilter, setBlockFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showPreview, setShowPreview] = useState(false)

  // Filter tickets based on all criteria
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Date range filter
      if (dateFrom && new Date(t.createdAt) < new Date(dateFrom)) return false
      if (dateTo) {
        const endOfDay = new Date(dateTo)
        endOfDay.setHours(23, 59, 59, 999)
        if (new Date(t.createdAt) > endOfDay) return false
      }
      // Block filter
      if (blockFilter !== 'All' && t.hostelBlock !== blockFilter) return false
      // Priority filter
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false
      // Status filter
      if (statusFilter !== 'All' && t.status !== statusFilter) return false
      return true
    })
  }, [tickets, dateFrom, dateTo, blockFilter, priorityFilter, statusFilter])

  // Summary stats for filtered tickets
  const summary = useMemo(() => {
    const byPriority = {}
    const byStatus = {}
    filteredTickets.forEach((t) => {
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1
      byStatus[t.status] = (byStatus[t.status] || 0) + 1
    })
    return { total: filteredTickets.length, byPriority, byStatus }
  }, [filteredTickets])

  function handleGenerate() {
    setShowPreview(true)
  }

  function handleDownloadPDF() {
    window.print()
  }

  function formatDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-LK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">Report Filters</h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Date From */}
          <div>
            <label className="mb-1 block text-xs text-slate-500">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="mb-1 block text-xs text-slate-500">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Hostel Block */}
          <div>
            <label className="mb-1 block text-xs text-slate-500">Hostel Block</label>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            >
              {hostelBlocks.map((b) => (
                <option key={b} value={b}>
                  {b === 'All' ? 'All Blocks' : `Block ${b}`}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-xs text-slate-500">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Priorities' : priorityLabels[p]}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs text-slate-500">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : statusLabels[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
          >
            Generate Report
          </button>
          {showPreview && (
            <button
              onClick={handleDownloadPDF}
              className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
            >
              Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {showPreview && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-300">Report Summary</h3>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Total */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-xs text-slate-500">Total Filtered</p>
              <p className="mt-1 text-xl font-bold text-violet-400">{summary.total}</p>
            </div>

            {/* By Priority */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="mb-2 text-xs text-slate-500">By Priority</p>
              <div className="space-y-1">
                {Object.entries(summary.byPriority).map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-slate-400">{key}</span>
                    <span className="font-medium text-slate-300">{count}</span>
                  </div>
                ))}
                {Object.keys(summary.byPriority).length === 0 && (
                  <span className="text-xs text-slate-600">None</span>
                )}
              </div>
            </div>

            {/* By Status */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="mb-2 text-xs text-slate-500">By Status</p>
              <div className="space-y-1">
                {Object.entries(summary.byStatus).map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{statusLabels[key] || key}</span>
                    <span className="font-medium text-slate-300">{count}</span>
                  </div>
                ))}
                {Object.keys(summary.byStatus).length === 0 && (
                  <span className="text-xs text-slate-600">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {showPreview && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 print:border-none print:bg-white print:p-0">
          <h3 className="mb-4 text-sm font-semibold text-slate-300 print:text-black">
            Filtered Tickets ({filteredTickets.length})
          </h3>

          {filteredTickets.length === 0 ? (
            <p className="text-sm text-slate-500">No tickets match the selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 print:border-gray-300 print:text-gray-600">
                    <th className="pb-2 pr-3 font-medium">Ticket ID</th>
                    <th className="pb-2 pr-3 font-medium">Title</th>
                    <th className="pb-2 pr-3 font-medium">Block</th>
                    <th className="pb-2 pr-3 font-medium">Priority</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                  {filteredTickets.map((t) => (
                    <tr key={t._id} className="text-slate-300 print:text-gray-800">
                      <td className="py-2 pr-3 font-mono text-xs">{t.ticketId}</td>
                      <td className="py-2 pr-3 max-w-[200px] truncate">{t.title}</td>
                      <td className="py-2 pr-3">{t.hostelBlock}</td>
                      <td className="py-2 pr-3 capitalize">{t.priority}</td>
                      <td className="py-2 pr-3">{statusLabels[t.status] || t.status}</td>
                      <td className="py-2 text-xs">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DownloadReports

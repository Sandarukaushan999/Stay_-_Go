// DownloadReports - Admin report generator with date range, filters, preview, and print-based PDF

import { useState, useMemo } from 'react'

const hostelBlocks = ['All', 'A', 'B', 'C', 'D', 'E', 'F']
const priorityOptions = ['All', 'low', 'medium', 'high', 'emergency']
const statusOptions = ['All', 'submitted', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected']

const statusLabels = {
  submitted: 'Submitted', assigned: 'Assigned', in_progress: 'In Progress',
  resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected',
}

const priorityLabels = {
  low: 'Low', medium: 'Medium', high: 'High', emergency: 'Emergency',
}

// Shared input classes with hardcoded hex colors
const inputClasses = 'w-full rounded-lg border border-[#101312]/15 bg-white px-3 py-2 text-sm text-[#101312] outline-none transition focus:border-[#101312]/40 focus:ring-1 focus:ring-[#101312]/10'
const labelClasses = 'mb-1 block text-xs font-medium text-[#101312]/75'

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
      if (dateFrom && new Date(t.createdAt) < new Date(dateFrom)) return false
      if (dateTo) {
        const endOfDay = new Date(dateTo)
        endOfDay.setHours(23, 59, 59, 999)
        if (new Date(t.createdAt) > endOfDay) return false
      }
      if (blockFilter !== 'All' && t.hostelBlock !== blockFilter) return false
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false
      if (statusFilter !== 'All' && t.status !== statusFilter) return false
      return true
    })
  }, [tickets, dateFrom, dateTo, blockFilter, priorityFilter, statusFilter])

  // Summary stats
  const summary = useMemo(() => {
    const byPriority = {}
    const byStatus = {}
    filteredTickets.forEach((t) => {
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1
      byStatus[t.status] = (byStatus[t.status] || 0) + 1
    })
    return { total: filteredTickets.length, byPriority, byStatus }
  }, [filteredTickets])

  function formatDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-LK', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div data-print-hide="true" className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
        <h3 className="mb-4 text-sm font-semibold text-[#101312]">Report Filters</h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelClasses}>From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>To Date</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Hostel Block</label>
            <select value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} className={inputClasses}>
              {hostelBlocks.map((b) => (
                <option key={b} value={b}>{b === 'All' ? 'All Blocks' : `Block ${b}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Priority</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={inputClasses}>
              {priorityOptions.map((p) => (
                <option key={p} value={p}>{p === 'All' ? 'All Priorities' : priorityLabels[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClasses}>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : statusLabels[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="rounded-lg bg-[#BAF91A] px-5 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00]"
          >
            Generate Report
          </button>
          {showPreview && (
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-[#101312]/15 bg-white px-5 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#101312]/5"
            >
              Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats + Table — wrapped for print */}
      {showPreview && (
        <div data-print-show className="space-y-6">
        <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
          <h3 className="mb-4 text-sm font-semibold text-[#101312]">Report Summary</h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#101312]/10 bg-[#101312]/[0.02] p-4">
              <p className="text-xs font-medium text-[#101312]/75">Total Filtered</p>
              <p className="mt-1 text-2xl font-bold text-[#876DFF]">{summary.total}</p>
            </div>

            <div className="rounded-xl border border-[#101312]/10 bg-[#101312]/[0.02] p-4">
              <p className="mb-2 text-xs font-medium text-[#101312]/75">By Priority</p>
              <div className="space-y-1.5">
                {Object.entries(summary.byPriority).map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-[#101312]/80">{priorityLabels[key] || key}</span>
                    <span className="font-bold text-[#101312]">{count}</span>
                  </div>
                ))}
                {Object.keys(summary.byPriority).length === 0 && (
                  <span className="text-xs text-[#101312]/75">None</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#101312]/10 bg-[#101312]/[0.02] p-4">
              <p className="mb-2 text-xs font-medium text-[#101312]/75">By Status</p>
              <div className="space-y-1.5">
                {Object.entries(summary.byStatus).map(([key, count]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-[#101312]/80">{statusLabels[key] || key}</span>
                    <span className="font-bold text-[#101312]">{count}</span>
                  </div>
                ))}
                {Object.keys(summary.byStatus).length === 0 && (
                  <span className="text-xs text-[#101312]/75">None</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
          <h3 className="mb-4 text-sm font-semibold text-[#101312] print:text-black">
            Filtered Tickets ({filteredTickets.length})
          </h3>

          {filteredTickets.length === 0 ? (
            <p className="text-sm text-[#101312]/75">No tickets match the selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#101312]/10 text-xs text-[#101312]/75 print:border-gray-300">
                    <th className="pb-2 pr-3 font-medium">Ticket ID</th>
                    <th className="pb-2 pr-3 font-medium">Title</th>
                    <th className="pb-2 pr-3 font-medium">Block</th>
                    <th className="pb-2 pr-3 font-medium">Priority</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#101312]/5 print:divide-gray-200">
                  {filteredTickets.map((t) => (
                    <tr key={t._id} className="text-[#101312]/80 transition hover:bg-[#101312]/[0.02] print:text-gray-800">
                      <td className="py-2.5 pr-3 font-mono text-xs">{t.ticketId}</td>
                      <td className="py-2.5 pr-3 max-w-[200px] truncate font-medium text-[#101312]">{t.title}</td>
                      <td className="py-2.5 pr-3">{t.hostelBlock}</td>
                      <td className="py-2.5 pr-3 capitalize">{priorityLabels[t.priority] || t.priority}</td>
                      <td className="py-2.5 pr-3">{statusLabels[t.status] || t.status}</td>
                      <td className="py-2.5 text-xs">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  )
}

export default DownloadReports

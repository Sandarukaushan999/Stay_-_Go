// TechnicianTasks component - shows assigned tickets grouped by status
// Technicians can start work on assigned tickets and resolve in-progress ones

import { useState } from 'react'
import TicketCard from './TicketCard'

function TechnicianTasks({ tickets = [], onSelectTicket, onStart, onResolve }) {
  const [resolveTicketId, setResolveTicketId] = useState(null)
  const [resolutionNote, setResolutionNote] = useState('')

  // Group tickets by status category
  const groups = {
    new: tickets.filter((t) => t.status === 'assigned'),
    inProgress: tickets.filter((t) => t.status === 'in_progress'),
    completed: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed'),
  }

  function handleOpenResolve(ticketId) {
    setResolveTicketId(ticketId)
    setResolutionNote('')
  }

  function handleCancelResolve() {
    setResolveTicketId(null)
    setResolutionNote('')
  }

  function handleSubmitResolve() {
    if (resolutionNote.trim().length < 10) return
    onResolve(resolveTicketId, resolutionNote.trim())
    setResolveTicketId(null)
    setResolutionNote('')
  }

  function renderGroup(label, groupTickets, type) {
    return (
      <section className="space-y-3">
        {/* Group header with count */}
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-medium text-slate-600">
            {groupTickets.length}
          </span>
        </div>

        {groupTickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">No {label.toLowerCase()} tickets.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupTickets.map((ticket) => (
              <div key={ticket._id} className="space-y-2">
                <TicketCard ticket={ticket} onClick={() => onSelectTicket(ticket)} />

                {/* Action buttons */}
                {type === 'new' && (
                  <div className="pl-4">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onStart(ticket._id) }}
                      className="rounded-xl bg-[#BAF91A] px-4 py-1.5 text-xs font-medium text-[#101312] transition hover:bg-[#a9ea00]"
                    >
                      Start Work
                    </button>
                  </div>
                )}

                {type === 'inProgress' && resolveTicketId !== ticket._id && (
                  <div className="pl-4">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleOpenResolve(ticket._id) }}
                      className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}

                {/* Inline resolution form */}
                {type === 'inProgress' && resolveTicketId === ticket._id && (
                  <div className="ml-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <label className="block text-xs font-medium text-slate-700">
                      Resolution Note
                    </label>
                    <textarea
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500"
                      placeholder="Describe how the issue was resolved (min 10 characters)"
                      rows={3}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      {resolutionNote.trim().length}/10 min characters
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSubmitResolve}
                        disabled={resolutionNote.trim().length < 10}
                        className="rounded-xl bg-[#BAF91A] px-4 py-1.5 text-xs font-medium text-[#101312] transition hover:bg-[#a9ea00] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelResolve}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-emerald-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-6 text-lg font-bold text-slate-950">My Assigned Tasks</h1>

      <div className="space-y-8">
        {renderGroup('New', groups.new, 'new')}
        {renderGroup('In Progress', groups.inProgress, 'inProgress')}
        {renderGroup('Completed', groups.completed, 'completed')}
      </div>
    </div>
  )
}

export default TechnicianTasks

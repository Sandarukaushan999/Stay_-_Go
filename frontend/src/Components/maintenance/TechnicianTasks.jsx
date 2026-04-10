// TechnicianTasks component - shows assigned tickets grouped by status
// Technicians can start work on assigned tickets and resolve in-progress ones

import { useState } from 'react'
import TicketCard from './TicketCard'

function TechnicianTasks({ tickets = [], onViewTicket, onStart, onResolve }) {
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
          <h2 className="text-sm font-semibold text-slate-300">{label}</h2>
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-800 px-1.5 text-xs font-medium text-slate-400">
            {groupTickets.length}
          </span>
        </div>

        {groupTickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center">
            <p className="text-sm text-slate-500">No {label.toLowerCase()} tickets.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupTickets.map((ticket) => (
              <div key={ticket._id} className="space-y-2">
                <TicketCard ticket={ticket} onClick={() => onViewTicket(ticket._id)} />

                {/* Action buttons */}
                {type === 'new' && (
                  <div className="pl-4">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onStart(ticket._id) }}
                      className="rounded-xl bg-violet-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-violet-500"
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
                  <div className="ml-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                    <label className="block text-xs font-medium text-slate-300">
                      Resolution Note
                    </label>
                    <textarea
                      className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-violet-600"
                      placeholder="Describe how the issue was resolved (min 10 characters)"
                      rows={3}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-slate-600">
                      {resolutionNote.trim().length}/10 min characters
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSubmitResolve}
                        disabled={resolutionNote.trim().length < 10}
                        className="rounded-xl bg-violet-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelResolve}
                        className="rounded-xl border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300"
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
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <h1 className="mb-6 text-lg font-bold text-slate-100">My Assigned Tasks</h1>

      <div className="space-y-8">
        {renderGroup('New', groups.new, 'new')}
        {renderGroup('In Progress', groups.inProgress, 'inProgress')}
        {renderGroup('Completed', groups.completed, 'completed')}
      </div>
    </div>
  )
}

export default TechnicianTasks

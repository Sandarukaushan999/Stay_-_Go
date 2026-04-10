// TicketDetail component - full detail view of a single maintenance ticket
// Two-column layout: main content left, status timeline + metadata right

import { useState } from 'react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import RatingStars from './RatingStars'
import TicketTimeline from './TicketTimeline'

const categoryLabels = {
  plumbing: 'Plumbing', electrical: 'Electrical', furniture: 'Furniture',
  cleaning: 'Cleaning', network: 'Network', other: 'Other',
}

const categoryIcons = {
  plumbing: '🔧', electrical: '⚡', furniture: '🪑',
  cleaning: '🧹', network: '🌐', other: '📋',
}

function TicketDetail({ ticket, userRole, technicians = [], onBack, onAssign, onReject, onStart, onResolve, onRate }) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  function handleSubmitRating() {
    if (rating === 0) return
    onRate(ticket._id, rating, feedback)
    setRatingSubmitted(true)
  }

  // Format date to readable format
  function formatDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-LK', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const canRate = userRole === 'student' && ticket.status === 'resolved' && !ratingSubmitted
  const showRatingDone = userRole === 'student' && ticket.status === 'resolved' && ratingSubmitted

  return (
    <div className="p-4 md:p-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-600 transition hover:text-emerald-700"
      >
        <span aria-hidden="true">&larr;</span> Back to tickets
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            {/* Ticket ID */}
            <p className="text-xs font-mono text-slate-500">{ticket.ticketId}</p>

            {/* Title */}
            <h1 className="mt-2 text-xl font-bold text-slate-950">{ticket.title}</h1>

            {/* Category + badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">
                {categoryIcons[ticket.category] || '📋'} {categoryLabels[ticket.category] || ticket.category}
              </span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>

            {/* Location */}
            {(ticket.hostelBlock || ticket.roomNumber) && (
              <p className="mt-3 text-sm text-slate-600">
                Block {ticket.hostelBlock} &middot; Room {ticket.roomNumber}
              </p>
            )}

            {/* Created date */}
            <p className="mt-2 text-xs text-slate-500">
              Submitted {formatDate(ticket.createdAt)}
            </p>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-950">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {ticket.description || 'No description provided.'}
            </p>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-950">Attachments</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ticket.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url || attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-emerald-500 hover:text-emerald-700"
                  >
                    <span aria-hidden="true">📎</span>
                    <span className="truncate">{attachment.name || `Attachment ${index + 1}`}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rating section - only for students on resolved tickets */}
          {canRate && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-950">Rate this resolution</h2>
              <p className="mt-1 text-xs text-slate-500">
                How satisfied are you with how this issue was resolved?
              </p>

              <div className="mt-3">
                <RatingStars rating={rating} onRate={setRating} />
              </div>

              <textarea
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500"
                placeholder="Optional feedback (max 200 characters)"
                rows={3}
                maxLength={200}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <div className="mt-1 text-right text-xs text-slate-500">
                {feedback.length}/200
              </div>

              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="mt-2 rounded-xl bg-[#BAF91A] px-4 py-2 text-sm font-medium text-[#101312] transition hover:bg-[#a9ea00] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit Rating
              </button>
            </div>
          )}

          {showRatingDone && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm text-emerald-700">Thank you for your feedback!</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Status timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-950">Status Timeline</h2>
            <TicketTimeline statusHistory={ticket.statusHistory || []} />
          </div>

          {/* Technician info */}
          {ticket.assignedTo && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-950">Assigned Technician</h2>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
                  {(ticket.assignedTo.fullName || ticket.assignedTo.name || '?').charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-950">
                    {ticket.assignedTo.fullName || ticket.assignedTo.name}
                  </p>
                  {ticket.assignedTo.email && (
                    <p className="text-xs text-slate-500">{ticket.assignedTo.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resolution note */}
          {(ticket.status === 'resolved' || ticket.status === 'closed') && ticket.resolutionNote && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h2 className="mb-2 text-sm font-semibold text-emerald-700">Resolution Note</h2>
              <p className="text-sm leading-relaxed text-slate-600">{ticket.resolutionNote}</p>
            </div>
          )}

          {/* Rejection reason */}
          {ticket.status === 'rejected' && ticket.rejectionReason && (
            <div className="rounded-2xl border border-violet-200 bg-white p-5">
              <h2 className="mb-2 text-sm font-semibold text-violet-700">Rejection Reason</h2>
              <p className="text-sm leading-relaxed text-slate-600">{ticket.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketDetail

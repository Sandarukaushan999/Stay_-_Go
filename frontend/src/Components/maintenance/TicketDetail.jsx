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
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-sm text-[#101312]/80 transition hover:text-[#101312]"
      >
        <span aria-hidden="true">&larr;</span> Back to tickets
      </button>

      {/* Ticket header — inline */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs text-[#101312]/75">{ticket.ticketId}</p>
          <h1 className="mt-1 text-2xl font-bold text-[#101312]">{ticket.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#101312]/75">
              {categoryIcons[ticket.category] || '📋'} {categoryLabels[ticket.category] || ticket.category}
            </span>
            <span className="text-sm text-[#101312]/75">·</span>
            <span className="text-sm text-[#101312]/75">Block {ticket.hostelBlock} · Room {ticket.roomNumber}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5 lg:col-span-2">
          {/* Description */}
          <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#101312]/75">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#101312]/80">
              {ticket.description || 'No description provided.'}
            </p>
            <p className="mt-4 text-xs text-[#101312]/80">
              Submitted {formatDate(ticket.createdAt)}
            </p>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#101312]/75">Attachments</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ticket.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url || attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-[#101312]/10 px-3 py-2.5 text-xs text-[#101312]/75 transition hover:border-[#876DFF]/40 hover:text-[#876DFF]"
                  >
                    <span aria-hidden="true">📎</span>
                    <span className="truncate">{attachment.name || `Attachment ${index + 1}`}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rating section */}
          {canRate && (
            <div className="rounded-2xl border border-[#BAF91A]/40 bg-[#BAF91A]/5 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#101312]/75">Rate this resolution</h2>
              <p className="mt-1 text-sm text-[#101312]/75">
                How satisfied are you with how this issue was resolved?
              </p>
              <div className="mt-3">
                <RatingStars rating={rating} onRate={setRating} />
              </div>
              <textarea
                className="mt-3 w-full rounded-xl border border-[#101312]/15 bg-white px-3 py-2 text-sm text-[#101312] placeholder-[#101312]/50 outline-none transition focus:border-[#876DFF]"
                placeholder="Optional feedback (max 200 characters)"
                rows={3}
                maxLength={200}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <div className="mt-1 text-right text-xs text-[#101312]/80">{feedback.length}/200</div>
              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="mt-2 rounded-xl bg-[#BAF91A] px-5 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit Rating
              </button>
            </div>
          )}

          {showRatingDone && (
            <div className="rounded-2xl border border-[#16a34a]/20 bg-[#16a34a]/5 p-5">
              <p className="text-sm font-medium text-[#16a34a]">Thank you for your feedback!</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Status timeline */}
          <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#101312]/75">Status Timeline</h2>
            <TicketTimeline statusHistory={ticket.statusHistory || []} />
          </div>

          {/* Technician info */}
          {ticket.assignedTo && typeof ticket.assignedTo === 'object' && (
            <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#101312]/75">Assigned Technician</h2>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#876DFF]/10 text-sm font-bold text-[#876DFF]">
                  {(ticket.assignedTo.fullName || ticket.assignedTo.name || '?').charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#101312]">
                    {ticket.assignedTo.fullName || ticket.assignedTo.name}
                  </p>
                  {ticket.assignedTo.email && (
                    <p className="text-xs text-[#101312]/80">{ticket.assignedTo.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resolution note */}
          {(ticket.status === 'resolved' || ticket.status === 'closed') && ticket.resolutionNote && (
            <div className="rounded-2xl border border-[#16a34a]/20 bg-[#16a34a]/5 p-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#16a34a]">Resolution Note</h2>
              <p className="text-sm leading-relaxed text-[#101312]/80">{ticket.resolutionNote}</p>
            </div>
          )}

          {/* Rejection reason */}
          {ticket.status === 'rejected' && ticket.rejectionReason && (
            <div className="rounded-2xl border border-[#e53e3e]/20 bg-[#e53e3e]/5 p-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#e53e3e]">Rejection Reason</h2>
              <p className="text-sm leading-relaxed text-[#101312]/80">{ticket.rejectionReason}</p>
            </div>
          )}

          {/* Rating display (for closed tickets) */}
          {ticket.status === 'closed' && ticket.rating && (
            <div className="rounded-2xl border border-[#101312]/10 bg-white p-5 shadow-[0_2px_8px_rgba(16,19,18,0.04)]">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#101312]/75">Student Rating</h2>
              <RatingStars rating={ticket.rating} readOnly />
              {ticket.ratingFeedback && (
                <p className="mt-2 text-sm text-[#101312]/75">"{ticket.ratingFeedback}"</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketDetail

import { useEffect, useState } from 'react'
import { rideApi } from '../services/rideApi'

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString()
}

function getDefaultDraft(row) {
  return {
    rating: Number(row?.feedback?.rating ?? 5),
    complaint: Boolean(row?.feedback?.complaint),
    complaintText: row?.feedback?.complaintText ?? '',
  }
}

export default function RideHistoryTable() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [feedbackDrafts, setFeedbackDrafts] = useState({})
  const [feedbackSavingId, setFeedbackSavingId] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const response = await rideApi.myRequests()
      setRows(response.data.data || [])
    } catch (err) {
      setRows([])
      setError(err?.response?.data?.message ?? 'Could not load ride history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function updateDraft(row, patch) {
    setFeedbackDrafts((prev) => ({
      ...prev,
      [row._id]: {
        ...(prev[row._id] ?? getDefaultDraft(row)),
        ...patch,
      },
    }))
  }

  async function cancelRequest(id) {
    setError(null)
    setSuccessMessage(null)
    try {
      await rideApi.cancelRide(id)
      await load()
      setSuccessMessage('Ride request cancelled.')
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Could not cancel this request.')
    }
  }

  async function submitFeedback(row) {
    const draft = feedbackDrafts[row._id] ?? getDefaultDraft(row)
    const rating = Number(draft.rating)

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5.')
      return
    }

    const complaintText = draft.complaint ? String(draft.complaintText ?? '').trim() : ''
    if (draft.complaint && complaintText.length < 5) {
      setError('Please add complaint details (at least 5 characters).')
      return
    }

    setFeedbackSavingId(row._id)
    setError(null)
    setSuccessMessage(null)
    try {
      await rideApi.submitFeedback(row._id, {
        rating,
        complaint: Boolean(draft.complaint),
        complaintText,
      })
      await load()
      setSuccessMessage('Feedback submitted. Rider performance metrics are updated.')
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Could not submit feedback.')
    } finally {
      setFeedbackSavingId(null)
    }
  }

  return (
    <section className="rounded-3xl border border-[#101312]/15 bg-white p-4 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#101312]">Ride History</h3>
          <p className="text-xs text-[#101312]/65">Request timeline, rider assignment, cancellation, and feedback.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
        >
          Refresh
        </button>
      </div>

      {loading ? <div className="mt-3 text-sm text-[#101312]/65">Loading...</div> : null}
      {error ? <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
      {successMessage ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>
      ) : null}

      {rows.length ? (
        <div className="mt-4 grid gap-3">
          {rows.map((r) => {
            const canCancel = r.status === 'requested' || r.status === 'accepted'
            const canFeedback = r.status === 'completed' && Boolean(r.riderId)
            const draft = feedbackDrafts[r._id] ?? getDefaultDraft(r)
            const hasSubmittedFeedback = Boolean(r?.feedback?.submittedAt)

            return (
              <article key={r._id} className="rounded-2xl border border-[#101312]/12 bg-[#f9fce9] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-[#101312]/65">
                    Request <span className="font-mono">{String(r._id)}</span>
                  </div>
                  <div className="rounded-full border border-[#101312]/15 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#101312]/75">
                    {r.status}
                  </div>
                </div>

                <div className="mt-2 text-xs text-[#101312]/65">{formatDate(r.requestedAt)}</div>

                {r.riderId ? (
                  <div className="mt-3 rounded-lg border border-[#101312]/10 bg-white p-3 text-xs text-[#101312]/75">
                    <div>
                      Rider: <span className="font-semibold text-[#101312]">{r.riderId.fullName ?? '-'}</span>
                    </div>
                    <div className="mt-1">
                      Mobile: <span className="font-mono">{r.riderId.phone ?? '-'}</span>
                    </div>
                    <div className="mt-1">
                      Vehicle: {r.riderId.vehicleType ?? 'vehicle'} {r.riderId.vehicleNumber ? `(${r.riderId.vehicleNumber})` : ''}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-[#101312]/10 bg-white p-3 text-xs text-[#101312]/65">
                    No rider assigned yet.
                  </div>
                )}

                {canCancel ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => cancelRequest(r._id)}
                      className="w-full rounded-xl border border-[#876DFF]/35 bg-[#876DFF]/10 px-3 py-2 text-sm font-semibold text-[#4a35b6] transition hover:bg-[#876DFF]/20 sm:w-auto"
                    >
                      Cancel Request
                    </button>
                  </div>
                ) : null}

                {canFeedback ? (
                  <div className="mt-3 rounded-xl border border-[#101312]/12 bg-white p-3">
                    <div className="text-xs font-semibold text-[#101312]">
                      Rider Feedback {hasSubmittedFeedback ? '(update allowed)' : ''}
                    </div>

                    {hasSubmittedFeedback ? (
                      <div className="mt-1 text-[11px] text-[#101312]/65">
                        Last submitted: {formatDate(r.feedback.submittedAt)} • Rating: {r.feedback.rating ?? '-'} • Complaint:{' '}
                        {r.feedback.complaint ? 'yes' : 'no'}
                      </div>
                    ) : null}

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-xs">
                        <span className="text-[#101312]/75">Rating (1-5)</span>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={draft.rating}
                          onChange={(e) => updateDraft(r, { rating: Number(e.target.value) })}
                          className="rounded-lg border border-[#101312]/20 px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#876DFF]"
                        />
                      </label>

                      <label className="flex items-center gap-2 rounded-lg border border-[#101312]/12 bg-[#f9fce9] px-3 py-2 text-xs text-[#101312] sm:self-end">
                        <input
                          type="checkbox"
                          checked={Boolean(draft.complaint)}
                          onChange={(e) => updateDraft(r, { complaint: e.target.checked })}
                          className="h-4 w-4 accent-[#876DFF]"
                        />
                        Report complaint about this ride/rider
                      </label>
                    </div>

                    {draft.complaint ? (
                      <label className="mt-3 grid gap-1 text-xs">
                        <span className="text-[#101312]/75">Complaint details</span>
                        <textarea
                          rows={3}
                          maxLength={500}
                          value={draft.complaintText}
                          onChange={(e) => updateDraft(r, { complaintText: e.target.value })}
                          className="rounded-lg border border-[#101312]/20 px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#876DFF]"
                          placeholder="Explain what happened..."
                        />
                      </label>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => submitFeedback(r)}
                      disabled={feedbackSavingId === r._id}
                      className="mt-3 w-full rounded-xl bg-[#BAF91A] px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00] disabled:opacity-60"
                    >
                      {feedbackSavingId === r._id ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-[#101312]/10 bg-[#f9fce9] p-4 text-sm text-[#101312]/65">
          No requests yet.
        </div>
      )}
    </section>
  )
}

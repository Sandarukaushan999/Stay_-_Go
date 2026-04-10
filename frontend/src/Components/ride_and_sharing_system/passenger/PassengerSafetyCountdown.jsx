import { useEffect, useMemo, useRef, useState } from 'react'
import { rideApi } from '../services/rideApi'
/* eslint-disable react-hooks/set-state-in-effect */

/** Extra time after OSRM ETA before we consider the trip abnormally late (traffic, etc.). */
const BUFFER_SEC = 5 * 60
/** Passenger may cancel the pending auto-SOS only inside this final window. */
const CANCEL_WINDOW_SEC = 10 * 60

function formatMmSs(totalSec) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function PassengerSafetyCountdown({
  tripId,
  tripStatus,
  etaToPickupSec,
  etaToCampusSec,
  pickupLocation,
}) {
  const [deadlineAt, setDeadlineAt] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const [autoSosCancelled, setAutoSosCancelled] = useState(false)
  const [autoSosFired, setAutoSosFired] = useState(false)
  const [manualStatus, setManualStatus] = useState(null)
  const firedRef = useRef(false)
  const pickupRef = useRef(pickupLocation)

  useEffect(() => {
    pickupRef.current = pickupLocation
  }, [pickupLocation])

  const relevantEtaSec = useMemo(() => {
    if (tripStatus === 'to_university') return typeof etaToCampusSec === 'number' ? etaToCampusSec : null
    if (tripStatus === 'to_pickup') return typeof etaToPickupSec === 'number' ? etaToPickupSec : null
    if (tripStatus === 'overdue') {
      if (typeof etaToCampusSec === 'number') return etaToCampusSec
      if (typeof etaToPickupSec === 'number') return etaToPickupSec
    }
    return null
  }, [tripStatus, etaToPickupSec, etaToCampusSec])

  useEffect(() => {
    firedRef.current = false
    setAutoSosCancelled(false)
    setAutoSosFired(false)
    setManualStatus(null)
    setDeadlineAt(null)
  }, [tripId])

  useEffect(() => {
    if (typeof relevantEtaSec !== 'number' || relevantEtaSec <= 0 || !tripId) {
      setDeadlineAt(null)
      return
    }
    setDeadlineAt(Date.now() + (relevantEtaSec + BUFFER_SEC) * 1000)
  }, [relevantEtaSec, tripId, tripStatus])

  useEffect(() => {
    if (!tripId) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [tripId])

  const remainingSec = deadlineAt != null ? Math.max(0, Math.floor((deadlineAt - now) / 1000)) : null

  const inCancelWindow = remainingSec != null && remainingSec > 0 && remainingSec <= CANCEL_WINDOW_SEC

  useEffect(() => {
    if (!tripId || autoSosCancelled || firedRef.current) return
    if (remainingSec !== 0) return
    if (deadlineAt == null) return

    firedRef.current = true
    setAutoSosFired(true)
    const loc = pickupRef.current
    rideApi
      .sos(tripId, {
        message: 'Automatic passenger safety alert: expected arrival window (ETA + 5 min buffer) has passed.',
        severity: 'high',
        location: loc?.lat != null && loc?.lng != null ? loc : undefined,
      })
      .catch(() => {
        firedRef.current = false
        setAutoSosFired(false)
        setManualStatus('Auto SOS failed to send. Try Emergency SOS.')
      })
  }, [remainingSec, tripId, autoSosCancelled, deadlineAt])

  async function sendManualSos() {
    if (!tripId) return
    setManualStatus(null)
    const loc = pickupRef.current
    try {
      await rideApi.sos(tripId, {
        message: 'Passenger pressed Emergency SOS.',
        severity: 'critical',
        location: loc?.lat != null && loc?.lng != null ? loc : undefined,
      })
      setManualStatus('Emergency SOS sent.')
    } catch {
      setManualStatus('Could not send SOS. Check connection.')
    }
  }

  if (!tripId) return null

  return (
    <div className="rounded-2xl border border-[#101312]/15 bg-[#fff7df] p-4">
      <div className="text-sm font-semibold text-[#101312]">Safety countdown</div>
      <p className="mt-1 text-xs text-[#101312]/75">
        Deadline = current route ETA + <span className="font-medium">5 min</span> buffer (traffic / delays). When it
        reaches zero, an SOS is sent automatically unless you cancel in the final <span className="font-medium">10 minutes</span>.
      </p>

      {relevantEtaSec == null ? (
        <div className="mt-2 text-sm text-[#101312]/65">Waiting for route ETA...</div>
      ) : deadlineAt == null ? (
        <div className="mt-2 text-sm text-[#101312]/65">Calibrating...</div>
      ) : (
        <>
          <div className="mt-3 font-mono text-3xl font-semibold tracking-tight text-[#101312]">{formatMmSs(remainingSec)}</div>
          <div className="mt-1 text-xs text-[#101312]/65">Time left before automatic SOS • ETA leg + {BUFFER_SEC / 60} min buffer</div>
        </>
      )}

      {inCancelWindow && !autoSosCancelled && !autoSosFired ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoSosCancelled(true)}
            className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-medium text-[#101312] transition hover:bg-[#E2FF99]"
          >
            Stop automatic SOS (this trip)
          </button>
          <span className="text-xs text-[#101312]/75">Available only in the last 10 minutes.</span>
        </div>
      ) : null}

      {autoSosCancelled ? (
        <div className="mt-2 text-xs text-emerald-700">Automatic SOS cancelled for this trip. Emergency SOS still below.</div>
      ) : null}

      {autoSosFired && !autoSosCancelled ? (
        <div className="mt-2 text-xs text-rose-700">Automatic SOS was triggered (admins notified).</div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-[#101312]/10 pt-3">
        <button
          type="button"
          onClick={sendManualSos}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
        >
          Emergency SOS now
        </button>
        {manualStatus ? <span className="self-center text-xs text-[#101312]/75">{manualStatus}</span> : null}
      </div>
    </div>
  )
}

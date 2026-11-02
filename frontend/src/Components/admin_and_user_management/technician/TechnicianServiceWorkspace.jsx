import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Activity, CheckCircle2, Clock, Hammer, Inbox, MapPinned, Play, Radio, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../../lib/apiClient'
import * as maintenanceApi from '../../maintenance/api'
import TechnicianLayout from '../layout/TechnicianLayout'
import { Card, EmptyState, Loading, PageHeader, Pill, StatCard, Tabs, btnGhost, btnPrimary, btnViolet, errMsg, formatDuration, inputCls, inputStyle, timeAgo } from '../shared/ui'

const MODES = [
  { key: 'active', label: 'Active tasks', path: '/technician/tasks/active', icon: Hammer },
  { key: 'tracking', label: 'Live job tracking', path: '/technician/tasks/tracking', icon: MapPinned },
  { key: 'requests', label: 'Job requests', path: '/technician/tasks/requests', icon: Inbox },
]

const PRIORITY_TONE = { emergency: 'rose', high: 'amber', medium: 'lime', low: 'slate' }
const RANK = { emergency: 0, high: 1, medium: 2, low: 3 }
const STEPS = ['Reported', 'Assigned', 'In progress', 'Resolved']

// Normalise a hostel issue (roommate module) and a maintenance ticket into one "work item".
const fromIssue = (j) => ({
  key: `issue:${j._id}`,
  source: 'issue',
  id: j._id,
  title: j.title,
  room: j.roomNumber || 'TBD',
  priority: (j.priority || 'MEDIUM').toLowerCase(),
  stage: j.status === 'RESOLVED' ? 3 : j.status === 'IN_PROGRESS' ? 2 : j.assignedTechnician ? 1 : 0,
  mine: Boolean(j.assignedTechnician),
  createdAt: j.createdAt,
  startedAt: j.startedAt,
  finishedAt: j.completedAt,
})

const fromTicket = (t) => ({
  key: `ticket:${t._id}`,
  source: 'ticket',
  id: t._id,
  title: t.title,
  ref: t.ticketId,
  room: `${t.hostelBlock}-${t.roomNumber}`,
  priority: t.priority,
  stage: ['resolved', 'closed'].includes(t.status) ? 3 : t.status === 'in_progress' ? 2 : 1,
  mine: true,
  createdAt: t.createdAt,
  startedAt: t.statusHistory?.find((h) => h.status === 'in_progress')?.changedAt,
  finishedAt: t.statusHistory?.find((h) => h.status === 'resolved')?.changedAt,
})

const sortWork = (a, b) => (RANK[a.priority] ?? 9) - (RANK[b.priority] ?? 9) || new Date(b.createdAt) - new Date(a.createdAt)

export default function TechnicianServiceWorkspace() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const mode = MODES.find((m) => pathname.endsWith(`/${m.key}`))?.key || 'active'

  const [issues, setIssues] = useState([])
  const [pool, setPool] = useState([]) // unclaimed hostel issues
  const [tickets, setTickets] = useState([])
  const [perf, setPerf] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)
  const [resolving, setResolving] = useState(null) // ticket work item awaiting a resolution note
  const [, tick] = useState(0)

  const load = useCallback(async () => {
    try {
      const [mineRes, reqRes, tix, p] = await Promise.all([
        api.get('/technician/jobs', { params: { filter: 'assigned' } }),
        api.get('/technician/jobs', { params: { filter: 'pending' } }),
        maintenanceApi.getAssignedTickets(),
        api.get('/technician/performance'),
      ])
      setIssues(mineRes.data.jobs || [])
      setPool(reqRes.data.jobs || [])
      setTickets(tix || [])
      setPerf(p.data.stats)
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load your work'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const refresh = setInterval(load, 30000) // keep tracking fresh
    const clock = setInterval(() => tick((n) => n + 1), 60000) // re-render elapsed timers
    return () => {
      clearInterval(refresh)
      clearInterval(clock)
    }
  }, [load])

  const mineItems = useMemo(() => [...issues.map(fromIssue), ...tickets.filter((t) => t.status !== 'rejected').map(fromTicket)], [issues, tickets])
  const active = mineItems.filter((w) => w.stage === 2).sort(sortWork)
  const requests = [...pool.map(fromIssue), ...mineItems.filter((w) => w.stage === 1)].sort(sortWork)
  const tracking = mineItems.filter((w) => w.stage < 3).sort(sortWork)

  async function run(item, fn, okMsg) {
    setBusyKey(item.key)
    try {
      await fn()
      toast.success(okMsg)
      await load()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusyKey(null)
    }
  }

  const startItem = (item) =>
    run(
      item,
      () => (item.source === 'ticket' ? maintenanceApi.startTicket(item.id) : api.patch(`/technician/jobs/${item.id}/${item.mine ? 'start' : 'claim'}`)),
      item.mine ? 'Work started' : 'Job claimed — it is now in progress'
    )

  const resolveItem = (item) => (item.source === 'ticket' ? setResolving(item) : run(item, () => api.patch(`/technician/jobs/${item.id}/complete`), 'Job resolved — nice work!'))

  return (
    <TechnicianLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader icon={Hammer} title="Service Workspace" subtitle="Everything you are working on — hostel issues and maintenance tickets together." />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Active now" value={active.length} icon={Activity} accent="violet" />
          <StatCard label="Waiting to start" value={requests.length} icon={Inbox} accent="amber" />
          <StatCard label="Resolved (issues)" value={perf?.completed} icon={CheckCircle2} />
          <StatCard label="Avg. fix time" value={perf ? formatDuration(perf.avgCompletionMs) : '—'} icon={Clock} />
        </div>

        <Tabs
          value={mode}
          onChange={(key) => navigate(MODES.find((m) => m.key === key).path)}
          options={MODES.map((m) => ({ key: m.key, label: m.label, count: m.key === 'active' ? active.length : m.key === 'requests' ? requests.length : tracking.length }))}
        />

        {loading ? (
          <Card>
            <Loading label="Loading your work…" />
          </Card>
        ) : mode === 'active' ? (
          active.length === 0 ? (
            <Card>
              <EmptyState icon={Hammer} title="No active tasks" text="Start a request from the Job requests tab and it will appear here." />
            </Card>
          ) : (
            <div className="space-y-3">
              {active.map((w) => (
                <WorkCard key={w.key} item={w} footer={`Working for ${formatDuration(Date.now() - new Date(w.startedAt || w.createdAt))}`}>
                  <button type="button" disabled={busyKey === w.key} onClick={() => resolveItem(w)} className={btnPrimary}>
                    <CheckCircle2 className="h-4 w-4" /> Mark resolved
                  </button>
                </WorkCard>
              ))}
            </div>
          )
        ) : mode === 'requests' ? (
          requests.length === 0 ? (
            <Card>
              <EmptyState icon={Inbox} title="No new requests" text="You will be notified when the admin assigns you a job." />
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((w) => (
                <WorkCard key={w.key} item={w} footer={w.mine ? 'Assigned to you' : 'Unclaimed — first come, first served'}>
                  <button type="button" disabled={busyKey === w.key} onClick={() => startItem(w)} className={btnViolet}>
                    <Play className="h-4 w-4" /> {w.mine ? 'Start work' : 'Claim & start'}
                  </button>
                </WorkCard>
              ))}
            </div>
          )
        ) : tracking.length === 0 ? (
          <Card>
            <EmptyState icon={Radio} title="Nothing to track" text="Open jobs assigned to you are tracked here step by step." />
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
              <Radio className="h-3.5 w-3.5 animate-pulse text-[#876DFF]" /> Live — refreshes every 30 seconds
            </p>
            {tracking.map((w) => (
              <Card key={w.key} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={w.source === 'ticket' ? 'violet' : 'lime'}>{w.source === 'ticket' ? 'maintenance' : 'hostel issue'}</Pill>
                      <Pill tone={PRIORITY_TONE[w.priority] || 'slate'}>{w.priority}</Pill>
                    </div>
                    <h3 className="mt-1.5 text-base font-bold" style={{ color: 'var(--admin-text)' }}>
                      {w.title}
                    </h3>
                    <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      Room {w.room} · reported {timeAgo(w.createdAt)}
                    </div>
                  </div>
                  <div className="text-right text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
                    {w.stage === 2 ? `In progress for ${formatDuration(Date.now() - new Date(w.startedAt || w.createdAt))}` : 'Not started yet'}
                  </div>
                </div>
                <Stepper stage={w.stage} />
                <div className="mt-3 flex justify-end gap-2">
                  {w.stage < 2 ? (
                    <button type="button" disabled={busyKey === w.key} onClick={() => startItem(w)} className={btnViolet}>
                      <Play className="h-4 w-4" /> Start work
                    </button>
                  ) : (
                    <button type="button" disabled={busyKey === w.key} onClick={() => resolveItem(w)} className={btnPrimary}>
                      <CheckCircle2 className="h-4 w-4" /> Mark resolved
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {resolving ? (
        <ResolveModal
          item={resolving}
          onClose={() => setResolving(null)}
          onResolved={async () => {
            setResolving(null)
            await load()
          }}
        />
      ) : null}
    </TechnicianLayout>
  )
}

function WorkCard({ item, footer, children }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={item.source === 'ticket' ? 'violet' : 'lime'}>{item.source === 'ticket' ? 'maintenance' : 'hostel issue'}</Pill>
            <Pill tone={PRIORITY_TONE[item.priority] || 'slate'}>{item.priority}</Pill>
            {item.ref ? <span className="font-mono text-[11px]" style={{ color: 'var(--admin-text-muted)' }}>{item.ref}</span> : null}
          </div>
          <h3 className="mt-1.5 text-base font-bold" style={{ color: 'var(--admin-text)' }}>
            {item.title}
          </h3>
          <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
            Room {item.room} · reported {timeAgo(item.createdAt)} · <span className="font-semibold">{footer}</span>
          </div>
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </Card>
  )
}

function Stepper({ stage }) {
  return (
    <ol className="mt-4 flex items-center">
      {STEPS.map((label, i) => {
        const done = i <= stage
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-[#BAF91A] text-[#101312]' : 'bg-[#101312]/10 text-[#101312]/40'} ${i === stage ? 'ring-4 ring-[#BAF91A]/30' : ''}`}>
                {done ? '✓' : i + 1}
              </span>
              <span className="whitespace-nowrap text-[11px] font-medium" style={{ color: done ? 'var(--admin-text)' : 'var(--admin-text-muted)' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? <span className={`mx-2 mb-5 h-0.5 flex-1 rounded ${i < stage ? 'bg-[#BAF91A]' : 'bg-[#101312]/10'}`} /> : null}
          </li>
        )
      })}
    </ol>
  )
}

function ResolveModal({ item, onClose, onResolved }) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await maintenanceApi.resolveTicket(item.id, note.trim())
      toast.success('Ticket resolved')
      await onResolved()
    } catch (err) {
      toast.error(errMsg(err, 'Could not resolve ticket'))
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border p-6 shadow-2xl" style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">Resolve {item.ref}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-[#BAF91A]/20">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-2 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
          Describe what you did so the student knows how it was fixed (min. 10 characters).
        </p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className={inputCls} style={inputStyle} autoFocus required minLength={10} />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnGhost} style={{ borderColor: 'var(--admin-border)' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving || note.trim().length < 10} className={btnPrimary}>
            {saving ? 'Saving…' : 'Mark resolved'}
          </button>
        </div>
      </form>
    </div>
  )
}

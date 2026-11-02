import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, Home, MessageSquareWarning, Siren, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import { Card, EmptyState, Loading, PageHeader, Pill, StatCard, Tabs, btnPrimary, errMsg, inputCls, inputStyle, timeAgo } from '../shared/ui'

const STATUS_TONE = { open: 'amber', assigned: 'violet', in_progress: 'violet', resolved: 'lime', rejected: 'slate' }
const STATUS_LABEL = { open: 'open', assigned: 'assigned', in_progress: 'in progress', resolved: 'resolved', rejected: 'rejected' }
const PRIORITY_TONE = { emergency: 'rose', high: 'amber', medium: 'lime', low: 'slate' }

// One list for everything people complain about: maintenance tickets + roommate/hostel issue reports.
export default function ComplaintCenter() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState({})
  const [technicians, setTechnicians] = useState([])
  const [source, setSource] = useState('all')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [picked, setPicked] = useState({}) // complaint key -> technician id
  const [busyKey, setBusyKey] = useState(null)

  const load = useCallback(async () => {
    try {
      const [c, t] = await Promise.all([api.get('/admin/complaints'), api.get('/maintenance/tickets/technicians')])
      setItems(c.data.items || [])
      setSummary(c.data.summary || {})
      setTechnicians(t.data.data || [])
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load complaints'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const shown = useMemo(
    () =>
      items.filter(
        (c) =>
          (source === 'all' || c.source === source) &&
          (status === 'all' || (status === 'active' ? ['assigned', 'in_progress'].includes(c.status) : c.status === status))
      ),
    [items, source, status]
  )

  const keyOf = (c) => `${c.source}:${c.id}`

  async function assign(c) {
    const technicianId = picked[keyOf(c)]
    if (!technicianId) return
    setBusyKey(keyOf(c))
    try {
      await api.patch(`/admin/complaints/${c.source}/${c.id}/assign`, { technicianId })
      toast.success('Technician assigned and notified')
      setPicked((p) => ({ ...p, [keyOf(c)]: '' }))
      await load()
    } catch (err) {
      toast.error(errMsg(err, 'Could not assign technician'))
    } finally {
      setBusyKey(null)
    }
  }

  // Tickets can only be assigned while still "submitted"; issues until they are resolved.
  const canAssign = (c) => (c.source === 'ticket' ? c.rawStatus === 'submitted' : c.status !== 'resolved')

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          icon={MessageSquareWarning}
          title="Complaint Center"
          subtitle="Maintenance tickets and hostel issue reports in one place — assign a technician to get them fixed."
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="All complaints" value={summary.total} icon={MessageSquareWarning} />
          <StatCard label="Waiting for action" value={summary.open} icon={Clock} accent="amber" />
          <StatCard label="Being handled" value={summary.inProgress} icon={Wrench} accent="violet" />
          <StatCard label="Urgent & unresolved" value={summary.emergency} icon={Siren} accent="rose" hint="high / emergency priority" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={source}
            onChange={setSource}
            options={[
              { key: 'all', label: 'All' },
              { key: 'ticket', label: 'Maintenance tickets', count: items.filter((c) => c.source === 'ticket').length },
              { key: 'issue', label: 'Hostel issues', count: items.filter((c) => c.source === 'issue').length },
            ]}
          />
          <Tabs
            value={status}
            onChange={setStatus}
            options={[
              { key: 'all', label: 'Any status' },
              { key: 'open', label: 'Open' },
              { key: 'active', label: 'In progress' },
              { key: 'resolved', label: 'Resolved' },
            ]}
          />
        </div>

        {loading ? (
          <Card>
            <Loading />
          </Card>
        ) : shown.length === 0 ? (
          <Card>
            <EmptyState icon={CheckCircle2} title="No complaints here" text="Nothing matches these filters right now." />
          </Card>
        ) : (
          <div className="space-y-3">
            {shown.map((c) => (
              <Card key={keyOf(c)} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#101312]/6 px-1.5 py-0.5 font-mono text-[11px] font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
                        {c.ref}
                      </span>
                      <Pill tone={c.source === 'ticket' ? 'violet' : 'lime'}>
                        {c.source === 'ticket' ? <Wrench className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                        {c.source === 'ticket' ? 'maintenance' : 'hostel issue'}
                      </Pill>
                      <Pill tone={PRIORITY_TONE[c.priority] || 'slate'}>{c.priority}</Pill>
                      <Pill tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status] || c.status}</Pill>
                    </div>
                    <h3 className="mt-2 text-base font-bold" style={{ color: 'var(--admin-text)' }}>
                      {c.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                      {c.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      <span className="capitalize">{c.category}</span>
                      <span>Room {c.room}</span>
                      <span>By {c.reporter.name}</span>
                      <span>{timeAgo(c.createdAt)}</span>
                      {c.assignedTo ? <span className="font-semibold" style={{ color: 'var(--admin-text)' }}>Technician: {c.assignedTo.name}</span> : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 lg:w-72">
                    {canAssign(c) ? (
                      <div className="flex gap-2">
                        <select
                          value={picked[keyOf(c)] || ''}
                          onChange={(e) => setPicked((p) => ({ ...p, [keyOf(c)]: e.target.value }))}
                          className={`${inputCls} flex-1`}
                          style={inputStyle}
                        >
                          <option value="">{c.assignedTo ? 'Reassign to…' : 'Assign technician…'}</option>
                          {technicians.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.fullName}
                            </option>
                          ))}
                        </select>
                        <button type="button" disabled={!picked[keyOf(c)] || busyKey === keyOf(c)} onClick={() => assign(c)} className={btnPrimary}>
                          Assign
                        </button>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => navigate(c.source === 'ticket' ? '/admin/maintenance' : '/roommate/admin/issues')}
                      className="text-left text-xs font-semibold text-[#876DFF] hover:underline"
                    >
                      Open full {c.source === 'ticket' ? 'maintenance' : 'issue'} manager →
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

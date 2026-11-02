import { useCallback, useEffect, useState } from 'react'
import { Bike, Check, ExternalLink, FileText, ShieldCheck, Wrench, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import { Card, EmptyState, Loading, PageHeader, Pill, Tabs, assetUrl, btnDanger, btnGhost, btnPrimary, errMsg, inputCls, inputStyle, timeAgo } from '../shared/ui'

const DOC_LABEL = { nic: 'National ID', certificate: 'Certificate', license: 'Licence', police_report: 'Police report', other: 'Other' }
const STATUS_TONE = { pending: 'amber', approved: 'lime', rejected: 'rose' }

export default function VerificationRequests() {
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('pending')
  const [items, setItems] = useState([])
  const [counts, setCounts] = useState({ pendingRiders: 0, pendingTechnicians: 0 })
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [rejecting, setRejecting] = useState(null) // item being rejected
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/verification-requests', { params: { type, status } })
      setItems(data.items || [])
      setCounts(data.counts || {})
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load verification requests'))
    } finally {
      setLoading(false)
    }
  }, [type, status])

  useEffect(() => {
    load()
  }, [load])

  async function decide(item, approved, note = '') {
    setBusyId(item.id)
    try {
      if (item.kind === 'rider') {
        await api.patch(`/admin/riders/${item.id}/approve`, { approved })
      } else {
        await api.patch(`/admin/verification-requests/technician/${item.id}`, { approved, note })
      }
      toast.success(`${item.fullName} ${approved ? 'approved' : 'rejected'}`)
      setRejecting(null)
      setReason('')
      await load()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusyId(null)
    }
  }

  const pendingTotal = (counts.pendingRiders || 0) + (counts.pendingTechnicians || 0)

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          icon={ShieldCheck}
          title="Verification Requests"
          subtitle={`Review rider applications and technician documents. ${pendingTotal} waiting for review.`}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={type}
            onChange={setType}
            options={[
              { key: 'all', label: 'All' },
              { key: 'rider', label: 'Riders', count: counts.pendingRiders },
              { key: 'technician', label: 'Technicians', count: counts.pendingTechnicians },
            ]}
          />
          <Tabs
            value={status}
            onChange={setStatus}
            options={[
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' },
            ]}
          />
        </div>

        {loading ? (
          <Card>
            <Loading />
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState
              icon={ShieldCheck}
              title={status === 'pending' ? 'Nothing waiting for review' : `No ${status} requests`}
              text="Rider applications and technician document submissions will appear here."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={`${item.kind}-${item.id}`} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.kind === 'rider' ? 'bg-[#876DFF]/15 text-[#5b4ccc]' : 'bg-[#BAF91A] text-[#101312]'}`}>
                        {item.kind === 'rider' ? <Bike className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                      </span>
                      <h3 className="text-base font-bold" style={{ color: 'var(--admin-text)' }}>
                        {item.fullName}
                      </h3>
                      <Pill tone={item.kind === 'rider' ? 'violet' : 'lime'}>{item.kind}</Pill>
                      <Pill tone={STATUS_TONE[item.status]}>{item.status}</Pill>
                    </div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                      {item.email}
                      {item.phone ? ` · ${item.phone}` : ''} · submitted {timeAgo(item.submittedAt)}
                    </div>

                    {item.kind === 'rider' ? (
                      <div className="mt-3 text-sm" style={{ color: 'var(--admin-text)' }}>
                        Vehicle: <span className="font-semibold capitalize">{item.vehicle?.type || '—'}</span>
                        {item.vehicle?.number ? ` · ${item.vehicle.number}` : ''} · {item.vehicle?.seats ?? '—'} seat(s)
                      </div>
                    ) : item.docs.length === 0 ? (
                      <div className="mt-3 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                        No documents attached.
                      </div>
                    ) : (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {item.docs.map((d) => (
                          <a
                            key={d.id}
                            href={assetUrl(d.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-xl border p-2.5 text-sm transition hover:bg-[#BAF91A]/10"
                            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
                          >
                            <FileText className="h-4 w-4 shrink-0 text-[#876DFF]" />
                            <span className="min-w-0 flex-1 truncate">
                              <span className="font-semibold">{DOC_LABEL[d.docType] || 'Document'}</span>
                              {d.label ? ` — ${d.label}` : ''}
                              <span className="block truncate text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                                {d.originalName}
                              </span>
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50" />
                          </a>
                        ))}
                      </div>
                    )}

                    {item.note ? (
                      <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">Reviewer note: {item.note}</div>
                    ) : null}
                  </div>

                  {item.status === 'pending' ? (
                    <div className="flex shrink-0 gap-2">
                      <button type="button" disabled={busyId === item.id} onClick={() => decide(item, true)} className={btnPrimary}>
                        <Check className="h-4 w-4" /> Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => (item.kind === 'rider' ? decide(item, false) : setRejecting(item))}
                        className={btnDanger}
                      >
                        <X className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {rejecting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border p-6 shadow-2xl" style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
            <h3 className="text-lg font-bold">Reject {rejecting.fullName}?</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              The technician will see this reason and can upload corrected documents.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={300}
              placeholder="e.g. The NIC photo is blurry — please upload a clearer copy."
              className={`${inputCls} mt-3`}
              style={inputStyle}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={btnGhost} style={{ borderColor: 'var(--admin-border)' }} onClick={() => { setRejecting(null); setReason('') }}>
                Cancel
              </button>
              <button type="button" disabled={!reason.trim() || busyId === rejecting.id} className={btnDanger} onClick={() => decide(rejecting, false, reason.trim())}>
                Reject request
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  )
}

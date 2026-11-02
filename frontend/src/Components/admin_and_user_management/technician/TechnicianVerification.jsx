import { useCallback, useEffect, useRef, useState } from 'react'
import { BadgeCheck, Clock, FileText, ShieldAlert, ShieldCheck, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../../lib/apiClient'
import TechnicianLayout from '../layout/TechnicianLayout'
import { Card, EmptyState, Loading, PageHeader, Pill, assetUrl, btnDanger, btnPrimary, errMsg, inputCls, inputStyle, timeAgo } from '../shared/ui'

const DOC_TYPES = [
  { key: 'nic', label: 'National ID (NIC)' },
  { key: 'certificate', label: 'Trade / training certificate' },
  { key: 'license', label: 'Licence' },
  { key: 'police_report', label: 'Police clearance' },
  { key: 'other', label: 'Other' },
]
const TYPE_LABEL = Object.fromEntries(DOC_TYPES.map((d) => [d.key, d.label]))

const STATUS = {
  none: { tone: 'slate', icon: ShieldAlert, title: 'Not verified yet', text: 'Upload your documents and submit them so an admin can verify you.' },
  pending: { tone: 'amber', icon: Clock, title: 'Under review', text: 'An admin is reviewing your documents. You will be notified of the result.' },
  approved: { tone: 'lime', icon: BadgeCheck, title: 'Verified technician', text: 'Your documents were approved. Thank you!' },
  rejected: { tone: 'rose', icon: ShieldAlert, title: 'Verification rejected', text: 'Please fix the problem below, upload corrected documents and submit again.' },
}

export default function TechnicianVerification() {
  const [v, setV] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [docType, setDocType] = useState('nic')
  const [label, setLabel] = useState('')
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/technician/verification')
      setV(data.verification)
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load verification'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const locked = v?.status === 'pending' || v?.status === 'approved'
  const meta = STATUS[v?.status || 'none']
  const StatusIcon = meta.icon

  async function upload(e) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('Choose a file first')
    if (file.size > 5 * 1024 * 1024) return toast.error('File is larger than 5 MB')

    const form = new FormData()
    form.append('document', file)
    form.append('docType', docType)
    form.append('label', label)
    setUploading(true)
    try {
      const { data } = await api.post('/technician/verification/documents', form)
      setV(data.verification)
      setLabel('')
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Document uploaded')
    } catch (err) {
      toast.error(errMsg(err, 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  async function remove(doc) {
    try {
      const { data } = await api.delete(`/technician/verification/documents/${doc.id}`)
      setV(data.verification)
      toast.success('Document removed')
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  async function submit() {
    setSubmitting(true)
    try {
      const { data } = await api.post('/technician/verification/submit')
      setV(data.verification)
      toast.success('Submitted for verification')
    } catch (err) {
      toast.error(errMsg(err, 'Could not submit'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <TechnicianLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader icon={ShieldCheck} title="Documents & Verification" subtitle="Verified technicians are trusted with hostel rooms. Upload your ID and certificates for the admin to review." />

        {loading ? (
          <Card>
            <Loading />
          </Card>
        ) : (
          <>
            <Card className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${v.status === 'approved' ? 'bg-[#BAF91A] text-[#101312]' : v.status === 'rejected' ? 'bg-rose-100 text-rose-600' : v.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-[#101312]/8 text-[#101312]/50'}`}>
                    <StatusIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold" style={{ color: 'var(--admin-text)' }}>
                        {meta.title}
                      </h2>
                      <Pill tone={meta.tone}>{v.status === 'none' ? 'not submitted' : v.status}</Pill>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                      {meta.text}
                      {v.submittedAt && v.status !== 'none' ? ` Submitted ${timeAgo(v.submittedAt)}.` : ''}
                    </p>
                  </div>
                </div>
                {!locked ? (
                  <button type="button" onClick={submit} disabled={submitting || v.docs.length === 0} className={btnPrimary}>
                    {submitting ? 'Submitting…' : v.status === 'rejected' ? 'Resubmit for verification' : 'Submit for verification'}
                  </button>
                ) : null}
              </div>
              {v.status === 'rejected' && v.note ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <span className="font-semibold">Reason from admin:</span> {v.note}
                </div>
              ) : null}
            </Card>

            {!locked ? (
              <Card className="p-5">
                <h2 className="mb-3 text-base font-bold" style={{ color: 'var(--admin-text)' }}>
                  Upload a document
                </h2>
                <form onSubmit={upload} className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
                      Document type
                    </span>
                    <select value={docType} onChange={(e) => setDocType(e.target.value)} className={inputCls} style={inputStyle}>
                      {DOC_TYPES.map((d) => (
                        <option key={d.key} value={d.key}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
                      Note (optional)
                    </span>
                    <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} placeholder="e.g. NVQ Level 4 Electrician" className={inputCls} style={inputStyle} />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
                      File — JPG, PNG or PDF, max 5 MB
                    </span>
                    <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" className={`${inputCls} file:mr-3 file:rounded-lg file:border-0 file:bg-[#BAF91A] file:px-3 file:py-1 file:text-sm file:font-semibold file:text-[#101312]`} style={inputStyle} />
                  </label>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={uploading} className={btnPrimary}>
                      <Upload className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload document'}
                    </button>
                  </div>
                </form>
              </Card>
            ) : null}

            <Card className="overflow-hidden">
              <div className="border-b px-5 py-4 text-base font-bold" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                Your documents ({v.docs.length}/8)
              </div>
              {v.docs.length === 0 ? (
                <EmptyState icon={FileText} title="No documents yet" text="Upload at least one document, then submit for verification." />
              ) : (
                <ul className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
                  {v.docs.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 px-5 py-3.5" style={{ borderColor: 'var(--admin-border)' }}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#876DFF]/12 text-[#5b4ccc]">
                        <FileText className="h-5 w-5" />
                      </span>
                      <a href={assetUrl(d.url)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 hover:underline">
                        <div className="truncate font-semibold" style={{ color: 'var(--admin-text)' }}>
                          {TYPE_LABEL[d.docType] || 'Document'}
                          {d.label ? ` — ${d.label}` : ''}
                        </div>
                        <div className="truncate text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                          {d.originalName} · {timeAgo(d.uploadedAt)}
                        </div>
                      </a>
                      {!locked ? (
                        <button type="button" onClick={() => remove(d)} className={btnDanger} title="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </TechnicianLayout>
  )
}

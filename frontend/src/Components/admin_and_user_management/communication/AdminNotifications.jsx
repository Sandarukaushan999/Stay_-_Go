import { useCallback, useEffect, useState } from 'react'
import { Bell, Megaphone, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import NotificationsFeed from '../shared/NotificationsFeed'
import { Card, EmptyState, Loading, PageHeader, Pill, Tabs, btnPrimary, errMsg, inputCls, inputStyle, timeAgo } from '../shared/ui'

const AUDIENCES = [
  { key: 'all', label: 'Everyone' },
  { key: 'student', label: 'Students' },
  { key: 'rider', label: 'Riders' },
  { key: 'technician', label: 'Technicians' },
  { key: 'admin', label: 'Admins' },
]
const PRIORITY_TONE = { urgent: 'rose', important: 'amber', normal: 'slate' }

export default function AdminNotifications() {
  const [tab, setTab] = useState('send')

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader icon={Bell} title="Notifications" subtitle="Send alerts to users and read the notifications addressed to you." />
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { key: 'send', label: 'Send notification' },
            { key: 'inbox', label: 'My inbox' },
          ]}
        />
        {tab === 'send' ? <BroadcastPanel /> : <NotificationsFeed />}
      </div>
    </AdminLayout>
  )
}

function BroadcastPanel() {
  const [form, setForm] = useState({ audience: 'all', priority: 'normal', title: '', message: '' })
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/notifications/broadcasts')
      setHistory(data.items || [])
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load history'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  async function send(e) {
    e.preventDefault()
    setSending(true)
    try {
      const { data } = await api.post('/admin/notifications/broadcast', form)
      toast.success(`Sent to ${data.broadcast.recipientCount} user(s)`)
      setForm((p) => ({ ...p, title: '', message: '' }))
      loadHistory()
    } catch (err) {
      toast.error(errMsg(err, 'Failed to send notification'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="p-5 lg:col-span-3">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold" style={{ color: 'var(--admin-text)' }}>
          <Megaphone className="h-4 w-4 text-[#876DFF]" /> New notification
        </h2>
        <form onSubmit={send} className="space-y-4">
          <div>
            <span className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
              Send to
            </span>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, audience: a.key }))}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${form.audience === a.key ? 'border-[#BAF91A] bg-[#BAF91A] font-semibold text-[#101312]' : 'hover:bg-[#BAF91A]/15'}`}
                  style={form.audience === a.key ? undefined : { borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
              Priority
            </span>
            <select value={form.priority} onChange={set('priority')} className={inputCls} style={inputStyle}>
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
              Title
            </span>
            <input value={form.title} onChange={set('title')} maxLength={100} required minLength={3} placeholder="e.g. Water supply cut tomorrow" className={inputCls} style={inputStyle} />
          </label>

          <label className="block">
            <span className="mb-1 flex justify-between text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
              <span>Message</span>
              <span>{form.message.length}/500</span>
            </span>
            <textarea value={form.message} onChange={set('message')} rows={5} maxLength={500} required minLength={5} placeholder="Write the details users should know…" className={inputCls} style={inputStyle} />
          </label>

          <button type="submit" disabled={sending} className={btnPrimary}>
            <Send className="h-4 w-4" /> {sending ? 'Sending…' : 'Send notification'}
          </button>
        </form>
      </Card>

      <Card className="overflow-hidden lg:col-span-2">
        <div className="border-b px-5 py-4 text-base font-bold" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
          Sent history
        </div>
        {loading ? (
          <Loading />
        ) : history.length === 0 ? (
          <EmptyState icon={Send} title="Nothing sent yet" text="Notifications you send will be listed here." />
        ) : (
          <ul className="max-h-[520px] divide-y overflow-y-auto" style={{ borderColor: 'var(--admin-border)' }}>
            {history.map((b) => (
              <li key={b._id} className="p-4" style={{ borderColor: 'var(--admin-border)' }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
                    {b.title}
                  </span>
                  {b.priority !== 'normal' ? <Pill tone={PRIORITY_TONE[b.priority]}>{b.priority}</Pill> : null}
                </div>
                <p className="mt-0.5 line-clamp-2 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                  {b.message}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                  <Pill tone="violet">{b.audience === 'all' ? 'everyone' : `${b.audience}s`}</Pill>
                  <span>{b.recipientCount} recipients</span>
                  <span>· {timeAgo(b.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

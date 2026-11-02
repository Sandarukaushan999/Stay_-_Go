import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellRing, Briefcase, CheckCheck, Megaphone, ShieldCheck, Trash2, TriangleAlert, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../../lib/apiClient'
import { Card, EmptyState, Loading, Pill, Tabs, btnGhost, errMsg, timeAgo } from './ui'

const TYPE_ICON = {
  announcement: Megaphone,
  job: Briefcase,
  complaint: Wrench,
  verification: ShieldCheck,
  system: Bell,
}
const PRIORITY_TONE = { urgent: 'rose', important: 'amber', normal: 'slate' }

// The signed-in user's own inbox (GET /api/notifications).
export default function NotificationsFeed({ pollMs = 20000 }) {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications', { params: { limit: 100 } })
      setItems(data.items || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load notifications'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, pollMs)
    return () => clearInterval(timer)
  }, [load, pollMs])

  async function open(n) {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)))
      setUnreadCount((c) => Math.max(0, c - 1))
      api.patch(`/notifications/${n._id}/read`).catch(() => {})
    }
    if (n.link) navigate(n.link)
  }

  async function markAll() {
    try {
      await api.patch('/notifications/read-all')
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  async function remove(n, e) {
    e.stopPropagation()
    try {
      await api.delete(`/notifications/${n._id}`)
      setItems((prev) => prev.filter((x) => x._id !== n._id))
      if (!n.isRead) setUnreadCount((c) => Math.max(0, c - 1))
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  const shown = tab === 'unread' ? items.filter((n) => !n.isRead) : items

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { key: 'all', label: 'All', count: items.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
          ]}
        />
        <button type="button" onClick={markAll} disabled={!unreadCount} className={btnGhost} style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <Loading />
        ) : shown.length === 0 ? (
          <EmptyState icon={BellRing} title={tab === 'unread' ? 'You are all caught up' : 'No notifications yet'} text="New alerts, job assignments and announcements will show up here." />
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
            {shown.map((n) => {
              const Icon = n.priority === 'urgent' ? TriangleAlert : TYPE_ICON[n.type] || Bell
              return (
                <li
                  key={n._id}
                  onClick={() => open(n)}
                  className="group flex cursor-pointer items-start gap-3 p-4 transition hover:bg-[#BAF91A]/10"
                  style={{ borderColor: 'var(--admin-border)', background: n.isRead ? undefined : 'rgba(186,249,26,0.07)' }}
                >
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.isRead ? 'bg-[#101312]/5 text-[#101312]/50' : 'bg-[#BAF91A] text-[#101312]'}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm ${n.isRead ? 'font-medium' : 'font-bold'}`} style={{ color: 'var(--admin-text)' }}>
                        {n.title}
                      </span>
                      {n.priority !== 'normal' ? <Pill tone={PRIORITY_TONE[n.priority]}>{n.priority}</Pill> : null}
                      {!n.isRead ? <span className="h-2 w-2 rounded-full bg-[#876DFF]" aria-label="unread" /> : null}
                    </div>
                    <p className="mt-0.5 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                      {n.message}
                    </p>
                    <div className="mt-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => remove(n, e)}
                    title="Delete"
                    className="rounded-lg p-1.5 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                    style={{ color: 'var(--admin-text-muted)' }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}

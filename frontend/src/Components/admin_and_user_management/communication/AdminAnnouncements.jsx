import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, Megaphone, Pencil, Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../layout/AdminLayout'
import * as maintenanceApi from '../../maintenance/api'
import { Card, EmptyState, Loading, PageHeader, Pill, StatCard, Tabs, btnDanger, btnGhost, btnPrimary, errMsg, inputCls, inputStyle, timeAgo } from '../shared/ui'

const PRIORITY_TONE = { urgent: 'rose', important: 'amber', normal: 'slate' }
const EMPTY = { title: '', content: '', priority: 'normal' }

// Hostel-wide announcements (maintenance schedules, water cuts, outages…). Backed by /api/maintenance/announcements.
export default function AdminAnnouncements() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null) // null | 'new' | announcement
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      setItems((await maintenanceApi.getAllAnnouncements()) || [])
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load announcements'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggle(a) {
    setBusyId(a._id)
    try {
      await maintenanceApi.toggleAnnouncement(a._id)
      toast.success(a.isActive ? 'Announcement hidden' : 'Announcement visible again')
      await load()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusyId(null)
    }
  }

  async function remove(a) {
    if (!window.confirm(`Delete "${a.title}" permanently?`)) return
    setBusyId(a._id)
    try {
      await maintenanceApi.deleteAnnouncement(a._id)
      toast.success('Announcement deleted')
      await load()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusyId(null)
    }
  }

  const shown = items.filter((a) => (filter === 'active' ? a.isActive : filter === 'hidden' ? !a.isActive : true))

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          icon={Megaphone}
          title="Announcements"
          subtitle="Post hostel updates everyone sees on their maintenance page."
          actions={
            <button type="button" className={btnPrimary} onClick={() => setEditing('new')}>
              <Plus className="h-4 w-4" /> New announcement
            </button>
          }
        />

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total" value={items.length} icon={Megaphone} />
          <StatCard label="Visible" value={items.filter((a) => a.isActive).length} icon={Eye} />
          <StatCard label="Urgent" value={items.filter((a) => a.priority === 'urgent' && a.isActive).length} icon={Megaphone} accent="rose" />
        </div>

        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Visible' },
            { key: 'hidden', label: 'Hidden' },
          ]}
        />

        {loading ? (
          <Card>
            <Loading />
          </Card>
        ) : shown.length === 0 ? (
          <Card>
            <EmptyState icon={Megaphone} title="No announcements" text="Create one to inform students, riders and technicians." />
          </Card>
        ) : (
          <div className="space-y-3">
            {shown.map((a) => (
              <Card key={a._id} className={`p-5 ${a.isActive ? '' : 'opacity-60'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold" style={{ color: 'var(--admin-text)' }}>
                        {a.title}
                      </h3>
                      <Pill tone={PRIORITY_TONE[a.priority]}>{a.priority}</Pill>
                      {!a.isActive ? <Pill tone="slate">hidden</Pill> : null}
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                      {a.content}
                    </p>
                    <div className="mt-2 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      Posted {timeAgo(a.createdAt)}
                      {a.createdBy?.fullName ? ` by ${a.createdBy.fullName}` : ''}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" title={a.isActive ? 'Hide' : 'Show'} disabled={busyId === a._id} onClick={() => toggle(a)} className={btnGhost} style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                      {a.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button type="button" title="Edit" onClick={() => setEditing(a)} className={btnGhost} style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" title="Delete" disabled={busyId === a._id} onClick={() => remove(a)} className={btnDanger}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {editing ? (
        <AnnouncementModal
          announcement={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      ) : null}
    </AdminLayout>
  )
}

function AnnouncementModal({ announcement, onClose, onSaved }) {
  const [form, setForm] = useState(announcement ? { title: announcement.title, content: announcement.content, priority: announcement.priority } : EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const titleOk = form.title.trim().length >= 5
  const contentOk = form.content.trim().length >= 20

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, title: form.title.trim(), content: form.content.trim() }
      if (announcement) await maintenanceApi.updateAnnouncement(announcement._id, payload)
      else await maintenanceApi.createAnnouncement(payload)
      toast.success(announcement ? 'Announcement updated' : 'Announcement posted')
      onSaved()
    } catch (err) {
      toast.error(errMsg(err, 'Failed to save announcement'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-lg rounded-3xl border p-6 shadow-2xl" style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{announcement ? 'Edit announcement' : 'New announcement'}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-[#BAF91A]/20">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 flex justify-between text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
              <span>Title (5–100 characters)</span>
              <span>{form.title.length}/100</span>
            </span>
            <input value={form.title} onChange={set('title')} maxLength={100} className={inputCls} style={inputStyle} required />
          </label>
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
            <span className="mb-1 flex justify-between text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
              <span>Content (20–500 characters)</span>
              <span>{form.content.length}/500</span>
            </span>
            <textarea value={form.content} onChange={set('content')} maxLength={500} rows={5} className={inputCls} style={inputStyle} required />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnGhost} style={{ borderColor: 'var(--admin-border)' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving || !titleOk || !contentOk} className={btnPrimary}>
            {saving ? 'Saving…' : announcement ? 'Save changes' : 'Post announcement'}
          </button>
        </div>
      </form>
    </div>
  )
}

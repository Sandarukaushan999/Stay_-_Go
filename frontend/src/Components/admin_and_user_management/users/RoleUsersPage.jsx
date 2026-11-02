import { useCallback, useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Ban, Bike, GraduationCap, Plus, Search, ShieldCheck, UserCheck, Users, Wrench, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import { Card, EmptyState, Loading, PageHeader, Pill, StatCard, btnGhost, btnPrimary, errMsg, inputCls, inputStyle } from '../shared/ui'

const CONFIG = {
  student: {
    title: 'Students',
    subtitle: 'Hostel residents, their rooms and roommate-matching progress.',
    icon: GraduationCap,
  },
  rider: {
    title: 'Riders',
    subtitle: 'Approved campus riders, their vehicles and availability.',
    icon: Bike,
  },
  technician: {
    title: 'Technicians',
    subtitle: 'Maintenance staff, their workload and document verification.',
    icon: Wrench,
  },
}

const VERIFY_TONE = { approved: 'lime', pending: 'amber', rejected: 'rose', none: 'slate' }
const AVAIL_TONE = { available: 'lime', busy: 'amber', online: 'lime', offline: 'slate' }
const ROOMMATE = {
  matched: ['lime', 'Roommate locked'],
  matching: ['violet', 'Looking for roommate'],
  profile: ['amber', 'Profile started'],
  none: ['slate', 'Not started'],
}

export default function RoleUsersPage({ role }) {
  const cfg = CONFIG[role]
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/users', { params: { role, q: q || undefined, page: 1, limit: 100 } })
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      setError(errMsg(err, `Failed to load ${cfg.title.toLowerCase()}`))
    } finally {
      setLoading(false)
    }
  }, [role, q, cfg.title])

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0) // debounce typing
    return () => clearTimeout(t)
  }, [load, q])

  async function toggleBlock(user) {
    setBusyId(user.id)
    try {
      await api.patch(`/admin/users/${user.id}/block`, { isBlocked: !user.isBlocked })
      toast.success(user.isBlocked ? `${user.fullName} unblocked` : `${user.fullName} blocked`)
      await load()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusyId(null)
    }
  }

  const stats = useMemo(() => {
    const blocked = items.filter((u) => u.isBlocked).length
    if (role === 'student') {
      return [
        { label: 'Total students', value: total, icon: Users },
        { label: 'Roommate locked', value: items.filter((u) => u.roommateStatus === 'matched').length, icon: UserCheck },
        { label: 'Room assigned', value: items.filter((u) => u.hostelRoom).length, icon: BadgeCheck, accent: 'violet' },
        { label: 'Blocked', value: blocked, icon: Ban, accent: 'rose' },
      ]
    }
    if (role === 'rider') {
      return [
        { label: 'Total riders', value: total, icon: Users },
        { label: 'Online now', value: items.filter((u) => ['online', 'available'].includes(u.availability)).length, icon: UserCheck },
        { label: 'Pending approval', value: items.filter((u) => u.riderVerificationStatus === 'pending').length, icon: ShieldCheck, accent: 'amber' },
        { label: 'Blocked', value: blocked, icon: Ban, accent: 'rose' },
      ]
    }
    return [
      { label: 'Total technicians', value: total, icon: Users },
      { label: 'Available now', value: items.filter((u) => u.availability === 'available').length, icon: UserCheck },
      { label: 'Awaiting verification', value: items.filter((u) => u.technicianVerificationStatus === 'pending').length, icon: ShieldCheck, accent: 'amber' },
      { label: 'Open jobs', value: items.reduce((n, u) => n + (u.openJobs || 0), 0), icon: Wrench, accent: 'violet' },
    ]
  }, [items, role, total])

  const th = 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide'
  const td = 'px-4 py-3 align-middle'

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          icon={cfg.icon}
          title={cfg.title}
          subtitle={cfg.subtitle}
          actions={
            role === 'technician' ? (
              <button type="button" className={btnPrimary} onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> Add technician
              </button>
            ) : null
          }
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4" style={{ borderColor: 'var(--admin-border)' }}>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--admin-text-muted)' }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${cfg.title.toLowerCase()} by name, email or ID…`}
                className={`${inputCls} pl-9`}
                style={inputStyle}
              />
            </div>
            <div className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              Showing {items.length} of {total}
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : error ? (
            <div className="p-6 text-sm text-rose-600">{error}</div>
          ) : items.length === 0 ? (
            <EmptyState icon={cfg.icon} title={`No ${cfg.title.toLowerCase()} found`} text={q ? 'Try a different search.' : 'They will appear here once they register.'} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead style={{ background: 'var(--admin-surface-2)', color: 'var(--admin-text-muted)' }}>
                  <tr>
                    <th className={th}>{cfg.title.slice(0, -1)}</th>
                    {role === 'student' && (
                      <>
                        <th className={th}>Student ID</th>
                        <th className={th}>Hostel room</th>
                        <th className={th}>Roommate matching</th>
                      </>
                    )}
                    {role === 'rider' && (
                      <>
                        <th className={th}>Vehicle</th>
                        <th className={th}>Seats</th>
                        <th className={th}>Rating</th>
                        <th className={th}>Status</th>
                      </>
                    )}
                    {role === 'technician' && (
                      <>
                        <th className={th}>Availability</th>
                        <th className={th}>Open jobs</th>
                        <th className={th}>Resolved</th>
                        <th className={th}>Verification</th>
                      </>
                    )}
                    <th className={th}>Account</th>
                    <th className={`${th} text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => (
                    <tr key={u.id} className="border-t transition hover:bg-[#BAF91A]/8" style={{ borderColor: 'var(--admin-border)' }}>
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <Avatar user={u} />
                          <div className="min-w-0">
                            <div className="truncate font-semibold" style={{ color: 'var(--admin-text)' }}>
                              {u.fullName}
                            </div>
                            <div className="truncate text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                              {u.email}
                              {u.phone ? ` · ${u.phone}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {role === 'student' && (
                        <>
                          <td className={td}>{u.studentId || '—'}</td>
                          <td className={td}>{u.hostelRoom || <span style={{ color: 'var(--admin-text-muted)' }}>Unassigned</span>}</td>
                          <td className={td}>
                            <Pill tone={ROOMMATE[u.roommateStatus || 'none'][0]}>{ROOMMATE[u.roommateStatus || 'none'][1]}</Pill>
                          </td>
                        </>
                      )}
                      {role === 'rider' && (
                        <>
                          <td className={td}>
                            <div className="capitalize">{u.vehicleType || '—'}</div>
                            <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                              {u.vehicleNumber || ''}
                            </div>
                          </td>
                          <td className={td}>{u.seatCount ?? '—'}</td>
                          <td className={td}>{u.rating != null ? `${Number(u.rating).toFixed(1)} ★` : '—'}</td>
                          <td className={td}>
                            <div className="flex flex-wrap gap-1">
                              <Pill tone={AVAIL_TONE[u.availability] || 'slate'}>{u.availability || 'offline'}</Pill>
                              <Pill tone={VERIFY_TONE[u.riderVerificationStatus || 'none']}>{u.riderVerificationStatus || 'none'}</Pill>
                            </div>
                          </td>
                        </>
                      )}
                      {role === 'technician' && (
                        <>
                          <td className={td}>
                            <Pill tone={AVAIL_TONE[u.availability] || 'slate'}>{u.availability || 'offline'}</Pill>
                          </td>
                          <td className={td}>{u.openJobs ?? 0}</td>
                          <td className={td}>{u.resolvedJobs ?? 0}</td>
                          <td className={td}>
                            <Pill tone={VERIFY_TONE[u.technicianVerificationStatus || 'none']}>
                              {u.technicianVerificationStatus && u.technicianVerificationStatus !== 'none' ? u.technicianVerificationStatus : 'not submitted'}
                            </Pill>
                          </td>
                        </>
                      )}

                      <td className={td}>
                        <Pill tone={u.isBlocked ? 'rose' : 'lime'}>{u.isBlocked ? 'blocked' : 'active'}</Pill>
                      </td>
                      <td className={`${td} text-right`}>
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => toggleBlock(u)}
                          className={btnGhost}
                          style={{ borderColor: 'var(--admin-border)', color: u.isBlocked ? 'var(--admin-text)' : '#e11d48' }}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {creating ? (
        <CreateTechnicianModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            load()
          }}
        />
      ) : null}
    </AdminLayout>
  )
}

function Avatar({ user }) {
  const initials = (user.fullName || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return user.profileImage ? (
    <img src={user.profileImage} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#BAF91A]/40 text-xs font-bold text-[#101312]">{initials}</span>
  )
}

function CreateTechnicianModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/admin/users', { ...form, phone: form.phone || undefined, role: 'technician' })
      toast.success('Technician account created')
      onCreated()
    } catch (err) {
      toast.error(errMsg(err, 'Failed to create technician'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border p-6 shadow-2xl" style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Add technician</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-[#BAF91A]/20">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Full name">
            <input className={inputCls} style={inputStyle} value={form.fullName} onChange={set('fullName')} required minLength={2} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} style={inputStyle} value={form.email} onChange={set('email')} required />
          </Field>
          <Field label="Phone (optional)">
            <input className={inputCls} style={inputStyle} value={form.phone} onChange={set('phone')} />
          </Field>
          <Field label="Temporary password (min 6)">
            <input type="password" className={inputCls} style={inputStyle} value={form.password} onChange={set('password')} required minLength={6} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnGhost} style={{ borderColor: 'var(--admin-border)' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

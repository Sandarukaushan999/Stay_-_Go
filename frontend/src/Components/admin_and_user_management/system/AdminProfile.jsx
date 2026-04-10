import { useState, useEffect, useRef } from 'react'
import { api } from '../../../lib/apiClient'
import { useAuthStore } from '../../../app/store/authStore'
import AdminLayout from '../layout/AdminLayout'
import {
  Loader2,
  User,
  Phone,
  Shield,
  Lock,
  Bell,
  Activity,
  Save,
  Upload,
  Settings,
  Smartphone,
  Mail,
  XCircle,
  LogOut,
} from 'lucide-react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const defaultSettings = {
  emailNotifications: true,
  smsNotifications: false,
  sosAlerts: true,
  systemUpdates: true,
  twoFactorEnabled: false,
}

export default function AdminProfile() {
  const { user, hydrateMe, logout } = useAuthStore()
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logs, setLogs] = useState([])

  const [form, setForm] = useState({ fullName: '', phone: '', emergencyContact: '' })
  const [settings, setSettings] = useState({ ...defaultSettings })
  const [avatarDataUrl, setAvatarDataUrl] = useState(null)
  const fileInputRef = useRef(null)

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passLoading, setPassLoading] = useState(false)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const [profRes, logRes] = await Promise.all([
        api.get('/admin/profile'),
        api.get('/admin/logs').catch(() => ({ data: { success: false, logs: [] } })),
      ])

      if (profRes.data?.success && profRes.data.user) {
        const u = profRes.data.user
        setProfileUser(u)
        setForm({
          fullName: u.fullName || '',
          phone: u.phone || '',
          emergencyContact: u.emergencyContact || '',
        })
        setAvatarDataUrl(null)
        if (u.systemSettings && typeof u.systemSettings === 'object') {
          setSettings((prev) => ({ ...prev, ...defaultSettings, ...u.systemSettings }))
        } else {
          setSettings({ ...defaultSettings })
        }
      }

      if (logRes.data?.success && Array.isArray(logRes.data.logs)) {
        setLogs(logRes.data.logs)
      } else {
        setLogs([])
      }
    } catch {
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const displayUser = profileUser || user

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const handlePassChange = (e) => setPassForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const handleToggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  const onPickAvatar = () => fileInputRef.current?.click()
  const onAvatarFile = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    if (f.size > 1.5 * 1024 * 1024) {
      toast.error('Image must be under 1.5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatarDataUrl(reader.result)
    }
    reader.readAsDataURL(f)
  }

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault()
    if (!form.fullName?.trim()) return toast.error('Full name is required.')
    setSaving(true)
    try {
      const body = { ...form, systemSettings: settings }
      if (avatarDataUrl) body.profileImage = avatarDataUrl
      await api.put('/admin/profile', body)
      toast.success('Admin profile & preferences saved')
      await hydrateMe()
      await fetchProfileData()
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error('New passwords do not match')
    }
    if (passForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    setPassLoading(true)
    try {
      await api.put('/admin/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      })
      toast.success('Password updated')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      const logRes = await api.get('/admin/logs')
      if (logRes.data?.success && Array.isArray(logRes.data.logs)) setLogs(logRes.data.logs)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed')
    } finally {
      setPassLoading(false)
    }
  }

  const triggerLogout = async () => {
    if (
      window.confirm(
        'Sign out of this administrative session on this device?'
      )
    ) {
      logout()
      window.location.href = '/auth/login'
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#876DFF]" />
        </div>
      </AdminLayout>
    )
  }

  const avatarSrc = avatarDataUrl || displayUser?.profileImage
  const created = displayUser?.createdAt

  return (
    <AdminLayout>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onAvatarFile}
      />

      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-[#101312]">Admin profile</h1>
          <p className="text-sm text-[#101312]/65">
            Manage your admin identity, security, notification preferences, and recent audit entries.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="relative overflow-hidden rounded-xl border border-[#101312]/12 bg-[#0f172a] p-6 text-white shadow-[0_10px_40px_rgba(16,19,18,0.12)]">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[100px] bg-[#876DFF]/10" />

              <div className="relative z-10 mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="group relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-800">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-slate-500">
                        {displayUser?.fullName?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onPickAvatar}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 text-xs font-semibold uppercase tracking-wider text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                  >
                    <Upload className="mr-1 h-4 w-4" />
                    Upload
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{displayUser?.fullName}</h2>
                  <p className="mt-0.5 text-slate-400">{displayUser?.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded bg-[#876DFF]/25 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#c4b5fd]">
                      <Shield className="h-3.5 w-3.5" />
                      {displayUser?.role?.replace?.('_', ' ') ?? displayUser?.role}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Member since {created ? dayjs(created).format('MMM YYYY') : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Display name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-[#876DFF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Mobile contact
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+94 …"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-[#876DFF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-rose-400/80">
                    Emergency contact
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-500/50" />
                    <input
                      type="text"
                      name="emergencyContact"
                      value={form.emergencyContact}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-rose-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#101312]/12 bg-[#0f172a] p-6 text-white shadow-[0_10px_40px_rgba(16,19,18,0.12)]">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <Lock className="h-5 w-5 text-[#BAF91A]" />
                Security
              </h3>

              <form
                onSubmit={handlePasswordUpdate}
                className="mb-6 grid grid-cols-1 gap-5 border-b border-slate-800 pb-6 sm:grid-cols-2"
              >
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Current password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="••••••••"
                    value={passForm.currentPassword}
                    onChange={handlePassChange}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-[#876DFF]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    New password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    value={passForm.newPassword}
                    onChange={handlePassChange}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-[#876DFF]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={passForm.confirmPassword}
                    onChange={handlePassChange}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-rose-500/50"
                  />
                </div>
                <div className="pt-1 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={passLoading || !passForm.newPassword || !passForm.currentPassword}
                    className="rounded-lg bg-slate-800 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {passLoading ? 'Updating…' : 'Change password'}
                  </button>
                </div>
              </form>

              <div className="flex items-center justify-between gap-4">
                <div className="pr-4">
                  <div className="font-semibold text-slate-200">Two-factor preference</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Stored with your profile — use <strong>Commit identity changes</strong> below to save all
                    notification &amp; security toggles together.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('twoFactorEnabled')}
                  className={`relative h-6 w-12 shrink-0 rounded-full transition-colors ${settings.twoFactorEnabled ? 'bg-[#876DFF]' : 'bg-slate-700'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-[#101312]/12 bg-[#0f172a] p-6 text-white shadow-[0_10px_40px_rgba(16,19,18,0.12)]">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <Bell className="h-5 w-5 text-[#BAF91A]" />
                Subscriptions
              </h3>

              <div className="space-y-5">
                <ToggleRow
                  icon={<Mail className="h-4 w-4 text-emerald-400" />}
                  label="Administrative summaries (email)"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <ToggleRow
                  icon={<Activity className="h-4 w-4 text-rose-400" />}
                  label="SOS & safety alerts"
                  checked={settings.sosAlerts}
                  onChange={() => handleToggle('sosAlerts')}
                />
                <ToggleRow
                  icon={<Settings className="h-4 w-4 text-indigo-400" />}
                  label="Platform update notices"
                  checked={settings.systemUpdates}
                  onChange={() => handleToggle('systemUpdates')}
                />
                <ToggleRow
                  icon={<Smartphone className="h-4 w-4 text-slate-400" />}
                  label="SMS escalation"
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#101312]/12 bg-[#0f172a] p-6 text-white shadow-[0_10px_40px_rgba(16,19,18,0.12)]">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <Activity className="h-5 w-5 text-emerald-400" />
                Activity trace
              </h3>

              <div className="mb-6 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="mb-1 text-xs font-bold uppercase text-slate-500">Last login</div>
                <div className="text-sm font-medium text-emerald-400">
                  {displayUser?.lastLogin
                    ? dayjs(displayUser.lastLogin).format('MMMM D, YYYY h:mm:ss A')
                    : '—'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2 text-xs font-bold uppercase text-slate-500">
                  Recent security audits
                </div>
                {logs.length === 0 ? (
                  <div className="text-sm italic text-slate-600">No audit entries yet.</div>
                ) : (
                  logs.map((log, idx) => (
                    <div
                      key={log._id ?? log.id ?? idx}
                      className="relative border-l border-slate-800 pl-4"
                    >
                      <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-700 ring-4 ring-[#0f172a]" />
                      <div className="mb-0.5 text-xs text-slate-400">
                        {log.createdAt ? dayjs(log.createdAt).fromNow() : '—'}
                      </div>
                      <div className="break-words text-sm text-slate-300">{log.description}</div>
                      <div className="mt-1 font-mono text-[10px] uppercase text-slate-600">
                        {log.actionType}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-[#101312]/12 bg-[#0f172a] p-4 text-white sm:flex-row sm:px-6">
          <button
            type="button"
            onClick={triggerLogout}
            className="flex items-center gap-2 py-2 text-sm font-medium text-rose-400 transition-colors hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>

          <div className="mt-0 flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={fetchProfileData}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-5 py-2 text-slate-300 transition hover:bg-slate-700 sm:flex-none"
            >
              <XCircle className="h-4 w-4 text-slate-400" />
              Reload
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#876DFF] px-6 py-2 font-medium text-white transition hover:bg-[#765ae9] disabled:opacity-60 sm:flex-none"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Commit identity changes
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function ToggleRow({ icon, label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-lg bg-slate-800/50 p-2">{icon}</div>
        <div className="text-sm font-medium text-slate-300">{label}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative ml-4 h-5 w-10 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#876DFF]' : 'bg-slate-700'}`}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  )
}

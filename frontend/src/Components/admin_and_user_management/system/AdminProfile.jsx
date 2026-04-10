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

      <div
        className="mx-auto max-w-5xl space-y-6 pb-12"
        style={{ fontFamily: '"Poppins", "Manrope", "Trebuchet MS", sans-serif' }}
      >
        <div className="rounded-3xl border border-[#101312]/12 bg-white p-5 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-6">
          <h1 className="text-2xl font-semibold text-[#101312]">Admin profile</h1>
          <p className="mt-2 text-sm text-[#101312]/70">
            Manage your admin identity, security, notification preferences, and recent audit entries — Stay &amp; Go
            workspace colors.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-[#101312]/12 bg-white p-6 shadow-[0_10px_30px_rgba(16,19,18,0.06)]">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[80px] bg-[#E2FF99]/80" />

              <div className="relative z-10 mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="group relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#101312]/12 bg-[#f9fce9]">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-[#101312]/40">
                        {displayUser?.fullName?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onPickAvatar}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#101312]/55 text-xs font-semibold uppercase tracking-wider text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                  >
                    <Upload className="mr-1 h-4 w-4" />
                    Upload
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-[#101312]">{displayUser?.fullName}</h2>
                  <p className="mt-0.5 text-sm text-[#101312]/65">{displayUser?.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#876DFF]/12 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#5b4ccc]">
                      <Shield className="h-3.5 w-3.5" />
                      {displayUser?.role?.replace?.('_', ' ') ?? displayUser?.role}
                    </span>
                    <span className="text-xs font-medium text-[#101312]/55">
                      Member since {created ? dayjs(created).format('MMM YYYY') : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">
                    Display name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#101312]/40" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#101312]/18 bg-[#fafdf4] py-2.5 pl-10 pr-4 text-sm text-[#101312] outline-none transition focus:border-[#BAF91A] focus:ring-2 focus:ring-[#BAF91A]/35"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">
                    Mobile contact
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#101312]/40" />
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+94 …"
                      className="w-full rounded-xl border border-[#101312]/18 bg-[#fafdf4] py-2.5 pl-10 pr-4 text-sm text-[#101312] outline-none transition focus:border-[#876DFF]/50 focus:ring-2 focus:ring-[#876DFF]/25"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">
                    Emergency contact
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#876DFF]/50" />
                    <input
                      type="text"
                      name="emergencyContact"
                      value={form.emergencyContact}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#101312]/18 bg-[#fafdf4] py-2.5 pl-10 pr-4 text-sm text-[#101312] outline-none transition focus:border-[#876DFF]/50 focus:ring-2 focus:ring-[#876DFF]/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#101312]/12 bg-white p-6 shadow-[0_10px_30px_rgba(16,19,18,0.06)]">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-[#101312]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E2FF99]">
                  <Lock className="h-5 w-5 text-[#101312]" />
                </span>
                Security
              </h3>

              <form
                onSubmit={handlePasswordUpdate}
                className="mb-6 grid grid-cols-1 gap-5 border-b border-[#101312]/10 pb-6 sm:grid-cols-2"
              >
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">
                    Current password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="••••••••"
                    value={passForm.currentPassword}
                    onChange={handlePassChange}
                    className="w-full rounded-xl border border-[#101312]/18 bg-[#fafdf4] px-4 py-2.5 text-sm text-[#101312] outline-none transition focus:border-[#101312]/35 focus:ring-2 focus:ring-[#BAF91A]/35"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">
                    New password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    value={passForm.newPassword}
                    onChange={handlePassChange}
                    className="w-full rounded-xl border border-[#101312]/18 bg-[#fafdf4] px-4 py-2.5 text-sm text-[#101312] outline-none transition focus:border-[#101312]/35 focus:ring-2 focus:ring-[#BAF91A]/35"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={passForm.confirmPassword}
                    onChange={handlePassChange}
                    className="w-full rounded-xl border border-[#101312]/18 bg-[#fafdf4] px-4 py-2.5 text-sm text-[#101312] outline-none transition focus:border-[#101312]/35 focus:ring-2 focus:ring-[#BAF91A]/35"
                  />
                </div>
                <div className="pt-1 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={passLoading || !passForm.newPassword || !passForm.currentPassword}
                    className="rounded-xl border border-[#101312]/15 bg-[#101312] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a211f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {passLoading ? 'Updating…' : 'Change password'}
                  </button>
                </div>
              </form>

              <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f9fce9] p-4">
                <div className="pr-4">
                  <div className="font-semibold text-[#101312]">Two-factor preference</div>
                  <div className="mt-1 text-sm text-[#101312]/65">
                    Use <strong className="text-[#101312]">Commit identity changes</strong> below to save with your
                    other toggles.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('twoFactorEnabled')}
                  className={`relative h-6 w-12 shrink-0 rounded-full transition-colors ${settings.twoFactorEnabled ? 'bg-[#BAF91A]' : 'bg-[#101312]/15'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#101312]/12 bg-white p-6 shadow-[0_10px_30px_rgba(16,19,18,0.06)]">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-[#101312]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#876DFF]/12">
                  <Bell className="h-5 w-5 text-[#876DFF]" />
                </span>
                Subscriptions
              </h3>

              <div className="space-y-3">
                <ToggleRow
                  icon={<Mail className="h-4 w-4 text-[#101312]" />}
                  label="Administrative summaries (email)"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <ToggleRow
                  icon={<Activity className="h-4 w-4 text-[#876DFF]" />}
                  label="SOS & safety alerts"
                  checked={settings.sosAlerts}
                  onChange={() => handleToggle('sosAlerts')}
                />
                <ToggleRow
                  icon={<Settings className="h-4 w-4 text-[#101312]/70" />}
                  label="Platform update notices"
                  checked={settings.systemUpdates}
                  onChange={() => handleToggle('systemUpdates')}
                />
                <ToggleRow
                  icon={<Smartphone className="h-4 w-4 text-[#101312]/55" />}
                  label="SMS escalation"
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#101312]/12 bg-white p-6 shadow-[0_10px_30px_rgba(16,19,18,0.06)]">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-[#101312]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E2FF99]">
                  <Activity className="h-5 w-5 text-[#101312]" />
                </span>
                Activity trace
              </h3>

              <div className="mb-6 rounded-xl border border-[#101312]/10 bg-[#fafdf4] p-4">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[#101312]/50">Last login</div>
                <div className="text-sm font-semibold text-[#101312]">
                  {displayUser?.lastLogin
                    ? dayjs(displayUser.lastLogin).format('MMMM D, YYYY h:mm:ss A')
                    : '—'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-[#101312]/10 pb-2 text-xs font-bold uppercase tracking-wide text-[#101312]/50">
                  Recent security audits
                </div>
                {logs.length === 0 ? (
                  <div className="text-sm italic text-[#101312]/50">No audit entries yet.</div>
                ) : (
                  logs.map((log, idx) => (
                    <div
                      key={log._id ?? log.id ?? idx}
                      className="relative border-l-2 border-[#876DFF]/35 pl-4"
                    >
                      <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#BAF91A] ring-4 ring-white" />
                      <div className="mb-0.5 text-xs text-[#101312]/55">
                        {log.createdAt ? dayjs(log.createdAt).fromNow() : '—'}
                      </div>
                      <div className="break-words text-sm text-[#101312]/85">{log.description}</div>
                      <div className="mt-1 font-mono text-[10px] uppercase text-[#101312]/45">{log.actionType}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#101312]/12 bg-white p-4 shadow-[0_10px_30px_rgba(16,19,18,0.06)] sm:flex-row sm:px-6">
          <button
            type="button"
            onClick={triggerLogout}
            className="flex items-center gap-2 py-2 text-sm font-semibold text-rose-600 transition-colors hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>

          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={fetchProfileData}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#101312]/18 bg-white px-5 py-2.5 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]/50 sm:flex-none"
            >
              <XCircle className="h-4 w-4 text-[#101312]/50" />
              Reload
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#BAF91A] px-6 py-2.5 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00] disabled:opacity-60 sm:flex-none"
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#101312]/08 bg-[#fafdf4] px-3 py-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-lg bg-[#E2FF99]/90 p-2 text-[#101312]">{icon}</div>
        <div className="text-sm font-medium text-[#101312]/85">{label}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative ml-2 h-5 w-10 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#BAF91A]' : 'bg-[#101312]/12'}`}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  )
}

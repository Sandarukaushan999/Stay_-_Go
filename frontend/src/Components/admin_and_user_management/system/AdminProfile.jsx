import { useState, useEffect, useRef } from 'react'
import { api } from '../../../lib/apiClient'
import { useAuthStore } from '../../../app/store/authStore'
import AdminLayout from '../layout/AdminLayout'
import {
  Loader2, User, Phone, Shield, Lock, Bell, Activity,
  Save, Upload, Settings, Smartphone, Mail, XCircle, LogOut,
  Eye, EyeOff, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import ProfileImageCropper from '../users/ProfileImageCropper'

dayjs.extend(relativeTime)

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'A'
}

function resolveImageSrc(profileImage, googlePicture) {
  const src = profileImage || googlePicture || null
  if (!src) return null
  if (src.startsWith('http')) return src
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '')
  return `${base}/${src.replace(/^\//, '')}`
}

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
  const [formErrors, setFormErrors] = useState({})
  const [settings, setSettings] = useState({ ...defaultSettings })

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passErrors, setPassErrors] = useState({})
  const [passLoading, setPassLoading] = useState(false)
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })

  // Password strength
  const newPass = passForm.newPassword
  const passReqs = [
    { label: 'At least 8 characters', met: newPass.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(newPass) },
    { label: 'One lowercase letter', met: /[a-z]/.test(newPass) },
    { label: 'One number', met: /\d/.test(newPass) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(newPass) },
  ]
  const metCount = passReqs.filter(r => r.met).length
  const strength = newPass.length === 0 ? 0 : metCount <= 2 ? 1 : metCount <= 4 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-rose-400', 'bg-amber-400', 'bg-[#BAF91A]'][strength]
  const isPassValid = strength >= 2
  const isConfirmValid = newPass === passForm.confirmPassword && passForm.confirmPassword.length > 0

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

  const validateForm = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number'
    if (form.emergencyContact && !/^\+?[\d\s\-()]{7,15}$/.test(form.emergencyContact)) errs.emergencyContact = 'Enter a valid phone number'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    try {
      const body = { ...form, systemSettings: settings }
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
    const errs = {}
    if (!passForm.currentPassword) errs.currentPassword = 'Current password is required'
    if (!isPassValid) errs.newPassword = 'Password does not meet requirements'
    if (!isConfirmValid) errs.confirmPassword = 'Passwords do not match'
    setPassErrors(errs)
    if (Object.keys(errs).length > 0) return

    setPassLoading(true)
    try {
      await api.put('/admin/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      })
      toast.success('Password updated successfully!')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPassErrors({})
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


  const created = displayUser?.createdAt

  return (
    <AdminLayout>
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
                <div className="w-[180px] shrink-0">
                  <ProfileImageCropper 
                    imgSrc={resolveImageSrc(displayUser?.profileImage, displayUser?.googlePicture)} 
                    initials={getInitials(displayUser?.fullName)} 
                    onUploadSuccess={fetchProfileData} 
                  />
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
                      onChange={e => { handleChange(e); setFormErrors(p=>({...p,fullName:''})) }}
                      className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-[#101312] outline-none transition bg-[#fafdf4] focus:ring-2 ${
                        formErrors.fullName ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#101312]/18 focus:border-[#BAF91A] focus:ring-[#BAF91A]/35'
                      }`}
                    />
                  {formErrors.fullName && <p className="mt-1 text-xs text-rose-500">{formErrors.fullName}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">Mobile contact</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#101312]/40" />
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={e => { handleChange(e); setFormErrors(p=>({...p,phone:''})) }}
                      placeholder="+94 7X XXX XXXX"
                      className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-[#101312] outline-none transition bg-[#fafdf4] focus:ring-2 ${
                        formErrors.phone ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#101312]/18 focus:border-[#876DFF]/50 focus:ring-[#876DFF]/25'
                      }`}
                    />
                  {formErrors.phone && <p className="mt-1 text-xs text-rose-500">{formErrors.phone}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">Emergency contact</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#876DFF]/50" />
                    <input
                      type="text"
                      name="emergencyContact"
                      value={form.emergencyContact}
                      onChange={e => { handleChange(e); setFormErrors(p=>({...p,emergencyContact:''})) }}
                      placeholder="+94 7X XXX XXXX"
                      className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-[#101312] outline-none transition bg-[#fafdf4] focus:ring-2 ${
                        formErrors.emergencyContact ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#101312]/18 focus:border-[#876DFF]/50 focus:ring-[#876DFF]/20'
                      }`}
                    />
                  {formErrors.emergencyContact && <p className="mt-1 text-xs text-rose-500">{formErrors.emergencyContact}</p>}
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

              <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Current password */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#101312]/35" />
                    <input
                      type={showPass.current ? 'text' : 'password'}
                      name="currentPassword"
                      placeholder="••••••••"
                      value={passForm.currentPassword}
                      onChange={e => { handlePassChange(e); setPassErrors(p=>({...p,currentPassword:''})) }}
                      className={`w-full rounded-xl border py-2.5 pl-10 pr-11 text-sm text-[#101312] outline-none transition bg-[#fafdf4] focus:ring-2 ${
                        passErrors.currentPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-[#101312]/18 focus:border-[#BAF91A] focus:ring-[#BAF91A]/35'
                      }`}
                    />
                    <button type="button" onClick={() => setShowPass(p=>({...p,current:!p.current}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#101312]/40 hover:text-[#101312]">
                      {showPass.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passErrors.currentPassword && <p className="mt-1 text-xs text-rose-500">{passErrors.currentPassword}</p>}
                </div>

                {/* New password */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#101312]/35" />
                    <input
                      type={showPass.new ? 'text' : 'password'}
                      name="newPassword"
                      placeholder="••••••••"
                      value={passForm.newPassword}
                      onChange={e => { handlePassChange(e); setPassErrors(p=>({...p,newPassword:''})) }}
                      className={`w-full rounded-xl border py-2.5 pl-10 pr-11 text-sm text-[#101312] outline-none transition bg-[#fafdf4] focus:ring-2 ${
                        passErrors.newPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-[#101312]/18 focus:border-[#BAF91A] focus:ring-[#BAF91A]/35'
                      }`}
                    />
                    <button type="button" onClick={() => setShowPass(p=>({...p,new:!p.new}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#101312]/40 hover:text-[#101312]">
                      {showPass.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {newPass.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1,2,3].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-[#101312]/10'}`} />)}
                      </div>
                      <p className={`mt-1 text-[11px] font-semibold ${ strength===1?'text-rose-500':strength===2?'text-amber-500':'text-[#4a7c00]' }`}>{strengthLabel}</p>
                    </div>
                  )}
                  {passErrors.newPassword && <p className="mt-1 text-xs text-rose-500">{passErrors.newPassword}</p>}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#101312]/55">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#101312]/35" />
                    <input
                      type={showPass.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={passForm.confirmPassword}
                      onChange={e => { handlePassChange(e); setPassErrors(p=>({...p,confirmPassword:''})) }}
                      className={`w-full rounded-xl border py-2.5 pl-10 pr-11 text-sm text-[#101312] outline-none transition bg-[#fafdf4] focus:ring-2 ${
                        passErrors.confirmPassword ? 'border-rose-400 focus:ring-rose-200' : isConfirmValid ? 'border-[#BAF91A] focus:ring-[#BAF91A]/35' : 'border-[#101312]/18 focus:border-[#BAF91A] focus:ring-[#BAF91A]/35'
                      }`}
                    />
                    <button type="button" onClick={() => setShowPass(p=>({...p,confirm:!p.confirm}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#101312]/40 hover:text-[#101312]">
                      {showPass.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passErrors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{passErrors.confirmPassword}</p>}
                </div>

                {/* Requirements + submit */}
                <div className="sm:col-span-2">
                  <div className="mb-4 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {passReqs.map(r => (
                      <div key={r.label} className={`flex items-center gap-1.5 text-xs ${ r.met ? 'text-[#4a7c00]' : 'text-[#101312]/40' }`}>
                        <CheckCircle2 className={`h-3.5 w-3.5 ${ r.met ? 'text-[#4a7c00]' : 'text-[#101312]/25' }`} />
                        {r.label}
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="rounded-xl bg-[#101312] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a211f] disabled:opacity-50"
                  >
                    {passLoading ? 'Updating…' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
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

      {/* Toggle track — w-12 = 48px, h-6 = 24px */}
      <button
        type="button"
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        style={{ position: 'relative', width: 48, height: 24, borderRadius: 999, flexShrink: 0,
          backgroundColor: checked ? '#BAF91A' : 'rgba(16,19,18,0.2)',
          boxShadow: checked ? '0 0 10px rgba(186,249,26,0.5)' : 'none',
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
          border: 'none', cursor: 'pointer',
        }}
      >
        {/* Knob — 20px × 20px, 2px padding each side */}
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            transform: checked ? 'translateX(24px)' : 'translateX(0px)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
    </div>
  )
}


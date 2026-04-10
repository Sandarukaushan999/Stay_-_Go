import { useState, useEffect } from 'react'
import { Loader2, Palette, Bell, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'

export default function DashboardSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'English',
    emailNotifications: true,
    smsNotifications: false,
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile/me')
      if (data.success && data.user?.systemSettings) {
        setSettings({
          theme: data.user.systemSettings.theme || 'dark',
          language: data.user.systemSettings.language || 'English',
          emailNotifications: data.user.systemSettings.emailNotifications ?? true,
          smsNotifications: data.user.systemSettings.smsNotifications ?? false,
        })
      }
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleChange = (e) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/users/profile/me', { systemSettings: settings })
      toast.success('Dashboard settings saved')
      if (settings.theme === 'light') {
        toast('Light theme support may be partial; admin shell uses the lime workspace theme.', { icon: '☀️' })
      }
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const cardClass = 'rounded-2xl border border-[#101312]/12 bg-[#fafdf4] p-5 sm:p-6'
  const innerToggleClass =
    'flex items-center justify-between rounded-xl border border-[#101312]/10 bg-white p-4 shadow-sm'

  return (
    <AdminLayout>
      <div className="rounded-3xl border border-[#101312]/15 bg-white p-5 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E2FF99] text-[#101312]">
            <Palette className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#101312]">Dashboard Settings</h1>
            <p className="mt-2 text-[#101312]/70">
              Preferences for your admin experience. Matches Ride Sharing Workspace styling.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#101312]/40" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 max-w-4xl space-y-6">
            <div className={cardClass}>
              <div className="mb-5 flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#101312]" />
                <h2 className="text-lg font-semibold text-[#101312]">Appearance</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#101312]/70">Color theme</label>
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 cursor-pointer rounded-xl border p-4 transition ${
                        settings.theme === 'dark'
                          ? 'border-[#101312] bg-[#E2FF99]/50 ring-2 ring-[#BAF91A]/60'
                          : 'border-[#101312]/15 bg-white hover:border-[#101312]/25'
                      }`}
                    >
                      <input type="radio" name="theme" value="dark" checked={settings.theme === 'dark'} onChange={handleChange} className="sr-only" />
                      <div className="font-semibold text-[#101312]">Dark</div>
                      <div className="text-xs text-[#101312]/55">Default for operations</div>
                    </label>
                    <label
                      className={`flex-1 cursor-pointer rounded-xl border p-4 transition ${
                        settings.theme === 'light'
                          ? 'border-[#101312] bg-[#E2FF99]/50 ring-2 ring-[#BAF91A]/60'
                          : 'border-[#101312]/15 bg-white hover:border-[#101312]/25'
                      }`}
                    >
                      <input type="radio" name="theme" value="light" checked={settings.theme === 'light'} onChange={handleChange} className="sr-only" />
                      <div className="font-semibold text-[#101312]">Light</div>
                      <div className="text-xs text-[#101312]/55">Brighter panels</div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#101312]/70">System language</label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#101312]/40" />
                    <select
                      name="language"
                      value={settings.language}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-xl border border-[#101312]/20 bg-white py-3 pl-10 pr-4 text-sm text-[#101312] outline-none focus:ring-2 focus:ring-[#BAF91A]/50"
                    >
                      <option value="English">English</option>
                      <option value="Sinhala">Sinhala</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-5 flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#101312]" />
                <h2 className="text-lg font-semibold text-[#101312]">Alert preferences</h2>
              </div>

              <div className="space-y-3">
                <div className={innerToggleClass}>
                  <div>
                    <div className="font-medium text-[#101312]">Email system alerts</div>
                    <div className="text-sm text-[#101312]/60">Server issues, SOS, and critical events.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('emailNotifications')}
                    className={`relative h-6 w-12 rounded-full transition-colors ${settings.emailNotifications ? 'bg-[#BAF91A]' : 'bg-[#101312]/20'}`}
                    aria-pressed={settings.emailNotifications}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className={innerToggleClass}>
                  <div>
                    <div className="font-medium text-[#101312]">SMS escalation</div>
                    <div className="text-sm text-[#101312]/60">Critical ride-sharing alerts via SMS.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('smsNotifications')}
                    className={`relative h-6 w-12 rounded-full transition-colors ${settings.smsNotifications ? 'bg-[#BAF91A]' : 'bg-[#101312]/20'}`}
                    aria-pressed={settings.smsNotifications}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        settings.smsNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#BAF91A] px-8 py-3 text-sm font-semibold text-[#101312] transition hover:bg-[#a8e010] disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  )
}

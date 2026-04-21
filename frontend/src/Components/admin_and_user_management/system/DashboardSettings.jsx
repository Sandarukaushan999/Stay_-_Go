import { useState, useEffect } from 'react'
import { Loader2, Palette, Bell, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'
import { useTheme } from '../../../app/hooks/useTheme'
import { useTranslation } from '../../../app/i18n/TranslationContext'

export default function DashboardSettings() {
  const { theme, toggleTheme } = useTheme()
  const { t, changeLanguage } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
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
        const s = data.user.systemSettings
        setSettings({
          language: s.language || 'English',
          emailNotifications: s.emailNotifications ?? true,
          smsNotifications: s.smsNotifications ?? false,
        })
        // Sync saved theme preference
        if (s.theme && s.theme !== theme) toggleTheme(s.theme)
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

  // Theme selection: apply immediately + store in localStorage via useTheme
  const handleThemeSelect = (selected) => {
    toggleTheme(selected)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/users/profile/me', {
        systemSettings: { ...settings, theme },
      })
      changeLanguage(settings.language) // Apply language globally on save
      toast.success(t('dashboardSettings.saveSettings'))
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // Fixed toggle button component (no overflow-hidden)
  const Toggle = ({ checked, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={checked}
      style={{
        position: 'relative', width: 48, height: 24, borderRadius: 999,
        flexShrink: 0, border: 'none', cursor: 'pointer',
        backgroundColor: checked ? '#BAF91A' : 'rgba(16,19,18,0.2)',
        boxShadow: checked ? '0 0 10px rgba(186,249,26,0.45)' : 'none',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: 2,
        width: 20, height: 20, borderRadius: '50%',
        backgroundColor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        transform: checked ? 'translateX(24px)' : 'translateX(0)',
        transition: 'transform 0.2s ease',
      }} />
    </button>
  )

  return (
    <AdminLayout>
      <div
        className="rounded-3xl border p-5 sm:p-6 transition-colors duration-300"
        style={{
          background: 'var(--admin-surface)',
          borderColor: 'var(--admin-border)',
          boxShadow: 'var(--admin-card-shadow)',
        }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-start gap-3 mb-8">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(186,249,26,0.18)' }}
          >
            <Palette className="h-6 w-6" style={{ color: '#BAF91A' }} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--admin-text)' }}>
              {t('dashboardSettings.title')}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              {t('dashboardSettings.subtitle')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--admin-text-muted)' }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">

            {/* ── Appearance ── */}
            <div
              className="rounded-2xl border p-5 sm:p-6 transition-colors duration-300"
              style={{ background: 'var(--admin-surface-2)', borderColor: 'var(--admin-border)' }}
            >
              <div className="mb-5 flex items-center gap-2">
                <Palette className="h-5 w-5" style={{ color: 'var(--admin-text)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>
                  {t('dashboardSettings.appearance')}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Color theme */}
                <div>
                  <label className="mb-3 block text-sm font-medium" style={{ color: 'var(--admin-text-muted)' }}>
                    {t('dashboardSettings.colorTheme')}
                  </label>
                  <div className="flex gap-3">
                    {/* Dark card */}
                    <button
                      type="button"
                      onClick={() => handleThemeSelect('dark')}
                      className="flex-1 cursor-pointer rounded-xl border p-4 text-left transition-all duration-200"
                      style={{
                        borderColor: theme === 'dark' ? '#BAF91A' : 'var(--admin-border)',
                        background: theme === 'dark' ? 'rgba(186,249,26,0.10)' : '#1a2118',
                        boxShadow: theme === 'dark' ? '0 0 0 2px rgba(186,249,26,0.3)' : 'none',
                      }}
                    >
                      <div className="font-semibold text-[#e8efe8]">{t('dashboardSettings.dark')}</div>
                      <div className="text-xs" style={{ color: 'rgba(232,239,232,0.55)' }}>
                        {t('dashboardSettings.darkDesc')}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeSelect('light')}
                      className="flex-1 cursor-pointer rounded-xl border p-4 text-left transition-all duration-200"
                      style={{
                        borderColor: theme === 'light' ? '#BAF91A' : 'rgba(16,19,18,0.15)',
                        background: theme === 'light' ? 'rgba(186,249,26,0.10)' : '#ffffff',
                        boxShadow: theme === 'light' ? '0 0 0 2px rgba(186,249,26,0.3)' : 'none',
                      }}
                    >
                      <div className="font-semibold" style={{ color: '#101312' }}>{t('dashboardSettings.light')}</div>
                      <div className="text-xs" style={{ color: 'rgba(16,19,18,0.55)' }}>{t('dashboardSettings.lightDesc')}</div>
                    </button>
                  </div>
                </div>

                {/* System language */}
                <div>
                  <label className="mb-3 block text-sm font-medium" style={{ color: 'var(--admin-text-muted)' }}>
                    {t('dashboardSettings.systemLanguage')}
                  </label>
                  <div className="relative">
                    <Globe
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: 'var(--admin-text-muted)' }}
                    />
                    <select
                      name="language"
                      value={settings.language}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-xl border py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#BAF91A]/50 transition-colors duration-300"
                      style={{
                        background: 'var(--admin-input-bg)',
                        borderColor: 'var(--admin-border)',
                        color: 'var(--admin-text)',
                      }}
                    >
                      <option value="English">English</option>
                      <option value="Sinhala">Sinhala</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Alert preferences ── */}
            <div
              className="rounded-2xl border p-5 sm:p-6 transition-colors duration-300"
              style={{ background: 'var(--admin-surface-2)', borderColor: 'var(--admin-border)' }}
            >
              <div className="mb-5 flex items-center gap-2">
                <Bell className="h-5 w-5" style={{ color: 'var(--admin-text)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>
                  {t('dashboardSettings.alertPreferences')}
                </h2>
              </div>

              <div className="space-y-3">
                {/* Email alerts */}
                <div
                  className="flex items-center justify-between rounded-xl border p-4 transition-colors duration-300"
                  style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
                >
                  <div>
                    <div className="font-medium" style={{ color: 'var(--admin-text)' }}>
                      {t('dashboardSettings.emailAlerts')}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                      {t('dashboardSettings.emailAlertsDesc')}
                    </div>
                  </div>
                  <Toggle checked={settings.emailNotifications} onToggle={() => handleToggle('emailNotifications')} />
                </div>

                {/* SMS escalation */}
                <div
                  className="flex items-center justify-between rounded-xl border p-4 transition-colors duration-300"
                  style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
                >
                  <div>
                    <div className="font-medium" style={{ color: 'var(--admin-text)' }}>
                      {t('dashboardSettings.smsEscalation')}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                      {t('dashboardSettings.smsEscalationDesc')}
                    </div>
                  </div>
                  <Toggle checked={settings.smsNotifications} onToggle={() => handleToggle('smsNotifications')} />
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#BAF91A] px-8 py-3 text-sm font-semibold transition hover:bg-[#a8e010] disabled:opacity-60"
                style={{ color: '#101312' }}
              >
                {saving ? t('dashboardSettings.saving') : t('dashboardSettings.saveSettings')}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  )
}

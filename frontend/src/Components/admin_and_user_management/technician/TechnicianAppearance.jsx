import { useState, useEffect } from 'react'
import { Loader2, Palette, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import TechnicianLayout from '../layout/TechnicianLayout'
import { api } from '../../../lib/apiClient'
import { useTheme } from '../../../app/hooks/useTheme'
import { useTranslation } from '../../../app/i18n/TranslationContext'

export default function TechnicianAppearance() {
  const { theme, toggleTheme } = useTheme()
  const { t, changeLanguage } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({ language: 'English' })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile/me')
      if (data.success && data.user?.systemSettings) {
        const s = data.user.systemSettings
        setSettings({ language: s.language || 'English' })
        if (s.theme && s.theme !== theme) toggleTheme(s.theme)
      }
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const handleThemeSelect = (selected) => toggleTheme(selected)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/users/profile/me', { systemSettings: { ...settings, theme } })
      changeLanguage(settings.language)
      toast.success(t('dashboardSettings.saveSettings'))
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <TechnicianLayout>
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#BAF91A]">
          <Palette className="h-6 w-6 text-[#101312]" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#101312]">{t('dashboardSettings.appearance')}</h1>
          <p className="mt-1 text-sm text-[#101312]/55">Manage your theme and language preferences.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#101312]/40" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="rounded-2xl border border-[#101312]/12 bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(16,19,18,0.06)]">
            <div className="grid gap-6 md:grid-cols-2">

              {/* Theme selector */}
              <div>
                <label className="mb-3 block text-sm font-medium text-[#101312]/55">
                  {t('dashboardSettings.colorTheme')}
                </label>
                <div className="flex gap-3">
                  {/* Dark mode card */}
                  <button
                    type="button"
                    onClick={() => handleThemeSelect('dark')}
                    className={`flex-1 cursor-pointer rounded-xl border p-4 text-left transition-all duration-200 ${
                      theme === 'dark'
                        ? 'border-[#BAF91A] bg-[#101312] shadow-[0_0_0_2px_rgba(186,249,26,0.25)]'
                        : 'border-[#101312]/12 bg-[#101312]'
                    }`}
                  >
                    <div className="font-semibold text-[#E2FF99]">{t('dashboardSettings.dark')}</div>
                    <div className="text-xs text-[#E2FF99]/55 mt-0.5">{t('dashboardSettings.darkDesc')}</div>
                    {theme === 'dark' && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#BAF91A] uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#BAF91A]" /> Active
                      </div>
                    )}
                  </button>

                  {/* Light mode card */}
                  <button
                    type="button"
                    onClick={() => handleThemeSelect('light')}
                    className={`flex-1 cursor-pointer rounded-xl border p-4 text-left transition-all duration-200 ${
                      theme === 'light'
                        ? 'border-[#BAF91A] bg-white shadow-[0_0_0_2px_rgba(186,249,26,0.25)]'
                        : 'border-[#101312]/12 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-[#101312]">{t('dashboardSettings.light')}</div>
                    <div className="text-xs text-[#101312]/55 mt-0.5">{t('dashboardSettings.lightDesc')}</div>
                    {theme === 'light' && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#BAF91A] uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#BAF91A]" /> Active
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Language selector */}
              <div>
                <label className="mb-3 block text-sm font-medium text-[#101312]/55">
                  {t('dashboardSettings.systemLanguage')}
                </label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#101312]/40" />
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-[#101312]/15 bg-white py-3 pl-10 pr-4 text-sm text-[#101312] outline-none focus:border-[#BAF91A] focus:ring-2 focus:ring-[#BAF91A]/20 transition-colors"
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#BAF91A] px-8 py-3 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00] disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? t('dashboardSettings.saving') : t('dashboardSettings.saveSettings')}
            </button>
          </div>
        </form>
      )}
    </TechnicianLayout>
  )
}

import { useState, useEffect } from 'react'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import { Loader2, Palette, Bell, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        theme: 'dark',
        language: 'English',
        emailNotifications: true,
        smsNotifications: false
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/profile/me')
            if (data.success && data.user && data.user.systemSettings) {
                setSettings({
                    theme: data.user.systemSettings.theme || 'dark',
                    language: data.user.systemSettings.language || 'English',
                    emailNotifications: data.user.systemSettings.emailNotifications ?? true,
                    smsNotifications: data.user.systemSettings.smsNotifications ?? false
                })
            }
        } catch (error) {
            toast.error('Failed to load system settings')
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleChange = (e) => {
        setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            // we mapped systemSettings flattening in userController.js 
            await api.put('/users/profile/me', { systemSettings: settings })
            toast.success('Dashboard settings saved correctly')
            // In a real app, theme context update would be triggered here
            if (settings.theme === 'light') {
                toast("Note: Light mode UI tokens are partially implemented. Stick to Dark mode for the perfect experience!", { icon: "🌞" })
            }
        } catch (error) {
            toast.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl">
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard Configuration</h1>
                <p className="text-sm text-slate-400 mb-8">Personalize your StayGo administrative interface and preferences.</p>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Appearance settings */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Palette className="w-5 h-5 text-fuchsia-400" />
                                <h2 className="text-lg font-semibold text-white">Appearance Settings</h2>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Color Theme</label>
                                    <div className="flex items-center gap-3">
                                        <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all ${settings.theme === 'dark' ? 'bg-slate-800 border-fuchsia-500 ring-1 ring-fuchsia-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                                            <input type="radio" name="theme" value="dark" checked={settings.theme === 'dark'} onChange={handleChange} className="sr-only" />
                                            <div className="font-bold text-white mb-1">Dark Mode</div>
                                            <div className="text-xs text-slate-500">Perfect for night time ops.</div>
                                        </label>
                                        <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all ${settings.theme === 'light' ? 'bg-slate-800 border-fuchsia-500 ring-1 ring-fuchsia-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                                            <input type="radio" name="theme" value="light" checked={settings.theme === 'light'} onChange={handleChange} className="sr-only" />
                                            <div className="font-bold text-slate-300 mb-1">Light Mode</div>
                                            <div className="text-xs text-slate-500">Clear bright aesthetic.</div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">System Language</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <select 
                                            name="language" 
                                            value={settings.language} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 px-4 py-3 outline-none focus:border-fuchsia-500 appearance-none"
                                        >
                                            <option value="English">English</option>
                                            <option value="Sinhala">Sinhala (Sri Lanka)</option>
                                            <option value="Tamil">Tamil</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notification Toggles */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Bell className="w-5 h-5 text-amber-400" />
                                <h2 className="text-lg font-semibold text-white">Alert Preferences</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                                    <div>
                                        <div className="font-medium text-slate-200">Email System Alerts</div>
                                        <div className="text-sm text-slate-500">Receive server faults and SOS pings directly to your admin email.</div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => handleToggle('emailNotifications')}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.emailNotifications ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                                    <div>
                                        <div className="font-medium text-slate-200">SMS Escalation</div>
                                        <div className="text-sm text-slate-500">Forward critical Ride-sharing alerts aggressively via text.</div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => handleToggle('smsNotifications')}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.smsNotifications ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.smsNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-xl font-medium transition-colors"
                            >
                                {saving ? 'Syncing with MongoDB...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    )
}

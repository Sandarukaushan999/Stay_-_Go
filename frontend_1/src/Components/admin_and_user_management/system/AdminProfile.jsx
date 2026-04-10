import { useState, useEffect } from 'react'
import { api } from '../../../lib/apiClient'
import { useAuthStore } from '../../../app/store/authStore'
import AdminLayout from '../layout/AdminLayout'
import { 
    Loader2, User, Phone, Shield, Lock, Bell, Activity, Save, 
    Upload, Settings, Smartphone, Mail, XCircle, LogOut
} from 'lucide-react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export default function AdminProfile() {
    const { user, hydrateMe, logout } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [logs, setLogs] = useState([])
    
    // Core Form
    const [form, setForm] = useState({ fullName: '', phone: '', emergencyContact: '' })
    
    // Settings
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        sosAlerts: true,
        systemUpdates: true,
        twoFactorEnabled: false
    })

    // Password State
    const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [passLoading, setPassLoading] = useState(false)

    useEffect(() => {
        fetchProfileData()
    }, [])

    const fetchProfileData = async () => {
        try {
            const [profRes, logRes] = await Promise.all([
                api.get('/admin/profile'),
                api.get('/admin/logs')
            ])
            
            if (profRes.data.success) {
                const u = profRes.data.user
                setForm({
                    fullName: u.fullName || '',
                    phone: u.phone || '',
                    emergencyContact: u.emergencyContact || ''
                })
                if (u.systemSettings) {
                    setSettings(prev => ({ ...prev, ...u.systemSettings }))
                }
            }

            if (logRes.data.success) {
                setLogs(logRes.data.logs)
            }
        } catch (error) {
            toast.error('Failed to load comprehensive profile data')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    const handlePassChange = (e) => setPassForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }))

    const handleSaveProfile = async (e) => {
        if(e) e.preventDefault()
        if(!form.fullName) return toast.error("Full Name is visually required.")
        setSaving(true)
        try {
            await api.put('/admin/profile', { ...form, systemSettings: settings })
            toast.success('Admin identity & preferences synced')
            await hydrateMe()
        } catch (error) {
            toast.error('Failed to synchronize profile data')
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()
        if (passForm.newPassword !== passForm.confirmPassword) {
            return toast.error("New passwords do not match")
        }
        if (passForm.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters")
        }
        
        setPassLoading(true)
        try {
            await api.put('/admin/change-password', {
                currentPassword: passForm.currentPassword,
                newPassword: passForm.newPassword
            })
            toast.success('Security matrix updated')
            setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            // Fetch logs to show the new password change log
            const logRes = await api.get('/admin/logs')
            if (logRes.data.success) setLogs(logRes.data.logs)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password update failed')
        } finally {
            setPassLoading(false)
        }
    }

    const triggerLogout = async () => {
        if (window.confirm("You are about to sign out of the administrative session on this device. Proceed?")) {
            await logout()
            window.location.href = '/auth/login'
        }
    }

    if (loading) {
        return <AdminLayout><div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-fuchsia-500" /></div></AdminLayout>
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl space-y-6 pb-12">
                
                {/* PAGE HEADER */}
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Profile Page</h1>
                    <p className="text-sm text-slate-400">Strictly manage your administrative identity, security tokens, and auditing trail.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* LEFT COLUMN: Identity & Passwords */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* SECTION 1 & 2: Profile Header + Personal Info */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-bl-[100px]" />
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 relative z-10">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                                        {user?.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black text-slate-500">{user?.fullName?.charAt(0) || 'A'}</span>
                                        )}
                                    </div>
                                    <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                                        <Upload className="w-4 h-4 mr-1" />
                                        Upload
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-white">{user?.fullName}</h2>
                                    <p className="text-slate-400 mt-0.5">{user?.email}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold uppercase tracking-wider">
                                            <Shield className="w-3.5 h-3.5" />
                                            {user?.role?.replace('_',' ')}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500">
                                            Member since {dayjs(user?.createdAt).format('MMM YYYY')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Display Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <input 
                                            type="text" 
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-fuchsia-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Mobile Contact</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <input 
                                            type="text" 
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+1 ......"
                                            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-fuchsia-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 text-rose-400/80">Emergency Direct</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500/50" />
                                        <input 
                                            type="text" 
                                            name="emergencyContact"
                                            value={form.emergencyContact}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-rose-500/50 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: Security & Passwords */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                <Lock className="w-5 h-5 text-fuchsia-400" />
                                Security Credentials
                            </h3>

                            <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-b border-slate-800 pb-6 mb-6">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Current Authentication String</label>
                                    <input 
                                        type="password" 
                                        name="currentPassword"
                                        placeholder="••••••••"
                                        value={passForm.currentPassword}
                                        onChange={handlePassChange}
                                        className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 focus:border-fuchsia-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">New Password</label>
                                    <input 
                                        type="password" 
                                        name="newPassword"
                                        placeholder="••••••••"
                                        value={passForm.newPassword}
                                        onChange={handlePassChange}
                                        className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 focus:border-fuchsia-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Confirm Formulation</label>
                                    <input 
                                        type="password" 
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={passForm.confirmPassword}
                                        onChange={handlePassChange}
                                        className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 focus:border-rose-500/50 outline-none"
                                    />
                                </div>
                                <div className="sm:col-span-2 pt-1">
                                    <button 
                                        type="submit" 
                                        disabled={passLoading || (!passForm.newPassword || !passForm.currentPassword)}
                                        className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {passLoading ? 'Verifying...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>

                            {/* 2FA Integration */}
                            <div className="flex items-center justify-between">
                                <div className="pr-4">
                                    <div className="font-semibold text-slate-200">Enforce Two-Factor Auth (2FA)</div>
                                    <div className="text-sm text-slate-500 mt-1">Require an authenticator code upon initial device handshake.</div>
                                </div>
                                <button 
                                    onClick={() => handleToggle('twoFactorEnabled')}
                                    className={`shrink-0 w-12 h-6 rounded-full transition-colors relative ${settings.twoFactorEnabled ? 'bg-fuchsia-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>

                    </div>


                    {/* RIGHT COLUMN: Settings & Activities */}
                    <div className="space-y-6">
                        
                        {/* SECTION 4: Notifications */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                <Bell className="w-5 h-5 text-amber-400" />
                                Subscriptions
                            </h3>

                            <div className="space-y-5">
                                <ToggleRow 
                                    icon={<Mail className="w-4 h-4 text-emerald-400" />} 
                                    label="Administrative Summaries" 
                                    checked={settings.emailNotifications} 
                                    onChange={() => handleToggle('emailNotifications')}
                                />
                                <ToggleRow 
                                    icon={<Activity className="w-4 h-4 text-rose-400" />} 
                                    label="System SOS Hijacks" 
                                    checked={settings.sosAlerts} 
                                    onChange={() => handleToggle('sosAlerts')}
                                />
                                <ToggleRow 
                                    icon={<Settings className="w-4 h-4 text-indigo-400" />} 
                                    label="Platform Update Warnings" 
                                    checked={settings.systemUpdates} 
                                    onChange={() => handleToggle('systemUpdates')}
                                />
                                <ToggleRow 
                                    icon={<Smartphone className="w-4 h-4 text-slate-400" />} 
                                    label="SMS Escalation" 
                                    checked={settings.smsNotifications} 
                                    onChange={() => handleToggle('smsNotifications')}
                                />
                            </div>
                        </div>

                        {/* SECTION 5: Activity Log */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                <Activity className="w-5 h-5 text-emerald-400" />
                                Active Trace
                            </h3>

                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-6">
                                <div className="text-xs uppercase font-bold text-slate-500 mb-1">Last Validated Session</div>
                                <div className="text-sm font-medium text-emerald-400">
                                    {user?.lastLogin ? dayjs(user.lastLogin).format('MMMM Do YYYY, h:mm:ss A') : 'Current Session Context'}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="text-xs uppercase font-bold text-slate-500 border-b border-slate-800 pb-2">Recent Security Audits</div>
                                {logs.length === 0 ? (
                                    <div className="text-sm text-slate-600 italic">No historical actions logged in the primary database.</div>
                                ) : (
                                    logs.map((log) => (
                                        <div key={log._id} className="relative pl-4 border-l border-slate-800">
                                            <div className="absolute w-2 h-2 rounded-full bg-slate-700 -left-[5px] top-1.5 ring-4 ring-slate-900" />
                                            <div className="text-xs text-slate-400 mb-0.5">{dayjs(log.createdAt).fromNow()}</div>
                                            <div className="text-sm text-slate-300 break-words">{log.description}</div>
                                            <div className="text-[10px] font-mono text-slate-600 mt-1 uppercase">{log.actionType}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* SECTION 6: Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 sm:px-6">
                    <button 
                        onClick={triggerLogout}
                        className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-400 transition-colors py-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Terminate Active Sessions
                    </button>
                    
                    <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                        <button 
                            onClick={fetchProfileData}
                            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                        >
                            <XCircle className="w-4 h-4 text-slate-400" />
                            Discard Changes
                        </button>
                        <button 
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-6 py-2 rounded-lg bg-fuchsia-600 text-white hover:bg-fuchsia-500 font-medium transition"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 bg-transparent outline-none border-none p-0" />}
                            Commit Identity Changes
                        </button>
                    </div>
                </div>

            </div>
        </AdminLayout>
    )
}

function ToggleRow({ icon, label, checked, onChange }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800/50 rounded-lg shrink-0">{icon}</div>
                <div className="text-sm font-medium text-slate-300">{label}</div>
            </div>
            <button 
                onClick={onChange}
                className={`shrink-0 w-10 h-5 rounded-full transition-colors relative ml-4 ${checked ? 'bg-fuchsia-500' : 'bg-slate-700'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
            </button>
        </div>
    )
}

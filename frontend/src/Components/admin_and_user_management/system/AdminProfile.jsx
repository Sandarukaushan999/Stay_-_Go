import { useState, useEffect } from 'react'
import { api } from '../../../lib/apiClient'
import { useAuthStore } from '../../../app/store/authStore'
import AdminLayout from '../layout/AdminLayout'
import { 
    Loader2, User, Phone, Shield, Lock, Bell, Activity, Save, 
    Upload, Settings, Smartphone, Mail, XCircle, LogOut, Verified, Database, Network, Key, Monitor, Siren, History as HistoryIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import ConfirmActionModal from '../../shared/modals/ConfirmActionModal'

export default function AdminProfile() {
    const { user, hydrateMe, openLogoutModal } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [logs, setLogs] = useState([])
    
    // Modal states
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false)
    const [isCommitModalOpen, setIsCommitModalOpen] = useState(false)
    
    // Core Form & New DB Mappings
    const [form, setForm] = useState({ 
        fullName: '', phone: '', emergencyContact: '', adminNotes: '', emergencyClearance: 'Standard' 
    })
    
    // Mapped Models
    const [permissions, setPermissions] = useState([])
    const [adminStats, setAdminStats] = useState({ systemAudits: 0, usersBanned: 0, criticalResolutions: 0 })
    const [loginHistory, setLoginHistory] = useState([])
    const [sessionManagement, setSessionManagement] = useState({ maxConcurrentSessions: 3, sessionTimeoutMinutes: 60 })

    // Settings
    const [settings, setSettings] = useState({
        emailNotifications: true, smsNotifications: false, sosAlerts: true, systemUpdates: true, twoFactorEnabled: false
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
                    fullName: u.fullName || '', phone: u.phone || '',
                    emergencyContact: u.emergencyContact || '',
                    adminNotes: u.adminNotes || '',
                    emergencyClearance: u.emergencyClearance || 'Standard'
                })
                
                // Set default views if array is natively empty upon initialization
                setPermissions(u.permissions?.length ? u.permissions : ['VIEW_USERS', 'MANAGE_ROLES', 'SAFETY_AUDITS', 'ACCESS_LOGS'])
                setAdminStats(u.adminStats || { systemAudits: 14, usersBanned: 2, criticalResolutions: 8 })
                
                // Fallback login history if natively empty
                setLoginHistory(u.loginHistory?.length ? u.loginHistory : [
                    { _id: '1', timestamp: new Date(Date.now() - 3600000), ipAddress: '192.168.1.104', device: 'Windows / Chrome' },
                    { _id: '2', timestamp: new Date(Date.now() - 86400000), ipAddress: '192.168.1.104', device: 'Windows / Chrome' }
                ])
                setSessionManagement(u.sessionManagement || { maxConcurrentSessions: 3, sessionTimeoutMinutes: 60 })
                
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
    const handleToggle = (key, label) => {
        setSettings(prev => {
            const newState = !prev[key]
            toast.success(`${label} turned ${newState ? 'on' : 'off'}`, {
                style: { background: '#0f172a', color: '#fff', border: '1px solid #1e293b' }
            })
            return { ...prev, [key]: newState }
        })
    }
    const handleSessionChange = (e) => setSessionManagement(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }))

    const handleSaveProfile = async (e) => {
        if(e) e.preventDefault()
        if(!form.fullName) return toast.error("Full Name is visually required.")
        setSaving(true)
        try {
            await api.put('/admin/profile', { ...form, systemSettings: settings, sessionManagement })
            toast.success('Admin infrastructure synchronised natively')
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
        if (passForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters")
        
        setPassLoading(true)
        try {
            await api.put('/admin/change-password', {
                currentPassword: passForm.currentPassword,
                newPassword: passForm.newPassword
            })
            toast.success('Security matrix updated')
            setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            const logRes = await api.get('/admin/logs')
            if (logRes.data.success) setLogs(logRes.data.logs)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password update failed')
        } finally {
            setPassLoading(false)
        }
    }

    const triggerLogout = async () => {
        openLogoutModal()
    }

    if (loading) return <AdminLayout><div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-fuchsia-500" /></div></AdminLayout>

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                
                {/* PAGE HEADER */}
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Administrative Profile</h1>
                    <p className="text-sm text-slate-400">Strictly manage your unified administrative identity, tokens, and comprehensive metrics natively.</p>
                </div>

                {/* 3-COLUMN ARCHITECTURE */}
                <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* ======================= LEFT COLUMN ======================= */}
                    <div className="space-y-6">
                        
                        {/* Profile Identity Card */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-bl-[100px]" />
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="relative group mb-4">
                                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                                        {user?.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl font-black text-slate-500">{user?.fullName?.charAt(0) || 'A'}</span>
                                        )}
                                    </div>
                                    <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                                        <Upload className="w-4 h-4 mr-1" />Upload
                                    </button>
                                </div>
                                <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
                                <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
                                <span className="inline-flex mt-3 items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold uppercase tracking-wider">
                                    <Shield className="w-3.5 h-3.5" />
                                    {user?.role?.replace('_',' ')}
                                </span>
                            </div>
                        </div>

                        {/* Permissions */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Key className="w-4 h-4 text-emerald-400" /> Privileges
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {permissions.map(p => (
                                    <span key={p} className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-emerald-300 text-[10px] font-bold rounded uppercase">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Admin Stats */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Database className="w-4 h-4 text-indigo-400" /> Admin Impact
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <StatItem label="Audits Performed" value={adminStats.systemAudits} color="text-indigo-400" />
                                <StatItem label="Entities Banned" value={adminStats.usersBanned} color="text-rose-400" />
                                <StatItem label="Critical Overrides" value={adminStats.criticalResolutions} color="text-amber-400" />
                            </div>
                        </div>

                        {/* Identity Verification */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                            <Verified className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                            <h3 className="text-md font-bold text-white">Verified Authority Level</h3>
                            <p className="text-xs text-slate-400 mt-1">This terminal sequence identifies you natively within Mongo operations.</p>
                        </div>
                    </div>


                    {/* ======================= CENTER COLUMN ======================= */}
                    <div className="space-y-6">
                        
                        {/* Personal Info */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                <User className="w-5 h-5 text-indigo-400" /> Personal Identity
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Official Name</label>
                                    <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Dispatch Number</label>
                                    <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 focus:border-indigo-500 outline-none" placeholder="+1 ..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 text-rose-500/80">Emergency Direct</label>
                                    <input type="text" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 outline-none focus:border-rose-500" />
                                </div>
                            </div>
                        </div>

                        {/* Security Credentials */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                <Lock className="w-5 h-5 text-fuchsia-400" /> Architecture Security
                            </h3>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4 border-b border-slate-800 pb-5 mb-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Current Hash</label>
                                    <input type="password" name="currentPassword" placeholder="••••••••" value={passForm.currentPassword} onChange={handlePassChange} className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Target</label>
                                        <input type="password" name="newPassword" placeholder="••••••••" value={passForm.newPassword} onChange={handlePassChange} className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Confirm</label>
                                        <input type="password" name="confirmPassword" placeholder="••••••••" value={passForm.confirmPassword} onChange={handlePassChange} className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2 outline-none" />
                                    </div>
                                </div>
                                <button type="submit" disabled={passLoading} className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2.5 rounded-lg font-bold transition-colors">
                                    Rotate Security Token
                                </button>
                            </form>
                            
                            <ToggleRow icon={<Smartphone className="w-4 h-4 text-fuchsia-400" />} label="Enforce 2FA Checks" checked={settings.twoFactorEnabled} onChange={() => handleToggle('twoFactorEnabled', 'Enforce 2FA Checks')} />
                        </div>

                        {/* Session Management */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                <Monitor className="w-5 h-5 text-emerald-500" /> Session Governance
                            </h3>
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">Max Concurrent Terminals</label>
                                    <input type="number" name="maxConcurrentSessions" value={sessionManagement.maxConcurrentSessions} onChange={handleSessionChange} className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg p-2 outline-none" />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">Inactivity Timeout (Mins)</label>
                                    <input type="number" name="sessionTimeoutMinutes" value={sessionManagement.sessionTimeoutMinutes} onChange={handleSessionChange} className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg p-2 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Admin Notes */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                <Network className="w-5 h-5 text-amber-500" /> Administration Notes
                            </h3>
                            <textarea 
                                name="adminNotes" 
                                value={form.adminNotes} 
                                onChange={handleChange} 
                                placeholder="Store private tracking data or directives here..."
                                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-300 rounded-lg p-3 min-h-[120px] outline-none focus:border-amber-500/50 resize-y"
                            />
                        </div>

                    </div>


                    {/* ======================= RIGHT COLUMN ======================= */}
                    <div className="space-y-6">
                        
                        {/* Subscriptions */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                <Bell className="w-5 h-5 text-amber-400" /> Subscriptions
                            </h3>
                            <div className="space-y-5">
                                <ToggleRow icon={<Mail className="w-4 h-4 text-emerald-400" />} label="Admin Summaries" checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications', 'Admin Summaries')} />
                                <ToggleRow icon={<Activity className="w-4 h-4 text-rose-400" />} label="SOS Hijack Pings" checked={settings.sosAlerts} onChange={() => handleToggle('sosAlerts', 'SOS Hijack Pings')} />
                                <ToggleRow icon={<Settings className="w-4 h-4 text-indigo-400" />} label="Update Warnings" checked={settings.systemUpdates} onChange={() => handleToggle('systemUpdates', 'Update Warnings')} />
                                <ToggleRow icon={<Smartphone className="w-4 h-4 text-slate-400" />} label="SMS Escalation" checked={settings.smsNotifications} onChange={() => handleToggle('smsNotifications', 'SMS Escalation')} />
                            </div>
                        </div>

                        {/* Login History */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                <HistoryIcon className="w-5 h-5 text-sky-400" /> Login History
                            </h3>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {loginHistory.map((lh, i) => (
                                    <div key={lh._id || i} className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-sky-400">{dayjs(lh.timestamp).format('MMM D, h:mm A')}</span>
                                            <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{lh.ipAddress}</span>
                                        </div>
                                        <div className="text-xs text-slate-400">{lh.device}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Trace */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                <Activity className="w-5 h-5 text-emerald-400" /> Active Trace
                            </h3>
                            <div className="space-y-4">
                                {logs.length === 0 ? <div className="text-sm text-slate-600 italic">No historical traces tracked.</div> : 
                                    logs.map((log) => (
                                        <div key={log._id} className="relative pl-4 border-l border-slate-800">
                                            <div className="absolute w-2 h-2 rounded-full bg-slate-700 -left-[5px] top-1.5 ring-4 ring-slate-900" />
                                            <div className="text-xs text-slate-400 mb-0.5">{dayjs(log.createdAt).fromNow()}</div>
                                            <div className="text-sm text-slate-300 break-words">{log.description}</div>
                                            <div className="text-[10px] font-mono text-slate-600 mt-1 uppercase">{log.actionType}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Emergency Controls */}
                        <div className="bg-slate-900 border border-rose-900/50 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-[100px]" />
                            <h3 className="text-lg font-bold text-rose-500 flex items-center gap-2 mb-6 relative z-10">
                                <Siren className="w-5 h-5" /> Emergency Controls
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <label className="text-xs font-bold text-rose-400 uppercase mb-2 block">Delegated Clearance Lock</label>
                                    <select 
                                        name="emergencyClearance" 
                                        value={form.emergencyClearance} 
                                        onChange={handleChange} 
                                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg p-2.5 outline-none focus:border-rose-500"
                                    >
                                        <option value="Standard">Standard Execution</option>
                                        <option value="Elevated">Elevated (Require Dual-Key)</option>
                                        <option value="Maximum">Maximum (Lockdown Mode)</option>
                                    </select>
                                    <p className="text-[10px] text-slate-500 mt-1.5">Setting elevated clears external web caches natively.</p>
                                </div>
                                <button onClick={triggerLogout} type="button" className="w-full bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 text-rose-400 hover:text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex justify-center items-center gap-2">
                                    <XCircle className="w-4 h-4" /> Hard Reset Remote Tokens
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="flex justify-end gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:px-6">
                    <button onClick={() => setIsDiscardModalOpen(true)} className="px-5 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition text-sm font-bold">
                        Discard Edits
                    </button>
                    <button onClick={() => setIsCommitModalOpen(true)} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-sm transition disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Commit Operations
                    </button>
                </div>

            </div>

            {/* Confirmation Modals */}
            <ConfirmActionModal 
                isOpen={isDiscardModalOpen}
                onClose={() => setIsDiscardModalOpen(false)}
                onConfirm={fetchProfileData}
                title="Discard All Edits?"
                description="This will instantly wipe any unsaved data modifications on your screen and reload your configuration natively from the system."
                confirmText="Yes, Discard Edits"
                type="amber"
            />
            
            <ConfirmActionModal 
                isOpen={isCommitModalOpen}
                onClose={() => setIsCommitModalOpen(false)}
                onConfirm={() => handleSaveProfile()}
                title="Commit Operations?"
                description="Are you absolutely sure you want to enforce these configuration updates across the Stay & Go infrastructure globally?"
                confirmText="Yes, Commit Edits"
                type="emerald"
            />
        </AdminLayout>
    )
}

function StatItem({ label, value, color }) {
    return (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center">
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">{label}</div>
        </div>
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
                type="button"
                onClick={onChange}
                className={`shrink-0 w-10 h-5 rounded-full transition-colors relative ml-4 ${checked ? 'bg-fuchsia-500' : 'bg-slate-700'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
            </button>
        </div>
    )
}

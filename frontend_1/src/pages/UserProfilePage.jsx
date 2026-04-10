import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../app/store/authStore';
import { createApiClient } from '../lib/axios';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, Loader2, Shield, Calendar, LogOut, ShieldCheck, ShieldAlert } from 'lucide-react';

const api = createApiClient({ getToken: () => useAuthStore.getState().token });

export default function UserProfilePage() {
    const { user, hydrateMe, logout } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // 2FA States
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [disableMode, setDisableMode] = useState(false);
    const [password, setPassword] = useState('');

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        emergencyContact: '',
        studentId: '',
        gender: '',
        address: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user) {
            setIs2FAEnabled(Boolean(user.is2FAEnabled));
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/profile/me');
            if (data.success && data.user) {
                setForm({
                    fullName: data.user.fullName || '',
                    phone: data.user.phone || '',
                    emergencyContact: data.user.emergencyContact || '',
                    studentId: data.user.studentId || '',
                    gender: data.user.gender || '',
                    address: data.user.address || ''
                });
            }
        } catch (error) {
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.fullName.trim()) {
            return toast.error('Full Name is required');
        }

        setSaving(true);
        try {
            const { data } = await api.put('/users/profile/me', form);
            if (data.success) {
                toast.success('Profile updated successfully!');
                await hydrateMe();
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    // 2FA Endpoints Logic
    const handleEnable2FA = async () => {
        setTwoFALoading(true);
        try {
            const res = await api.post('/2fa/enable');
            toast.success(res.data.message || 'OTP sent to your email');
            setShowOtpInput(true);
            setDisableMode(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate 2FA');
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) return toast.error('Please enter the OTP');
        setTwoFALoading(true);
        try {
            const res = await api.post('/2fa/verify-enable', { otp });
            toast.success(res.data.message || '2FA enabled successfully');
            setShowOtpInput(false);
            setOtp('');
            setIs2FAEnabled(true);
            hydrateMe();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!disableMode) {
            setDisableMode(true);
            return;
        }

        if (!password) return toast.error('Password is required to disable 2FA');
        setTwoFALoading(true);
        try {
            const res = await api.post('/2fa/disable', { password });
            toast.success(res.data.message || '2FA disabled successfully');
            setDisableMode(false);
            setPassword('');
            setIs2FAEnabled(false);
            hydrateMe();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid password');
        } finally {
            setTwoFALoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Account Settings</h1>
                <p className="text-slate-400">Manage your global profile and contact preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-sm">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center text-4xl font-bold mb-4">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{user?.fullName}</h2>
                        <div className="text-slate-400 text-sm mb-4">{user?.email}</div>
                        
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            <Shield className="w-3.5 h-3.5" />
                            {user?.role}
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            logout();
                            navigate('/auth/login');
                        }}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 font-medium transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>

                {/* Form Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">Personal Information</h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-3 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <input 
                                            type="text" 
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+94 77 123 4567"
                                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-3 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Emergency Contact</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-rose-500/70" />
                                        </div>
                                        <input 
                                            type="text" 
                                            name="emergencyContact"
                                            value={form.emergencyContact}
                                            onChange={handleChange}
                                            placeholder="Parent/Guardian Number"
                                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-3 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Gender</label>
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block p-3 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Prefer not to say</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Student ID (Optional)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <input 
                                            type="text" 
                                            name="studentId"
                                            value={form.studentId}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-3 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Home Address</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <MapPin className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <textarea 
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-3 outline-none transition-all"
                                        placeholder="Full residential address"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security & 2FA Container */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-white mb-2 border-b border-slate-800 pb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-violet-500" />
                            Security Settings
                        </h3>
                        <p className="text-slate-400 text-sm mb-6 mt-4">Manage Two-Factor Authentication to keep your account secure.</p>
                        
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                    {is2FAEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Two-Factor Authentication</h4>
                                    <p className={`font-semibold text-sm ${is2FAEnabled ? 'text-emerald-500' : 'text-slate-500'}`}>
                                        Status: {is2FAEnabled ? 'Enabled' : 'Disabled'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                {!is2FAEnabled ? (
                                    <button
                                        type="button"
                                        onClick={handleEnable2FA}
                                        disabled={twoFALoading || showOtpInput}
                                        className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50 inline-flex"
                                    >
                                        Enable 2FA
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setDisableMode(true)}
                                        disabled={twoFALoading || disableMode}
                                        className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
                                    >
                                        Disable 2FA
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Inline OTP Input Modal/Section for Enabling */}
                        {showOtpInput && !is2FAEnabled && (
                            <div className="mt-4 bg-violet-500/10 border border-violet-500/20 p-5 rounded-2xl flex flex-col gap-3">
                                <h4 className="font-bold text-violet-400 text-sm">Verify your 2FA OTP</h4>
                                <p className="text-xs text-violet-300/70">We've sent a 6-digit verification code to your email. Enter it below to confirm activation.</p>
                                <div className="flex max-w-sm gap-2">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        maxLength={6}
                                        className="flex-1 bg-slate-950 border border-violet-500/30 text-white font-mono tracking-widest text-center focus:ring-violet-500 rounded-xl px-4 py-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOTP}
                                        disabled={twoFALoading}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold shadow-sm disabled:opacity-50"
                                    >
                                        Verify
                                    </button>
                                </div>
                                <button type="button" onClick={() => setShowOtpInput(false)} className="text-left text-xs font-semibold text-violet-400 hover:text-violet-300">Cancel Setup</button>
                            </div>
                        )}

                        {/* Inline Section for Disabling */}
                        {disableMode && is2FAEnabled && (
                            <div className="mt-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
                                <h4 className="font-bold text-slate-200 text-sm">Disable Two-Factor Authentication</h4>
                                <p className="text-xs text-slate-500">Please confirm your current password to disable 2FA security.</p>
                                <div className="flex max-w-sm gap-2">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Your Password"
                                        className="flex-1 bg-slate-900 border border-slate-700 text-white focus:ring-rose-500 rounded-xl px-4 py-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleDisable2FA}
                                        disabled={twoFALoading}
                                        className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl font-semibold shadow-sm disabled:opacity-50"
                                    >
                                        Confirm
                                    </button>
                                </div>
                                <button type="button" onClick={() => { setDisableMode(false); setPassword(''); }} className="text-left text-xs font-semibold text-slate-500 hover:text-slate-400">Cancel</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../app/store/authStore';
import { createApiClient } from '../lib/axios';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, Loader2, Shield, Calendar, LogOut } from 'lucide-react';

const api = createApiClient({ getToken: () => useAuthStore.getState().token });

export default function UserProfilePage() {
    const { user, hydrateMe, logout } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
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
                // Synchronize auth state (Navbar, etc)
                await hydrateMe();
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
        } finally {
            setSaving(false);
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
                <div className="lg:col-span-2">
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
                </div>
            </div>
        </div>
    );
}

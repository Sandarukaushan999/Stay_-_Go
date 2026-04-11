import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../app/store/authStore';
import { createApiClient } from '../lib/axios';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import { 
    User, Phone, MapPin, Loader2, Shield, Calendar, LogOut, ShieldCheck, ShieldAlert,
    CheckCircle2, Circle, AlertCircle, Car, Settings, Bell, Lock, Mail, Star, Users, Navigation, Eye, Music, Wind, MessageSquare, Activity, Settings2, Camera, Upload, X
} from 'lucide-react';

const api = createApiClient({ getToken: () => useAuthStore.getState().token });

export default function UserProfilePage() {
    const { user, hydrateMe, openLogoutModal } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Avatar Upload States
    const [imgSrc, setImgSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // 2FA States
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [disableMode, setDisableMode] = useState(false);
    const [password, setPassword] = useState('');

    const [stats, setStats] = useState({ tripsJoined: 0, tripsOffered: 0, completedTrips: 0, rating: 5 });
    const [verifications, setVerifications] = useState({ email: false, phone: false, student: false, license: false });

    const [form, setForm] = useState({
        fullName: '', phone: '', emergencyContact: '', studentId: '', gender: '', address: '', bio: '',
        vehicleModel: '', vehicleNumber: '', vehicleType: '', seatCount: '', driverLicenseUrl: '',
        ridePreferences: {
            preferredRole: 'Both', usualTravelTime: '', preferredPickupLocations: '',
            music: 'Any', ac: 'Any', smoking: 'No Smoking', genderPreference: 'Any'
        },
        privacySettings: {
            profileVisibility: 'public', phoneVisibility: 'matches_only', emailVisibility: 'matches_only'
        },
        systemSettings: {
            emailNotifications: true, smsNotifications: false, sosAlerts: true, systemUpdates: true,
            rideRequestAlerts: true, messages: true, maintenanceUpdates: true, promotionsToggle: false
        }
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
                const u = data.user;
                setForm(prev => ({
                    ...prev,
                    fullName: u.fullName || '',
                    phone: u.phone || '',
                    emergencyContact: u.emergencyContact || '',
                    studentId: u.studentId || '',
                    gender: u.gender || '',
                    address: u.address || '',
                    bio: u.bio || '',
                    vehicleModel: u.vehicleModel || '',
                    vehicleNumber: u.vehicleNumber || '',
                    vehicleType: u.vehicleType || '',
                    seatCount: u.seatCount || '',
                    driverLicenseUrl: u.driverLicenseUrl || '',
                    ridePreferences: {
                        preferredRole: u.ridePreferences?.preferredRole || 'Both',
                        usualTravelTime: u.ridePreferences?.usualTravelTime || 'Morning (7AM - 10AM)',
                        preferredPickupLocations: u.ridePreferences?.preferredPickupLocations || '',
                        music: u.ridePreferences?.music || 'Any',
                        ac: u.ridePreferences?.ac || 'Any',
                        smoking: u.ridePreferences?.smoking || 'No Smoking',
                        genderPreference: u.ridePreferences?.genderPreference || 'Any'
                    },
                    privacySettings: {
                        profileVisibility: u.privacySettings?.profileVisibility || 'public',
                        phoneVisibility: u.privacySettings?.phoneVisibility || 'matches_only',
                        emailVisibility: u.privacySettings?.emailVisibility || 'matches_only'
                    },
                    systemSettings: {
                        ...prev.systemSettings,
                        ...u.systemSettings
                    }
                }));

                setStats({
                    tripsJoined: u.activityStats?.tripsJoined || 0,
                    tripsOffered: u.activityStats?.tripsOffered || 0,
                    completedTrips: u.activityStats?.completedTrips || 0,
                    rating: u.rating || 5
                });

                setVerifications({
                    email: u.verifications?.email || false,
                    phone: u.verifications?.phone || false,
                    student: u.verifications?.student || false,
                    license: u.verifications?.license || false
                });
            }
        } catch (error) {
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleNestedChange = (category, field, value) => {
        setForm(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName.trim()) return toast.error('Full Name is required');
        
        setSaving(true);
        try {
            const payload = {
                ...form,
                seatCount: form.seatCount ? Number(form.seatCount) : 0
            };
            const { data } = await api.put('/users/profile/me', payload);
            if (data.success) {
                toast.success('Profile updated successfully!');
                await hydrateMe();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Image Upload & Crop Logic
    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                return toast.error("File size must be less than 5MB");
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setShowCropModal(true);
            });
            reader.readAsDataURL(file);
        }
        e.target.value = ''; 
    };

    const handleCropComplete = (_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = new Image();
        image.src = imageSrc;
        await new Promise((resolve) => { image.onload = resolve; });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
            0, 0, pixelCrop.width, pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Canvas is empty'));
                blob.name = 'avatar.jpg';
                resolve(blob);
            }, 'image/jpeg', 0.85);
        });
    };

    const handleUploadAvatar = async () => {
        try {
            setUploadingAvatar(true);
            const croppedImageBlob = await getCroppedImg(imgSrc, croppedAreaPixels);
            
            const formData = new FormData();
            formData.append('avatar', croppedImageBlob, 'avatar.jpg');

            const { data } = await api.post('/users/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success('Profile photo updated!');
                setShowCropModal(false);
                setImgSrc(null);
                await hydrateMe(); 
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Avatar upload failed');
        } finally {
            setUploadingAvatar(false);
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
        if (!disableMode) return setDisableMode(true);
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

    const completionChecks = [
        { label: 'Profile Photo', done: !!user?.profileImage },
        { label: 'Phone Verified', done: !!form.phone && verifications.phone },
        { label: 'Student ID Added', done: !!form.studentId },
        { label: 'Emergency Contact', done: !!form.emergencyContact },
        { label: 'Ride Preferences', done: !!form.ridePreferences.preferredPickupLocations }
    ];
    const completionPercentage = Math.round((completionChecks.filter(c => c.done).length / completionChecks.length) * 100);

    const isDriver = user?.role === 'rider';

    const getFullImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        return apiUrl.replace('/api', '') + path;
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Account Center</h1>
                <p className="text-slate-700 font-medium">Manage your comprehensive workspace profile seamlessly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- LEFT SIDEBAR --- */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
                    {/* User Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-sm">
                        <div className="relative w-24 h-24 mx-auto mb-4 group">
                            <div className="w-full h-full rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-4xl font-bold overflow-hidden border-2 border-transparent group-hover:border-emerald-500 transition-colors bg-slate-800 shadow-inner">
                                {user?.profileImage ? (
                                    <img src={getFullImageUrl(user.profileImage)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user?.fullName?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            
                            {/* Hover overlay & trigger */}
                            <label className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <Camera className="w-6 h-6 text-white mb-1" />
                                <span className="text-[10px] text-white font-semibold uppercase tracking-wider">Change</span>
                                <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={onSelectFile} />
                            </label>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">{user?.fullName}</h2>
                        <div className="text-slate-400 text-sm mb-4">{user?.email}</div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            <Shield className="w-3.5 h-3.5" />
                            {user?.role}
                        </div>
                    </div>

                    {/* Profile Completion */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white">Profile Completion</h3>
                            <span className="text-emerald-500 font-bold">{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                        </div>
                        <ul className="space-y-3">
                            {completionChecks.map((item, idx) => (
                                <li key={idx} className="flex items-center text-sm">
                                    {item.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" /> : <Circle className="w-4 h-4 text-slate-600 mr-2" />}
                                    <span className={item.done ? 'text-slate-300' : 'text-slate-500'}>{item.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-white mb-4">Verification Status</h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Email Address', v: verifications.email },
                                { label: 'Phone Number', v: verifications.phone },
                                { label: 'Student Identity', v: verifications.student },
                                ...(isDriver ? [{ label: 'Driver License', v: verifications.license }] : [])
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-300">{item.label}</span>
                                    {item.v ? (
                                        <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md font-medium">Verified</span>
                                    ) : (
                                        <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md font-medium">Pending</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button 
                        onClick={() => openLogoutModal()}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 font-bold transition-all shadow-sm"
                    >
                        <LogOut className="w-5 h-5 mb-0.5" />
                        Sign Out
                    </button>
                </div>

                {/* --- RIGHT CONTENT --- */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Activity Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow-sm">
                            <Activity className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.tripsJoined}</div>
                            <div className="text-xs text-emerald-500/80 uppercase font-bold mt-1 tracking-wider">Trips Joined</div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow-sm">
                            <Car className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.tripsOffered}</div>
                            <div className="text-xs text-emerald-500/80 uppercase font-bold mt-1 tracking-wider">Trips Offered</div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow-sm">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.completedTrips}</div>
                            <div className="text-xs text-emerald-500/80 uppercase font-bold mt-1 tracking-wider">Completed</div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow-sm">
                            <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{parseFloat(stats.rating).toFixed(1)}</div>
                            <div className="text-xs text-amber-500/80 uppercase font-bold mt-1 tracking-wider">Avg Rating</div>
                        </div>
                    </div>

                    {/* Main Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Personal Information */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">Personal Information</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-500" /></div>
                                        <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-3 outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-slate-500" /></div>
                                            <input type="tel" name="phone" value={form.phone} onChange={(e) => {
                                                e.target.value = e.target.value.replace(/[^\d+\s-]/g, '');
                                                handleChange(e);
                                            }} placeholder="+94 77 123 4567" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block pl-10 p-3 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Emergency Contact</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-rose-500/70" /></div>
                                            <input type="tel" name="emergencyContact" value={form.emergencyContact} onChange={(e) => {
                                                e.target.value = e.target.value.replace(/[^\d+\s-]/g, '');
                                                handleChange(e);
                                            }} placeholder="Parent/Guardian Number" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block pl-10 p-3 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Gender</label>
                                        <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none appearance-none">
                                            <option value="">Prefer not to say</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Student ID</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-slate-500" /></div>
                                            <input type="text" name="studentId" value={form.studentId} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block pl-10 p-3 outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Home Address</label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 pointer-events-none"><MapPin className="h-5 w-5 text-slate-500" /></div>
                                        <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block pl-10 p-3 outline-none" placeholder="Full residential address" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">About Me</label>
                                    <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none" placeholder="Short bio describing yourself..." />
                                </div>
                            </div>
                        </div>

                        {/* Ride Preferences */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                                <Car className="w-5 h-5 text-emerald-500" /> Ride Preferences
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Preferred Role</label>
                                    <select value={form.ridePreferences.preferredRole} onChange={(e) => handleNestedChange('ridePreferences', 'preferredRole', e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none appearance-none">
                                        <option value="Both">Driver & Passenger</option>
                                        <option value="Driver">Driver Only</option>
                                        <option value="Passenger">Passenger Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Usual Travel Time</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-slate-500" /></div>
                                        <input type="text" value={form.ridePreferences.usualTravelTime} onChange={(e) => handleNestedChange('ridePreferences', 'usualTravelTime', e.target.value)} placeholder="e.g. Morning (7AM - 10AM)" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block pl-10 p-3 outline-none" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Preferred Pickup Locations</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-slate-500" /></div>
                                        <input type="text" value={form.ridePreferences.preferredPickupLocations} onChange={(e) => handleNestedChange('ridePreferences', 'preferredPickupLocations', e.target.value)} placeholder="e.g. Main Gate, Library" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block pl-10 p-3 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Music Preference</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Music className="h-5 w-5 text-slate-500" /></div>
                                        <select value={form.ridePreferences.music} onChange={(e) => handleNestedChange('ridePreferences', 'music', e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block pl-10 p-3 outline-none appearance-none">
                                            <option value="Any">Any</option>
                                            <option value="Required">Music Required</option>
                                            <option value="Quiet">Quiet Preferred</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">AC Guidelines</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Wind className="h-5 w-5 text-slate-500" /></div>
                                        <select value={form.ridePreferences.ac} onChange={(e) => handleNestedChange('ridePreferences', 'ac', e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block pl-10 p-3 outline-none appearance-none">
                                            <option value="Any">Any</option>
                                            <option value="AC Only">AC Mandatory</option>
                                            <option value="No AC">Non-AC Fine</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Smoking Allowed?</label>
                                    <select value={form.ridePreferences.smoking} onChange={(e) => handleNestedChange('ridePreferences', 'smoking', e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none appearance-none">
                                        <option value="No Smoking">Strictly No Smoking</option>
                                        <option value="Accepted">Accepted</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Gender Ride Preference</label>
                                    <select value={form.ridePreferences.genderPreference} onChange={(e) => handleNestedChange('ridePreferences', 'genderPreference', e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none appearance-none">
                                        <option value="Any">Any</option>
                                        <option value="Same Gender">Same Gender Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Driver Details (Conditional) */}
                        {isDriver && (
                            <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Car className="w-32 h-32" /></div>
                                <h3 className="text-lg font-bold text-emerald-400 mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5" /> Driver Configuration
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Vehicle Type</label>
                                        <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none appearance-none">
                                            <option value="">Select Type</option>
                                            <option value="bike">Bike</option>
                                            <option value="car">Car</option>
                                            <option value="van">Van</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Vehicle Make/Model</label>
                                        <input type="text" name="vehicleModel" value={form.vehicleModel} onChange={handleChange} placeholder="e.g. Toyota Prius" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">License Plate Number</label>
                                        <input type="text" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="ABC-1234" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Seat Capacity</label>
                                        <input type="number" name="seatCount" value={form.seatCount} onChange={handleChange} placeholder="Total empty seats" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Privacy & Notifications Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Privacy Settings */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-sky-500" /> Privacy Options
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Profile Visibility</label>
                                        <select value={form.privacySettings.profileVisibility} onChange={(e) => handleNestedChange('privacySettings', 'profileVisibility', e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none appearance-none">
                                            <option value="public">Fully Public</option>
                                            <option value="campus_only">Campus Network Only</option>
                                            <option value="matches_only">Rides & Matches Only</option>
                                            <option value="private">Strictly Private</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone Visibility</label>
                                        <select value={form.privacySettings.phoneVisibility} onChange={(e) => handleNestedChange('privacySettings', 'phoneVisibility', e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none appearance-none">
                                            <option value="public">Public</option>
                                            <option value="campus_only">Campus Network Only</option>
                                            <option value="matches_only">Rides & Matches Only</option>
                                            <option value="private">Hidden</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Visibility</label>
                                        <select value={form.privacySettings.emailVisibility} onChange={(e) => handleNestedChange('privacySettings', 'emailVisibility', e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 block p-3 outline-none appearance-none">
                                            <option value="public">Public</option>
                                            <option value="campus_only">Campus Network Only</option>
                                            <option value="matches_only">Rides & Matches Only</option>
                                            <option value="private">Hidden</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Notification Preferences */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-violet-500" /> Global Notifications
                                </h3>
                                <ul className="space-y-4">
                                    {[
                                        { key: 'rideRequestAlerts', label: 'Ride Request Alerts', desc: 'Notify when trips are matched.' },
                                        { key: 'messages', label: 'In-app Messages', desc: 'Alerts for direct P2P chat.' },
                                        { key: 'maintenanceUpdates', label: 'Maintenance Updates', desc: 'Changes in hostel tickets.' },
                                        { key: 'emailNotifications', label: 'Email Rollups', desc: 'Daily and weekly activity digests.' },
                                        { key: 'promotionsToggle', label: 'News & Promotions', desc: 'Updates on platform additions.' }
                                    ].map((opt) => (
                                        <li key={opt.key} className="flex items-start justify-between">
                                            <div className="pr-2">
                                                <p className="text-sm font-bold text-slate-200">{opt.label}</p>
                                                <p className="text-xs text-slate-500 leading-snug mt-0.5">{opt.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                                                <input type="checkbox" className="sr-only peer" checked={form.systemSettings[opt.key]} onChange={(e) => handleNestedChange('systemSettings', opt.key, e.target.checked)} />
                                                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 flex justify-end sticky bottom-4 z-20">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3.5 rounded-xl font-bold transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings2 className="w-5 h-5" />}
                                {saving ? 'Applying Settings...' : 'Save Comprehensive Profile'}
                            </button>
                        </div>
                    </form>

                    {/* Security & 2FA */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm mt-6">
                        <h3 className="text-lg font-bold text-white mb-2 border-b border-slate-800 pb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-rose-500" /> Account Authentication
                        </h3>
                        <p className="text-slate-400 text-sm mb-6 mt-4">Manage Two-Factor Authentication (2FA) to verify logins across all campus services securely.</p>
                        
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
                                    <button onClick={handleEnable2FA} disabled={twoFALoading || showOtpInput} className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50">Enable 2FA</button>
                                ) : (
                                    <button onClick={() => setDisableMode(true)} disabled={twoFALoading || disableMode} className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50">Disable 2FA</button>
                                )}
                            </div>
                        </div>

                        {/* Modals for 2FA */}
                        {showOtpInput && !is2FAEnabled && (
                            <div className="mt-4 bg-slate-950 border border-emerald-500/20 p-5 rounded-2xl flex flex-col gap-3">
                                <h4 className="font-bold text-emerald-400 text-sm">Verify your 2FA OTP</h4>
                                <p className="text-xs text-slate-400">We've sent a 6-digit verification code to your email. Enter it below to confirm activation.</p>
                                <div className="flex max-w-sm gap-2">
                                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} className="flex-1 bg-slate-900 border border-slate-800 text-white font-mono tracking-widest text-center focus:ring-emerald-500 rounded-xl px-4 py-2" />
                                    <button onClick={handleVerifyOTP} disabled={twoFALoading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-50">Verify</button>
                                </div>
                                <button type="button" onClick={() => setShowOtpInput(false)} className="text-left text-xs font-semibold text-slate-500 hover:text-slate-400">Cancel Setup</button>
                            </div>
                        )}
                        {disableMode && is2FAEnabled && (
                            <div className="mt-4 bg-slate-950 border border-rose-500/20 p-5 rounded-2xl flex flex-col gap-3">
                                <h4 className="font-bold text-rose-400 text-sm">Disable Two-Factor Authentication</h4>
                                <p className="text-xs text-slate-400">Please confirm your current password to disable 2FA security.</p>
                                <div className="flex max-w-sm gap-2">
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your Password" className="flex-1 bg-slate-900 border border-slate-800 text-white focus:ring-rose-500 rounded-xl px-4 py-2" />
                                    <button onClick={handleDisable2FA} disabled={twoFALoading} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-50">Confirm</button>
                                </div>
                                <button type="button" onClick={() => { setDisableMode(false); setPassword(''); }} className="text-left text-xs font-semibold text-slate-500 hover:text-slate-400">Cancel</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {showCropModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Adjust Profile Photo</h3>
                            <button onClick={() => { setShowCropModal(false); setImgSrc(null); }} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="relative w-full h-72 bg-slate-950">
                            <Cropper
                                image={imgSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={handleCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        
                        <div className="p-5 flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Zoom</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setShowCropModal(false); setImgSrc(null); }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadAvatar}
                                    disabled={uploadingAvatar}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                    {uploadingAvatar ? 'Saving...' : 'Save Photo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

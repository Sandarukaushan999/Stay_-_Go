import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useIdentity } from '../contexts/DevIdentityContext';
import { createProfile, updateMyProfile } from '../api/studentApi';
import { SLEEP_SCHEDULE, SOCIAL_HABITS, STUDY_HABITS, GENDER_OPTIONS } from '../constants/enums';
import { User, Phone, Mail, MapPin, Hash, Activity, Lock, ChevronRight, Check } from 'lucide-react';

const InputWrap = ({ label, icon: Icon, children }) => (
    <div className="space-y-1.5 flex-1 w-full">
        <label className="flex items-center text-sm font-semibold text-slate-700">
            {Icon && <Icon className="w-4 h-4 mr-1.5 text-slate-400" />}
            {label}
        </label>
        {children}
    </div>
);

const inputClasses = "w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3 transition-colors md:min-w-0";

export default function ProfilePage() {
    const { profile, isLocked, refreshProfile } = useIdentity();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState({
        firstName: '', lastName: '', address: '', email: '', whatsApp: '',
        gender: '', age: '', sleepSchedule: '', cleanliness: 3,
        socialHabits: '', studyHabits: '',
    });

    useEffect(() => {
        if (profile) {
            setForm({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                address: profile.address || '',
                email: profile.email || '',
                whatsApp: profile.whatsApp || '',
                gender: profile.gender || '',
                age: profile.age || '',
                sleepSchedule: profile.sleepSchedule || '',
                cleanliness: profile.cleanliness || 3,
                socialHabits: profile.socialHabits || '',
                studyHabits: profile.studyHabits || '',
            });
            setIsEdit(true);
        }
    }, [profile]);

    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const validate = () => {
        if (!form.firstName.trim()) return 'First name is required';
        if (!form.lastName.trim()) return 'Last name is required';
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'Valid email is required';
        if (!form.whatsApp.trim()) return 'WhatsApp number is required';
        if (!form.gender) return 'Gender is required';
        if (!form.age || Number(form.age) < 1) return 'Valid age is required';
        if (!form.sleepSchedule) return 'Sleep schedule is required';
        if (!form.socialHabits) return 'Social habits is required';
        if (!form.studyHabits) return 'Study habits is required';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) return toast.error(err);

        setLoading(true);
        try {
            const payload = { ...form, age: Number(form.age), cleanliness: Number(form.cleanliness) };
            if (isEdit) {
                await updateMyProfile(payload);
                toast.success('Profile updated successfully!');
            } else {
                await createProfile(payload);
                toast.success('Profile created successfully!');
            }
            await refreshProfile();
            navigate('/roommate/preferences');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save profile';
            toast.error(msg);
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <User className="w-8 h-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-xl border border-emerald-100" />
                    My Lifestyle Profile
                </h1>
                <p className="text-slate-500 mt-3 text-lg">
                    Build your profile to help us find the most compatible roommate matches for you.
                </p>
                {isLocked && (
                    <div className="mt-4 flex items-center gap-2 text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <Lock className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Your profile is locked after roommate pairing. Modifications are limited.</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="flex gap-4 w-full">
                            <InputWrap label="First Name *" icon={User}>
                                <input className={inputClasses} value={form.firstName} onChange={set('firstName')} placeholder="Sujaya" disabled={isLocked} />
                            </InputWrap>
                            <InputWrap label="Last Name *" icon={User}>
                                <input className={inputClasses} value={form.lastName} onChange={set('lastName')} placeholder="Saman" disabled={isLocked} />
                            </InputWrap>
                        </div>
                        
                        <InputWrap label="Email Address *" icon={Mail}>
                            <input type="email" className={inputClasses} value={form.email} onChange={set('email')} placeholder="student@example.com" disabled={isLocked} />
                        </InputWrap>

                        <InputWrap label="Phone / WhatsApp *" icon={Phone}>
                            <input className={inputClasses} value={form.whatsApp} onChange={set('whatsApp')} placeholder="+94 77 123 4567" disabled={isLocked} />
                        </InputWrap>

                        <div className="flex gap-4 w-full">
                            <InputWrap label="Gender *" icon={User}>
                                <select className={inputClasses} value={form.gender} onChange={set('gender')} disabled={isLocked}>
                                    <option value="">Select gender</option>
                                    {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                                </select>
                            </InputWrap>
                            <InputWrap label="Age *" icon={Hash}>
                                <input type="number" min="1" className={inputClasses} value={form.age} onChange={set('age')} placeholder="21" disabled={isLocked} />
                            </InputWrap>
                        </div>

                        <div className="md:col-span-2">
                            <InputWrap label="Home Address *" icon={MapPin}>
                                <textarea className={inputClasses} value={form.address} onChange={set('address')} placeholder="Full residential address" rows={2} disabled={isLocked} />
                            </InputWrap>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Habits & Cleanliness
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputWrap label="Sleep Schedule *">
                            <select className={inputClasses} value={form.sleepSchedule} onChange={set('sleepSchedule')} disabled={isLocked}>
                                <option value="">Select sleep schedule</option>
                                {SLEEP_SCHEDULE.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </InputWrap>

                        <InputWrap label={`Cleanliness Tolerance: ${form.cleanliness}/5 *`}>
                            <div className="flex flex-col space-y-4 pt-2">
                                <input type="range" min="1" max="5" value={form.cleanliness}
                                    onChange={(e) => setForm((prev) => ({ ...prev, cleanliness: e.target.value }))} 
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                                    disabled={isLocked} />
                                <div className="flex justify-between text-xs text-slate-400 font-semibold px-1">
                                    <span>Messy</span>
                                    <span>Average</span>
                                    <span>Very Neat</span>
                                </div>
                            </div>
                        </InputWrap>

                        <InputWrap label="Social Habits *">
                            <select className={inputClasses} value={form.socialHabits} onChange={set('socialHabits')} disabled={isLocked}>
                                <option value="">Select social dynamic</option>
                                {SOCIAL_HABITS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </InputWrap>

                        <InputWrap label="Study Habits *">
                            <select className={inputClasses} value={form.studyHabits} onChange={set('studyHabits')} disabled={isLocked}>
                                <option value="">Select study preferences</option>
                                {STUDY_HABITS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </InputWrap>
                    </div>
                </div>

                <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pb-10">
                    <button 
                        type="button" 
                        onClick={() => navigate('/roommate/dashboard')}
                        className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    {!isLocked && (
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-slate-900 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:bg-slate-900"
                        >
                            {loading ? 'Saving Profile...' : isEdit ? 'Update Profile' : 'Save & Continue'}
                            {!loading && (isEdit ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />)}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useIdentity } from '../contexts/DevIdentityContext';
import { createOrUpdatePreference, getMyPreference, updateMyPreference } from '../api/roomPreferenceApi';
import { AC_TYPE, ROOM_POSITION, CAPACITY_OPTIONS, BLOCK_OPTIONS, FLOOR_OPTIONS } from '../constants/enums';
import { Home, MapPin, Building, ThermometerSnowflake, Users, Save, ChevronRight, Check, AlertCircle } from 'lucide-react';

export default function RoomPreferencePage() {
    const { isProfileComplete, profile, loading: identityLoading, roomPref, refreshProfile, isLocked } = useIdentity();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState({
        block: '', floor: '', acType: '', roomPosition: '', capacity: '',
    });

    useEffect(() => {
        if (roomPref) {
            setForm({
                block: roomPref.block || '',
                floor: roomPref.floor || '',
                acType: roomPref.acType || '',
                roomPosition: roomPref.roomPosition || '',
                capacity: roomPref.capacity || '',
            });
            setIsEdit(true);
        }
    }, [roomPref]);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const validate = () => {
        if (!form.block) return 'Block is required';
        if (!form.floor) return 'Floor is required';
        if (!form.acType) return 'AC type is required';
        if (!form.roomPosition) return 'Room position is required';
        if (!form.capacity) return 'Capacity is required';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) return toast.error(err);

        setLoading(true);
        try {
            const payload = { ...form, capacity: Number(form.capacity) };
            if (isEdit) {
                await updateMyPreference(payload);
                toast.success('Room preference updated!');
            } else {
                await createOrUpdatePreference(payload);
                toast.success('Room preference saved!');
            }
            await refreshProfile();
            navigate('/roommate/matches');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save preference');
        } finally { setLoading(false); }
    };

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

    // Show a brief spinner only during the very first data fetch
    if (identityLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-10 flex items-center justify-center min-h-[40vh]">
                <div className="text-slate-500 text-lg animate-pulse">Loading…</div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Home className="w-8 h-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-xl border border-emerald-100" />
                    Room Preferences
                </h1>
                <p className="text-slate-500 mt-3 text-lg">
                    Select your preferred hostel block, floor, and room setup to find students with matching choices.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        Location & Layout Preferences
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InputWrap label="Hostel Block *" icon={Building}>
                            <select className={inputClasses} value={form.block} onChange={set('block')} disabled={isLocked}>
                                <option value="">Select block</option>
                                {BLOCK_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                            </select>
                        </InputWrap>

                        <InputWrap label="Floor Level *" icon={MapPin}>
                            <select className={inputClasses} value={form.floor} onChange={set('floor')} disabled={isLocked}>
                                <option value="">Select floor</option>
                                {FLOOR_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                        </InputWrap>

                        <InputWrap label="AC Type *" icon={ThermometerSnowflake}>
                            <select className={inputClasses} value={form.acType} onChange={set('acType')} disabled={isLocked}>
                                <option value="">Select AC type</option>
                                {AC_TYPE.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </select>
                        </InputWrap>

                        <InputWrap label="Room Position *" icon={Home}>
                            <select className={inputClasses} value={form.roomPosition} onChange={set('roomPosition')} disabled={isLocked}>
                                <option value="">Select room position</option>
                                {ROOM_POSITION.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </InputWrap>

                        <InputWrap label="Desired Capacity *" icon={Users}>
                            <select className={inputClasses} value={form.capacity} onChange={set('capacity')} disabled={isLocked}>
                                <option value="">Select room capacity</option>
                                {CAPACITY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
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
                            {loading ? 'Saving Preferences...' : isEdit ? 'Update Preferences' : 'Save & Continue'}
                            {!loading && (isEdit ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />)}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

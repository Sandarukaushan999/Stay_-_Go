import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useIdentity } from '../contexts/DevIdentityContext';
import { getSuggestions, sendRequest } from '../api/matchingApi';
import {
    Search, Users, X, UserPlus, Clock, Mail, MapPin,
    Moon, Sun, Sparkles, BookOpen, Building2, Layers,
    Wind, LayoutGrid, AlertCircle, CheckCircle2, Lock,
    ChevronRight, Filter, Star
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────── */
const SLEEP_LABEL  = { EARLY_BIRD: 'Early Bird', NIGHT_OWL: 'Night Owl', FLEXIBLE: 'Flexible' };
const SOCIAL_LABEL = { INTROVERT: 'Introvert', EXTROVERT: 'Extrovert', AMBIVERT: 'Ambivert' };
const STUDY_LABEL  = { HOME: 'Stays Home', LIBRARY: 'Library', FLEXIBLE: 'Flexible' };

function scoreColor(score) {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
}

/* ─── Detail Slide Panel ──────────────────────────────────── */
function DetailPanel({ student: s, onClose, onSend, sending }) {
    const isSending = sending === String(s.studentId);

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
                
                {/* Sticky header */}
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <div className={`text-sm font-bold px-3 py-1 rounded-full border ${scoreColor(s.compatibilityScore)}`}>
                            {s.compatibilityScore}% Match
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-5 flex-1">
                    {/* Avatar & core info */}
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-50 to-emerald-100 flex items-center justify-center text-3xl font-black text-indigo-600 border-2 border-white shadow-md flex-shrink-0">
                            {(s.fullName?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">{s.fullName}</h3>
                            <p className="text-sm text-slate-500 mt-1">{s.gender} · {s.age} years old</p>
                            {/* Compatibility score bar */}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                                        style={{ width: `${s.compatibilityScore}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-emerald-600">{s.compatibilityScore}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Living Habits
                        </h4>
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                            <Row icon={s.sleepSchedule === 'EARLY_BIRD' ? Sun : Moon} label="Sleep" value={SLEEP_LABEL[s.sleepSchedule] || s.sleepSchedule} iconColor="text-amber-500" />
                            <Row icon={Sparkles} label="Cleanliness" value={
                                <div className="flex items-center gap-1.5">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className={`w-3 h-3 rounded-full ${i <= s.cleanliness ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                    ))}
                                    <span className="text-xs text-slate-500 ml-1">{s.cleanliness}/5</span>
                                </div>
                            } iconColor="text-emerald-500" />
                            <Row icon={Users} label="Social" value={SOCIAL_LABEL[s.socialHabits] || s.socialHabits} iconColor="text-purple-500" />
                            <Row icon={BookOpen} label="Study" value={STUDY_LABEL[s.studyHabits] || s.studyHabits} iconColor="text-blue-500" />
                        </div>
                    </div>

                    {/* Room Preferences */}
                    {s.roomPreference && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5" /> Room Preferences
                            </h4>
                            <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                                <Row icon={Building2} label="Block"    value={`Block ${s.roomPreference.block}`}     iconColor="text-indigo-500" />
                                <Row icon={Layers}    label="Floor"    value={`Floor ${s.roomPreference.floor}`}     iconColor="text-teal-500" />
                                <Row icon={Wind}      label="AC Type"  value={s.roomPreference.acType}              iconColor="text-cyan-500" />
                                <Row icon={LayoutGrid} label="Position" value={s.roomPreference.roomPosition}       iconColor="text-orange-500" />
                                <Row icon={Users}     label="Capacity" value={`${s.roomPreference.capacity} person(s)`} iconColor="text-rose-500" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky send button */}
                <div className="sticky bottom-0 p-4 bg-white border-t border-slate-100">
                    {s.requestSent ? (
                        <div className="w-full bg-blue-50 text-blue-600 font-semibold py-3 rounded-xl text-center text-sm flex items-center justify-center gap-2 border border-blue-200">
                            <Clock className="w-4 h-4" /> Request Already Sent — Awaiting Response
                        </div>
                    ) : (
                        <button
                            onClick={() => onSend(s.studentId)}
                            disabled={isSending}
                            className="w-full bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-md"
                        >
                            {isSending
                                ? <><Clock className="w-4 h-4 animate-spin" /> Sending...</>
                                : <><UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Send Match Request</>
                            }
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

function Row({ icon: Icon, label, value, iconColor = 'text-slate-400' }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-20 flex-shrink-0">{label}</span>
            <span className="text-sm font-medium text-slate-800 flex-1">{value}</span>
        </div>
    );
}

/* ─── Student Row (list item) ─────────────────────────────── */
function StudentRow({ s, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-200 text-left group shadow-sm hover:shadow-md"
        >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg font-black text-indigo-600 flex-shrink-0 shadow-sm">
                {(s.fullName?.[0] || '?').toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm truncate">{s.fullName}</p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">{s.gender}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{s.age} yrs</span>
                    {s.roomPreference && (
                        <>
                            <span className="text-xs text-slate-400 hidden sm:inline">·</span>
                            <span className="text-xs text-slate-400 hidden sm:inline">
                                Block {s.roomPreference.block} · Floor {s.roomPreference.floor}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Score + chevron */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {s.requestSent ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Sent</span>
                ) : (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreColor(s.compatibilityScore)}`}>
                        {s.compatibilityScore}%
                    </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
            </div>
        </button>
    );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function MatchSuggestionsPage() {
    const { isProfileComplete, isRoomPrefComplete, isLocked, loading: identityLoading } = useIdentity();
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [sending, setSending]         = useState(null);
    const [selected, setSelected]       = useState(null);
    const [search, setSearch]           = useState('');

    useEffect(() => {
        if (!isProfileComplete || !isRoomPrefComplete) { setLoading(false); return; }
        fetchSuggestions();
    }, [isProfileComplete, isRoomPrefComplete]);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const res = await getSuggestions();
            setSuggestions(res.data.data || []);
        } catch {
            toast.error('Failed to load suggestions');
        } finally { setLoading(false); }
    };

    const handleSend = async (studentId) => {
        setSending(String(studentId));
        try {
            await sendRequest(studentId);
            toast.success('Match request sent! They will be notified.');
            const update = (list) => list.map(s =>
                String(s.studentId) === String(studentId) ? { ...s, requestSent: true } : s
            );
            setSuggestions(update);
            setSelected(prev => prev && String(prev.studentId) === String(studentId)
                ? { ...prev, requestSent: true } : prev
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request');
        } finally { setSending(null); }
    };

    const filtered = suggestions.filter(s =>
        !search || s.fullName.toLowerCase().includes(search.toLowerCase())
    );

    if (identityLoading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="text-emerald-600 animate-pulse font-medium">Checking Profile...</div>
        </div>
    );

    /* Setup not complete */
    if (!isProfileComplete || !isRoomPrefComplete) return (
        <div className="max-w-2xl mx-auto p-6 md:p-10">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center space-y-4">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-7 h-7 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-amber-900">Setup Required</h2>
                <p className="text-amber-700">
                    {!isProfileComplete ? 'Complete your personal profile' : 'Set your room preferences'} first to find compatible matches.
                </p>
                <button
                    onClick={() => navigate(!isProfileComplete ? '/roommate/profile' : '/roommate/preferences')}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
                >
                    {!isProfileComplete ? 'Complete Profile' : 'Set Preferences'}
                </button>
            </div>
        </div>
    );

    /* Already locked */
    if (isLocked) return (
        <div className="max-w-2xl mx-auto p-6 md:p-10">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-emerald-900">You're Already Paired!</h2>
                <p className="text-emerald-700">Your roommate matching is complete. Check the Final Result page.</p>
                <button
                    onClick={() => navigate('/roommate/final-result')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
                >
                    View Roommate
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Star className="w-8 h-8 text-indigo-500" />
                    Compatible Matches
                </h1>
                <p className="text-slate-500 mt-2">
                    Students who share your exact room preferences — same block, floor, AC type, room position, and capacity.
                    Click any student to view their full profile and send a request.
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                />
            </div>

            <p className="text-xs text-slate-400 font-medium -mt-2">
                {loading ? 'Searching...' : `${filtered.length} compatible student${filtered.length !== 1 ? 's' : ''} found`}
            </p>

            {/* List */}
            {loading ? (
                <div className="flex h-52 items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-indigo-400">
                        <Search className="w-8 h-8 animate-bounce" />
                        <span className="font-medium text-sm">Finding compatible students...</span>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-7 h-7 text-slate-300" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">
                        {search ? 'No results for your search' : 'No Compatible Students Yet'}
                    </h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        {search
                            ? 'Try clearing the search.'
                            : 'No other students share your exact room preferences right now. Check back after more students complete their setup!'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(s => (
                        <StudentRow key={String(s.studentId)} s={s} onClick={() => setSelected(s)} />
                    ))}
                </div>
            )}

            {/* Detail panel */}
            {selected && (
                <DetailPanel
                    student={selected}
                    onClose={() => setSelected(null)}
                    onSend={handleSend}
                    sending={sending}
                />
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useIdentity } from '../contexts/DevIdentityContext';
import { getSuggestions, sendRequest } from '../api/matchingApi';
import { AlertCircle, CheckCircle2, UserPlus, Clock, Search, MapPin, Moon, Sun, Filter, Sparkles } from 'lucide-react';

export default function MatchSuggestionsPage() {
    const { isProfileComplete, isRoomPrefComplete, isLocked, loading: identityLoading } = useIdentity();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(null);

    useEffect(() => {
        if (!isProfileComplete || !isRoomPrefComplete) { setLoading(false); return; }
        fetchSuggestions();
    }, [isProfileComplete, isRoomPrefComplete]);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const res = await getSuggestions();
            setSuggestions(res.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load suggestions');
        } finally { setLoading(false); }
    };

    const handleSend = async (studentId) => {
        setSending(studentId);
        try {
            await sendRequest(studentId);
            toast.success('Match request sent!');
            setSuggestions((prev) => prev.filter((s) => s.studentId !== studentId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally { setSending(null); }
    };

    if (identityLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-emerald-600 animate-pulse font-medium">Checking Profile...</div>
            </div>
        );
    }

    if (!isProfileComplete || !isRoomPrefComplete) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-10">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-amber-500" />
                    <h2 className="text-xl font-bold text-amber-900">Setup Required</h2>
                    <p className="text-amber-700 max-w-md">
                        {!isProfileComplete ? 'Complete your profile first to see match suggestions.' : 'Set your room preference first to see match suggestions.'}
                    </p>
                </div>
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-10">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    <h2 className="text-xl font-bold text-emerald-900">Roommate Locked</h2>
                    <p className="text-emerald-700 max-w-md">You already have a locked roommate. Check the Final Result page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-emerald-500" />
                        Find Matches
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg max-w-2xl">
                        We've found compatible roommate suggestions based on your lifestyle profile and room preferences.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <Filter className="w-4 h-4" />
                    Showing Best Matches First
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-emerald-600">
                        <Search className="w-8 h-8 animate-bounce" />
                        <span className="font-medium">Searching for perfect matches...</span>
                    </div>
                </div>
            ) : suggestions.length === 0 ? (
                <div className="bg-white border text-center border-slate-200 rounded-2xl p-12 shadow-sm">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Matches Found Yet</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        There are currently no students with exactly compatible room preferences. Check back later as more students join!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {suggestions.map((s) => (
                        <div key={s.studentId} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                            {/* Card Header Profile */}
                            <div className="p-6 pb-0 flex gap-4 items-start relative">
                                <div className="absolute top-6 right-6 flex flex-col items-end">
                                    <span className="text-2xl font-black text-emerald-600">{s.compatibilityScore}%</span>
                                    <span className="text-xs uppercase tracking-wider font-bold text-emerald-600/70">Match</span>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-white shadow-sm rounded-full flex items-center justify-center text-xl font-bold text-emerald-700 shrink-0">
                                    {s.fullName[0]}
                                </div>
                                <div className="mt-2 text-left">
                                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{s.fullName}</h3>
                                    <p className="text-sm text-slate-500">{s.gender} • {s.age} yrs</p>
                                </div>
                            </div>

                            {/* Traits grid */}
                            <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-2 text-sm mt-2 flex-grow">
                                <div className="flex items-start gap-2">
                                    <div className="p-1.5 bg-slate-50 rounded-md text-slate-400">
                                        {s.sleepSchedule === 'EARLY_BIRD' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sleep</p>
                                        <p className="font-medium text-slate-700">{s.sleepSchedule === 'EARLY_BIRD' ? 'Early Bird' : 'Night Owl'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-2">
                                    <div className="p-1.5 bg-slate-50 rounded-md text-slate-400">
                                        <Sparkles className="w-4 h-4"/>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clean</p>
                                        <p className="font-medium text-slate-700">{s.cleanliness}/5 Rating</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <div className="p-1.5 bg-slate-50 rounded-md text-slate-400">
                                        <Users className="w-4 h-4"/>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Social</p>
                                        <p className="font-medium text-slate-700 capitalize">{s.socialHabits.toLowerCase()}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <div className="p-1.5 bg-slate-50 rounded-md text-slate-400">
                                        <MapPin className="w-4 h-4"/>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Room</p>
                                        <p className="font-medium text-slate-700">{s.roomPreference?.acType} • {s.roomPreference?.roomPosition}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                                <button
                                    onClick={() => handleSend(s.studentId)}
                                    disabled={sending === s.studentId}
                                    className="w-full bg-slate-900 overflow-hidden hover:bg-emerald-600 disabled:bg-slate-300 text-white font-medium py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group relative"
                                >
                                    {sending === s.studentId ? (
                                        <><Clock className="w-4 h-4 animate-spin" /> Sending...</>
                                    ) : (
                                        <><UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Send Match Request</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

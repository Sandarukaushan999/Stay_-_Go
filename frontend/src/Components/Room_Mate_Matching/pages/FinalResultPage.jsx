import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useIdentity } from '../contexts/DevIdentityContext';
import { getMyPair } from '../api/matchingApi';
import { Lock, Phone, MessageSquare, Star, Home, AlertTriangle, CheckCircle, Mail, MapPin } from 'lucide-react';

export default function FinalResultPage() {
    const { profile, isLocked } = useIdentity();
    const [pair, setPair] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getMyPair()
            .then((res) => setPair(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleRate = async () => {
        if (rating === 0) return toast.error('Please select a star rating');
        setSubmittingRating(true);
        // Simulated API call for rating
        setTimeout(() => {
            toast.success('Rating submitted successfully! This helps improve future matches.');
            setSubmittingRating(false);
        }, 1000);
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="text-emerald-600 animate-pulse font-medium">Loading details...</div>
        </div>
    );

    if (!pair) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-10 text-center">
                <div className="bg-white border text-center border-slate-200 rounded-2xl p-12 shadow-sm">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No Roommate Pair Found</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        You do not have a locked roommate yet. Complete the matching process to see your confirmed roommate here.
                    </p>
                    <button 
                        onClick={() => navigate('/roommate/matches')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                        Find Matches
                    </button>
                </div>
            </div>
        );
    }

    const isStudentA = pair.studentA?._id === profile?._id;
    const roommate = isStudentA ? pair.studentB : pair.studentA;

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Final Match Result</h1>
                    <p className="text-slate-500">Your confirmed roommate assignment is active.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Identity Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full border border-emerald-200">
                                <Lock className="w-4 h-4" /> Locked Pair
                            </span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 mt-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 border-4 border-white shadow-md rounded-full flex items-center justify-center text-4xl font-bold text-emerald-700 shrink-0">
                                {roommate?.firstName[0]}
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-bold text-slate-900">{roommate?.firstName} {roommate?.lastName}</h2>
                                <p className="text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-lg inline-block mt-2">
                                    {pair.compatibilityScore}% Compatibility Score
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Gender</p>
                                <p className="font-semibold text-slate-900">{roommate?.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Age</p>
                                <p className="font-semibold text-slate-900">{roommate?.age} years</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Sleep Schedule</p>
                                <p className="font-semibold text-slate-900">{roommate?.sleepSchedule === 'EARLY_BIRD' ? 'Early Bird' : 'Night Owl'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Cleanliness</p>
                                <p className="font-semibold text-slate-900">{roommate?.cleanliness} / 5</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Social Habits</p>
                                <p className="font-semibold text-slate-900 capitalize">{roommate?.socialHabits.toLowerCase()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Study Habits</p>
                                <p className="font-semibold text-slate-900 capitalize">{roommate?.studyHabits.toLowerCase()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-amber-900">Roommate Change Policy</h4>
                            <p className="text-amber-700 text-sm mt-1">
                                Roommate changes are not allowed directly after locking. If you face critical issues, you must submit a formal issue report to the admin team for consideration.
                            </p>
                            <button onClick={() => navigate('/roommate/issues')} className="mt-3 text-sm font-bold text-amber-800 hover:text-amber-900 underline">
                                Submit Issue Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact & Room Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-emerald-600" />
                            Contact Information
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex bg-slate-50 p-4 rounded-xl items-center gap-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Phone className="w-5 h-5 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">WhatsApp / Phone</p>
                                    <p className="text-slate-900 font-medium truncate">{roommate?.userId?.phone || 'Not available'}</p>
                                </div>
                                {roommate?.userId?.phone && (
                                    <a
                                        href={`https://wa.me/${roommate.userId.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition"
                                        title="Message on WhatsApp"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                            
                            <div className="flex bg-slate-50 p-4 rounded-xl items-center gap-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Mail className="w-5 h-5 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</p>
                                    <p className="text-slate-900 font-medium truncate">{roommate?.userId?.email || roommate?.email || 'Not available'}</p>
                                </div>
                                {(roommate?.userId?.email || roommate?.email) && (
                                    <a
                                        href={`mailto:${roommate?.userId?.email || roommate?.email}`}
                                        className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition"
                                        title="Send Email"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm overflow-hidden relative">
                        <div className="absolute right-0 top-0 opacity-10">
                            <Home className="w-32 h-32 -mt-4 -mr-4" />
                        </div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                            <Home className="w-5 h-5 text-emerald-400" />
                            Room Assignment
                        </h3>
                        
                        {pair.roomId ? (
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Room Number</p>
                                    <p className="text-3xl font-black text-white">{pair.roomId.roomNumber}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                                    <div>
                                        <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-semibold">Block</p>
                                        <p className="font-medium">{pair.roomId.block}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-semibold">Floor</p>
                                        <p className="font-medium">{pair.roomId.floor}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 py-4 text-center border border-slate-700 border-dashed rounded-xl bg-slate-800/50">
                                <MapPin className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-300 font-medium text-sm">Room pending assignment</p>
                                <p className="text-slate-500 text-xs mt-1 px-4">Admin will assign your specific room shortly.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Rate Your Experience</h3>
                        <p className="text-sm text-slate-500 mb-4">Lived together? Rate your roommate to help improve our compatibility algorithm.</p>
                        
                        <div className="flex justify-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star} 
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star className={`w-8 h-8 ${rating >= star ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`} />
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={handleRate}
                            disabled={submittingRating || rating === 0}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
                        >
                            {submittingRating ? 'Submitting...' : 'Submit Rating'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

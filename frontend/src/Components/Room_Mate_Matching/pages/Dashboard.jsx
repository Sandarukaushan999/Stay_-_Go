import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdentity } from '../contexts/DevIdentityContext';
import { getMyPair, getReceivedRequests, acceptRequest, rejectRequest } from '../api/matchingApi';
import { CheckCircle, Clock, Lock, Users, ChevronRight, User, AlertTriangle, Bell, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { profile, isProfileComplete, isRoomPrefComplete, isLocked, loading, refreshProfile } = useIdentity();
    const [pair, setPair] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [acting, setActing] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLocked) {
            getMyPair().then((r) => setPair(r.data.data)).catch(() => { });
        }
        if (isRoomPrefComplete) {
            getReceivedRequests()
                .then((r) => {
                    const pending = (r.data.data || []).filter((req) => req.status === 'PENDING');
                    setPendingRequests(pending);
                })
                .catch(() => { });
        }
    }, [isLocked, isRoomPrefComplete]);

    const handleAction = async (action, requestId) => {
        setActing(requestId);
        try {
            if (action === 'accept') {
                await acceptRequest(requestId);
                toast.success('Request accepted! Roommate pair locked. 🎉');
                await refreshProfile();
            } else {
                await rejectRequest(requestId);
                toast.success('Request declined.');
            }
            setPendingRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally { setActing(null); }
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="text-emerald-600 animate-pulse font-medium">Loading Dashboard...</div>
        </div>
    );

    if (!profile) return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Roommate Profile Found</h3>
                <p className="text-slate-500 mb-6">You need to set up your roommate profile first.</p>
                <button 
                    onClick={() => navigate('/roommate/setup')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                    Get Started
                </button>
            </div>
        </div>
    );

    const getNextStep = () => {
        if (!isProfileComplete) return { label: 'Complete Profile', path: '/roommate/profile' };
        if (!isRoomPrefComplete) return { label: 'Set Room Preference', path: '/roommate/preferences' };
        if (!isLocked) return { label: 'Find Matches', path: '/roommate/matches' };
        return null;
    };
    const nextStep = getNextStep();

    const StatusIcon = ({ complete }) => (
        complete ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <Clock className="text-amber-500 w-5 h-5" />
    );

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-2 text-lg">Welcome back, {profile.firstName}! Track your roommate matching progress.</p>
            </div>

            {/* ── Pending Match Requests Notification Widget ── */}
            {pendingRequests.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative">
                            <Bell className="w-5 h-5 text-indigo-600" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        </div>
                        <h3 className="font-bold text-indigo-900 text-base">
                            {pendingRequests.length} Pending Match Request{pendingRequests.length > 1 ? 's' : ''}
                        </h3>
                        <span className="ml-auto text-xs text-indigo-500">Respond to continue matching</span>
                    </div>
                    <div className="space-y-3">
                        {pendingRequests.map(req => {
                            const sender = req.senderStudentId || {};
                            const name = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'Unknown';
                            return (
                                <div key={req._id} className="bg-white rounded-xl border border-indigo-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-base font-black text-indigo-600 flex-shrink-0">
                                            {name[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 text-sm truncate">{name}</p>
                                            <p className="text-xs text-slate-500">
                                                {sender.gender} · {sender.age} yrs
                                                {req.compatibilityScore && (
                                                    <span className="ml-2 font-semibold text-emerald-600">{req.compatibilityScore}% match</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 sm:flex-shrink-0">
                                        <button
                                            onClick={() => handleAction('accept', req._id)}
                                            disabled={acting === req._id}
                                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <Check className="w-3.5 h-3.5" /> Accept
                                        </button>
                                        <button
                                            onClick={() => handleAction('reject', req._id)}
                                            disabled={acting === req._id}
                                            className="flex items-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 disabled:opacity-50 text-red-600 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" /> Decline
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md cursor-pointer" onClick={() => navigate('/roommate/profile')}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <User className="w-6 h-6" />
                        </div>
                        <StatusIcon complete={isProfileComplete} />
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm">Profile Status</h3>
                    <p className={`text-lg font-semibold mt-1 ${isProfileComplete ? 'text-slate-900' : 'text-amber-600'}`}>
                        {isProfileComplete ? 'Completed' : 'Incomplete'}
                    </p>
                </div>

                {/* Preference Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md cursor-pointer" onClick={() => navigate('/roommate/preferences')}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <StatusIcon complete={isRoomPrefComplete} />
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm">Room Preference</h3>
                    <p className={`text-lg font-semibold mt-1 ${isRoomPrefComplete ? 'text-slate-900' : 'text-amber-600'}`}>
                        {isRoomPrefComplete ? 'Completed' : 'Incomplete'}
                    </p>
                </div>

                {/* Match Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md cursor-pointer" onClick={() => navigate(isLocked ? '/roommate/final-result' : '/roommate/matches')}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${isLocked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {isLocked ? <Lock className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                        </div>
                        {isLocked && <CheckCircle className="text-emerald-500 w-5 h-5" />}
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm">Roommate Pair</h3>
                    <p className={`text-lg font-semibold mt-1 ${isLocked ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {isLocked ? 'Locked & Confirmed' : 'No Pair Yet'}
                    </p>
                </div>

                {/* Pending Requests */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md cursor-pointer" onClick={() => navigate('/roommate/requests')}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        {pendingRequests.length > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                {pendingRequests.length}
                            </span>
                        )}
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm">Pending Requests</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{pendingRequests.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {nextStep && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <CheckCircle className="w-32 h-32 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold tracking-wider text-emerald-800 uppercase mb-2">Next Step</h2>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">{nextStep.label}</h3>
                            <p className="text-emerald-700 mb-8 max-w-sm">
                                Keep your profile updated to find the best possible roommate match on campus.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate(nextStep.path)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 group relative z-10 w-fit"
                        >
                            Continue Setup 
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

                {isLocked && pair && (
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Your Roommate Match</h3>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-xl font-bold text-slate-500">
                                    {(pair.studentA._id === profile._id ? pair.studentB.firstName[0] : pair.studentA.firstName[0])}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900">
                                        {pair.studentA._id === profile._id
                                            ? `${pair.studentB.firstName} ${pair.studentB.lastName}`
                                            : `${pair.studentA.firstName} ${pair.studentA.lastName}`}
                                    </h4>
                                    <p className="text-emerald-600 font-medium text-sm mt-1 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                                        {pair.compatibilityScore}% Compatibility Match
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/roommate/final-result')}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            View Full Details
                        </button>
                    </div>
                )}

                {/* Report Issue Card */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <AlertTriangle className="w-32 h-32 text-slate-600" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-2">Support & Reports</h2>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Report an Issue</h3>
                        <p className="text-slate-600 mb-8 max-w-sm text-sm">
                            Having trouble with your roommate, maintenance, or need admin assistance? Submit a ticket directly to the management team.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/roommate/issues')}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2 group relative z-10 w-full"
                    >
                        Issue Report Portal
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, Fragment } from 'react';
import toast from 'react-hot-toast';
import { useIdentity } from '../contexts/DevIdentityContext';
import {
    getSentRequests, getReceivedRequests,
    acceptRequest, rejectRequest, cancelRequest,
} from '../api/matchingApi';
import { Mail, Send, Check, X, Ban, Clock, AlertCircle } from 'lucide-react';

export default function MatchRequestsPage() {
    const { isRoomPrefComplete, refreshProfile, loading: identityLoading } = useIdentity();
    const [tab, setTab] = useState('received');
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const [recRes, sentRes] = await Promise.all([getReceivedRequests(), getSentRequests()]);
            setReceived(recRes.data.data || []);
            setSent(sentRes.data.data || []);
        } catch { toast.error('Failed to load requests'); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (isRoomPrefComplete) fetchRequests(); else setLoading(false); }, [isRoomPrefComplete]);

    const handleAction = async (action, requestId) => {
        setActing(requestId);
        try {
            if (action === 'accept') {
                await acceptRequest(requestId);
                toast.success('Request accepted! Roommate pair locked.');
                await refreshProfile();
            } else if (action === 'reject') {
                await rejectRequest(requestId);
                toast.success('Request rejected.');
            } else if (action === 'cancel') {
                await cancelRequest(requestId);
                toast.success('Request cancelled.');
            }
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally { setActing(null); }
    };

    const getSender = (req) => req.senderStudentId || {};
    const getReceiver = (req) => req.receiverStudentId || {};
    
    // UI Helpers
    const getStatusUI = (status) => {
        if (status === 'PENDING') return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" /> };
        if (status === 'ACCEPTED') return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Check className="w-3 h-3" /> };
        if (status === 'REJECTED') return { color: 'bg-red-100 text-red-700 border-red-200', icon: <X className="w-3 h-3" /> };
        if (status === 'CANCELLED') return { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: <Ban className="w-3 h-3" /> };
        return { color: 'bg-slate-100 text-slate-800', icon: null };
    };

    if (identityLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-emerald-600 animate-pulse font-medium">Checking Profile...</div>
            </div>
        );
    }

    if (!isRoomPrefComplete) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-10">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-amber-500" />
                    <h2 className="text-xl font-bold text-amber-900">Setup Required</h2>
                    <p className="text-amber-700 max-w-md">Complete your profile and room preference first to manage match requests.</p>
                </div>
            </div>
        );
    }

    const unreadCount = received.filter(r => r.status === 'PENDING').length;

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Mail className="w-8 h-8 text-emerald-500" />
                        Match Requests
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage incoming and sent roommate requests.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 pb-px">
                <button 
                    className={`px-6 py-3 font-medium text-sm rounded-t-xl transition-colors relative ${tab === 'received' ? 'bg-white border-t border-l border-r border-slate-200 text-emerald-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => setTab('received')}
                >
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Received
                        {unreadCount > 0 && (
                            <span className="ml-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </button>
                <button 
                    className={`px-6 py-3 font-medium text-sm rounded-t-xl transition-colors ${tab === 'sent' ? 'bg-white border-t border-l border-r border-slate-200 text-emerald-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => setTab('sent')}
                >
                    <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Sent
                        <span className="ml-1 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {sent.length}
                        </span>
                    </div>
                </button>
            </div>

            <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-slate-200 shadow-sm p-6 md:p-8 -mt-px">
                {loading ? (
                    <div className="flex h-32 items-center justify-center text-emerald-600 animate-pulse font-medium">Loading requests...</div>
                ) : (
                    <div className="space-y-4">
                        {tab === 'received' && (
                            received.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500">No received requests yet.</p>
                                </div>
                            ) : received.map((req) => {
                                const sender = getSender(req);
                                const statusUI = getStatusUI(req.status);
                                return (
                                    <div key={req._id} className={`flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-2xl border ${req.status === 'PENDING' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} hover:shadow-md transition-shadow gap-4`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm shrink-0">
                                                {sender.firstName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{sender.firstName} {sender.lastName}</h4>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {sender.gender} • {sender.age} yrs <span className="mx-2">•</span> 
                                                    <strong className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{req.compatibilityScore}% Compatibility</strong>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusUI.color}`}>
                                                {statusUI.icon} {req.status}
                                            </div>
                                            
                                            {req.status === 'PENDING' && (
                                                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                    <button
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                                        onClick={() => setSelectedProfile(sender)}
                                                    >
                                                        View Profile
                                                    </button>
                                                    <button 
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                                        disabled={acting === req._id}
                                                        onClick={() => handleAction('accept', req._id)}
                                                    >
                                                        <Check className="w-4 h-4" /> Accept
                                                    </button>
                                                    <button 
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                                        disabled={acting === req._id}
                                                        onClick={() => handleAction('reject', req._id)}
                                                    >
                                                        <X className="w-4 h-4" /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {tab === 'sent' && (
                            sent.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500">No sent requests yet.</p>
                                </div>
                            ) : sent.map((req) => {
                                const receiver = getReceiver(req);
                                const statusUI = getStatusUI(req.status);
                                return (
                                    <div key={req._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-shadow gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm shrink-0">
                                                {receiver.firstName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{receiver.firstName} {receiver.lastName}</h4>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {receiver.gender} • {receiver.age} yrs <span className="mx-2">•</span> 
                                                    <strong className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{req.compatibilityScore}% Compatibility</strong>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusUI.color}`}>
                                                {statusUI.icon} {req.status}
                                            </div>
                                            
                                            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                <button
                                                    className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                                    onClick={() => setSelectedProfile(receiver)}
                                                >
                                                    View Profile
                                                </button>
                                                {req.status === 'PENDING' && (
                                                    <button 
                                                        className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                                        disabled={acting === req._id}
                                                        onClick={() => handleAction('cancel', req._id)}
                                                    >
                                                        <Ban className="w-4 h-4" /> Cancel Request
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Profile Modal */}
            {selectedProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-900">Student Profile</h2>
                            <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-700 shadow-inner">
                                    {selectedProfile.firstName?.[0] || '?'}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">{selectedProfile.firstName} {selectedProfile.lastName}</h3>
                                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                                        {selectedProfile.gender} • {selectedProfile.age} yrs
                                        {selectedProfile.isVerified && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Check className="w-3 h-3"/> Verified</span>}
                                    </p>
                                </div>
                            </div>
                            
                            {selectedProfile.bio && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">About me</h4>
                                    <p className="text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed">{selectedProfile.bio}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Living Habits</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-500 block mb-1">Sleep Schedule</span>
                                        <strong className="text-slate-900 capitalize">{selectedProfile.sleepSchedule?.toLowerCase().replace('_', ' ')}</strong>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-500 block mb-1">Cleanliness</span>
                                        <strong className="text-slate-900">{selectedProfile.cleanliness}/5 Rating</strong>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-500 block mb-1">Social Habits</span>
                                        <strong className="text-slate-900 capitalize">{selectedProfile.socialHabits?.toLowerCase().replace('_', ' ')}</strong>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-500 block mb-1">Noise Preference</span>
                                        <strong className="text-slate-900 capitalize">{selectedProfile.noisePreference?.toLowerCase().replace('_', ' ')}</strong>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-500 block mb-1">Study Routine</span>
                                        <strong className="text-slate-900 capitalize">{selectedProfile.studyRoutine?.toLowerCase().replace('_', ' ')}</strong>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-500 block mb-1">Guest Preference</span>
                                        <strong className="text-slate-900 capitalize">{selectedProfile.guestPreference?.toLowerCase().replace('_', ' ')}</strong>
                                    </div>
                                </div>
                            </div>
                            
                            {selectedProfile.interests?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Interests</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProfile.interests.map((int, i) => (
                                            <span key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100">
                                                {int}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

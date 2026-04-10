import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMyNotifications, markAsRead, markAllAsRead } from '../api/notificationApi';
import { Bell, Check, CheckCircle2, Circle, Clock, Info, ShieldAlert } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await getMyNotifications(1, 50);
            setNotifications(res.data.data?.notifications || res.data.data || []);
        } catch { toast.error('Failed to load notifications'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
        } catch { toast.error('Failed to mark as read'); }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            toast.success('All marked as read');
        } catch { toast.error('Failed to mark all as read'); }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const getIcon = (type) => {
        switch (type) {
            case 'MATCH_REQUEST_RECEIVED': return <Bell className="w-5 h-5 text-blue-500" />;
            case 'MATCH_REQUEST_ACCEPTED': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'MATCH_REQUEST_REJECTED': return <ShieldAlert className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-slate-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-emerald-500" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-emerald-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full mt-1">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Stay updated on your roommate matching progress.</p>
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
                    >
                        <Check className="w-4 h-4" /> Mark All as Read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex h-48 items-center justify-center text-emerald-600 animate-pulse font-medium">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">You're all caught up!</h4>
                        <p className="text-slate-500 max-w-sm mx-auto">You don't have any notifications at the moment.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((n) => (
                            <div 
                                key={n._id} 
                                onClick={() => !n.isRead && handleMarkRead(n._id)}
                                className={`flex gap-4 p-5 md:p-6 transition-colors ${!n.isRead ? 'bg-emerald-50/30 cursor-pointer hover:bg-emerald-50' : 'bg-white hover:bg-slate-50'}`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!n.isRead ? 'bg-white shadow-sm border border-emerald-100' : 'bg-slate-100 border border-slate-200'}`}>
                                        {getIcon(n.type)}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4 mb-1">
                                        <h4 className={`font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {n.title}
                                        </h4>
                                        {!n.isRead && (
                                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> New
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm mb-2 ${!n.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                                        {n.message}
                                    </p>
                                    <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

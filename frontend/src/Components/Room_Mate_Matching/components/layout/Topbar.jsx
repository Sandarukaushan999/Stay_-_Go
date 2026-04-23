import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useIdentity } from '../../contexts/DevIdentityContext';
import { getMyNotifications } from '../../api/notificationApi';
import './Topbar.css';

function formatRole(role) {
    if (!role) return 'Student';
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function Topbar() {
    const { studentId, role, isAdmin, displayName } = useIdentity();
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!studentId || isAdmin) {
            setUnreadCount(0);
            return;
        }

        let active = true;
        const loadUnread = () =>
            getMyNotifications(1, 1)
                .then((res) => {
                    if (!active) return;
                    setUnreadCount(res.data.data?.unreadCount || 0);
                })
                .catch(() => {
                    if (!active) return;
                    setUnreadCount(0);
                });

        loadUnread();
        const interval = setInterval(loadUnread, 15000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [studentId, isAdmin]);

    return (
        <header className="topbar">
            <div className="topbar-copy">
                <div className="topbar-title">Stay &amp; Go — Roommate Workspace</div>
                <div className="topbar-subtitle">
                    {isAdmin
                        ? 'Admin workspace for room assignment, issue review, and roommate operations.'
                        : 'Complete your profile, find compatible roommates, and manage your hostel pairing.'}
                </div>
            </div>

            <div className="topbar-actions">
                {!isAdmin && (
                    <button
                        className="topbar-bell"
                        onClick={() => navigate('/roommate/notifications')}
                        title="Notifications"
                        type="button"
                    >
                        <FaBell />
                        {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
                    </button>
                )}

                <div className="topbar-identity">
                    <span className="topbar-user-name">{displayName}</span>
                    <span className="topbar-role-badge">{formatRole(role)}</span>
                </div>
            </div>
        </header>
    );
}

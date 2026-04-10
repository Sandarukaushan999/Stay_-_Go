import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useIdentity } from '../../contexts/DevIdentityContext';
import { getMyNotifications, markAllAsRead } from '../../api/notificationApi';
import './Topbar.css';

export default function Topbar() {
    const { studentId, role, switchIdentity } = useIdentity();
    const [unreadCount, setUnreadCount] = useState(0);
    const [showIdInput, setShowIdInput] = useState(false);
    const [idInput, setIdInput] = useState(studentId || '');
    const [roleInput, setRoleInput] = useState(role || 'student');
    const navigate = useNavigate();

    useEffect(() => {
        if (!studentId) return;
        getMyNotifications(1, 1)
            .then((res) => setUnreadCount(res.data.data?.unreadCount || 0))
            .catch(() => { });
        const interval = setInterval(() => {
            getMyNotifications(1, 1)
                .then((res) => setUnreadCount(res.data.data?.unreadCount || 0))
                .catch(() => { });
        }, 15000);
        return () => clearInterval(interval);
    }, [studentId]);

    const handleSwitch = () => {
        if (idInput.trim()) {
            switchIdentity(idInput.trim(), roleInput);
            setShowIdInput(false);
            navigate('/roommate/dashboard');
        }
    };

    return (
        <header className="topbar">
            <div className="topbar-title">Stay & Go — Hostel Roommate Matching</div>
            <div className="topbar-actions">
                <button className="topbar-bell" onClick={() => navigate('/roommate/notifications')} title="Notifications">
                    <FaBell />
                    {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
                </button>
                <div className="topbar-identity">
                    <span className="topbar-role-badge">{role}</span>
                    <button className="topbar-switch-btn" onClick={() => setShowIdInput(!showIdInput)}>
                        Switch Identity
                    </button>
                </div>
            </div>
            {showIdInput && (
                <div className="topbar-id-panel">
                    <input
                        value={idInput}
                        onChange={(e) => setIdInput(e.target.value)}
                        placeholder="Student ID"
                        className="topbar-id-input"
                    />
                    <select value={roleInput} onChange={(e) => setRoleInput(e.target.value)} className="topbar-id-input">
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button onClick={handleSwitch} className="btn btn-primary btn-sm">Apply</button>
                </div>
            )}
        </header>
    );
}

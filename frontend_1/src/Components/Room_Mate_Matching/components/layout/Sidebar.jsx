import React, { Fragment } from "react";
import { NavLink } from 'react-router-dom';
import { useIdentity } from '../../contexts/DevIdentityContext';
import { FaUser, FaBed, FaUsers, FaHandshake, FaLock, FaExclamationTriangle, FaBell, FaBuilding, FaClipboardList, FaTachometerAlt } from 'react-icons/fa';
import './Sidebar.css';

const studentLinks = [
    { to: '/roommate/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/roommate/profile', label: 'Profile', icon: <FaUser /> },
    { to: '/roommate/preferences', label: 'Room Preference', icon: <FaBed /> },
    { to: '/roommate/matches', label: 'Find Matches', icon: <FaUsers /> },
    { to: '/roommate/match-requests', label: 'Match Requests', icon: <FaHandshake /> },
    { to: '/roommate/final-result', label: 'Final Result', icon: <FaLock /> },
    { to: '/roommate/issues', label: 'Report Issues', icon: <FaExclamationTriangle /> },
    { to: '/roommate/notifications', label: 'Notifications', icon: <FaBell /> },
];

const adminLinks = [
    { to: '/roommate/admin/rooms', label: 'Manage Rooms', icon: <FaBuilding /> },
    { to: '/roommate/admin/issues', label: 'Manage Issues', icon: <FaClipboardList /> },
];

export default function Sidebar() {
    const { isAdmin, isProfileComplete, isRoomPrefComplete } = useIdentity();

    const getStepStatus = (to) => {
        if (to === '/roommate/dashboard') return 'available'; // Dashboard is always available
        if (to === '/roommate/profile') return 'available';
        if (to === '/roommate/preferences') return isProfileComplete ? 'available' : 'locked';
        if (['/roommate/matches', '/roommate/match-requests', '/roommate/final-result'].includes(to)) return isRoomPrefComplete ? 'available' : 'locked';
        return 'available';
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>Stay & Go</h2>
            </div>
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Student</div>
                {studentLinks.map((link) => {
                    const status = getStepStatus(link.to);
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''} ${status === 'locked' ? 'locked' : ''}`
                            }
                        >
                            <span className="sidebar-icon">{link.icon}</span>
                            <span className="sidebar-label">{link.label}</span>
                            {status === 'locked' && <span className="sidebar-lock-badge">🔒</span>}
                        </NavLink>
                    );
                })}
                {isAdmin && (
                    <Fragment>
                        <div className="sidebar-section-label">Admin</div>
                        {adminLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <span className="sidebar-icon">{link.icon}</span>
                                <span className="sidebar-label">{link.label}</span>
                            </NavLink>
                        ))}
                    </Fragment>
                )}
            </nav>
        </aside>
    );
}

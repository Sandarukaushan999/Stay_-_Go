import { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useIdentity } from '../../contexts/DevIdentityContext';
import { getMyNotifications } from '../../api/notificationApi';
import TopNavbar from '../../../shared/layout/TopNavbar';
import { FaUser, FaBed, FaUsers, FaHandshake, FaLock, FaExclamationTriangle, FaBell, FaBuilding, FaClipboardList, FaTachometerAlt } from 'react-icons/fa';
import './AppLayout.css';

const studentLinks = [
    { to: '/roommate/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/roommate/profile', label: 'Profile', icon: <FaUser /> },
    { to: '/roommate/preferences', label: 'Room Preference', icon: <FaBed /> },
    { to: '/roommate/matches', label: 'Find Matches', icon: <FaUsers /> },
    { to: '/roommate/requests', label: 'Match Requests', icon: <FaHandshake /> },
    { to: '/roommate/final-result', label: 'Final Result', icon: <FaLock /> },
    { to: '/roommate/issues', label: 'Report Issues', icon: <FaExclamationTriangle /> },
];

const adminLinks = [
    { to: '/roommate/admin/rooms', label: 'Manage Rooms', icon: <FaBuilding /> },
    { to: '/roommate/admin/issues', label: 'Manage Issues', icon: <FaClipboardList /> },
];

function SubNavLink({ link, locked }) {
    return (
        <NavLink
            to={link.to}
            className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    isActive
                        ? 'bg-[#BAF91A] text-[#101312] font-semibold shadow-[0_0_14px_rgba(186,249,26,0.35)]'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                } ${locked ? 'opacity-50' : ''}`
            }
        >
            <span className="text-[13px]">{link.icon}</span>
            <span>{link.label}</span>
            {locked && <span aria-label="locked">🔒</span>}
        </NavLink>
    );
}

// Right side of the sub-nav: setup progress + unread notifications
function SubNavStatus({ studentId, steps }) {
    const navigate = useNavigate();
    const [unread, setUnread] = useState(0);
    const done = steps.filter(Boolean).length;

    useEffect(() => {
        if (!studentId) return undefined;
        const load = () =>
            getMyNotifications(1, 1)
                .then((res) => setUnread(res.data.data?.unreadCount || 0))
                .catch(() => {});
        load();
        const timer = setInterval(load, 15000);
        return () => clearInterval(timer);
    }, [studentId]);

    return (
        <div className="ml-auto flex shrink-0 items-center gap-4 pl-4">
            <div className="hidden items-center gap-2 md:flex" title="Profile → Room preference → Roommate locked">
                <span className="text-[11px] font-medium text-white/60">Setup progress</span>
                <div className="flex items-center gap-1">
                    {steps.map((ok, i) => (
                        <span
                            key={i}
                            className={`h-1.5 w-6 rounded-full ${ok ? 'bg-[#BAF91A]' : 'bg-white/20'}`}
                        />
                    ))}
                </div>
                <span className="text-[11px] font-semibold text-[#BAF91A]">{done}/{steps.length}</span>
            </div>
            <button
                type="button"
                onClick={() => navigate('/roommate/notifications')}
                title="Notifications"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
            >
                <FaBell className="text-[13px]" />
                {unread > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-[16px] rounded-full bg-[#876DFF] px-1 text-center text-[10px] font-bold leading-4 text-white">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>
        </div>
    );
}

export default function AppLayout() {
    const { studentId, isAdmin, isProfileComplete, isRoomPrefComplete, isLocked: isPairLocked } = useIdentity();

    if (!studentId) {
        return <Navigate to="/" replace />;
    }

    const isLocked = (to) => {
        if (to === '/roommate/preferences') return !isProfileComplete;
        if (['/roommate/matches', '/roommate/requests', '/roommate/final-result'].includes(to)) return !isRoomPrefComplete;
        return false;
    };

    return (
        <div className="app-layout">
            <TopNavbar />
            <div className="roommate-subnav px-4 sm:px-6">
                <nav className="roommate-subnav-scroll mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto py-2" aria-label="Roommate matching">
                    {studentLinks.map((link) => (
                        <SubNavLink key={link.to} link={link} locked={isLocked(link.to)} />
                    ))}
                    {isAdmin && (
                        <>
                            <span className="mx-2 h-5 w-px shrink-0 bg-white/20" />
                            {adminLinks.map((link) => (
                                <SubNavLink key={link.to} link={link} />
                            ))}
                        </>
                    )}
                    <SubNavStatus studentId={studentId} steps={[isProfileComplete, isRoomPrefComplete, isPairLocked]} />
                </nav>
            </div>
            <main className="app-content px-4 sm:px-6">
                <div className="roommate-outlet mx-auto max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

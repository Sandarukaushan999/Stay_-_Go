import { Outlet, Navigate } from 'react-router-dom';
import { useIdentity } from '../../contexts/DevIdentityContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppLayout.css';

export default function AppLayout() {
    const { studentId } = useIdentity();

    if (!studentId) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-main">
                <Topbar />
                <main className="app-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

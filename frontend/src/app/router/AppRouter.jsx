import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

import AuthPage from '../../pages/AuthPage'
import UnauthorizedPage from '../../pages/UnauthorizedPage'
import NotFoundPage from '../../pages/NotFoundPage'
import HomePage from '../../pages/HomePage'
import RidesGatewayPage from '../../pages/RidesGatewayPage'

import AdminDashboard from '../../Components/admin_and_user_management/dashboard/AdminDashboard'
import UserList from '../../Components/admin_and_user_management/users/UserList'
import RiderApprovalsTable from '../../Components/admin_and_user_management/rider_management/RiderApprovalsTable'
import LiveTripsTable from '../../Components/admin_and_user_management/ride_monitoring/LiveTripsTable'
import SOSAlertsTable from '../../Components/admin_and_user_management/sos_and_safety/SOSAlertsTable'
import SafetyAlertsPage from '../../Components/admin_and_user_management/sos_and_safety/SafetyAlertsPage'
import RideRequestsPage from '../../Components/admin_and_user_management/ride_monitoring/RideRequestsPage'
import ActiveRidersPage from '../../Components/admin_and_user_management/ride_monitoring/ActiveRidersPage'
import RideDashboardPage from '../../Components/admin_and_user_management/ride_monitoring/RideDashboardPage'
import MaintenanceDashboard from '../../Components/maintenance/MaintenanceDashboard'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/auth/login"
        element={
          <AuthPage
            mode="login"
            headerNavItems={[]}
            onNavigateHome={() => (window.location.href = '/')}
            onNavigateToRide={() => (window.location.href = '/student/dashboard')}
            onNavigateToPage={(p) => (window.location.href = `/${p}`)}
            onNavigateToAuth={(m) => (window.location.href = `/auth/${m}`)}
            afterAuthRedirect={() => (window.location.href = '/')}
          />
        }
      />
      <Route
        path="/auth/register"
        element={
          <AuthPage
            mode="register"
            headerNavItems={[]}
            onNavigateHome={() => (window.location.href = '/')}
            onNavigateToRide={() => (window.location.href = '/student/dashboard')}
            onNavigateToPage={(p) => (window.location.href = `/${p}`)}
            onNavigateToAuth={(m) => (window.location.href = `/auth/${m}`)}
            afterAuthRedirect={() => (window.location.href = '/')}
          />
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/rides" element={<RidesGatewayPage />} />
        <Route path="/maintenance" element={<MaintenanceDashboard />} />

        <Route element={<RoleRoute allow={['admin', 'super_admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/rider-approvals" element={<RiderApprovalsTable />} />
          <Route path="/admin/live-trips" element={<LiveTripsTable />} />
          <Route path="/admin/ride-dashboard" element={<RideDashboardPage />} />
          <Route path="/admin/ride-requests" element={<RideRequestsPage />} />
          <Route path="/admin/active-riders" element={<ActiveRidersPage />} />
          <Route path="/admin/sos-alerts" element={<SOSAlertsTable />} />
          <Route path="/admin/safety-alerts" element={<SafetyAlertsPage />} />
          <Route path="/admin/incidents" element={<LiveTripsTable />} />
        </Route>

        <Route element={<RoleRoute allow={['student', 'rider', 'technician']} />}>
          <Route path="/student/dashboard" element={<RidesGatewayPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

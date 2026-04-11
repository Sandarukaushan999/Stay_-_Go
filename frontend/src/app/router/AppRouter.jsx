import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

import AuthPage from '../../pages/AuthPage'
import UnauthorizedPage from '../../pages/UnauthorizedPage'
import NotFoundPage from '../../pages/NotFoundPage'
import HomePage from '../../pages/HomePage'
import RidesGatewayPage from '../../pages/RidesGatewayPage'
import RideShowcasePage from '../../pages/RideShowcasePage'
import UserProfilePage from '../../pages/UserProfilePage'

import AdminDashboard from '../../Components/admin_and_user_management/dashboard/AdminDashboard'
import UserList from '../../Components/admin_and_user_management/users/UserList'
import RiderApprovalsTable from '../../Components/admin_and_user_management/rider_management/RiderApprovalsTable'
import LiveTripsTable from '../../Components/admin_and_user_management/ride_monitoring/LiveTripsTable'
import SOSAlertsTable from '../../Components/admin_and_user_management/sos_and_safety/SOSAlertsTable'
import SafetyAlertsPage from '../../Components/admin_and_user_management/sos_and_safety/SafetyAlertsPage'
import RideRequestsPage from '../../Components/admin_and_user_management/ride_monitoring/RideRequestsPage'
import ActiveRidersPage from '../../Components/admin_and_user_management/ride_monitoring/ActiveRidersPage'
import RideDashboardPage from '../../Components/admin_and_user_management/ride_monitoring/RideDashboardPage'
import StudentDashboard from '../../Components/admin_and_user_management/dashboard/StudentDashboard'
import RiderDashboard from '../../Components/admin_and_user_management/dashboard/RiderDashboard'
import TechnicianDashboard from '../../Components/admin_and_user_management/dashboard/TechnicianDashboard'
import TechnicianJobs from '../../Components/admin_and_user_management/technician/TechnicianJobs'
import TechnicianLayout from '../../Components/admin_and_user_management/layout/TechnicianLayout'
import RoommateDashboard from '../../Components/admin_and_user_management/roommate/RoommateDashboard'
import MatchProfiles from '../../Components/admin_and_user_management/roommate/MatchProfiles'
import RoommateReports from '../../Components/admin_and_user_management/roommate/RoommateReports'
import MatchAnalytics from '../../Components/admin_and_user_management/roommate/MatchAnalytics'
import AdminProfile from '../../Components/admin_and_user_management/system/AdminProfile'
import AccessSettings from '../../Components/admin_and_user_management/system/AccessSettings'
import DashboardSettings from '../../Components/admin_and_user_management/system/DashboardSettings'
import AdminLayout from '../../Components/admin_and_user_management/layout/AdminLayout'

import MaintenanceDashboard from '../../Components/maintenance/MaintenanceDashboard'
import MainLayout from '../../Components/shared/layout/MainLayout'
import RoommateAppLayout from '../../Components/Room_Mate_Matching/components/layout/AppLayout'

import RoomMateDashboard from '../../Components/Room_Mate_Matching/pages/Dashboard'
import FinalResultPage from '../../Components/Room_Mate_Matching/pages/FinalResultPage'
import IssuesPage from '../../Components/Room_Mate_Matching/pages/IssuesPage'
import MatchRequestsPage from '../../Components/Room_Mate_Matching/pages/MatchRequestsPage'
import MatchSuggestionsPage from '../../Components/Room_Mate_Matching/pages/MatchSuggestionsPage'
import NotificationsPage from '../../Components/Room_Mate_Matching/pages/NotificationsPage'
import ProfilePage from '../../Components/Room_Mate_Matching/pages/ProfilePage'
import RoomPreferencePage from '../../Components/Room_Mate_Matching/pages/RoomPreferencePage'
import SetupPage from '../../Components/Room_Mate_Matching/pages/SetupPage'
import RoomsAdminPage from '../../Components/Room_Mate_Matching/pages/admin/RoomsAdminPage'
import IssuesAdminPage from '../../Components/Room_Mate_Matching/pages/admin/IssuesAdminPage'
import { DevIdentityProvider } from '../../Components/Room_Mate_Matching/contexts/DevIdentityContext'

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
      <Route path="/rides" element={<RideShowcasePage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/profile"
          element={
            <MainLayout>
              <UserProfilePage />
            </MainLayout>
          }
        />

        <Route path="/rides/workspace" element={<RidesGatewayPage />} />
        <Route path="/maintenance" element={<MainLayout showFooter={false}><MaintenanceDashboard /></MainLayout>} />

        <Route element={<RoleRoute allow={['admin', 'super_admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/maintenance" element={<AdminLayout><MaintenanceDashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/rider-approvals" element={<RiderApprovalsTable />} />
          <Route path="/admin/live-trips" element={<LiveTripsTable />} />
          <Route path="/admin/ride-dashboard" element={<RideDashboardPage />} />
          <Route path="/admin/ride-requests" element={<RideRequestsPage />} />
          <Route path="/admin/active-riders" element={<ActiveRidersPage />} />
          <Route path="/admin/sos-alerts" element={<SOSAlertsTable />} />
          <Route path="/admin/safety-alerts" element={<SafetyAlertsPage />} />
          <Route path="/admin/incidents" element={<LiveTripsTable />} />

          <Route path="/admin/roommate-dashboard" element={<RoommateDashboard />} />
          <Route path="/admin/match-profiles" element={<MatchProfiles />} />
          <Route path="/admin/roommate-reports" element={<RoommateReports />} />
          <Route path="/admin/match-analytics" element={<MatchAnalytics />} />

          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/access-settings" element={<AccessSettings />} />
          <Route path="/admin/dashboard-settings" element={<DashboardSettings />} />
        </Route>

        <Route element={<RoleRoute allow={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        <Route element={<RoleRoute allow={['rider']} />}>
          <Route path="/rider/dashboard" element={<RiderDashboard />} />
        </Route>

        <Route element={<RoleRoute allow={['technician']} />}>
          <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
          <Route path="/technician/jobs/*" element={<TechnicianJobs />} />
          <Route path="/technician/performance" element={<TechnicianDashboard />} />
          <Route path="/technician/tasks/*" element={<TechnicianJobs />} />
          <Route path="/technician/maintenance" element={<TechnicianLayout><MaintenanceDashboard /></TechnicianLayout>} />
        </Route>

        <Route element={<RoleRoute allow={['student', 'rider', 'technician', 'admin', 'super_admin']} />}>
          <Route
            path="/roommate"
            element={
              <DevIdentityProvider>
                <RoommateAppLayout />
              </DevIdentityProvider>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="setup" element={<SetupPage />} />
            <Route path="dashboard" element={<RoomMateDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="preferences" element={<RoomPreferencePage />} />
            <Route path="matches" element={<MatchSuggestionsPage />} />
            <Route path="match-requests" element={<Navigate to="/roommate/requests" replace />} />
            <Route path="requests" element={<MatchRequestsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="issues" element={<IssuesPage />} />
            <Route path="final-result" element={<FinalResultPage />} />
            <Route path="admin/rooms" element={<RoomsAdminPage />} />
            <Route path="admin/issues" element={<IssuesAdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

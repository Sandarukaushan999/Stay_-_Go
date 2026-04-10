import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../app/store/authStore'
import PassengerDashboardPage from '../Components/ride_and_sharing_system/pages/PassengerDashboardPage'
import RiderDashboardPage from '../Components/ride_and_sharing_system/pages/RiderDashboardPage'
import MainLayout from '../Components/shared/layout/MainLayout'

export default function RidesGatewayPage() {
  const [searchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)

  // If user is somehow missing (race), let ProtectedRoute handle it, but keep safe.
  if (!user) return <Navigate to="/auth/login" replace />

  // Only students can use ride system; admin should use admin dashboard.
  if (user.role === 'admin' || user.role === 'super_admin') return <Navigate to="/admin" replace />

  // Rider UI should show for:
  // - approved riders (role=rider)
  // - rider-candidates (hasVehicle=true) so they can see the rider workspace
  //   (accept/online controls can be disabled until approved).
  const isRiderEligible = user.role === 'rider' || user.hasVehicle
  const preferredView = searchParams.get('view')
  const isRiderUI = preferredView === 'passenger' ? false : preferredView === 'rider' ? isRiderEligible : isRiderEligible

  return (
    <MainLayout showFooter={false}>
      <section className="mx-auto max-w-7xl space-y-6">
        {isRiderUI ? <RiderDashboardPage /> : <PassengerDashboardPage />}
      </section>
    </MainLayout>
  )
}

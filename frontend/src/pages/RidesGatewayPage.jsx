import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../app/store/authStore'
import PassengerDashboardPage from '../Components/ride_and_sharing_system/pages/PassengerDashboardPage'
import RiderDashboardPage from '../Components/ride_and_sharing_system/pages/RiderDashboardPage'
import MainLayout from '../Components/shared/layout/MainLayout'

export default function RidesGatewayPage() {
  const user = useAuthStore((s) => s.user)

  // If user is somehow missing (race), let ProtectedRoute handle it, but keep safe.
  if (!user) return <Navigate to="/auth/login" replace />

  // Rider role gets rider UI. Everyone else is passenger UI.
  const isRider = user.role === 'rider'

  return (
    <MainLayout>
      {isRider ? <RiderDashboardPage /> : <PassengerDashboardPage />}
    </MainLayout>
  )
}


import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../app/store/authStore'
import PassengerDashboardPage from '../Components/ride_and_sharing_system/pages/PassengerDashboardPage'
import RiderDashboardPage from '../Components/ride_and_sharing_system/pages/RiderDashboardPage'
import MainLayout from '../Components/shared/layout/MainLayout'

export default function RidesGatewayPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/auth/login" replace />
  if (user.role === 'admin' || user.role === 'super_admin') return <Navigate to="/admin" replace />

  const isRiderUI = user.role === 'rider' || user.hasVehicle

  return (
    <MainLayout>
      <section className="mx-auto max-w-7xl space-y-6">
        {isRiderUI ? <RiderDashboardPage /> : <PassengerDashboardPage />}
      </section>
    </MainLayout>
  )
}

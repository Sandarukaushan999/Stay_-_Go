import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../app/store/authStore'
import PassengerDashboardPage from '../Components/ride_and_sharing_system/pages/PassengerDashboardPage'
import RiderDashboardPage from '../Components/ride_and_sharing_system/pages/RiderDashboardPage'
import MainLayout from '../Components/shared/layout/MainLayout'

export default function RidesGatewayPage() {
  const navigate = useNavigate()
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
    <MainLayout>
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-[#101312]/15 bg-white/95 p-6 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#876DFF]">Ride Sharing Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#101312] sm:text-4xl">Real-time ride operations for students and riders</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#101312]/75">
            This workspace is connected to live requests, active trips, SOS flow, and rider availability. You can
            monitor routes, complete trip actions, and manage daily ride operations from one screen.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-[#101312]/15 bg-[#E2FF99] px-2.5 py-1 font-semibold text-[#101312]">
              Role: {user?.role ?? 'student'}
            </span>
            <span className="rounded-full border border-[#101312]/15 bg-[#E2FF99] px-2.5 py-1 font-semibold text-[#101312]">
              Vehicle profile: {user?.hasVehicle ? 'Enabled' : 'Not enabled'}
            </span>
            <span className="rounded-full border border-[#101312]/15 bg-[#E2FF99] px-2.5 py-1 font-semibold text-[#101312]">
              Campus: {user?.campusId ?? 'N/A'}
            </span>
            <span className="rounded-full border border-[#101312]/15 bg-[#E2FF99] px-2.5 py-1 font-semibold text-[#101312]">
              View: {isRiderUI ? 'Rider dashboard' : 'Passenger dashboard'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border border-[#101312]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate('/rides/workspace?view=passenger')}
              className="rounded-lg border border-[#101312]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
            >
              Passenger Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/rides/workspace?view=rider')}
              className="rounded-lg border border-[#101312]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
            >
              Rider Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth/register')}
              className="rounded-lg bg-[#BAF91A] px-3 py-1.5 text-xs font-semibold text-[#101312] transition hover:bg-[#a9ea00]"
            >
              Create Account
            </button>
          </div>
        </div>

        {isRiderUI ? <RiderDashboardPage /> : <PassengerDashboardPage />}
      </section>
    </MainLayout>
  )
}

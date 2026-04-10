import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../app/store/authStore'
import PassengerDashboardPage from '../Components/ride_and_sharing_system/pages/PassengerDashboardPage'
import RiderDashboardPage from '../Components/ride_and_sharing_system/pages/RiderDashboardPage'
import MainLayout from '../Components/shared/layout/MainLayout'

export default function RidesGatewayPage() {
  const user = useAuthStore((s) => s.user)

  // If user is somehow missing (race), let ProtectedRoute handle it, but keep safe.
  if (!user) return <Navigate to="/auth/login" replace />

  // Only students can use ride system; admin should use admin dashboard.
  if (user.role === 'admin' || user.role === 'super_admin') return <Navigate to="/admin" replace />

  // Rider UI should show for:
  // - approved riders (role=rider)
  // - rider-candidates (hasVehicle=true) so they can see the rider workspace
  //   (accept/online controls can be disabled until approved).
  const isRiderUI = user.role === 'rider' || user.hasVehicle

  return (
    <MainLayout>
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-300 bg-white/90 p-6 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Ride Sharing Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Real-time ride operations for students and riders</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700">
            This workspace is connected to live requests, active trips, SOS flow, and rider availability. You can
            monitor routes, complete trip actions, and manage daily ride operations from one screen.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-slate-300 bg-emerald-100 px-2.5 py-1 font-semibold text-slate-800">
              Role: {user?.role ?? 'student'}
            </span>
            <span className="rounded-full border border-slate-300 bg-emerald-100 px-2.5 py-1 font-semibold text-slate-800">
              Vehicle profile: {user?.hasVehicle ? 'Enabled' : 'Not enabled'}
            </span>
            <span className="rounded-full border border-slate-300 bg-emerald-100 px-2.5 py-1 font-semibold text-slate-800">
              Campus: {user?.campusId ?? 'N/A'}
            </span>
          </div>
        </div>

        {isRiderUI ? <RiderDashboardPage /> : <PassengerDashboardPage />}
      </section>
    </MainLayout>
  )
}

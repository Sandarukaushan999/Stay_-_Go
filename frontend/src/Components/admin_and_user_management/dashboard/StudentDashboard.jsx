import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'
import { api } from '../../../lib/apiClient'
import MainLayout from '../../shared/layout/MainLayout'
import { User, Bell, Car, Home } from 'lucide-react'

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/dashboard-stats')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Welcome back, {user?.fullName}. Here is your campus overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<User />} title="Profile Status" 
            value={user?.isVerified ? 'Verified' : 'Pending'} 
            color="bg-blue-50 text-blue-600" 
          />
          <StatCard 
            icon={<Bell />} title="Unread Notifications" 
            value={loading ? '...' : stats?.unreadNotifications || 0} 
            color="bg-orange-50 text-orange-600" 
          />
          <StatCard 
            icon={<Car />} title="Active Ride Requests" 
            value={loading ? '...' : stats?.activeRidesJoined || 0} 
            color="bg-emerald-50 text-emerald-600" 
          />
          <StatCard 
            icon={<Home />} title="Hostel Block" 
            value={user?.hostelBlock || 'Unassigned'} 
            color="bg-purple-50 text-purple-600" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between" onClick={() => navigate('/roommate/setup')}>
            <div>
              <div className="p-3 bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl mb-6 flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Roommate Matching Platform</h3>
              <p className="text-slate-500 mb-6">
                Find compatible roommates, set room preferences, and secure your campus accommodation.
              </p>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Open Roommate Portal
            </button>
          </div>

          <div
            className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
            onClick={() => navigate('/rides/workspace?view=passenger')}
            role="presentation"
          >
            <div>
              <div className="p-3 bg-emerald-50 text-emerald-600 w-12 h-12 rounded-xl mb-6 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ride Sharing Workspace</h3>
              <p className="text-slate-500 mb-6">
                Live trip map, request rides to SLIIT, and your ride history — same tools as the top nav Workspace.
              </p>
            </div>
            <button
              type="button"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Open ride workspace
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'
import { api } from '../../../lib/apiClient'
import MainLayout from '../../shared/layout/MainLayout'
import { User, Bell, Car, Star, ShieldCheck, MapPin } from 'lucide-react'

export default function RiderDashboard() {
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rider Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Welcome back, {user?.fullName}. Here is your vehicle and ride overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<ShieldCheck />} title="Verification Status" 
            value={user?.riderVerificationStatus === 'approved' ? 'Approved Rider' : 'Pending Verification'} 
            color={user?.riderVerificationStatus === 'approved' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"} 
          />
          <StatCard 
            icon={<Car />} title="Active Offered Rides" 
            value={loading ? '...' : stats?.activeRidesOffered || 0} 
            color="bg-blue-50 text-blue-600" 
          />
          <StatCard 
            icon={<Star />} title="Rider Rating" 
            value={`${user?.rating || 5.0} / 5.0`} 
            color="bg-orange-50 text-orange-600" 
          />
          <StatCard 
            icon={<Car />} title="Vehicle Details" 
            value={`${user?.vehicleType || 'None'} - ${user?.vehicleNumber || 'Unregistered'}`} 
            color="bg-purple-50 text-purple-600" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between" onClick={() => navigate('/rides')}>
            <div>
              <div className="p-3 bg-blue-50 text-blue-600 w-12 h-12 rounded-xl mb-6 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Offer a Ride</h3>
              <p className="text-slate-500 mb-6">
                Post a new ride to campus or manage your scheduled and active trips with passengers safely.
              </p>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Manage Rides
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between" onClick={() => navigate('/roommate/setup')}>
            <div>
              <div className="p-3 bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl mb-6 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Roommate Matching Engine</h3>
              <p className="text-slate-500 mb-6">
                Even as a verified Rider, you can still search for compatible campus roommates or confirm your assigned room.
              </p>
            </div>
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Open Roommate Portal
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
      <p className="text-xl font-bold text-slate-900 mt-1 truncate">{value}</p>
    </div>
  )
}

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
          <h1 className="text-3xl font-bold tracking-tight transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>Rider Dashboard</h1>
          <p className="mt-2 text-lg transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>Welcome back, {user?.fullName}. Here is your vehicle and ride overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<ShieldCheck />} title="Verification Status" 
            value={user?.riderVerificationStatus === 'approved' ? 'Approved Rider' : 'Pending Verification'} 
            colorBg="rgba(186,249,26,0.15)" colorIcon="#4a7c00"
          />
          <StatCard 
            icon={<Car />} title="Active Offered Rides" 
            value={loading ? '...' : stats?.activeRidesOffered || 0} 
            colorBg="rgba(135,109,255,0.15)" colorIcon="#876DFF" 
          />
          <StatCard 
            icon={<Star />} title="Rider Rating" 
            value={`${user?.rating || 5.0} / 5.0`} 
            colorBg="rgba(186,249,26,0.15)" colorIcon="#101312" 
          />
          <StatCard 
            icon={<Car />} title="Vehicle Details" 
            value={`${user?.vehicleType || 'None'} - ${user?.vehicleNumber || 'Unregistered'}`} 
            colorBg="rgba(226,255,153,0.3)" colorIcon="#101312" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div 
            className="rounded-2xl p-8 shadow-sm border transition-all hover:shadow-md cursor-pointer flex flex-col justify-between" 
            style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
            onClick={() => navigate('/rides')}
          >
            <div>
              <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center" style={{ background: '#E2FF99', color: '#101312' }}>
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>Offer a Ride</h3>
              <p className="mb-6 transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>
                Post a new ride to campus or manage your scheduled and active trips with passengers safely.
              </p>
            </div>
            <button className="w-full bg-[#BAF91A] hover:bg-[#a8e010] px-6 py-3 rounded-lg font-medium transition-colors" style={{ color: '#101312' }}>
              Manage Rides
            </button>
          </div>

          <div 
            className="rounded-2xl p-8 shadow-sm border transition-all hover:shadow-md cursor-pointer flex flex-col justify-between" 
            style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
            onClick={() => navigate('/roommate/setup')}
          >
            <div>
              <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center" style={{ background: 'rgba(135,109,255,0.15)', color: '#876DFF' }}>
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>Roommate Matching Engine</h3>
              <p className="mb-6 transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>
                Even as a verified Rider, you can still search for compatible campus roommates or confirm your assigned room.
              </p>
            </div>
            <button className="w-full bg-[#876DFF] hover:bg-[#7460e0] px-6 py-3 rounded-lg font-medium transition-colors" style={{ color: '#ffffff' }}>
              Open Roommate Portal
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function StatCard({ icon, title, value, colorBg, colorIcon }) {
  return (
    <div className="rounded-2xl p-6 shadow-sm border transition-all duration-300" style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl" style={{ background: colorBg, color: colorIcon }}>
          {icon}
        </div>
      </div>
      <h3 className="font-medium text-sm transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>{title}</h3>
      <p className="text-xl font-bold mt-1 truncate transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>{value}</p>
    </div>
  )
}

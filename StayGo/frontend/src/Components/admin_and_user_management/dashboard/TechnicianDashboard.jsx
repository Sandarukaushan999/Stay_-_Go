import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'
import { api } from '../../../lib/apiClient'
import TechnicianLayout from '../layout/TechnicianLayout'
import { Wrench, CheckCircle, Clock } from 'lucide-react'

export default function TechnicianDashboard() {
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
    <TechnicianLayout>
      <div className="max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Technician Control Panel</h1>
          <p className="text-slate-400 text-lg">Welcome back, {user?.fullName}. Here are the latest campus maintenance reports.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <StatCard 
            icon={<Clock />} title="Open / Pending Issues" 
            value={loading ? '...' : stats?.openIssues || 0} 
            color="bg-amber-500/10 text-amber-500 border border-amber-500/20" 
          />
          <StatCard 
            icon={<CheckCircle />} title="Resolved Issues" 
            value={loading ? '...' : stats?.resolvedIssues || 0} 
            color="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 transition-all hover:border-slate-700 cursor-pointer flex flex-col md:flex-row gap-6 items-center" onClick={() => navigate('/admin')}>
            <div className="p-4 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center shrink-0 border border-orange-500/20">
              <Wrench className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-2">Manage Room Maintenance Requests</h3>
              <p className="text-slate-400">
                View all pending student issues from the roommate matching tables. Resolve facility, safety, or room condition reports directly.
              </p>
            </div>
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <button className="w-full md:w-auto whitespace-nowrap bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                View Maintenance Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </TechnicianLayout>
  )
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  )
}

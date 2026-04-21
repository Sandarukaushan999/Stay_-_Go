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
          <h1 className="text-3xl font-bold tracking-tight mb-2 transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>Technician Control Panel</h1>
          <p className="text-lg transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>Welcome back, {user?.fullName}. Here are the latest campus maintenance reports.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <StatCard 
            icon={<Clock />} title="Open / Pending Issues" 
            value={loading ? '...' : stats?.openIssues || 0} 
            colorBg="rgba(245,158,11,0.1)" colorIcon="#F59E0B"
            colorBorder="rgba(245,158,11,0.2)"
          />
          <StatCard 
            icon={<CheckCircle />} title="Resolved Issues" 
            value={loading ? '...' : stats?.resolvedIssues || 0} 
            colorBg="rgba(16,185,129,0.1)" colorIcon="#10B981"
            colorBorder="rgba(16,185,129,0.2)"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div 
            className="rounded-2xl p-8 border transition-all cursor-pointer flex flex-col md:flex-row gap-6 items-center" 
            onClick={() => navigate('/technician/maintenance')}
            style={{ background: 'var(--admin-surface-2)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-card-shadow)' }}
          >
            <div className="p-4 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', borderColor: 'rgba(249,115,22,0.2)' }}>
              <Wrench className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>Hostel Maintenance Tickets</h3>
              <p className="transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>
                View tickets assigned to you, start work, and mark issues as resolved. Track the full ticket lifecycle from submission to closure.
              </p>
            </div>
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <button className="w-full md:w-auto whitespace-nowrap bg-[#BAF91A] hover:bg-[#a9ea00] text-[#101312] px-8 py-3 rounded-lg font-semibold transition-colors">
                Open Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    </TechnicianLayout>
  )
}

function StatCard({ icon, title, value, colorBg, colorIcon, colorBorder }) {
  return (
    <div className="rounded-2xl p-6 shadow-sm border transition-colors duration-300" style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-4 rounded-xl border" style={{ background: colorBg, color: colorIcon, borderColor: colorBorder }}>
          {icon}
        </div>
      </div>
      <h3 className="font-medium text-sm transition-colors duration-300" style={{ color: 'var(--admin-text-muted)' }}>{title}</h3>
      <p className="text-3xl font-bold mt-1 transition-colors duration-300" style={{ color: 'var(--admin-text)' }}>{value}</p>
    </div>
  )
}

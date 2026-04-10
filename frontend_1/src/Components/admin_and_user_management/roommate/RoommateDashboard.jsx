import { useEffect, useState } from 'react'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import { Loader2, Users, Handshake, MailX, Send } from 'lucide-react'

export default function RoommateDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    api.get('/admin/roommate/dashboard')
      .then((res) => {
        if (!alive) return
        setStats(res.data.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
    return () => { alive = false }
  }, [])

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Roommate Matching Overview</h1>
        <p className="text-slate-400 mb-8">High-level statistics summarizing algorithmic matchmaking performance.</p>

        {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                label="Total Participating Students" 
                value={stats?.totalProfiles || 0} 
                icon={<Users className="w-6 h-6 text-blue-500" />}
                trend="+12% this month"
              />
              <StatCard 
                label="Confirmed Matches" 
                value={stats?.confirmedMatches || 0} 
                icon={<Handshake className="w-6 h-6 text-emerald-500" />}
                trend="Successful pairings"
              />
              <StatCard 
                label="Pending Requests" 
                value={stats?.pendingRequests || 0} 
                icon={<Send className="w-6 h-6 text-amber-500" />}
                trend="Awaiting review"
              />
              <StatCard 
                label="Rejected Requests" 
                value={stats?.rejectedRequests || 0} 
                icon={<MailX className="w-6 h-6 text-rose-500" />}
                trend="Failed matches"
              />
            </div>
        )}

        {/* Extended Analytics row */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Handshake className="w-32 h-32" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Match Success Rate</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-emerald-400">{stats?.successRate || 0}%</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Percentage of requests that turn into confirmed matches.</p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Users className="w-32 h-32" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Average Compatibility</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-blue-400">{stats?.averageCompatibility || 0}%</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">System-wide average score among successful pairings.</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value, icon, trend }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-800/50 rounded-xl">{icon}</div>
                <div className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">{trend}</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm font-medium text-slate-400">{label}</div>
        </div>
    </div>
  )
}

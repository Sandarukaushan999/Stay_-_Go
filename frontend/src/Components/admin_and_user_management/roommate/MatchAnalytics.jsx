import { useEffect, useState } from 'react'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import { Loader2, TrendingUp, Activity, BarChart4 } from 'lucide-react'

export default function MatchAnalytics() {
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
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Algorithm Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Deep dive into the health and accuracy of the StayGo roommate matching algorithm.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Conversion Graph Placeholder */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 col-span-2">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">Request Conversion Funnel</h3>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 text-center">
                    <div className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4">
                        <div className="text-slate-400 text-sm mb-1">Total Profiles</div>
                        <div className="text-3xl font-bold text-indigo-400">{stats?.totalProfiles}</div>
                    </div>
                    <div className="hidden md:block text-slate-600">→</div>
                    <div className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4">
                        <div className="text-slate-400 text-sm mb-1">Requests Sent</div>
                        <div className="text-3xl font-bold text-blue-400">{stats?.totalRequests}</div>
                    </div>
                    <div className="hidden md:block text-slate-600">→</div>
                    <div className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 border-emerald-500/30">
                        <div className="text-slate-400 text-sm mb-1">Confirmed Matches</div>
                        <div className="text-3xl font-bold text-emerald-400">{stats?.confirmedMatches}</div>
                    </div>
                </div>
            </div>

            {/* Quality Score component */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <BarChart4 className="w-5 h-5 text-blue-400" />
                    Matching Quality
                </h3>
                <p className="text-sm text-slate-400 mb-6">Algorithm effectiveness based on system data.</p>
                
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">Target Score (Safe Compatibility)</span>
                            <span className="text-emerald-400">94%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">Actual Average Score</span>
                            <span className="text-blue-400">{stats?.averageCompatibility}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(stats?.averageCompatibility || 0, 100)}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">Rejection Rate</span>
                            <span className="text-rose-400">{100 - (stats?.successRate || 0)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${Math.min(100 - (stats?.successRate || 0), 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Algorithm is Healthy</h3>
                <p className="text-slate-400 max-w-sm">
                    The platform continues to pair students with a matching success rate of <strong>{stats?.successRate}%</strong>.
                    Behavioral metrics look great!
                </p>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  )
}

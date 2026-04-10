import { useEffect, useState } from 'react'
import { api } from '../../../lib/apiClient'
import TechnicianLayout from '../layout/TechnicianLayout'
import { Loader2, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TechnicianJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('assigned') // assigned, pending, completed, all

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/technician/jobs?filter=${filter}`)
      setJobs(res.data.jobs)
    } catch (e) {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [filter])

  const handleAction = async (jobId, action) => {
    try {
      await api.patch(`/technician/jobs/${jobId}/${action}`)
      toast.success(`Job ${action}ed successfully!`)
      fetchJobs()
    } catch (e) {
      toast.error(`Failed to ${action} job.`)
    }
  }

  return (
    <TechnicianLayout>
      <div className="max-w-6xl space-y-8 animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Job Management</h1>
            <p className="text-slate-400">View and respond to dynamic roommate requests and facility maintenance.</p>
          </div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            {['pending', 'assigned', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  filter === f ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <CheckCircle className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg">No jobs found in this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {jobs.map(job => (
                <div key={job._id} className="p-6 hover:bg-slate-800/20 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                         job.priority === 'EMERGENCY' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                         job.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-slate-800 text-slate-300'
                       }`}>
                         {job.priority} Priority
                       </span>
                       <span className="text-sm text-slate-400">Category: {job.category}</span>
                       <span className="text-sm font-bold text-violet-400">{job.status}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-2">{job.title}</h3>
                    <p className="text-slate-400 mt-1 max-w-2xl">{job.description}</p>
                    <div className="text-sm text-slate-500 mt-3 flex items-center gap-4">
                      <span>Room: {job.roomNumber || 'TBD'}</span>
                      <span>Reporter: {job.reportedBy?.fullName || 'Hidden'}</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex gap-3">
                    {filter === 'pending' && (
                       <button onClick={() => handleAction(job._id, 'claim')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors">
                         Claim Job
                       </button>
                    )}
                    {filter === 'assigned' && (
                       <button onClick={() => handleAction(job._id, 'complete')} className="px-6 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 font-medium rounded-lg transition-colors flex items-center gap-2">
                         <CheckCircle className="w-5 h-5"/> Resolve Issue
                       </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TechnicianLayout>
  )
}

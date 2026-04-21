import { useEffect, useState } from 'react'
import { api } from '../../../lib/apiClient'
import TechnicianLayout from '../layout/TechnicianLayout'
import { Loader2, CheckCircle, Clock, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'

const PRIORITY_STYLES = {
  EMERGENCY: 'bg-rose-50 text-rose-600 border border-rose-200',
  HIGH:      'bg-amber-50 text-amber-600 border border-amber-200',
  MEDIUM:    'bg-[#E2FF99] text-[#101312] border border-[#BAF91A]/40',
  LOW:       'bg-[#101312]/5 text-[#101312]/55 border border-[#101312]/10',
}

const STATUS_STYLES = {
  assigned:  'text-[#876DFF] bg-[#876DFF]/10 border border-[#876DFF]/20',
  pending:   'text-amber-600 bg-amber-50 border border-amber-200',
  completed: 'text-[#BAF91A] bg-[#BAF91A]/10 border border-[#BAF91A]/30',
}

export default function TechnicianJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('assigned')

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/technician/jobs?filter=${filter}`)
      setJobs(res.data.jobs)
    } catch {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [filter])

  const handleAction = async (jobId, action) => {
    try {
      await api.patch(`/technician/jobs/${jobId}/${action}`)
      toast.success(`Job ${action}ed successfully!`)
      fetchJobs()
    } catch {
      toast.error(`Failed to ${action} job.`)
    }
  }

  const filters = ['pending', 'assigned', 'completed']

  return (
    <TechnicianLayout>
      <div className="max-w-6xl space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#BAF91A] flex-shrink-0">
              <Briefcase className="h-6 w-6 text-[#101312]" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#101312]">Job Management</h1>
              <p className="text-sm text-[#101312]/55 mt-0.5">View and respond to roommate requests and facility maintenance.</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex bg-[#F5F5F5] border border-[#101312]/10 rounded-xl p-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-[#BAF91A] text-[#101312] shadow-sm font-semibold'
                    : 'text-[#101312]/55 hover:text-[#101312]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs table */}
        <div className="rounded-2xl border border-[#101312]/12 bg-white shadow-[0_4px_24px_rgba(16,19,18,0.06)] overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-[#101312]/30">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#101312]/35">
              <CheckCircle className="w-12 h-12 mb-4 opacity-40" />
              <p className="text-base font-medium">No jobs found in this category.</p>
              <p className="text-sm mt-1">Check back later or switch filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#101312]/08">
              {jobs.map(job => (
                <div
                  key={job._id}
                  className="p-6 hover:bg-[#fafdf4] transition-colors flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${PRIORITY_STYLES[job.priority] || PRIORITY_STYLES.LOW}`}>
                        {job.priority} Priority
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[job.status?.toLowerCase()] || ''}`}>
                        {job.status}
                      </span>
                      <span className="text-xs text-[#101312]/40 font-medium">
                        Category: {job.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#101312] mt-1">{job.title}</h3>
                    <p className="text-sm text-[#101312]/55 mt-1 max-w-2xl">{job.description}</p>
                    <div className="text-xs text-[#101312]/35 mt-3 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Room: {job.roomNumber || 'TBD'}
                      </span>
                      <span>Reporter: {job.reportedBy?.fullName || 'Hidden'}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex gap-3">
                    {filter === 'pending' && (
                      <button
                        onClick={() => handleAction(job._id, 'claim')}
                        className="px-5 py-2 bg-[#876DFF] hover:bg-[#7058e8] text-white font-semibold text-sm rounded-xl transition-colors"
                      >
                        Claim Job
                      </button>
                    )}
                    {filter === 'assigned' && (
                      <button
                        onClick={() => handleAction(job._id, 'complete')}
                        className="px-5 py-2 bg-[#BAF91A] hover:bg-[#a9ea00] text-[#101312] font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Resolve Issue
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

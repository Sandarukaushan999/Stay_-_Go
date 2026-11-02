import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Briefcase, CheckCircle2, Clock, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../../lib/apiClient'
import TechnicianLayout from '../layout/TechnicianLayout'
import { Card, EmptyState, Loading, PageHeader, Pill, Tabs, btnPrimary, btnViolet, errMsg, timeAgo } from '../shared/ui'

const PRIORITY_TONE = { EMERGENCY: 'rose', HIGH: 'amber', MEDIUM: 'lime', LOW: 'slate' }
const STATUS_TONE = { SUBMITTED: 'amber', IN_PROGRESS: 'violet', RESOLVED: 'lime' }
const STATUS_LABEL = { SUBMITTED: 'waiting', IN_PROGRESS: 'in progress', RESOLVED: 'resolved' }

const FILTERS = [
  { key: 'all', label: 'All jobs', path: '/technician/jobs' },
  { key: 'assigned', label: 'Assigned to me', path: '/technician/jobs/assigned' },
  { key: 'pending', label: 'Pending requests', path: '/technician/jobs/pending' },
  { key: 'completed', label: 'Completed', path: '/technician/jobs/completed' },
]

const EMPTY_TEXT = {
  all: 'Nothing assigned to you and no open requests right now.',
  assigned: 'Jobs the admin assigns to you or that you claim will show up here.',
  pending: 'No unclaimed requests — everything has been picked up.',
  completed: 'Jobs you resolve will be listed here.',
}

// Hostel issue reports (roommate module) handled by technicians. The route decides the filter,
// so every "Job Management" item in the sidebar opens the right list.
export default function TechnicianJobs() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const filter = FILTERS.find((f) => f.key !== 'all' && pathname.endsWith(`/${f.key}`))?.key || 'all'

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/technician/jobs', { params: { filter } })
      setJobs(data.jobs || [])
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load jobs'))
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  async function act(job, action, doneMsg) {
    setBusyId(job._id)
    try {
      await api.patch(`/technician/jobs/${job._id}/${action}`)
      toast.success(doneMsg)
      await load()
    } catch (err) {
      toast.error(errMsg(err, `Could not ${action} this job`))
    } finally {
      setBusyId(null)
    }
  }

  const isMine = (job) => Boolean(job.assignedTechnician)

  return (
    <TechnicianLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          icon={Briefcase}
          title="Job Management"
          subtitle="Hostel issue reports from students — claim new requests, start work and resolve them."
        />

        <Tabs
          value={filter}
          onChange={(key) => navigate(FILTERS.find((f) => f.key === key).path)}
          options={FILTERS.map((f) => ({ key: f.key, label: f.label }))}
        />

        <Card className="overflow-hidden">
          {loading ? (
            <Loading label="Loading jobs…" />
          ) : jobs.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No jobs here" text={EMPTY_TEXT[filter]} />
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
              {jobs.map((job) => (
                <li key={job._id} className="flex flex-col gap-4 p-5 transition hover:bg-[#BAF91A]/8 md:flex-row md:items-center md:justify-between" style={{ borderColor: 'var(--admin-border)' }}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={PRIORITY_TONE[job.priority] || 'slate'}>{job.priority?.toLowerCase()} priority</Pill>
                      <Pill tone={STATUS_TONE[job.status] || 'slate'}>{STATUS_LABEL[job.status] || job.status}</Pill>
                      <span className="text-xs capitalize" style={{ color: 'var(--admin-text-muted)' }}>
                        {job.category?.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold" style={{ color: 'var(--admin-text)' }}>
                      {job.title}
                    </h3>
                    <p className="mt-0.5 max-w-2xl text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                      {job.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Room {job.roomNumber || 'TBD'}
                      </span>
                      <span>Reported by {job.reportedBy?.fullName || 'a student'}</span>
                      <span>{timeAgo(job.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {job.status === 'SUBMITTED' && !isMine(job) && (
                      <button type="button" disabled={busyId === job._id} onClick={() => act(job, 'claim', 'Job claimed — it is now in progress')} className={btnViolet}>
                        Claim job
                      </button>
                    )}
                    {job.status === 'SUBMITTED' && isMine(job) && (
                      <button type="button" disabled={busyId === job._id} onClick={() => act(job, 'start', 'Work started')} className={btnViolet}>
                        <Play className="h-4 w-4" /> Start work
                      </button>
                    )}
                    {job.status === 'IN_PROGRESS' && isMine(job) && (
                      <button type="button" disabled={busyId === job._id} onClick={() => act(job, 'complete', 'Job resolved — nice work!')} className={btnPrimary}>
                        <CheckCircle2 className="h-4 w-4" /> Mark resolved
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </TechnicianLayout>
  )
}

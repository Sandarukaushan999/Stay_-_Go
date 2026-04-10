import { useEffect, useState } from 'react'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import { Loader2, ShieldAlert, CheckCircle, XCircle, Clock, FileText, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RoommateReports() {
  const [activeTab, setActiveTab] = useState('matches') // 'matches' | 'issues'
  
  // Match state
  const [requests, setRequests] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)

  // Issue state
  const [issues, setIssues] = useState([])
  const [loadingIssues, setLoadingIssues] = useState(true)

  // Fetch functions
  const fetchRequests = async () => {
    try {
      setLoadingMatches(true)
      const res = await api.get('/admin/roommate/requests')
      setRequests(res.data.items)
    } catch (err) {
      toast.error('Failed to load roommate requests')
    } finally {
      setLoadingMatches(false)
    }
  }

  const fetchIssues = async () => {
    try {
      setLoadingIssues(true)
      const res = await api.get('/roommate/issues')
      setIssues(res.data.data.issues || [])
    } catch (err) {
      toast.error('Failed to load issues')
    } finally {
      setLoadingIssues(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'matches') fetchRequests()
    else fetchIssues()
  }, [activeTab])

  // Handlers
  const handleForceUnmatch = async (matchId) => {
    if (!window.confirm("WARNING: Are you sure you want to forcibly UNMATCH these users? This action is irreversible.")) return
    try {
      const res = await api.post(`/admin/roommate/unmatch/${matchId}`)
      if (res.data.success) {
        toast.success('Successfully unmatched users')
        fetchRequests() 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unmatch users')
    }
  }

  const handleUpdateIssueStatus = async (issueId, status) => {
    try {
      await api.patch(`/roommate/issues/${issueId}/status`, { status })
      toast.success('Issue status updated')
      fetchIssues()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const handleAddAdminComment = async (issueId) => {
    const comment = window.prompt("Enter admin comment for this issue:")
    if (comment === null) return // cancelled

    try {
      await api.patch(`/roommate/issues/${issueId}/comment`, { adminComment: comment })
      toast.success('Comment added')
      fetchIssues()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    }
  }

  const getStatusUI = (status) => {
    if (status === 'RESOLVED') return <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5"/> Resolved</span>
    if (status === 'IN_PROGRESS') return <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg text-xs font-medium"><Clock className="w-3.5 h-3.5"/> In Progress</span>
    return <span className="inline-flex items-center gap-1.5 text-slate-400 bg-slate-400/10 px-2.5 py-1 rounded-lg text-xs font-medium"><FileText className="w-3.5 h-3.5"/> Submitted</span>
  }

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Match Handling</h1>
            <p className="text-sm text-slate-400 mt-1">Review roommate pairings, pending requests, and manage issue reports.</p>
          </div>
          
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'matches' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Match Controls
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'issues' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Issue Reports
            </button>
          </div>
        </div>

        {activeTab === 'matches' && (
          loadingMatches ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Match ID</th>
                      <th className="px-6 py-4 font-semibold">User A (Sender)</th>
                      <th className="px-6 py-4 font-semibold">User B (Receiver)</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Score</th>
                      <th className="px-6 py-4 font-semibold text-right">Admin Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">No match records found</td>
                      </tr>
                    ) : (
                      requests.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">...{r._id.slice(-6)}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{r.senderId?.fullName || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{r.senderId?.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{r.receiverId?.fullName || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{r.receiverId?.email}</div>
                          </td>
                          <td className="px-6 py-4">
                              {r.status === 'CONFIRMED' && <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg text-xs font-medium"><CheckCircle className="w-3.5 h-3.5"/> Confirmed</span>}
                              {r.status === 'PENDING' && <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg text-xs font-medium"><Clock className="w-3.5 h-3.5"/> Pending</span>}
                              {r.status === 'REJECTED' && <span className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-lg text-xs font-medium"><XCircle className="w-3.5 h-3.5"/> Rejected</span>}
                          </td>
                          <td className="px-6 py-4">
                              <span className="font-bold text-blue-400">{r.compatibilityScore}%</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              disabled={r.status !== 'CONFIRMED'}
                              onClick={() => handleForceUnmatch(r._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium text-xs"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Force Unmatch
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {activeTab === 'issues' && (
          loadingIssues ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : (
            <div className="space-y-4">
              {issues.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl py-12 text-center text-slate-500">
                   No issues reported matching criteria.
                </div>
              ) : (
                issues.map(issue => (
                  <div key={issue._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-base font-bold text-white">{issue.title}</h4>
                          {getStatusUI(issue.status)}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            issue.priority === 'EMERGENCY' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                            issue.priority === 'HIGH' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' :
                            'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                          }`}>
                            {issue.priority}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 whitespace-pre-wrap">{issue.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-800 mt-3 pt-3">
                          <span className="bg-slate-800/50 px-2.5 py-1 rounded-md">Reported by: <span className="text-slate-300">{issue.reportedBy?.fullName || 'Unknown'}</span> ({issue.reportedBy?.email || 'N/A'})</span>
                          <span className="bg-slate-800/50 px-2.5 py-1 rounded-md">Category: <span className="text-slate-300">{issue.category}</span></span>
                          {issue.roomNumber && (
                             <span className="bg-slate-800/50 px-2.5 py-1 rounded-md">Room: <span className="text-slate-300">{issue.roomNumber}</span></span>
                          )}
                        </div>
                        
                        {issue.adminComment && (
                          <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                            <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" /> Admin Comment
                            </div>
                            <p className="text-sm text-emerald-100/70">{issue.adminComment}</p>
                          </div>
                        )}
                        
                        {issue.imageUrl && (
                          <div className="mt-3">
                            <a href={issue.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                              View Attached Image
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="lg:w-48 flex flex-col gap-2 shrink-0">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Issue Actions</div>
                        
                        {issue.status !== 'IN_PROGRESS' && issue.status !== 'RESOLVED' && (
                          <button onClick={() => handleUpdateIssueStatus(issue._id, 'IN_PROGRESS')} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors text-left border border-slate-700 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> Start Progress
                          </button>
                        )}
                        {issue.status !== 'RESOLVED' && (
                          <button onClick={() => handleUpdateIssueStatus(issue._id, 'RESOLVED')} className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-colors text-left border border-emerald-500/20 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                          </button>
                        )}
                        <button onClick={() => handleAddAdminComment(issue._id)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors text-left border border-slate-700 mt-1 flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5" /> {issue.adminComment ? 'Edit Comment' : 'Add Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        )}
      </div>
    </AdminLayout>
  )
}

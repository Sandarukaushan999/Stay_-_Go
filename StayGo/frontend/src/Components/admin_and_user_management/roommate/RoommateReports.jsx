import { useEffect, useState } from 'react'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import { Loader2, ShieldAlert, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RoommateReports() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/roommate/requests')
      setRequests(res.data.items)
    } catch (err) {
      toast.error('Failed to load roommate requests')
    } finally {
      setLoading(false)
    }
  }

  const handleForceUnmatch = async (matchId) => {
    if (!window.confirm("WARNING: Are you sure you want to forcibly UNMATCH these users? This action is irreversible.")) {
      return
    }

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

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Reports & Match Handling</h1>
          <p className="text-sm text-slate-400 mt-1">Review roommate pairings, pending requests, and execute administrative un-matches.</p>
        </div>

        {loading ? (
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
        )}
      </div>
    </AdminLayout>
  )
}

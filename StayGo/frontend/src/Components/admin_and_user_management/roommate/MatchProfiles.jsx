import { useEffect, useState } from 'react'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import { Loader2, Search, Filter, ShieldAlert, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MatchProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const res = await api.get('/admin/roommate/profiles')
      setProfiles(res.data.items)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load roommate profiles')
    } finally {
      setLoading(false)
    }
  }

  const handleForceUnmatch = async (matchId) => {
    if (!window.confirm("Are you sure you want to forcibly unmatch these users? This action will alert both users and break their pairing.")) {
      return
    }

    try {
      const res = await api.post(`/admin/roommate/unmatch/${matchId}`)
      if (res.data.success) {
        toast.success('Successfully unmatched users')
        fetchProfiles() // Refresh to clear the lock
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unmatch users')
    }
  }

  const filtered = profiles.filter((p) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      p.userId?.fullName?.toLowerCase().includes(term) ||
      p.userId?.email?.toLowerCase().includes(term)
    )
  })

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Match Profiles</h1>
            <p className="text-sm text-slate-400 mt-1">Manage and monitor students participating in the roommate matching pool.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Bio / Hobbies</th>
                    <th className="px-6 py-4 font-semibold">Matched With (ID)</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">No profiles found</td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{p.userId?.fullName || 'Unknown'}</div>
                          <div className="text-xs text-slate-500">{p.userId?.email}</div>
                          <span className="inline-block mt-1 text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                            {p.gender || 'Not Set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.finalLockCompleted ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg text-xs font-medium">
                              Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg text-xs font-medium">
                              Looking
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate" title={p.bio || p.hobbies}>
                           {p.bio || p.hobbies || <span className="text-slate-600 italic">None provided</span>}
                        </td>
                        <td className="px-6 py-4">
                            {p.finalLockCompleted ? (
                                <span className="text-slate-400 text-xs font-mono bg-slate-800 px-2 py-1 rounded">System Handled</span>
                            ) : (
                                <span className="text-slate-600">-</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            disabled={!p.finalLockCompleted}
                            onClick={() => alert("To unmatch, we need the Match ID which requires a join query. (Note: Unmatching generally occurs from the Match Requests view to get the valid matchId.)")}
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
            
            {/* Pagination Placeholder */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400">
                <span>Showing 1 to {filtered.length} of {filtered.length}</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800">Prev</button>
                    <button className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800">Next</button>
                </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

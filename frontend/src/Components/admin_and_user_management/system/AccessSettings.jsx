import { useEffect, useState } from 'react'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import { Loader2, Search, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AccessSettings() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Only picking active system users for speed and mapping permissions
      const res = await api.get('/admin/users?limit=50')
      setUsers(res.data.items)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return
    
    try {
        const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole })
        if (res.data.success) {
            toast.success('User role updated')
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        }
    } catch (error) {
        toast.error('Failed to modify access policies')
    }
  }

  const filtered = users.filter(u => 
      !search || 
      u.email.toLowerCase().includes(search.toLowerCase()) || 
      u.fullName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            Access & Permissions
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage infrastructure, assign technical staff, or promote system administrators.</p>
        </div>

        <div className="mb-6 max-w-sm">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search accounts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
            </div>
        </div>

        {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Verification</th>
                    <th className="px-6 py-4 font-semibold">Current Access Level</th>
                    <th className="px-6 py-4 font-semibold text-right">Modify Permission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">No records found.</td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{u.fullName}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{u.phone || '-'}</td>
                        <td className="px-6 py-4">
                            {u.isVerified 
                                ? <span className="text-emerald-400">Verified</span> 
                                : <span className="text-slate-500">Unverified</span>}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase ${
                                u.role === 'admin' || u.role === 'super_admin' ? 'bg-indigo-500/20 text-indigo-400' :
                                u.role === 'technician' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-slate-800 text-slate-400'
                            }`}>
                                {u.role.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded outline-none p-1.5 focus:border-indigo-500"
                          >
                              <option value="student">Student User</option>
                              <option value="rider">Rider / Driver</option>
                              <option value="technician">Technician Staff</option>
                              <option value="admin">Administrator</option>
                              <option value="super_admin">Super Admin</option>
                          </select>
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

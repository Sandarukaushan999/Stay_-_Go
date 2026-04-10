import { useEffect, useState } from 'react'
import { Loader2, Search, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'

export default function AccessSettings() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users?limit=50')
      setUsers(res.data.items ?? [])
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to ${newRole.toUpperCase()}?`)) return

    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      if (res.data.success) {
        toast.success('User role updated')
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      }
    } catch {
      toast.error('Failed to update role')
    }
  }

  const filtered = users.filter(
    (u) =>
      !search ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <AdminLayout>
      <div className="rounded-3xl border border-[#101312]/15 bg-white p-5 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E2FF99] text-[#101312]">
            <Shield className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#101312]">Access Settings</h1>
            <p className="mt-2 text-[#101312]/70">
              Manage roles and access levels. Styled to match Ride Requests and Live Trip Monitoring.
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#101312]/40" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#101312]/20 bg-white py-2.5 pl-10 pr-4 text-sm text-[#101312] outline-none transition placeholder:text-[#101312]/40 focus:border-[#101312]/35 focus:ring-2 focus:ring-[#BAF91A]/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#101312]/40" />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-[#101312]/12 bg-white">
            <table className="min-w-[880px] w-full text-left text-sm">
              <thead className="bg-[#101312]">
                <tr className="text-white">
                  <th className="p-3 font-semibold">User</th>
                  <th className="p-3 font-semibold">Contact</th>
                  <th className="p-3 font-semibold">Verification</th>
                  <th className="p-3 font-semibold">Access level</th>
                  <th className="p-3 text-right font-semibold">Change role</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td className="p-6 text-center text-[#101312]/65" colSpan={5}>
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="border-t border-[#101312]/10">
                      <td className="p-3">
                        <div className="font-semibold text-[#101312]">{u.fullName}</div>
                        <div className="text-xs text-[#101312]/55">{u.email}</div>
                      </td>
                      <td className="p-3 text-[#101312]/82">{u.phone || '—'}</td>
                      <td className="p-3 text-[#101312]/82">
                        {u.isVerified ? (
                          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[#101312]/50">Unverified</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-lg px-2 py-1 text-xs font-bold uppercase ${
                            u.role === 'admin' || u.role === 'super_admin'
                              ? 'bg-violet-100 text-violet-900'
                              : u.role === 'technician'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-[#f4f4f2] text-[#101312]/75'
                          }`}
                        >
                          {(u.role || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="rounded-xl border border-[#101312]/20 bg-white px-2 py-2 text-xs font-semibold text-[#101312] outline-none focus:ring-2 focus:ring-[#BAF91A]/50"
                        >
                          <option value="student">Student</option>
                          <option value="rider">Rider</option>
                          <option value="technician">Technician</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super admin</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

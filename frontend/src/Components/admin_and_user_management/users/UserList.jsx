import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import MapPicker from '../../shared/maps/MapPicker'

export default function UserList() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    studentId: '',
    campusId: '',
    emergencyContact: '',
    hasVehicle: false,
    vehicleType: 'bike',
    vehicleNumber: '',
    seatCount: 1,
    residenceLocation: null,
    vehicleOriginLocation: null,
  })

  const query = useMemo(() => ({ q: q || undefined, role: role || undefined, page: 1, limit: 50 }), [q, role])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/users', { params: query })
      setItems(data.items ?? [])
    } catch (e) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role])

  async function toggleBlock(user) {
    const next = !user.isBlocked
    await api.patch(`/admin/users/${user.id}/block`, { isBlocked: next })
    await load()
  }

  function seatsForVehicle(type) {
    if (type === 'bike') return 1
    if (type === 'car') return 3
    if (type === 'van') return 7
    return 1
  }

  async function submitCreate(e) {
    e.preventDefault()
    setCreateError(null)
    try {
      const payload = {
        ...form,
        seatCount: form.hasVehicle ? seatsForVehicle(form.vehicleType) : 0,
        vehicleType: form.hasVehicle ? form.vehicleType : undefined,
        vehicleNumber: form.hasVehicle ? form.vehicleNumber : undefined,
        residenceLocation: form.residenceLocation || undefined,
        vehicleOriginLocation: (form.hasVehicle && form.vehicleOriginLocation) ? form.vehicleOriginLocation : undefined,
      }
      await api.post('/admin/users', payload)
      setCreating(false)
      setForm((p) => ({ ...p, fullName: '', email: '', password: '' }))
      await load()
    } catch (err) {
      setCreateError(err?.response?.data?.message ?? 'Failed to create user')
    }
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="mt-2 text-slate-400">Search, block/unblock, and review roles.</p>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            {creating ? 'Close Create Form' : 'Create Student / Rider Candidate'}
          </button>
        </div>

        {creating ? (
          <form onSubmit={submitCreate} className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Full name">
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Temporary password">
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                />
              </Field>

              <Field label="Phone">
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </Field>
              <Field label="Student ID">
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.studentId}
                  onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                />
              </Field>
              <Field label="University / Campus ID">
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.campusId}
                  onChange={(e) => setForm((p) => ({ ...p, campusId: e.target.value }))}
                  placeholder="e.g. uoc-main"
                />
              </Field>

              <Field label="Emergency contact">
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.emergencyContact}
                  onChange={(e) => setForm((p) => ({ ...p, emergencyContact: e.target.value }))}
                />
              </Field>

              <Field label="Role (base)">
                <select
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                >
                  <option value="student">student</option>
                  <option value="technician">technician</option>
                  <option value="admin">admin</option>
                </select>
              </Field>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-sm text-slate-300 mb-2">Student residence location (pickup default)</div>
                <MapPicker
                  value={form.residenceLocation}
                  onChange={(v) => setForm((p) => ({ ...p, residenceLocation: v }))}
                  height={260}
                />
                <div className="mt-2 text-xs text-slate-400">
                  Click map to set residence. This is used for passenger pickup.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.hasVehicle}
                    onChange={(e) => {
                      const hasVehicle = e.target.checked
                      setForm((p) => ({
                        ...p,
                        hasVehicle,
                        vehicleType: hasVehicle ? p.vehicleType : 'bike',
                        seatCount: hasVehicle ? seatsForVehicle(p.vehicleType) : 0,
                      }))
                    }}
                  />
                  Student owns a vehicle (rider candidate)
                </label>

                {form.hasVehicle ? (
                  <div className="mt-3 grid gap-3">
                    <Field label="Vehicle type">
                      <select
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                        value={form.vehicleType}
                        onChange={(e) => {
                          const vt = e.target.value
                          setForm((p) => ({ ...p, vehicleType: vt, seatCount: seatsForVehicle(vt) }))
                        }}
                      >
                        <option value="bike">Bike (1 passenger)</option>
                        <option value="car">Car (3 passengers)</option>
                        <option value="van">Van (7 passengers)</option>
                      </select>
                    </Field>

                    <Field label="Seat capacity (auto)">
                      <input
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300"
                        value={seatsForVehicle(form.vehicleType)}
                        readOnly
                        disabled
                      />
                    </Field>

                    <Field label="Vehicle number">
                      <input
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                        value={form.vehicleNumber}
                        onChange={(e) => setForm((p) => ({ ...p, vehicleNumber: e.target.value }))}
                        required
                      />
                    </Field>

                    <div>
                      <div className="text-sm text-slate-300 mb-2">Vehicle origin / start location</div>
                      <MapPicker
                        value={form.vehicleOriginLocation}
                        onChange={(v) => setForm((p) => ({ ...p, vehicleOriginLocation: v }))}
                        height={220}
                      />
                      <div className="mt-2 text-xs text-slate-400">
                        Click map to set where rider starts from.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-400">
                    This student will be a passenger only (still a student user).
                  </div>
                )}
              </div>
            </div>

            {createError ? (
              <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                {createError}
              </div>
            ) : null}

            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Create User
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-900"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Search name/email/studentId..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All roles</option>
            <option value="student">student</option>
            <option value="rider">rider</option>
            <option value="technician">technician</option>
            <option value="admin">admin</option>
            <option value="super_admin">super_admin</option>
          </select>
          <button
            type="button"
            onClick={load}
            className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950">
              <tr className="text-slate-300">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Verified</th>
                <th className="p-3">Blocked</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/30">
              {loading ? (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((u) => (
                  <tr key={u.id} className="border-t border-slate-800">
                    <td className="p-3 text-slate-100">{u.fullName}</td>
                    <td className="p-3 text-slate-300">{u.email}</td>
                    <td className="p-3 text-slate-300">{u.role}</td>
                    <td className="p-3 text-slate-300">{u.isVerified ? 'yes' : 'no'}</td>
                    <td className="p-3 text-slate-300">{u.isBlocked ? 'yes' : 'no'}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => toggleBlock(u)}
                        className="rounded-xl border border-slate-800 px-3 py-1.5 hover:bg-slate-900"
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={6}>
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-300">{label}</span>
      {children}
    </label>
  )
}


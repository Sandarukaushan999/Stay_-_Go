import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../app/store/authStore'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [campusId, setCampusId] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const setToken = useAuthStore((s) => s.setToken)
  const hydrateMe = useAuthStore((s) => s.hydrateMe)
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await axios.post(
        (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api') + '/auth/register',
        {
          fullName,
          email,
          password,
          role: 'student',
          campusId: campusId.trim(),
        }
      )
      setToken(data.token)
      await hydrateMe()
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message
      const details = err?.response?.data?.details
      const fieldErr =
        details?.fieldErrors && Object.values(details.fieldErrors).flat().filter(Boolean)[0]
      setError(msg || fieldErr || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-slate-400">For demo/dev only</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-sm text-slate-300">Full name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">University / campus ID</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              placeholder="e.g. uoc-main"
              required
            />
            <p className="mt-1 text-xs text-slate-500">Required for student accounts on the API.</p>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 px-3 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-400">
          Already have an account?{' '}
          <Link className="text-violet-300 hover:underline" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}


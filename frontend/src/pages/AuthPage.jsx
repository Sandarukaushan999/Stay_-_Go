import { useMemo, useState } from 'react'
import Footer from '../Components/landing/footer'
import Header from '../Components/landing/header'
import { useAuthStore } from '../app/store/authStore'
import axios from 'axios'

const authContent = {
  login: {
    eyebrow: 'Secure access',
    title: 'Return to your student operations workspace.',
    copy:
      'Log in to continue with roommate requests, active rides, maintenance tickets, and your personalized dashboard.',
    primaryLabel: 'Login',
    secondaryText: "Don't have an account yet?",
    secondaryAction: 'register',
    secondaryLabel: 'Create one',
  },
  register: {
    eyebrow: 'Verified onboarding',
    title: 'Create your Admin account to manage Stay & Go.',
    copy:
      'Students, riders, and technicians are created from the Admin dashboard. This page is for Admin bootstrapping only.',
    primaryLabel: 'Register',
    secondaryText: 'Already have an account?',
    secondaryAction: 'login',
    secondaryLabel: 'Sign in',
  },
}

const authSignals = [
  'Verified student-only access model',
  'Protected account recovery and 2FA-ready flows',
  'Unified access for rides, matching, and maintenance',
]

export default function AuthPage({
  mode,
  headerNavItems,
  onNavigateHome,
  onNavigateToRide,
  onNavigateToPage,
  onNavigateToAuth,
  afterAuthRedirect,
}) {
  const content = authContent[mode]
  const login = useAuthStore((s) => s.login)
  const setToken = useAuthStore((s) => s.setToken)
  const hydrateMe = useAuthStore((s) => s.hydrateMe)
  const user = useAuthStore((s) => s.user)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const actionItems = useMemo(
    () => [
      { label: 'Need Help', type: 'button', variant: 'button-ghost', onClick: () => onNavigateToPage('support') },
      { label: 'Open Ride Module', type: 'button', variant: 'button-primary', onClick: onNavigateToRide },
    ],
    [onNavigateToPage, onNavigateToRide]
  )

  async function onSubmit(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login({ email, password })
      } else {
        const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'
        const mappedRole = role
        const { data } = await axios.post(`${base}/auth/register`, {
          fullName,
          email,
          password,
          role: mappedRole,
        })
        setToken(data.token)
        await hydrateMe()
      }
      const roleAfter = user?.role
      if (roleAfter === 'admin' || roleAfter === 'super_admin') {
        window.location.href = '/admin'
      } else if (roleAfter === 'student' || roleAfter === 'rider' || roleAfter === 'technician') {
        window.location.href = '/student/dashboard'
      } else {
        afterAuthRedirect?.()
      }
    } catch (e) {
      const status = e?.response?.status
      const message = e?.response?.data?.message

      if (status === 409) {
        setError(message ?? 'Email already registered. Try logging in.')
      } else if (status === 401) {
        setError(message ?? 'Invalid email or password.')
      } else if (status === 403) {
        setError(message ?? 'Account blocked or not allowed.')
      } else {
        setError('Authentication failed. Check credentials and server.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header
        navItems={headerNavItems}
        actionItems={actionItems}
        onBrandClick={onNavigateHome}
        navAriaLabel="Authentication navigation"
      />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <p className="text-xs uppercase tracking-wide text-violet-200">{content.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold">{content.title}</h1>
          <p className="mt-3 text-slate-400">{content.copy}</p>

          <div className="mt-6 grid gap-3">
            {authSignals.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-600/20 text-violet-200">
                  +
                </span>
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">{content.primaryLabel}</p>
            <h2 className="mt-2 text-2xl font-semibold">{content.primaryLabel} to STAY & GO</h2>
            <p className="mt-2 text-sm text-slate-400">
              {mode === 'login'
                ? 'Use your verified campus account to continue.'
                : 'Start with the details needed for verification and secure onboarding.'}
            </p>
          </div>

          <form className="mt-6 grid gap-3" onSubmit={onSubmit}>
            {mode === 'register' ? (
              <>
                <label className="grid gap-1 text-sm">
                  <span className="text-slate-300">Full name</span>
                  <input
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </label>
              </>
            ) : null}

            <label className="grid gap-1 text-sm">
              <span className="text-slate-300">University email</span>
              <input
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-slate-300">Password</span>
              <input
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            {mode === 'register' ? (
              <label className="grid gap-1 text-sm">
                <span className="text-slate-300">Role</span>
                <input
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300"
                  value="admin"
                  disabled
                  readOnly
                />
              </label>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Please wait…' : content.primaryLabel}
              </button>
              <button
                className="rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
                type="button"
                onClick={() => onNavigateToPage('privacy')}
              >
                Review privacy
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-400">
            <p>{content.secondaryText}</p>
            <button
              className="rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
              type="button"
              onClick={() => onNavigateToAuth(content.secondaryAction)}
            >
              {content.secondaryLabel}
            </button>
          </div>
        </section>
      </main>

      <Footer onNavigateToPage={onNavigateToPage} />
    </div>
  )
}


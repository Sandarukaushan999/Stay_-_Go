import { useMemo, useState } from 'react'
import axios from 'axios'

import Footer from '../Components/landing/footer'
import Header from '../Components/landing/header'
import MapPicker from '../Components/shared/maps/MapPicker'
import { useAuthStore } from '../app/store/authStore'

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
    title: 'Create your student account (Passenger / Rider-candidate).',
    copy:
      'All users are students. If you own a vehicle, enable Rider-candidate and fill vehicle details. Admin approval is required before you can provide rides.',
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
  const [phone, setPhone] = useState('')
  const [studentId, setStudentId] = useState('')
  const [campusId, setCampusId] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [accountType, setAccountType] = useState('student')
  const [hasVehicle, setHasVehicle] = useState(false)
  const [vehicleType, setVehicleType] = useState('bike')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [residenceLocation, setResidenceLocation] = useState(null)
  const [vehicleOriginLocation, setVehicleOriginLocation] = useState(null)
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
      let authedUser = null
      if (mode === 'login') {
        const result = await login({ email, password })
        authedUser = result?.user ?? null
      } else {
        const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'
        const isStudent = accountType === 'student'
        const body = {
          fullName,
          email,
          password,
          role: accountType,
          hasVehicle: isStudent ? hasVehicle : false,
        }
        if (isStudent) {
          body.campusId = campusId.trim()
          if (phone.trim()) body.phone = phone.trim()
          if (studentId.trim()) body.studentId = studentId.trim()
          if (emergencyContact.trim()) body.emergencyContact = emergencyContact.trim()
          if (hasVehicle) {
            body.vehicleType = vehicleType
            if (vehicleNumber.trim()) body.vehicleNumber = vehicleNumber.trim()
            if (
              vehicleOriginLocation &&
              typeof vehicleOriginLocation.lat === 'number' &&
              typeof vehicleOriginLocation.lng === 'number'
            ) {
              body.vehicleOriginLocation = vehicleOriginLocation
            }
          } else if (
            residenceLocation &&
            typeof residenceLocation.lat === 'number' &&
            typeof residenceLocation.lng === 'number'
          ) {
            body.residenceLocation = residenceLocation
          }
        }
        const { data } = await axios.post(`${base}/auth/register`, body)
        setToken(data.token)
        authedUser = await hydrateMe()
      }

      const roleAfter = authedUser?.role ?? user?.role
      if (roleAfter === 'admin' || roleAfter === 'super_admin') {
        window.location.href = '/admin'
      } else if (roleAfter === 'student') {
        window.location.href = '/student/dashboard'
      } else if (roleAfter === 'rider') {
        window.location.href = '/rides/workspace'
      } else if (roleAfter === 'technician') {
        window.location.href = '/technician/dashboard'
      } else {
        afterAuthRedirect?.()
      }
    } catch (e) {
      const status = e?.response?.status
      const message = e?.response?.data?.message
      const details = e?.response?.data?.details
      const fieldErr =
        details?.fieldErrors && Object.values(details.fieldErrors).flat().filter(Boolean)[0]

      if (status === 409) setError(message ?? 'Email already registered. Try logging in.')
      else if (status === 401) setError(message ?? 'Invalid email or password.')
      else if (status === 403) setError(message ?? 'Account blocked or not allowed.')
      else if (status === 400)
        setError(message && message !== 'Validation error' ? message : fieldErr ?? message ?? 'Invalid registration data.')
      else setError('Authentication failed. Check credentials and server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#101312]" style={{ fontFamily: '"Poppins", "Manrope", "Trebuchet MS", sans-serif' }}>
      <Header
        navItems={headerNavItems}
        actionItems={actionItems}
        onBrandClick={onNavigateHome}
        navAriaLabel="Authentication navigation"
      />

      <main className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-[#101312]/15 bg-gradient-to-br from-[#E2FF99] via-[#f4ffd8] to-[#FFFFFF] p-5 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#876DFF]">{content.eyebrow}</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-[#101312] sm:text-3xl">{content.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#101312]/75">{content.copy}</p>

            <div className="mt-6 grid gap-3">
              {authSignals.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-[#101312]/12 bg-white p-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#BAF91A] text-base font-semibold text-[#101312]">
                    +
                  </span>
                  <p className="text-sm text-[#101312]/80">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#101312]/15 bg-white p-5 shadow-[0_10px_30px_rgba(16,19,18,0.08)] sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#876DFF]">{content.primaryLabel}</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#101312]">{content.primaryLabel} to STAY &amp; GO</h2>
              <p className="mt-2 text-sm text-[#101312]/70">
                {mode === 'login'
                  ? 'Use your verified campus account to continue.'
                  : 'Start with the details needed for verification and secure onboarding.'}
              </p>
            </div>

            <form className="mt-6 grid gap-3" onSubmit={onSubmit}>
              {mode === 'register' ? (
                <label className="grid gap-1 text-sm">
                  <span className="text-[#101312]/80">Full name</span>
                  <input
                    className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </label>
              ) : null}

              <label className="grid gap-1 text-sm">
                <span className="text-[#101312]/80">University email</span>
                <input
                  className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  required
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-[#101312]/80">Password</span>
                <input
                  className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </label>

              {mode === 'register' ? (
                <>
                  <label className="grid gap-1 text-sm">
                    <span className="text-[#101312]/80">Account type</span>
                    <select
                      className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
                      value={accountType}
                      onChange={(e) => {
                        const next = e.target.value
                        setAccountType(next)
                        if (next !== 'student') setHasVehicle(false)
                      }}
                    >
                      <option value="student">Student</option>
                      <option value="technician">Technician / Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm">
                    <span className="text-[#101312]/80">Phone</span>
                    <input
                      className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94..."
                    />
                  </label>

                  {accountType === 'student' ? (
                    <>
                      <label className="grid gap-1 text-sm">
                        <span className="text-[#101312]/80">Student ID</span>
                        <input
                          className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                        />
                      </label>

                      <label className="grid gap-1 text-sm">
                        <span className="text-[#101312]/80">University / Campus ID</span>
                        <input
                          className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
                          value={campusId}
                          onChange={(e) => setCampusId(e.target.value)}
                          placeholder="e.g. uoc-main"
                          required
                        />
                      </label>

                      <label className="grid gap-1 text-sm">
                        <span className="text-[#101312]/80">Emergency contact</span>
                        <input
                          className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                        />
                      </label>
                    </>
                  ) : null}

                  {accountType === 'student' ? (
                    <div className="rounded-2xl border border-[#101312]/12 bg-[#f9fce9] p-4">
                      <label className="flex items-center gap-2 text-sm text-[#101312]">
                        <input type="checkbox" checked={hasVehicle} onChange={(e) => setHasVehicle(e.target.checked)} />
                        I own a vehicle (Rider-candidate)
                      </label>
                      <p className="mt-2 text-xs text-[#101312]/65">
                        You will remain a student until admin approves you as a rider.
                      </p>

                      {hasVehicle ? (
                        <div className="mt-4 grid gap-3">
                          <label className="grid gap-1 text-sm">
                            <span className="text-[#101312]/80">Vehicle type</span>
                            <select
                              className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
                              value={vehicleType}
                              onChange={(e) => setVehicleType(e.target.value)}
                            >
                              <option value="bike">Bike (1 passenger)</option>
                              <option value="car">Car (3 passengers)</option>
                              <option value="van">Van (7 passengers)</option>
                            </select>
                          </label>

                          <label className="grid gap-1 text-sm">
                            <span className="text-[#101312]/80">Vehicle number</span>
                            <input
                              className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#876DFF]"
                              value={vehicleNumber}
                              onChange={(e) => setVehicleNumber(e.target.value)}
                              required
                            />
                          </label>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {accountType === 'student' && !hasVehicle ? (
                    <div>
                      <div className="mb-2 text-sm text-[#101312]/80">Your residence location (pickup default)</div>
                      <MapPicker value={residenceLocation} onChange={setResidenceLocation} height={240} />
                    </div>
                  ) : null}

                  {accountType === 'student' && hasVehicle ? (
                    <div>
                      <div className="mb-2 text-sm text-[#101312]/80">Vehicle origin / start location</div>
                      <MapPicker value={vehicleOriginLocation} onChange={setVehicleOriginLocation} height={240} />
                    </div>
                  ) : null}
                </>
              ) : null}

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className="rounded-xl bg-[#BAF91A] px-4 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00] disabled:opacity-60"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Please wait...' : content.primaryLabel}
                </button>
                <button
                  className="rounded-xl border border-[#101312]/20 bg-white px-4 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
                  type="button"
                  onClick={() => onNavigateToPage('privacy')}
                >
                  Review privacy
                </button>
              </div>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 text-sm text-[#101312]/70">
              <p>{content.secondaryText}</p>
              <button
                className="rounded-xl border border-[#101312]/20 bg-white px-3 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
                type="button"
                onClick={() => onNavigateToAuth(content.secondaryAction)}
              >
                {content.secondaryLabel}
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer onNavigateToPage={onNavigateToPage} />
    </div>
  )
}

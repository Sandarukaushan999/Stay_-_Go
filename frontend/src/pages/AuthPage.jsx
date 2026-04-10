import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import Footer from '../Components/landing/footer'
import Header from '../Components/landing/header'
import MapPicker from '../Components/shared/maps/MapPicker'
import { useAuthStore } from '../app/store/authStore'
import { getApiBaseURL } from '../lib/axios'
import { validateLoginFields, validateRegisterFields } from '../utils/authFormValidation'

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
  const navigate = useNavigate()
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
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    setFieldErrors({})
    setError(null)
  }, [mode])

  const actionItems = useMemo(
    () => [
      { label: 'Need Help', type: 'button', variant: 'button-ghost', onClick: () => onNavigateToPage('support') },
      { label: 'Open Ride Module', type: 'button', variant: 'button-primary', onClick: onNavigateToRide },
    ],
    [onNavigateToPage, onNavigateToRide]
  )

  function inputClass(fieldKey) {
    const err = fieldErrors[fieldKey]
    return [
      'w-full rounded-xl border px-3 py-2 outline-none focus:ring-2',
      err
        ? 'border-rose-500 bg-rose-50/50 text-[#101312] focus:ring-rose-400'
        : 'border-[#101312]/20 bg-white focus:ring-[#876DFF]',
    ].join(' ')
  }

  function blurLoginField(key) {
    if (mode !== 'login') return
    const errs = validateLoginFields({ email, password })
    const msg = errs[key]
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (msg) next[key] = msg
      else delete next[key]
      return next
    })
  }

  function blurRegisterField(key) {
    if (mode !== 'register') return
    const { errors } = validateRegisterFields({
      fullName,
      email,
      password,
      accountType,
      phone,
      studentId,
      campusId,
      emergencyContact,
      hasVehicle,
      vehicleNumber,
      residenceLocation,
      vehicleOriginLocation,
    })
    const msg = errors[key]
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (msg) next[key] = msg
      else delete next[key]
      return next
    })
  }

  function clearFieldError(key) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError(null)

    /** @type {{ phone?: string, emergencyContact?: string, vehicleNumber?: string } | null} */
    let registerNormalized = null

    if (mode === 'login') {
      const errs = validateLoginFields({ email, password })
      if (Object.keys(errs).length) {
        setFieldErrors(errs)
        return
      }
      setFieldErrors({})
    } else {
      const { errors, normalized } = validateRegisterFields({
        fullName,
        email,
        password,
        accountType,
        phone,
        studentId,
        campusId,
        emergencyContact,
        hasVehicle,
        vehicleNumber,
        residenceLocation,
        vehicleOriginLocation,
      })
      if (Object.keys(errors).length) {
        setFieldErrors(errors)
        return
      }
      setFieldErrors({})
      registerNormalized = normalized
    }

    setLoading(true)
    try {
      let authedUser = null
      if (mode === 'login') {
        const result = await login({ email: email.trim(), password })
        authedUser = result?.user ?? null
      } else {
        const base = getApiBaseURL()
        const isStudent = accountType === 'student'
        const normalized = registerNormalized ?? {}
        const body = {
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role: accountType,
          hasVehicle: isStudent ? hasVehicle : false,
        }
        if (isStudent) {
          body.campusId = campusId.trim().toLowerCase()
          if (normalized.phone) body.phone = normalized.phone
          if (studentId.trim()) body.studentId = studentId.trim()
          if (emergencyContact.trim() && normalized.emergencyContact) {
            body.emergencyContact = normalized.emergencyContact
          }
          if (hasVehicle) {
            body.vehicleType = vehicleType
            if (normalized.vehicleNumber) body.vehicleNumber = normalized.vehicleNumber
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
        } else if (normalized.phone) {
          body.phone = normalized.phone
        }
        const { data } = await axios.post(`${base}/auth/register`, body)
        setToken(data.token)
        authedUser = await hydrateMe()
      }

      const roleAfter = authedUser?.role ?? useAuthStore.getState().user?.role
      if (roleAfter === 'admin' || roleAfter === 'super_admin') {
        navigate('/admin', { replace: true })
      } else if (roleAfter === 'student') {
        navigate('/student/dashboard', { replace: true })
      } else if (roleAfter === 'rider') {
        navigate('/rides/workspace', { replace: true })
      } else if (roleAfter === 'technician') {
        navigate('/technician/dashboard', { replace: true })
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
                    className={inputClass('fullName')}
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      clearFieldError('fullName')
                    }}
                    onBlur={() => blurRegisterField('fullName')}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.fullName)}
                  />
                  {fieldErrors.fullName ? (
                    <span className="text-sm font-medium text-rose-600">{fieldErrors.fullName}</span>
                  ) : null}
                </label>
              ) : null}

              <label className="grid gap-1 text-sm">
                <span className="text-[#101312]/80">{mode === 'register' ? 'University email' : 'Email'}</span>
                <input
                  className={inputClass('email')}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearFieldError('email')
                  }}
                  onBlur={() => (mode === 'login' ? blurLoginField('email') : blurRegisterField('email'))}
                  placeholder={mode === 'register' ? 'name@university.edu' : 'you@example.com'}
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                {fieldErrors.email ? (
                  <span className="text-sm font-medium text-rose-600">{fieldErrors.email}</span>
                ) : null}
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-[#101312]/80">Password</span>
                <input
                  className={inputClass('password')}
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearFieldError('password')
                  }}
                  onBlur={() => (mode === 'login' ? blurLoginField('password') : blurRegisterField('password'))}
                  placeholder="Enter your password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                {fieldErrors.password ? (
                  <span className="text-sm font-medium text-rose-600">{fieldErrors.password}</span>
                ) : null}
              </label>

              {mode === 'register' ? (
                <>
                  <label className="grid gap-1 text-sm">
                    <span className="text-[#101312]/80">Account type</span>
                    <select
                      className={inputClass('accountType')}
                      value={accountType}
                      onChange={(e) => {
                        const next = e.target.value
                        setAccountType(next)
                        if (next !== 'student') setHasVehicle(false)
                        setFieldErrors({})
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
                      className={inputClass('phone')}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        clearFieldError('phone')
                      }}
                      onBlur={() => blurRegisterField('phone')}
                      placeholder="0771234567 or +94771234567"
                      inputMode="tel"
                      autoComplete="tel"
                      aria-invalid={Boolean(fieldErrors.phone)}
                    />
                    {fieldErrors.phone ? (
                      <span className="text-sm font-medium text-rose-600">{fieldErrors.phone}</span>
                    ) : accountType === 'student' ? (
                      <span className="text-xs text-[#101312]/55">10-digit Sri Lankan mobile (leading 0 or +94).</span>
                    ) : (
                      <span className="text-xs text-[#101312]/55">Optional for staff; same format if provided.</span>
                    )}
                  </label>

                  {accountType === 'student' ? (
                    <>
                      <label className="grid gap-1 text-sm">
                        <span className="text-[#101312]/80">Student ID</span>
                        <input
                          className={inputClass('studentId')}
                          value={studentId}
                          onChange={(e) => {
                            setStudentId(e.target.value)
                            clearFieldError('studentId')
                          }}
                          onBlur={() => blurRegisterField('studentId')}
                          placeholder="Optional"
                          aria-invalid={Boolean(fieldErrors.studentId)}
                        />
                        {fieldErrors.studentId ? (
                          <span className="text-sm font-medium text-rose-600">{fieldErrors.studentId}</span>
                        ) : null}
                      </label>

                      <label className="grid gap-1 text-sm">
                        <span className="text-[#101312]/80">University / Campus ID</span>
                        <input
                          className={inputClass('campusId')}
                          value={campusId}
                          onChange={(e) => {
                            setCampusId(e.target.value)
                            clearFieldError('campusId')
                          }}
                          onBlur={() => blurRegisterField('campusId')}
                          placeholder="e.g. uoc-main"
                          aria-invalid={Boolean(fieldErrors.campusId)}
                        />
                        {fieldErrors.campusId ? (
                          <span className="text-sm font-medium text-rose-600">{fieldErrors.campusId}</span>
                        ) : (
                          <span className="text-xs text-[#101312]/55">Letters, numbers, single hyphens (slug style).</span>
                        )}
                      </label>

                      <label className="grid gap-1 text-sm">
                        <span className="text-[#101312]/80">Emergency contact</span>
                        <input
                          className={inputClass('emergencyContact')}
                          value={emergencyContact}
                          onChange={(e) => {
                            setEmergencyContact(e.target.value)
                            clearFieldError('emergencyContact')
                          }}
                          onBlur={() => blurRegisterField('emergencyContact')}
                          placeholder="e.g. 0771234567 or hotline 117"
                          inputMode="tel"
                          aria-invalid={Boolean(fieldErrors.emergencyContact)}
                        />
                        {fieldErrors.emergencyContact ? (
                          <span className="text-sm font-medium text-rose-600">{fieldErrors.emergencyContact}</span>
                        ) : (
                          <span className="text-xs text-[#101312]/55">
                            Optional: family/friend mobile (10 digits) or 3–5 digit hotline (117, 1990). Leave blank if you
                            prefer.
                          </span>
                        )}
                      </label>
                    </>
                  ) : null}

                  {accountType === 'student' ? (
                    <div className="rounded-2xl border border-[#101312]/12 bg-[#f9fce9] p-4">
                      <label className="flex items-center gap-2 text-sm text-[#101312]">
                        <input
                          type="checkbox"
                          checked={hasVehicle}
                          onChange={(e) => {
                            setHasVehicle(e.target.checked)
                            clearFieldError('vehicleNumber')
                            clearFieldError('vehicleOriginLocation')
                            clearFieldError('residenceLocation')
                          }}
                        />
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
                              className={inputClass('vehicleType')}
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
                              className={inputClass('vehicleNumber')}
                              value={vehicleNumber}
                              onChange={(e) => {
                                setVehicleNumber(e.target.value.replace(/\D/g, ''))
                                clearFieldError('vehicleNumber')
                              }}
                              onBlur={() => blurRegisterField('vehicleNumber')}
                              placeholder="Digits only (e.g. 1234567)"
                              inputMode="numeric"
                              maxLength={12}
                              aria-invalid={Boolean(fieldErrors.vehicleNumber)}
                            />
                            {fieldErrors.vehicleNumber ? (
                              <span className="text-sm font-medium text-rose-600">{fieldErrors.vehicleNumber}</span>
                            ) : (
                              <span className="text-xs text-[#101312]/55">4–12 digits. No letters, spaces, or dashes.</span>
                            )}
                          </label>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {accountType === 'student' && !hasVehicle ? (
                    <div>
                      <div className="mb-2 text-sm text-[#101312]/80">Your residence location (pickup default)</div>
                      <p className="mb-2 text-xs text-[#101312]/55">
                        Optional — helps with ride pickup defaults. You can add or change it later in your profile.
                      </p>
                      <div
                        className={
                          fieldErrors.residenceLocation
                            ? 'rounded-2xl ring-2 ring-rose-500 ring-offset-2'
                            : undefined
                        }
                      >
                        <MapPicker
                          value={residenceLocation}
                          onChange={(v) => {
                            setResidenceLocation(v)
                            clearFieldError('residenceLocation')
                          }}
                          height={240}
                        />
                      </div>
                      {fieldErrors.residenceLocation ? (
                        <p className="mt-2 text-sm font-medium text-rose-600">{fieldErrors.residenceLocation}</p>
                      ) : null}
                    </div>
                  ) : null}

                  {accountType === 'student' && hasVehicle ? (
                    <div>
                      <div className="mb-2 text-sm text-[#101312]/80">Vehicle origin / start location</div>
                      <p className="mb-2 text-xs text-[#101312]/55">
                        Optional — used for route previews when you drive. You can update it later.
                      </p>
                      <div
                        className={
                          fieldErrors.vehicleOriginLocation
                            ? 'rounded-2xl ring-2 ring-rose-500 ring-offset-2'
                            : undefined
                        }
                      >
                        <MapPicker
                          value={vehicleOriginLocation}
                          onChange={(v) => {
                            setVehicleOriginLocation(v)
                            clearFieldError('vehicleOriginLocation')
                          }}
                          height={240}
                        />
                      </div>
                      {fieldErrors.vehicleOriginLocation ? (
                        <p className="mt-2 text-sm font-medium text-rose-600">{fieldErrors.vehicleOriginLocation}</p>
                      ) : null}
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

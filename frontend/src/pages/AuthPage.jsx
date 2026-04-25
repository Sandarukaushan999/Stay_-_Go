import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
    title: 'Create your account (Student / Technician / Admin).',
    copy:
      'Students get access to rides, roommate matching, and maintenance. Select Admin to register an administrator account.',
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

  // ── Google Sign-In state ─────────────────────────────────────────────────
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState(null)
  // link_required modal state
  const [linkModal, setLinkModal] = useState(null)   // null | { email, idToken }
  const [linkLoading, setLinkLoading] = useState(false)
  const googleBtnRef = useRef(null)

  // Resolve role and navigate after Google login
  const navigateAfterAuth = useCallback((authedUser) => {
    const role = authedUser?.role
    if (role === 'admin' || role === 'super_admin') navigate('/admin', { replace: true })
    else if (role === 'student') navigate('/student/dashboard', { replace: true })
    else if (role === 'rider') navigate('/rides/workspace', { replace: true })
    else if (role === 'technician') navigate('/technician/dashboard', { replace: true })
    else navigate('/profile', { replace: true })
  }, [navigate])

  // Called by Google Identity Services with credential (id_token)
  const handleGoogleCredential = useCallback(async (response) => {
    const idToken = response.credential
    if (!idToken) return
    setGoogleLoading(true)
    setGoogleError(null)
    try {
      const base = getApiBaseURL().replace(/\/api$/, '')
      const { data } = await axios.post(`${base}/auth/google/signin`, { idToken })

      if (data.action === 'logged_in') {
        setToken(data.token)
        const authedUser = await hydrateMe({ force: true })
        navigateAfterAuth(authedUser || data.user)

      } else if (data.action === 'link_required') {
        // Show confirmation modal — keep idToken in memory for confirm-link call
        setLinkModal({ email: data.email, idToken })

      } else if (data.action === 'onboard') {
        // Redirect to register with Google data pre-filled via sessionStorage
        try {
          sessionStorage.setItem('google_onboard', JSON.stringify(data.googleData))
        } catch { /* ignore */ }
        onNavigateToAuth('register')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Google sign-in failed. Please try again.'
      setGoogleError(msg)
    } finally {
      setGoogleLoading(false)
    }
  }, [setToken, hydrateMe, navigateAfterAuth, onNavigateToAuth])

  // Confirm linking: user accepted → POST /auth/google/confirm-link
  const handleConfirmLink = async () => {
    if (!linkModal?.idToken) return
    setLinkLoading(true)
    try {
      const base = getApiBaseURL().replace(/\/api$/, '')
      const { data } = await axios.post(`${base}/auth/google/confirm-link`, { idToken: linkModal.idToken })
      setLinkModal(null)
      setToken(data.token)
      const authedUser = await hydrateMe({ force: true })
      navigateAfterAuth(authedUser || data.user)
    } catch (err) {
      setGoogleError(err?.response?.data?.message || 'Could not link account. Please try again.')
      setLinkModal(null)
    } finally {
      setLinkLoading(false)
    }
  }

  // Load Google Identity Services script + render button
  useEffect(() => {
    if (mode !== 'login') return
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!GOOGLE_CLIENT_ID) return   // skip if not configured

    const doInit = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return

      // initialize() must only be called ONCE per page load
      if (!window.__gsiInitialized) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        })
        window.__gsiInitialized = true
      }

      // renderButton is safe to call again when the ref mounts
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        logo_alignment: 'left',
        width: 400,           // ← must be a number, NOT '100%'
      })
    }

    if (window.google) {
      doInit()
    } else if (!document.getElementById('gsi-script')) {
      // Only inject the script once
      const script = document.createElement('script')
      script.id = 'gsi-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = doInit
      document.head.appendChild(script)
    } else {
      // Script tag exists but hasn't loaded yet — wait
      document.getElementById('gsi-script').addEventListener('load', doInit, { once: true })
    }

    return () => {
      try { window.google?.accounts?.id?.cancel() } catch { /* ignore */ }
    }
  }, [mode, handleGoogleCredential])

  // Ensure AuthPage is strictly light mode (revert global dark mode if it bled over)
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    if (isDark) {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])

  useEffect(() => {
    setFieldErrors({})
    setError(null)
    setGoogleError(null)
  }, [mode])

  // ── Google onboard pre-fill (register mode) ─────────────────────────────
  const [googlePrefill, setGooglePrefill] = useState(null) // { email, name, picture } | null

  useEffect(() => {
    if (mode !== 'register') return
    try {
      const raw = sessionStorage.getItem('google_onboard')
      if (raw) {
        const data = JSON.parse(raw)
        sessionStorage.removeItem('google_onboard')
        if (data.name)  setFullName(data.name)
        if (data.email) setEmail(data.email)
        setGooglePrefill(data)
      }
    } catch { /* ignore */ }
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
              {/* Google pre-fill banner (register mode) */}
              {mode === 'register' && googlePrefill && (
                <div className="flex items-start gap-3 rounded-2xl border border-[#d6e9aa] bg-[#f4ffd6] px-4 py-3">
                  {googlePrefill.picture && (
                    <img
                      src={googlePrefill.picture}
                      alt="Google"
                      className="h-9 w-9 rounded-full border-2 border-[#BAF91A] object-cover flex-shrink-0 mt-0.5"
                    />
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#3a5200] leading-tight">
                      Details pre-filled from your Google account
                    </p>
                    <p className="text-[11px] text-[#3a5200]/70 mt-0.5">
                      Review and complete the remaining fields to finish registration.
                    </p>
                  </div>
                </div>
              )}

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

                  {accountType !== 'admin' && (
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
                  )}

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

            {/* ── Google Sign-In (login mode only) ── */}
            {mode === 'login' && import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <div className="mt-5">
                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-[#101312]/10" />
                  <span className="text-xs font-semibold text-[#101312]/40 uppercase tracking-wider">or continue with</span>
                  <div className="flex-1 h-px bg-[#101312]/10" />
                </div>

                {/* GSI rendered button */}
                <div
                  ref={googleBtnRef}
                  id="google-signin-btn"
                  className={`w-full transition-opacity ${googleLoading ? 'opacity-50 pointer-events-none' : ''}`}
                />

                {/* Google loading / error feedback */}
                {googleLoading && (
                  <p className="mt-2 text-xs text-center text-[#101312]/55 font-medium animate-pulse">
                    Verifying with Google…
                  </p>
                )}
                {googleError && (
                  <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {googleError}
                  </div>
                )}
              </div>
            )}

            {/* ── Link-Required Confirmation Modal ── */}
            {linkModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="w-full max-w-sm rounded-3xl bg-white shadow-[0_24px_60px_rgba(16,19,18,0.18)] p-7">
                  {/* Google logo */}
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full border border-[#101312]/10 bg-white shadow-sm flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#101312] text-center mb-1">Link Google Account?</h3>
                  <p className="text-xs text-[#101312]/60 text-center leading-relaxed mb-4">
                    A Stay &amp; Go account already exists for
                    <br />
                    <span className="font-semibold text-[#101312]/80">{linkModal.email}</span>
                    <br />
                    Link your Google account to sign in with Google in the future?
                  </p>

                  <div className="flex flex-col gap-2">
                    <button
                      id="google-confirm-link-btn"
                      onClick={handleConfirmLink}
                      disabled={linkLoading}
                      className="w-full rounded-xl bg-[#BAF91A] hover:bg-[#a9ea00] text-[#101312] py-2.5 text-sm font-bold shadow-[0_4px_16px_rgba(186,249,26,0.4)] transition-all disabled:opacity-60"
                    >
                      {linkLoading ? 'Linking…' : 'Yes, Link & Sign In'}
                    </button>
                    <button
                      id="google-cancel-link-btn"
                      onClick={() => setLinkModal(null)}
                      disabled={linkLoading}
                      className="w-full rounded-xl border border-[#101312]/15 bg-white text-[#101312]/65 py-2.5 text-sm font-semibold hover:bg-[#f4ffd6] transition-all disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3 text-sm text-[#101312]/70">
              <p>{content.secondaryText}</p>
              <button
                className="rounded-xl border border-[#101312]/15 bg-white px-4 py-2 font-semibold text-[#101312] transition hover:bg-[#f4ffd8]"
                type="button"
                onClick={() => onNavigateToAuth(content.secondaryAction)}
              >
                {content.secondaryLabel}
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

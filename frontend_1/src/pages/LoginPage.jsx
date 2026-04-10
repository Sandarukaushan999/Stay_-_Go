import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../app/store/authStore'

export default function LoginPage() {
  const { login, verifyOtp } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // 2FA state
  const [isOtpMode, setIsOtpMode] = useState(() => sessionStorage.getItem('isOtpMode') === 'true')
  const [otp, setOtp] = useState('')
  const [userIdForOtp, setUserIdForOtp] = useState(() => sessionStorage.getItem('userIdForOtp') || null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/'

  async function onLoginSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await login({ email, password })
      
      if (response && response.twoFactorRequired) {
        sessionStorage.setItem('isOtpMode', 'true')
        sessionStorage.setItem('userIdForOtp', response.userId)
        setUserIdForOtp(response.userId)
        setIsOtpMode(true)
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server unavailable')
    } finally {
      setLoading(false)
    }
  }

  async function onOtpSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await verifyOtp(userIdForOtp, otp)
      sessionStorage.removeItem('isOtpMode')
      sessionStorage.removeItem('userIdForOtp')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  function handleCancelOtp() {
    sessionStorage.removeItem('isOtpMode')
    sessionStorage.removeItem('userIdForOtp')
    setIsOtpMode(false)
    setOtp('')
    setUserIdForOtp(null)
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h1 className="text-2xl font-semibold">Stay & Go</h1>
        
        {isOtpMode ? (
          <>
            <p className="mt-1 text-sm text-slate-400">Enter the 6-digit code sent to your email.</p>
            <form onSubmit={onOtpSubmit} className="mt-6 space-y-3">
              <div>
                <label className="text-sm text-slate-300">Security Code</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500 text-center tracking-widest font-mono text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  type="text"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-colors px-3 py-2 font-bold text-white disabled:opacity-60"
              >
                {loading ? 'Verifying…' : 'Verify Code'}
              </button>
              
              <button
                type="button"
                onClick={handleCancelOtp}
                className="w-full text-sm text-slate-400 hover:text-white mt-2"
              >
                Cancel and return to login
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-400">Sign in to continue</p>
            <form onSubmit={onLoginSubmit} className="mt-6 space-y-3">
              <div>
                <label className="text-sm text-slate-300">Email</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@uni.edu"
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
                />
              </div>
              
              {error && (
                <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                className="w-full rounded-xl bg-violet-600 px-3 py-2 font-medium text-white disabled:opacity-60 hover:bg-violet-700 transition-colors"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-4 text-sm text-slate-400">
              Need an account?{' '}
              <Link className="text-violet-300 hover:underline" to="/register">
                Register
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

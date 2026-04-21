import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../app/store/authStore'
import toast from 'react-hot-toast'
import { Loader2, XCircle } from 'lucide-react'

/**
 * GoogleAuthSuccess
 * Handles the redirect from the Passport OAuth2 flow (profile-page linking).
 * URL params:
 *   ?token=<JWT>          → success: store token and hydrate user
 *   ?google=error         → failure: show error and redirect to profile or login
 */
export default function GoogleAuthSuccess() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { setToken, hydrateMe } = useAuthStore()
  const [errMsg, setErrMsg] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token  = params.get('token')
    const errFlag = params.get('google')

    // ── Error path ──────────────────────────────────────────────────────────
    if (errFlag === 'error' || (!token && !errFlag)) {
      const msg = 'Google authentication failed. Please try again.'
      setErrMsg(msg)
      toast.error(msg)
      // Redirect back: if user was linking from profile, go to /profile; else /auth/login
      setTimeout(() => {
        const existingToken = useAuthStore.getState().token
        navigate(existingToken ? '/profile' : '/auth/login', { replace: true })
      }, 2500)
      return
    }

    // ── Success path ─────────────────────────────────────────────────────────
    if (token) {
      setToken(token)
      hydrateMe({ force: true }).then((user) => {
        if (user) {
          toast.success('Google account linked successfully!')
          // If an existing session was ongoing (profile linking), go back to profile
          navigate('/profile', { replace: true })
        } else {
          toast.error('Session could not be established. Please log in.')
          navigate('/auth/login', { replace: true })
        }
      })
    }
  }, [location, navigate, setToken, hydrateMe])

  // ── Error display ──────────────────────────────────────────────────────────
  if (errMsg) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #E2FF99 0%, #f4ffd6 60%, #FFFFFF 100%)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center shadow">
            <XCircle className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-sm font-semibold text-[#101312]/65">{errMsg}</p>
          <p className="text-xs text-[#101312]/40">Redirecting…</p>
        </div>
      </div>
    )
  }

  // ── Loading display ────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #E2FF99 0%, #f4ffd6 60%, #FFFFFF 100%)' }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-[#BAF91A] flex items-center justify-center shadow-[0_0_24px_rgba(186,249,26,0.4)]">
          <Loader2 className="w-6 h-6 animate-spin text-[#101312]" />
        </div>
        <p className="text-sm font-semibold text-[#101312]/65">Finalizing Google Authentication…</p>
      </div>
    </div>
  )
}

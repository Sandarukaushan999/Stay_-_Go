import { useState } from 'react'
import { Loader2, ShieldCheck, Lock, Eye, EyeOff, XCircle, Check, CheckCircle2, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import TechnicianLayout from '../layout/TechnicianLayout'
import { api } from '../../../lib/apiClient'
import { useAuthStore } from '../../../app/store/authStore'
import GoogleAuthConnect from '../users/GoogleAuthConnect'

export default function TechnicianSecurity() {
  const { user } = useAuthStore()

  // Password Update States
  const [passwordState, setPasswordState] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
  const [newPasswordTouched, setNewPasswordTouched] = useState(false)

  // Real-time password validation
  const pass = passwordState.newPassword
  const passwordReqs = [
    { label: 'At least 8 characters long', met: pass.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(pass) },
    { label: 'One lowercase letter', met: /[a-z]/.test(pass) },
    { label: 'One number', met: /\d/.test(pass) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(pass) },
  ]

  const metCount = passwordReqs.filter(r => r.met).length
  let strengthLevel = 0
  if (pass.length > 0) {
    if (metCount <= 2) strengthLevel = 1
    else if (metCount <= 4) strengthLevel = 2
    else if (metCount === 5) strengthLevel = 3
  }
  const isNewPasswordValid = strengthLevel >= 2
  const isConfirmValid = pass === passwordState.confirmPassword && passwordState.confirmPassword.length > 0
  const canSubmitPassword = isNewPasswordValid && isConfirmValid && (user?.hasPassword === false || passwordState.currentPassword.length > 0)

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmitPassword) return
    setIsChangingPassword(true)
    setPasswordErrors({})
    try {
      const { data } = await api.put('/users/profile/password', passwordState)
      if (data.success) {
        toast.success('Password updated successfully')
        setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setNewPasswordTouched(false)
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Current password')) {
        setPasswordErrors({ currentPassword: 'Incorrect current password' })
        toast.error('Incorrect current password')
      } else {
        toast.error(err.response?.data?.message || 'Failed to update password')
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Input component using the current design palette
  const PaletteInput = ({ icon: Icon, rightElement, ...props }) => (
    <div className="relative group">
      {Icon && (
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-[#101312]/40 transition-colors group-focus-within:text-[#BAF91A]" />
        </span>
      )}
      <input
        {...props}
        className={[
          'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-[#101312]',
          'outline-none transition-all duration-150',
          'focus:border-[#BAF91A] focus:ring-2 focus:ring-[#BAF91A]/20',
          'placeholder:text-[#101312]/30',
          Icon ? 'pl-10' : '',
          rightElement ? 'pr-11' : '',
          props.className || '',
        ].join(' ')}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  )

  return (
    <TechnicianLayout>
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#BAF91A]">
          <ShieldCheck className="h-6 w-6 text-[#101312]" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#101312]">Security Settings</h1>
          <p className="mt-1 text-sm text-[#101312]/55">Manage your password and connected accounts.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">

        {/* ── Change Password ── */}
        <div className="rounded-2xl border border-[#101312]/12 bg-white p-6 shadow-[0_4px_24px_rgba(16,19,18,0.06)]">
          <div className="mb-6 border-b border-[#101312]/10 pb-4">
            <h3 className="text-base font-bold text-[#101312] flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#876DFF]" />
              Change Password
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {user?.hasPassword !== false && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#101312]/50 mb-1.5">
                  Current Password <span className="text-[#876DFF] font-bold">*</span>
                </label>
                <PaletteInput
                  icon={Lock}
                  type={showPassword.current ? 'text' : 'password'}
                  value={passwordState.currentPassword}
                  onChange={(e) => {
                    setPasswordState(prev => ({ ...prev, currentPassword: e.target.value }))
                    if (passwordErrors.currentPassword) setPasswordErrors(prev => ({ ...prev, currentPassword: '' }))
                  }}
                  placeholder="Enter current password"
                  className={passwordErrors.currentPassword ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/20' : 'border-[#101312]/15'}
                  rightElement={
                    <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))} className="text-[#101312]/30 hover:text-[#101312]/70">
                      {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> {passwordErrors.currentPassword}
                  </p>
                )}
              </div>
            )}

            {/* New password box */}
            <div className="bg-[#fafdf4] border border-[#101312]/10 rounded-[16px] p-5">
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#101312]/50 mb-1.5">
                  New Password <span className="text-[#876DFF] font-bold">*</span>
                </label>
                <PaletteInput
                  icon={Lock}
                  type={showPassword.new ? 'text' : 'password'}
                  value={passwordState.newPassword}
                  onChange={(e) => {
                    setPasswordState(prev => ({ ...prev, newPassword: e.target.value }))
                    setNewPasswordTouched(true)
                    if (passwordErrors.newPassword) setPasswordErrors(prev => ({ ...prev, newPassword: '' }))
                  }}
                  placeholder="Enter new password"
                  className={
                    (newPasswordTouched && !isNewPasswordValid) || passwordErrors.newPassword
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/20'
                      : newPasswordTouched && isNewPasswordValid
                      ? 'border-[#BAF91A] focus:border-[#BAF91A] focus:ring-[#BAF91A]/20'
                      : 'border-[#101312]/15'
                  }
                  rightElement={
                    <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))} className="text-[#101312]/30 hover:text-[#101312]/70">
                      {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              {newPasswordTouched && (
                <div className="mb-4 space-y-2">
                  {/* Strength bar */}
                  <div className="flex gap-1.5 h-1.5 w-full">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          strengthLevel >= bar
                            ? strengthLevel === 1 ? 'bg-rose-500'
                            : strengthLevel === 2 ? 'bg-amber-500'
                            : 'bg-[#BAF91A]'
                          : 'bg-[#101312]/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider mt-1 text-right" style={{
                    color: strengthLevel === 1 ? '#EF4444' : strengthLevel === 2 ? '#F59E0B' : strengthLevel === 3 ? '#BAF91A' : 'transparent'
                  }}>
                    {strengthLevel === 1 ? 'Weak' : strengthLevel === 2 ? 'Good' : 'Very Strong'}
                  </p>
                  {strengthLevel < 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {passwordReqs.map((req, i) => (
                        <div key={i} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${req.met ? 'text-[#BAF91A]' : 'text-[#101312]/40'}`}>
                          {req.met ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40 flex-shrink-0" />}
                          {req.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Confirm password */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#101312]/50 mb-1.5">
                  Confirm Password <span className="text-[#876DFF] font-bold">*</span>
                </label>
                <PaletteInput
                  icon={Lock}
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={passwordState.confirmPassword}
                  onChange={(e) => {
                    setPasswordState(prev => ({ ...prev, confirmPassword: e.target.value }))
                    if (passwordErrors.confirmPassword) setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }))
                  }}
                  placeholder="Re-enter new password"
                  className={
                    (passwordState.confirmPassword.length > 0 && !isConfirmValid) || passwordErrors.confirmPassword
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/20'
                      : isConfirmValid
                      ? 'border-[#BAF91A] focus:border-[#BAF91A] focus:ring-[#BAF91A]/20'
                      : 'border-[#101312]/15'
                  }
                  rightElement={
                    <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))} className="text-[#101312]/30 hover:text-[#101312]/70">
                      {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                {passwordState.confirmPassword.length > 0 && !isConfirmValid && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Passwords do not match
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword || !canSubmitPassword}
                className="rounded-xl bg-[#BAF91A] hover:bg-[#a9ea00] text-[#101312] px-6 py-2.5 min-w-[140px] text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                {isChangingPassword ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Sidebar: Security Status + Google Auth ── */}
        <div className="space-y-6">
          {/* Security Status card */}
          <div className="rounded-2xl border border-[#101312]/12 bg-white p-5 shadow-[0_4px_24px_rgba(16,19,18,0.06)]">
            <div className="mb-4 pb-3 border-b border-[#101312]/10 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#BAF91A]" />
              <h3 className="text-[13px] font-bold tracking-wide text-[#101312] uppercase">
                Security Status
              </h3>
            </div>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#101312]/55">Email Address</span>
                {user?.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#101312] bg-[#BAF91A] px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <ShieldAlert className="w-3 h-3" /> Unverified
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#101312]/55">Password Setup</span>
                {user?.hasPassword !== false ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#101312] bg-[#BAF91A] px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    <XCircle className="w-3 h-3" /> Missing
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Google Auth */}
          <GoogleAuthConnect />
        </div>
      </div>
    </TechnicianLayout>
  )
}

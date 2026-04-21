import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'

/* ── Role display helpers ── */
const ROLE_LABELS = {
  student: 'Student',
  rider: 'Rider',
  technician: 'Technician',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

const ROLE_COLORS_LIGHT = {
  student: 'bg-[#E2FF99] text-[#3a4a00]',
  rider: 'bg-blue-100 text-blue-700',
  technician: 'bg-orange-100 text-orange-700',
  admin: 'bg-[#876DFF]/15 text-[#5b4ccc]',
  super_admin: 'bg-[#876DFF]/25 text-[#5b4ccc]',
}

const ROLE_COLORS_DARK = {
  student: 'bg-[#BAF91A]/20 text-[#BAF91A]',
  rider: 'bg-blue-900/40 text-blue-300',
  technician: 'bg-orange-900/40 text-orange-300',
  admin: 'bg-violet-900/40 text-violet-300',
  super_admin: 'bg-violet-900/60 text-violet-200',
}

/** Where to redirect when user clicks the chip */
function getProfilePath(role) {
  if (role === 'admin' || role === 'super_admin') return '/admin/profile'
  if (role === 'technician') return '/profile'
  // student, rider → shared UserProfilePage
  return '/profile'
}

/** Build 1-2 initials from the full name */
function getInitials(fullName = '') {
  return fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

/** Resolve a stored profileImage to an absolute URL */
function resolveImageSrc(profileImage) {
  if (!profileImage) return null
  if (profileImage.startsWith('http')) return profileImage
  const base =
    (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '')
  return `${base}/${profileImage.replace(/^\//, '')}`
}

/* ─────────────────────────────────────────────────────────────
   UserAvatarChip
   props:
     theme  – 'light' (default) | 'dark'   controls text/border colours
   ───────────────────────────────────────────────────────────── */
export default function UserAvatarChip({ theme = 'auto' }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  // Auto-detect from html data-theme if theme prop is 'auto'
  const resolvedTheme = theme === 'auto'
    ? (document.documentElement.getAttribute('data-theme') || localStorage.getItem('sg-admin-theme') || 'light')
    : theme
  const isDark = resolvedTheme === 'dark'
  const role = user.role || 'student'
  const roleLabel = ROLE_LABELS[role] || role
  const roleBadgeCls = isDark
    ? (ROLE_COLORS_DARK[role] || 'bg-slate-700 text-slate-200')
    : (ROLE_COLORS_LIGHT[role] || 'bg-gray-100 text-gray-700')
  const initials = getInitials(user.fullName)
  const imgSrc = resolveImageSrc(user.profileImage)

  return (
    <button
      id={`user-avatar-chip-${role}`}
      type="button"
      onClick={() => navigate(getProfilePath(role))}
      title={`${user.fullName} · ${roleLabel} — go to settings`}
      className={[
        'flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-all duration-150',
        'hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none',
        isDark
          ? 'border-slate-700 bg-slate-800/70 hover:bg-slate-700/80 hover:border-slate-500'
          : 'border-[#101312]/15 bg-white hover:bg-[#f3ffe0] hover:border-[#BAF91A]/50',
      ].join(' ')}
    >
      {/* ── Avatar circle ── */}
      <span
        className={[
          'relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full',
          'ring-2',
          isDark ? 'ring-[#BAF91A]/40' : 'ring-[#BAF91A]/70',
        ].join(' ')}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={user.fullName}
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#876DFF] to-[#BAF91A] text-[10px] font-bold text-white">
            {initials}
          </span>
        )}
      </span>

      {/* ── Name + role ── */}
      <span className="hidden flex-col items-start leading-tight sm:flex">
        <span
          className={`text-[12px] font-semibold leading-none ${
            isDark ? 'text-slate-100' : 'text-[#101312]'
          }`}
        >
          {user.fullName}
        </span>
        <span
          className={`mt-0.5 rounded px-1 py-[1px] text-[10px] font-semibold leading-none ${roleBadgeCls}`}
        >
          {roleLabel}
        </span>
      </span>
    </button>
  )
}

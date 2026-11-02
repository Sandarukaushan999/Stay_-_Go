/* eslint-disable react-refresh/only-export-components */
// Small UI kit shared by the admin + technician panels.
// Theme: lime #BAF91A / #E2FF99, violet #876DFF, ink #101312 — colours that depend on light/dark
// come from the --admin-* CSS variables so pages follow the panel's theme switch.
import { Loader2 } from 'lucide-react'
import { getApiBaseURL } from '../../../lib/axios'

export const inputCls =
  'w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#BAF91A]'
export const inputStyle = {
  background: 'var(--admin-input-bg)',
  borderColor: 'var(--admin-border)',
  color: 'var(--admin-text)',
}

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#BAF91A] px-4 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00] disabled:cursor-not-allowed disabled:opacity-50'
export const btnViolet =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#876DFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7058e8] disabled:cursor-not-allowed disabled:opacity-50'
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:bg-[#BAF91A]/15 disabled:cursor-not-allowed disabled:opacity-50'
export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50'

export function Card({ children, className = '', ...rest }) {
  return (
    <div
      className={`rounded-2xl border ${className}`}
      style={{
        background: 'var(--admin-surface)',
        borderColor: 'var(--admin-border)',
        boxShadow: 'var(--admin-card-shadow)',
        color: 'var(--admin-text)',
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

export function PageHeader({ icon: Icon, title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#BAF91A]">
            <Icon className="h-6 w-6 text-[#101312]" strokeWidth={2} />
          </div>
        ) : null}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

const TONES = {
  lime: 'bg-[#BAF91A]/25 text-[#3d5200] border-[#BAF91A]/50',
  violet: 'bg-[#876DFF]/12 text-[#5b4ccc] border-[#876DFF]/30',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  rose: 'bg-rose-50 text-rose-600 border-rose-200',
  slate: 'bg-[#101312]/5 text-[#101312]/60 border-[#101312]/10',
}

export function Pill({ tone = 'slate', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${TONES[tone] || TONES.slate} ${className}`}
    >
      {children}
    </span>
  )
}

export function StatCard({ icon: Icon, label, value, hint, accent = 'lime' }) {
  const bg = { lime: '#BAF91A', violet: '#876DFF', amber: '#F59E0B', rose: '#F43F5E' }[accent] || '#BAF91A'
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--admin-text-muted)' }}>
          {label}
        </div>
        {Icon ? (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: `${bg}26`, color: accent === 'lime' ? '#3d5200' : bg }}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
        {value ?? '—'}
      </div>
      {hint ? (
        <div className="mt-0.5 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
          {hint}
        </div>
      ) : null}
    </Card>
  )
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2" style={{ color: 'var(--admin-text-muted)' }}>
      <Loader2 className="h-7 w-7 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center px-6 text-center" style={{ color: 'var(--admin-text-muted)' }}>
      {Icon ? <Icon className="mb-3 h-10 w-10 opacity-40" /> : null}
      <p className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>
        {title}
      </p>
      {text ? <p className="mt-1 max-w-sm text-sm">{text}</p> : null}
    </div>
  )
}

// Segmented tab bar: options = [{ key, label, count? }]
export function Tabs({ options, value, onChange }) {
  return (
    <div
      className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border p-1"
      style={{ background: 'var(--admin-surface-2)', borderColor: 'var(--admin-border)' }}
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
            value === o.key ? 'bg-[#BAF91A] font-semibold text-[#101312] shadow-sm' : 'hover:bg-[#BAF91A]/15'
          }`}
          style={value === o.key ? undefined : { color: 'var(--admin-text-muted)' }}
        >
          {o.label}
          {o.count != null ? <span className="ml-1.5 text-xs opacity-70">{o.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

// "/uploads/x.png" → "http://127.0.0.1:5000/uploads/x.png"
export function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${getApiBaseURL().replace(/\/api$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}

export function timeAgo(date) {
  if (!date) return ''
  const s = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(date).toLocaleDateString()
}

export function formatDuration(ms) {
  if (!ms || ms < 0) return '—'
  const min = Math.floor(ms / 60000)
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 48) return `${h}h ${min % 60}m`
  return `${Math.floor(h / 24)}d ${h % 24}h`
}

export function errMsg(err, fallback = 'Something went wrong') {
  return err?.response?.data?.message || err?.message || fallback
}

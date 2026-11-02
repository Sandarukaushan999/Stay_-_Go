import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarClock, CircleCheck, CircleDot, CirclePower, Save, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../../lib/apiClient'
import TechnicianLayout from '../layout/TechnicianLayout'
import { Card, Loading, PageHeader, Pill, StatCard, btnGhost, btnPrimary, errMsg, inputCls, inputStyle } from '../shared/ui'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DEFAULT_DAY = (dayOfWeek) => ({
  dayOfWeek,
  startTime: '08:00',
  endTime: '17:00',
  isAvailable: dayOfWeek >= 1 && dayOfWeek <= 5, // Mon–Fri by default
})

const STATUSES = [
  { key: 'available', label: 'Available', hint: 'Admins can assign you new jobs', icon: CircleCheck, tone: 'lime' },
  { key: 'busy', label: 'Busy', hint: 'Working on a job — avoid new assignments', icon: CircleDot, tone: 'amber' },
  { key: 'offline', label: 'Offline', hint: 'Off duty', icon: CirclePower, tone: 'slate' },
]

const PRESETS = [
  { label: 'Mon–Fri · 8:00–17:00', days: [1, 2, 3, 4, 5], start: '08:00', end: '17:00' },
  { label: 'Mon–Sat · 9:00–18:00', days: [1, 2, 3, 4, 5, 6], start: '09:00', end: '18:00' },
  { label: 'Every day · 7:00–19:00', days: [0, 1, 2, 3, 4, 5, 6], start: '07:00', end: '19:00' },
]

const hoursBetween = (s, e) => {
  const [sh, sm] = s.split(':').map(Number)
  const [eh, em] = e.split(':').map(Number)
  return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60)
}

// mode="availability" → live status + which days I work
// mode="schedule"     → working hours per day + quick presets
// Both edit the same weekly schedule (GET/PUT /technician/availability).
export default function TechnicianAvailability() {
  const { pathname } = useLocation()
  const mode = pathname.endsWith('/schedule') ? 'schedule' : 'availability'

  const [week, setWeek] = useState(() => DAYS.map((_, i) => DEFAULT_DAY(i)))
  const [status, setStatus] = useState('offline')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [savedOnce, setSavedOnce] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/technician/availability')
      const byDay = Object.fromEntries((data.schedule || []).map((d) => [d.dayOfWeek, d]))
      setWeek(DAYS.map((_, i) => (byDay[i] ? { ...DEFAULT_DAY(i), ...byDay[i] } : DEFAULT_DAY(i))))
      setSavedOnce((data.schedule || []).length > 0)
      setStatus(data.status || 'offline')
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load your schedule'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const update = (i, patch) => {
    setWeek((w) => w.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
    setDirty(true)
  }

  const applyPreset = (p) => {
    setWeek((w) => w.map((d) => ({ ...d, startTime: p.start, endTime: p.end, isAvailable: p.days.includes(d.dayOfWeek) })))
    setDirty(true)
  }

  async function changeStatus(next) {
    const prev = status
    setStatus(next)
    try {
      await api.patch('/technician/status', { status: next })
      toast.success(`You are now ${next}`)
    } catch (err) {
      setStatus(prev)
      toast.error(errMsg(err))
    }
  }

  const invalid = week.find((d) => d.isAvailable && d.endTime <= d.startTime)

  async function save() {
    if (invalid) return toast.error(`${DAYS[invalid.dayOfWeek]}: end time must be after start time`)
    setSaving(true)
    try {
      await api.put('/technician/availability/bulk', {
        days: week.map(({ dayOfWeek, startTime, endTime, isAvailable }) => ({ dayOfWeek, startTime, endTime, isAvailable })),
      })
      toast.success('Schedule saved')
      setDirty(false)
      setSavedOnce(true)
    } catch (err) {
      toast.error(errMsg(err, 'Failed to save schedule'))
    } finally {
      setSaving(false)
    }
  }

  const stats = useMemo(() => {
    const working = week.filter((d) => d.isAvailable)
    return {
      days: working.length,
      hours: working.reduce((n, d) => n + hoursBetween(d.startTime, d.endTime), 0),
    }
  }, [week])

  const today = new Date().getDay()
  const current = STATUSES.find((s) => s.key === status) || STATUSES[2]

  return (
    <TechnicianLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          icon={CalendarClock}
          title={mode === 'schedule' ? 'Working Hours' : 'Availability'}
          subtitle={mode === 'schedule' ? 'Set the hours you work each day so admins know when to assign jobs.' : 'Tell admins whether you can take jobs now, and which days you work.'}
          actions={
            <button type="button" onClick={save} disabled={saving || !dirty} className={btnPrimary}>
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : dirty ? 'Save schedule' : 'Saved'}
            </button>
          }
        />

        {loading ? (
          <Card>
            <Loading />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Status now" value={<span className="capitalize">{current.label}</span>} icon={current.icon} accent={status === 'available' ? 'lime' : status === 'busy' ? 'amber' : 'violet'} />
              <StatCard label="Working days" value={stats.days} icon={CalendarClock} hint="per week" />
              <StatCard label="Weekly hours" value={`${stats.hours.toFixed(stats.hours % 1 ? 1 : 0)}h`} icon={CalendarClock} accent="violet" />
            </div>

            {mode === 'availability' ? (
              <Card className="p-5">
                <h2 className="mb-3 text-base font-bold" style={{ color: 'var(--admin-text)' }}>
                  Current status
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {STATUSES.map((s) => {
                    const Icon = s.icon
                    const on = status === s.key
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => changeStatus(s.key)}
                        className={`rounded-2xl border p-4 text-left transition ${on ? 'border-[#BAF91A] bg-[#BAF91A]/20 shadow-[0_0_0_3px_rgba(186,249,26,0.25)]' : 'hover:bg-[#BAF91A]/10'}`}
                        style={on ? undefined : { borderColor: 'var(--admin-border)' }}
                      >
                        <Icon className="mb-2 h-5 w-5" style={{ color: 'var(--admin-text)' }} />
                        <div className="font-semibold" style={{ color: 'var(--admin-text)' }}>
                          {s.label}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                          {s.hint}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>
            ) : (
              <Card className="p-5">
                <h2 className="mb-3 flex items-center gap-2 text-base font-bold" style={{ color: 'var(--admin-text)' }}>
                  <Sparkles className="h-4 w-4 text-[#876DFF]" /> Quick presets
                </h2>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button key={p.label} type="button" onClick={() => applyPreset(p)} className={btnGhost} style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            <Card className="overflow-hidden">
              <div className="border-b px-5 py-4 text-base font-bold" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                Weekly schedule {!savedOnce ? <Pill tone="amber" className="ml-2">defaults — not saved yet</Pill> : null}
              </div>
              <ul className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
                {week.map((d, i) => (
                  <li key={d.dayOfWeek} className={`flex flex-wrap items-center gap-3 px-5 py-3.5 ${d.dayOfWeek === today ? 'bg-[#BAF91A]/10' : ''}`} style={{ borderColor: 'var(--admin-border)' }}>
                    <label className="flex w-40 cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={d.isAvailable} onChange={(e) => update(i, { isAvailable: e.target.checked })} className="h-4 w-4 accent-[#876DFF]" />
                      <span className="font-semibold" style={{ color: 'var(--admin-text)' }}>
                        {DAYS[d.dayOfWeek]}
                      </span>
                      {d.dayOfWeek === today ? <Pill tone="lime">today</Pill> : null}
                    </label>

                    {d.isAvailable ? (
                      mode === 'schedule' ? (
                        <div className="flex items-center gap-2">
                          <input type="time" value={d.startTime} onChange={(e) => update(i, { startTime: e.target.value })} className={`${inputCls} w-32`} style={inputStyle} />
                          <span style={{ color: 'var(--admin-text-muted)' }}>to</span>
                          <input type="time" value={d.endTime} onChange={(e) => update(i, { endTime: e.target.value })} className={`${inputCls} w-32 ${d.endTime <= d.startTime ? 'ring-2 ring-rose-400' : ''}`} style={inputStyle} />
                          <span className="ml-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                            {hoursBetween(d.startTime, d.endTime).toFixed(1)}h
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                          {d.startTime} – {d.endTime}
                        </span>
                      )
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                        Day off
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </div>
    </TechnicianLayout>
  )
}

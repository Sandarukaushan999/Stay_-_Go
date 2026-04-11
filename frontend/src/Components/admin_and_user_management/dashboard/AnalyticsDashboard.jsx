import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { api } from '../../../lib/apiClient'
import AdminLayout from '../layout/AdminLayout'
import {
  TrendingUp, Activity, AlertTriangle, CheckCircle2,
  Car, BarChart2, PieChart as PieIcon, RefreshCw, Zap,
} from 'lucide-react'

/* ── colour palette ─────────────────────────────────────────── */
const C = {
  bg:        '#0f172a',
  card:      '#1e293b',
  cardBorder:'#334155',
  text:      '#f1f5f9',
  muted:     '#94a3b8',
  green:     '#10b981',
  blue:      '#6366f1',
  yellow:    '#f59e0b',
  red:       '#ef4444',
  pink:      '#ec4899',
  grid:      '#1e293b',
}

/* ── Custom dark Tooltip ────────────────────────────────────── */
function DarkTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || C.green, fontWeight: 700 }}>
          {p.name}: {p.value}{unit}
        </p>
      ))}
    </div>
  )
}

/* ── KPI Card ───────────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: '20px 24px', position: 'relative', overflow: 'hidden', transition: 'box-shadow .2s' }}
      className="hover:shadow-2xl"
    >
      {/* glow blob */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: color, opacity: 0.08, filter: 'blur(20px)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ backgroundColor: color + '22', borderRadius: 12, padding: 10 }}>
          <Icon style={{ color, width: 20, height: 20 }} />
        </div>
      </div>
      <p style={{ color: C.muted, fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</p>
      <p style={{ color: C.text, fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{value ?? '—'}</p>
      {sub && <p style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

/* ── Chart Card ─────────────────────────────────────────────── */
function ChartCard({ title, subtitle, icon: Icon, iconColor = C.green, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 24, padding: '24px', boxShadow: '0 4px 32px rgba(0,0,0,.35)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ background: iconColor + '22', borderRadius: 10, padding: 8 }}>
          <Icon style={{ color: iconColor, width: 18, height: 18 }} />
        </div>
        <div>
          <p style={{ color: C.text, fontWeight: 700, fontSize: 15, margin: 0 }}>{title}</p>
          {subtitle && <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

/* ── Custom pie label ───────────────────────────────────────── */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.04) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/* ── Main Component ─────────────────────────────────────────── */
export default function AnalyticsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/admin/analytics')
      setData(res.data.data)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* find peak hour */
  const peakHour = data?.peakHours?.reduce((a, b) => (b.rides > a.rides ? b : a), { rides: 0 })

  return (
    <AdminLayout>
      <div style={{ background: C.bg, minHeight: '100vh', padding: '32px 28px', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: C.green, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Stay &amp; Go · Admin</p>
            <h1 style={{ color: C.text, fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Analytics Overview</h1>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 6, margin: 0 }}>
              Live ride-sharing metrics pulled from MongoDB &nbsp;·&nbsp;
              {lastUpdated ? `Last updated ${lastUpdated}` : 'Loading…'}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.card, border: `1px solid ${C.cardBorder}`,
              color: C.text, borderRadius: 12, padding: '10px 18px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              opacity: loading ? 0.5 : 1, transition: 'all .2s',
            }}
          >
            <RefreshCw style={{ width: 14, height: 14, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: 16, padding: '14px 20px', marginBottom: 28, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── KPI Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <KpiCard icon={Car}          label="Total Trips Today"  value={data?.kpi?.tripsToday}    color={C.blue}   sub="Rides created today" />
          <KpiCard icon={Zap}          label="Active Rides"       value={data?.kpi?.activeRides}   color={C.green}  sub="Currently in progress" />
          <KpiCard icon={AlertTriangle}label="Incident Count"     value={data?.kpi?.incidentCount} color={C.red}    sub="SOS alerts today" />
          <KpiCard icon={CheckCircle2} label="Completion Rate"    value={data?.kpi?.completionRate != null ? `${data.kpi.completionRate}%` : '—'} color={C.yellow} sub="Trips completed today" />
        </div>

        {/* ── 2×2 Chart Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24 }}>

          {/* 1 — Line Chart: Trips over time */}
          <ChartCard title="Trips Over Time" subtitle="Daily ride count — last 7 days" icon={TrendingUp} iconColor={C.blue}>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data?.tripsOverTime || []} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<DarkTooltip />} cursor={{ stroke: C.blue, strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Line
                    type="monotone" dataKey="trips" name="Trips"
                    stroke={C.blue} strokeWidth={2.5} dot={{ r: 4, fill: C.blue, stroke: C.bg, strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: C.blue, filter: 'url(#glow)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* 2 — Bar Chart: Peak hours */}
          <ChartCard title="Peak Usage Hours" subtitle="Ride frequency by hour (0–23)" icon={BarChart2} iconColor={C.yellow}>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data?.peakHours || []} margin={{ top: 0, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                  <Bar dataKey="rides" name="Rides" radius={[6, 6, 0, 0]}>
                    {(data?.peakHours || []).map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={peakHour && entry.hour === peakHour.hour ? C.yellow : C.yellow + '55'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {peakHour?.rides > 0 && (
              <p style={{ color: C.muted, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                Peak hour: <span style={{ color: C.yellow, fontWeight: 700 }}>{peakHour.hour}</span> with <span style={{ color: C.yellow, fontWeight: 700 }}>{peakHour.rides} rides</span>
              </p>
            )}
          </ChartCard>

          {/* 3 — Pie Chart: User distribution */}
          <ChartCard title="User Distribution" subtitle="Breakdown of registered user roles" icon={PieIcon} iconColor={C.pink}>
            {loading ? <ChartSkeleton /> : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie
                      data={data?.userDistribution || []}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={<PieLabel />}
                    >
                      {(data?.userDistribution || []).map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length
                          ? <DarkTooltip active={active} payload={payload} label={payload[0]?.name} />
                          : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 120 }}>
                  {(data?.userDistribution || []).map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ color: C.muted, fontSize: 13, flex: 1 }}>{d.name}</span>
                      <span style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>

          {/* 4 — Area Chart: Incidents */}
          <ChartCard title="Incidents & Safety Reports" subtitle="SOS alerts over the past 7 days" icon={AlertTriangle} iconColor={C.red}>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data?.incidentsOverTime || []} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="incidentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.red} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={C.red} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ stroke: C.red, strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    type="monotone" dataKey="incidents" name="Incidents"
                    stroke={C.red} strokeWidth={2}
                    fill="url(#incidentGrad)"
                    dot={{ r: 4, fill: C.red, stroke: C.bg, strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: C.red }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

        </div>

        {/* spin keyframes */}
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100% { opacity: .4; } 50% { opacity: .8; } }
        `}</style>
      </div>
    </AdminLayout>
  )
}

function ChartSkeleton() {
  return (
    <div style={{ height: 240, background: '#0f172a', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#334155', fontSize: 13 }}>Loading chart...</span>
    </div>
  )
}

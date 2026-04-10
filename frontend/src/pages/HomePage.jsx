import { useNavigate } from 'react-router-dom'

import Footer from '../Components/landing/footer'
import Header from '../Components/landing/header'

const heroStats = [
  { label: 'Active Students', value: '12.8K', note: '+14% this month' },
  { label: 'Successful Matches', value: '3,240', note: 'Double opt-in verified' },
  { label: 'Rides Completed', value: '8,960', note: 'Live route tracking' },
  { label: 'Tickets Resolved', value: '1,482', note: 'SLA monitored' },
]

const quickSignals = [
  {
    title: 'Compatibility-first matching',
    description: 'Lifestyle, routine, and preference scoring before roommate decisions are made.',
    actionLabel: 'Open Roommate Section',
    actionTarget: { type: 'section', value: 'roommates' },
  },
  {
    title: 'Safer student rides',
    description: 'Verified drivers, live route visibility, and structured pickup control in one flow.',
    actionLabel: 'Open Ride Module',
    actionTarget: { type: 'ride' },
  },
  {
    title: 'Transparent hostel support',
    description: 'Maintenance tickets stay visible from reporting to final closure and rating.',
    actionLabel: 'Open Maintenance',
    actionTarget: { type: 'maintenance' },
  },
  {
    title: 'Role-based analytics',
    description: 'Admins monitor demand, ticket pressure, and safety activity across the platform.',
    actionLabel: 'Open Dashboard Section',
    actionTarget: { type: 'section', value: 'dashboard' },
  },
]

const modules = [
  {
    code: 'RM',
    title: 'Roommate Matching',
    description: 'Find compatible roommates through lifestyle scoring, preference filters, and safe double opt-in approvals.',
    actionLabel: 'Open Roommates',
    actionTarget: { type: 'section', value: 'roommates' },
  },
  {
    code: 'RS',
    title: 'Ride Sharing + Live Tracking',
    description: 'Coordinate campus rides with route-based suggestions, pickup logic, seat control, and real-time tracking.',
    actionLabel: 'Open Ride Module',
    actionTarget: { type: 'ride' },
  },
  {
    code: 'MT',
    title: 'Maintenance Tickets',
    description: 'Submit issues digitally, follow every stage of the workflow, and rate service quality after resolution.',
    actionLabel: 'Open Maintenance',
    actionTarget: { type: 'maintenance' },
  },
]

const problemPoints = [
  'Random roommate allocation without compatibility signals',
  'No trusted campus ride-sharing system for students',
  'Maintenance requests still handled manually or informally',
  'No visibility into assignment status, delays, or closures',
  'Weak role-based access and limited operational control',
  'Fragmented tools that create duplicate work for admins',
]

const solutionFeatures = [
  {
    title: 'Smart compatibility scoring',
    description: 'Rank profiles by routines, habits, and expectations before a match request is sent.',
  },
  {
    title: 'Route and time recommendations',
    description: 'Suggest rides using location, travel windows, seat availability, and pickup distance.',
  },
  {
    title: 'Real-time GPS tracking',
    description: 'Keep passengers informed with live status, safe arrival check-ins, and route visibility.',
  },
  {
    title: 'Ticket workflow engine',
    description: 'Move issues from Submitted to Closed with assignment, escalation, and full audit history.',
  },
  {
    title: 'Payment and transaction records',
    description: 'Track ride-related payments and operational histories inside a single system view.',
  },
  {
    title: 'Admin insights and analytics',
    description: 'Monitor usage, resolve bottlenecks, and manage announcements from one dashboard.',
  },
]

const workflowSteps = [
  {
    step: '01',
    title: 'Register as a verified student',
    description: 'Create a trusted identity with institution-backed verification and secure onboarding.',
    actionLabel: 'Register Now',
    actionTarget: { type: 'auth', value: 'register' },
  },
  {
    step: '02',
    title: 'Set your preferences and profile',
    description: 'Define living habits, travel patterns, hostel details, and service preferences.',
    actionLabel: 'Open Setup Section',
    actionTarget: { type: 'section', value: 'services' },
  },
  {
    step: '03',
    title: 'Use the modules you need',
    description: 'Start matching, join or offer rides, and submit maintenance tickets from one interface.',
    actionLabel: 'Open Ride Module',
    actionTarget: { type: 'ride' },
  },
  {
    step: '04',
    title: 'Track everything in your dashboard',
    description: 'Review requests, notifications, history, safety updates, and operational insights.',
    actionLabel: 'Open Dashboard',
    actionTarget: { type: 'section', value: 'dashboard' },
  },
]

const roleCards = [
  {
    role: 'Student',
    summary: 'Find roommates, join rides, report issues, and manage personal activity from a single dashboard.',
    actionLabel: 'Student Signup',
    actionTarget: { type: 'auth', value: 'register' },
  },
  {
    role: 'Driver',
    summary: 'Offer rides, manage seat inventory, monitor requests, and track earnings cleanly.',
    actionLabel: 'Open Ride Module',
    actionTarget: { type: 'ride' },
  },
  {
    role: 'Technician / Staff',
    summary: 'Receive assigned tasks, update ticket stages, and keep service performance transparent.',
    actionLabel: 'Open Maintenance',
    actionTarget: { type: 'section', value: 'maintenance' },
  },
  {
    role: 'Admin',
    summary: 'Control users, view analytics, publish updates, and enforce platform-wide rules.',
    actionLabel: 'Open Admin Insights',
    actionTarget: { type: 'admin' },
  },
]

const safetyHighlights = [
  'JWT authentication with secure session management',
  'Two-factor authentication and protected password recovery',
  'Ride safety check-ins when expected arrival windows are exceeded',
  'Reporting and blocking workflows for misuse or unsafe behavior',
  'Verified student-only access for a trusted community model',
]

const analyticsCards = [
  { label: 'Verified Users', value: '9,812', trend: '+8.4%' },
  { label: 'Open Tickets', value: '148', trend: '-12.1%' },
  { label: 'Active Rides Now', value: '64', trend: '+5.8%' },
]

const priorityBreakdown = [
  { label: 'Low', value: 42 },
  { label: 'Medium', value: 33 },
  { label: 'High', value: 17 },
  { label: 'Critical', value: 8 },
]

const ridesByTime = [
  { label: '06:00', value: 34 },
  { label: '09:00', value: 52 },
  { label: '13:00', value: 68 },
  { label: '18:00', value: 88 },
  { label: '22:00', value: 41 },
]

function Accent({ children }) {
  return <span className="rounded bg-[#BAF91A] px-1.5 text-[#101312]">{children}</span>
}

function SectionHeading({ eyebrow, title, description, center = false, light = false }) {
  return (
    <div className={`${center ? 'text-center' : ''}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? 'text-[#BAF91A]' : 'text-[#876DFF]'}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-3xl font-semibold leading-tight sm:text-4xl ${light ? 'text-white' : 'text-[#101312]'}`}>
        {title}
      </h2>
      <p className={`mt-3 max-w-3xl text-sm leading-relaxed ${light ? 'text-white/75' : 'text-[#101312]/75'}`}>{description}</p>
    </div>
  )
}

function Home({ headerNavItems, onNavigateToRide, onNavigateToPage, onNavigateToAuth, onNavigateToAdminDashboard }) {
  const actionItems = [
    { label: 'Sign in', variant: 'button-ghost', onClick: () => onNavigateToAuth('login') },
    { label: 'Create Account', variant: 'button-primary', onClick: () => onNavigateToAuth('register') },
  ]

  const primaryButtonClass =
    'rounded-xl bg-[#BAF91A] px-4 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00]'
  const secondaryButtonClass =
    'rounded-xl border border-[#101312]/20 bg-white px-4 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]'
  const tertiaryButtonClass =
    'rounded-lg border border-[#101312]/20 bg-white px-3 py-2 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]'

  function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleAction(target) {
    if (!target) return
    if (target.type === 'ride') return onNavigateToRide()
    if (target.type === 'maintenance') return navigate('/maintenance')
    if (target.type === 'auth') return onNavigateToAuth(target.value)
    if (target.type === 'section') return scrollToSection(target.value)
    if (target.type === 'page') return onNavigateToPage(target.value)
    if (target.type === 'admin') return onNavigateToAdminDashboard()
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#101312]" style={{ fontFamily: '"Poppins", "Manrope", "Trebuchet MS", sans-serif' }}>
      <Header navItems={headerNavItems} actionItems={actionItems} onBrandClick={() => scrollToSection('home')} />

      <main className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section
          id="home"
          className="overflow-hidden rounded-[32px] border border-[#d6e9aa] bg-gradient-to-br from-[#E2FF99] via-[#f3ffd3] to-[#FFFFFF] p-6 shadow-[0_16px_40px_rgba(16,19,18,0.08)] sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#876DFF]">
                Smart Hostel Sharing &amp; Ride Sharing System
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#101312] sm:text-5xl">
                Match smarter.
                <br />
                Ride safer.
                <br />
                Fix faster.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#101312]/75">
                STAY &amp; GO gives verified university students one secure place to match roommates, coordinate rides
                with live tracking, and manage hostel maintenance with full visibility.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <button type="button" onClick={() => onNavigateToAuth('register')} className={primaryButtonClass}>
                  Get Started
                </button>
                <button type="button" onClick={onNavigateToRide} className={secondaryButtonClass}>
                  Open Ride Module
                </button>
                <button type="button" onClick={onNavigateToAdminDashboard} className={secondaryButtonClass}>
                  Open Admin Dashboard
                </button>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <article className="rounded-2xl border border-[#101312]/15 bg-white/90 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#876DFF]">Vision</p>
                  <p className="mt-2 text-sm font-semibold text-[#101312]">Create a safer, smarter student community.</p>
                </article>
                <article className="rounded-2xl border border-[#101312]/15 bg-white/90 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#876DFF]">Core Flow</p>
                  <p className="mt-2 text-sm font-semibold text-[#101312]">
                    Roommates, rides, maintenance, and admin insights in one system.
                  </p>
                </article>
              </div>
            </div>

            <aside className="rounded-3xl border border-[#101312]/20 bg-[#101312] p-6 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#BAF91A]">Live system snapshot</p>
                  <h3 className="mt-2 text-xl font-semibold">Operational command view</h3>
                </div>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">Online</span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {heroStats.map((item) => (
                  <article key={item.label} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-white/70">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-[#BAF91A]">{item.value}</p>
                    <p className="mt-1 text-xs text-white/70">{item.note}</p>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section id="services" className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickSignals.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[#101312]/15 bg-white p-5 shadow-[0_8px_24px_rgba(16,19,18,0.06)]">
              <h3 className="text-lg font-semibold text-[#101312]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#101312]/70">{item.description}</p>
              <button type="button" onClick={() => handleAction(item.actionTarget)} className={`mt-4 ${tertiaryButtonClass}`}>
                {item.actionLabel}
              </button>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[28px] border border-[#dceab7] bg-gradient-to-br from-[#FFFFFF] to-[#f7ffd8] p-6 sm:p-8">
          <SectionHeading
            eyebrow="Everything students need for hostel life"
            title="A modern platform built around the real campus experience"
            description="The system combines the three operational flows that matter most, without forcing students or staff to jump between disconnected tools."
          />

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {modules.map((card) => (
              <article key={card.code} className="rounded-2xl border border-[#101312]/15 bg-white p-5">
                <span className="inline-flex rounded-lg bg-[#101312] px-2 py-1 text-xs font-semibold text-[#BAF91A]">{card.code}</span>
                <h3 className="mt-3 text-xl font-semibold text-[#101312]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#101312]/70">{card.description}</p>
                <button type="button" onClick={() => handleAction(card.actionTarget)} className={`mt-4 ${tertiaryButtonClass}`}>
                  {card.actionLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2" id="roommates">
          <article className="rounded-[28px] border border-[#101312]/15 bg-white p-6 sm:p-8">
            <SectionHeading
              eyebrow="Why STAY & GO is needed"
              title="Traditional hostel systems leave students with friction and uncertainty"
              description="Daily operations slow down when roommate selection, transport, and maintenance depend on manual coordination."
            />
            <div className="mt-6 grid gap-2.5">
              {problemPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-xl border border-[#101312]/10 bg-[#f9fce9] p-3.5">
                  <span className="mt-1.5 inline-block h-2.5 w-2.5 rounded-full bg-[#876DFF]" />
                  <p className="text-sm text-[#101312]/80">{point}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-[#101312]/15 bg-[#101312] p-6 text-white sm:p-8" id="rides">
            <SectionHeading
              eyebrow="One centralized system"
              title="The solution connects matching, movement, and maintenance"
              description="Every module is designed to share identity, status, notifications, and analytics so the product feels unified."
              light
            />
            <div className="mt-6 grid gap-3">
              {solutionFeatures.map((feature) => (
                <article key={feature.title} className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <h3 className="font-semibold text-[#BAF91A]">{feature.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{feature.description}</p>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-10 rounded-[28px] border border-[#dceab7] bg-gradient-to-br from-[#E2FF99] to-[#FFFFFF] p-6 sm:p-8" id="maintenance">
          <SectionHeading
            eyebrow="Simple workflow"
            title="From registration to daily use, every step stays clear"
            description="A structured onboarding and tracking flow keeps both students and staff aligned on the same system state."
            center
          />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowSteps.map((item) => (
              <article key={item.step} className="rounded-2xl border border-[#101312]/15 bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#876DFF]">{item.step}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#101312]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#101312]/70">{item.description}</p>
                <button type="button" onClick={() => handleAction(item.actionTarget)} className={`mt-4 ${tertiaryButtonClass}`}>
                  {item.actionLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-[#101312]/15 bg-white p-6 sm:p-8">
          <SectionHeading
            eyebrow="Built for every role"
            title="Role-based access that matches how the campus actually operates"
            description="The interface keeps permissions clear while giving each role the exact actions and insights it needs."
          />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {roleCards.map((card) => (
              <article key={card.role} className="rounded-2xl border border-[#101312]/10 bg-[#f8fced] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#876DFF]">{card.role}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#101312]">{card.role}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#101312]/70">{card.summary}</p>
                <button type="button" onClick={() => handleAction(card.actionTarget)} className={`mt-4 ${tertiaryButtonClass}`}>
                  {card.actionLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="safety" className="mt-10 rounded-[28px] border border-[#101312]/15 bg-[#101312] p-6 text-white sm:p-8">
          <SectionHeading
            eyebrow="Safety first, always"
            title="Security is designed into the product, not added afterwards"
            description="Trust matters more in shared housing and shared travel. The platform uses layered controls to protect students and staff."
            light
          />
          <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {safetyHighlights.map((item) => (
              <article key={item} className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm text-white/90">{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="dashboard" className="mt-10 rounded-[28px] border border-[#101312]/15 bg-white p-6 sm:p-8">
          <SectionHeading
            eyebrow="Admin dashboard insights"
            title="Analytics that surface system health at a glance"
            description="A clean command layer helps admins understand demand, prioritize issues, and keep response times under control."
          />

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {analyticsCards.map((item) => (
              <article key={item.label} className="rounded-2xl border border-[#101312]/10 bg-[#f8fced] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#876DFF]">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[#101312]">{item.value}</p>
                <p className="mt-1 text-xs text-[#101312]/65">{item.trend} vs last period</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-[#101312]/10 bg-[#f8fced] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#876DFF]">Ticket priority breakdown</p>
              <h3 className="mt-2 text-lg font-semibold text-[#101312]">Service queue balance</h3>
              <div className="mt-5 space-y-3">
                {priorityBreakdown.map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#101312]/10 bg-white p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#eaf4d0]">
                      <div className="h-2 rounded-full bg-[#876DFF]" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#101312]/10 bg-[#f8fced] p-5 lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#876DFF]">Rides by time</p>
              <h3 className="mt-2 text-lg font-semibold text-[#101312]">Daily transport demand</h3>
              <div className="mt-5 grid grid-cols-5 gap-3">
                {ridesByTime.map((bar) => (
                  <div key={bar.label} className="flex flex-col items-center gap-2">
                    <div className="flex h-32 w-full items-end rounded-xl border border-[#101312]/10 bg-white p-2">
                      <div className="w-full rounded-md bg-[#876DFF]" style={{ height: `${bar.value}%` }} />
                    </div>
                    <p className="text-[11px] text-[#101312]/65">{bar.label}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-[#dceab7] bg-gradient-to-br from-[#E2FF99] via-[#f4ffd5] to-[#FFFFFF] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#876DFF]">Ready to upgrade hostel life?</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#101312] sm:text-4xl">Join a safer, smarter student community.</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-[#101312]/75">
            Launch with a modern platform where verified students can live better, move safer, and resolve issues
            faster.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => onNavigateToAuth('register')} className={primaryButtonClass}>
              Create Account
            </button>
            <button type="button" onClick={() => onNavigateToAuth('login')} className={secondaryButtonClass}>
              Login
            </button>
          </div>
        </section>
      </main>

      <Footer onNavigateToPage={onNavigateToPage} />
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()

  const headerNavItems = [
    { label: 'Home', onClick: () => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Services', onClick: () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Safety', onClick: () => document.getElementById('safety')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Impact', onClick: () => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Rides', onClick: () => navigate('/rides') },
    { label: 'Maintenance', onClick: () => navigate('/maintenance') },
  ]

  return (
    <Home
      headerNavItems={headerNavItems}
      onNavigateToRide={() => navigate('/rides')}
      onNavigateToAdminDashboard={() => navigate('/admin/ride-dashboard')}
      onNavigateToAuth={(mode) => navigate(`/auth/${mode}`)}
      onNavigateToPage={(page) => navigate(page ? `/${page}` : '/')}
    />
  )
}

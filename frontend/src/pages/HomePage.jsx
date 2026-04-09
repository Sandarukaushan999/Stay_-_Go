import Footer from '../Components/landing/footer'
import Header from '../Components/landing/header'
import { useNavigate } from 'react-router-dom'

const heroStats = [
  { label: 'Active Students', value: '12.8K', note: '+14% this month' },
  { label: 'Successful Matches', value: '3,240', note: 'Double opt-in verified' },
  { label: 'Rides Completed', value: '8,960', note: 'Live route tracking' },
  { label: 'Tickets Resolved', value: '1,482', note: 'SLA monitored' },
]

const valueSignals = [
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
    actionLabel: 'Open Maintenance Section',
    actionTarget: { type: 'section', value: 'maintenance' },
  },
  {
    title: 'Role-based analytics',
    description: 'Admins monitor demand, ticket pressure, and safety activity across the platform.',
    actionLabel: 'Open Dashboard Section',
    actionTarget: { type: 'section', value: 'dashboard' },
  },
]

const valueCards = [
  {
    code: 'RM',
    title: 'Roommate Matching',
    description:
      'Find compatible roommates through lifestyle scoring, preference filters, and safe double opt-in approvals.',
    actionLabel: 'Open Roommates',
    actionTarget: { type: 'section', value: 'roommates' },
  },
  {
    code: 'RS',
    title: 'Ride Sharing + Live Tracking',
    description:
      'Coordinate campus rides with route-based suggestions, pickup logic, seat control, and real-time tracking.',
    actionLabel: 'Open Ride Module',
    actionTarget: { type: 'ride' },
  },
  {
    code: 'MT',
    title: 'Maintenance Tickets',
    description:
      'Submit issues digitally, follow every stage of the workflow, and rate service quality after resolution.',
    actionLabel: 'Open Maintenance',
    actionTarget: { type: 'section', value: 'maintenance' },
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
    actionTarget: { type: 'section', value: 'rides' },
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
    actionTarget: { type: 'section', value: 'dashboard' },
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

const rideBars = [
  { label: '06:00', value: '34%' },
  { label: '09:00', value: '52%' },
  { label: '13:00', value: '68%' },
  { label: '18:00', value: '88%' },
  { label: '22:00', value: '41%' },
]

const priorityBreakdown = [
  { label: 'Low', value: '42%' },
  { label: 'Medium', value: '33%' },
  { label: 'High', value: '17%' },
  { label: 'Critical', value: '8%' },
]

function SectionHeading({ eyebrow, title, description, center = false }) {
  return (
    <div className={`mb-8 ${center ? 'text-center' : ''}`}>
      <p className="text-xs uppercase tracking-wide text-violet-200">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
      <p className="mt-2 text-slate-400">{description}</p>
    </div>
  )
}

function Home({ headerNavItems, onNavigateToRide, onNavigateToPage, onNavigateToAuth, onNavigateToAdminDashboard }) {
  function scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId)
    if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleDirectNavigation(target) {
    if (!target) return
    if (target.type === 'ride') return onNavigateToRide()
    if (target.type === 'auth') return onNavigateToAuth(target.value)
    if (target.type === 'page') return onNavigateToPage(target.value)
    if (target.type === 'section') return scrollToSection(target.value)
  }

  const actionItems = [
    { label: 'Login', type: 'button', variant: 'button-ghost', onClick: () => onNavigateToAuth('login') },
    { label: 'Register', type: 'button', variant: 'button-primary', onClick: () => onNavigateToAuth('register') },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header navItems={headerNavItems} actionItems={actionItems} onBrandClick={() => scrollToSection('home')} />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="grid gap-8 lg:grid-cols-2" id="home">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-200">
              Smart Hostel Sharing & Ride Sharing System
            </p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight">
              Match smarter.
              <br />
              Ride safer.
              <br />
              Fix faster.
            </h1>
            <p className="mt-4 text-slate-300">
              STAY & GO gives verified university students one secure place to match roommates, coordinate rides with
              live tracking, and manage hostel maintenance with full visibility.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
                type="button"
                onClick={() => onNavigateToAuth('register')}
              >
                Get Started
              </button>
              <button
                className="rounded-xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-900"
                type="button"
                onClick={onNavigateToRide}
              >
                Open Ride Module
              </button>
              <button
                className="rounded-xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-900"
                type="button"
                onClick={onNavigateToAdminDashboard}
              >
                Open Admin Dashboard
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-xs text-slate-400">Vision</span>
                <strong className="mt-1 block text-sm">Create a safer, smarter student community.</strong>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-xs text-slate-400">Core Flow</span>
                <strong className="mt-1 block text-sm">
                  Roommates, rides, maintenance, and admin insights in one system.
                </strong>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Live system snapshot</p>
                <h3 className="mt-1 text-lg font-semibold">Operational command view</h3>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200">Online</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {heroStats.map((item) => (
                <article key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <strong className="mt-2 block text-2xl">{item.value}</strong>
                  <small className="mt-1 block text-xs text-slate-500">{item.note}</small>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-10 grid gap-3 md:grid-cols-4">
          {valueSignals.map((signal) => (
            <article key={signal.title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <strong className="block">{signal.title}</strong>
              <p className="mt-2 text-sm text-slate-400">{signal.description}</p>
              <button
                className="mt-3 rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
                type="button"
                onClick={() => handleDirectNavigation(signal.actionTarget)}
              >
                {signal.actionLabel}
              </button>
            </article>
          ))}
        </section>

        <section className="mt-14" aria-labelledby="value-heading">
          <SectionHeading
            eyebrow="Everything students need for hostel life"
            title="A modern platform built around the real campus experience"
            description="The system combines the three operational flows that matter most, without forcing students or staff to jump between disconnected tools."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {valueCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="inline-flex rounded-xl bg-violet-600/20 px-3 py-1 text-xs text-violet-200">
                  {card.code}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{card.description}</p>
                <button
                  className="mt-4 rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
                  type="button"
                  onClick={() => handleDirectNavigation(card.actionTarget)}
                >
                  {card.actionLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-4 lg:grid-cols-2" id="roommates">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <SectionHeading
              eyebrow="Why STAY & GO is needed"
              title="Traditional hostel systems leave students with friction and uncertainty"
              description="Daily operations slow down when roommate selection, transport, and maintenance depend on manual coordination."
            />
            <div className="grid gap-2">
              {problemPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-violet-400" />
                  <p className="text-sm text-slate-200">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6" id="rides">
            <SectionHeading
              eyebrow="One centralized system"
              title="The solution connects matching, movement, and maintenance"
              description="Every module is designed to share identity, status, notifications, and analytics so the product feels unified."
            />
            <div className="grid gap-3">
              {solutionFeatures.map((feature) => (
                <article key={feature.title} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14" id="maintenance">
          <SectionHeading
            eyebrow="Simple workflow"
            title="From registration to daily use, every step stays clear"
            description="A structured onboarding and tracking flow keeps both students and staff aligned on the same system state."
            center
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((item) => (
              <article key={item.step} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="text-xs text-slate-500">{item.step}</span>
                <h3 className="mt-2 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                <button
                  className="mt-4 rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
                  type="button"
                  onClick={() => handleDirectNavigation(item.actionTarget)}
                >
                  {item.actionLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <SectionHeading
            eyebrow="Built for every role"
            title="Role-based access that matches how the campus actually operates"
            description="The interface keeps permissions clear while giving each role the exact actions and insights it needs."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roleCards.map((card) => (
              <article key={card.role} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">{card.role}</p>
                <h3 className="mt-2 text-lg font-semibold">{card.role}</h3>
                <p className="mt-2 text-sm text-slate-400">{card.summary}</p>
                <button
                  className="mt-4 rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
                  type="button"
                  onClick={() => handleDirectNavigation(card.actionTarget)}
                >
                  {card.actionLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <SectionHeading
            eyebrow="Safety first, always"
            title="Security is designed into the product, not added afterwards"
            description="Trust matters more in shared housing and shared travel. The platform uses layered controls to protect students and staff."
          />
          <div className="grid gap-3 md:grid-cols-3">
            {safetyHighlights.map((item) => (
              <article key={item} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-200">{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14" id="dashboard">
          <SectionHeading
            eyebrow="Admin dashboard insights"
            title="Analytics that surface system health at a glance"
            description="A clean command layer helps admins understand demand, prioritize issues, and keep response times under control."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {analyticsCards.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <span className="text-xs text-slate-400">{item.label}</span>
                <strong className="mt-2 block text-3xl">{item.value}</strong>
                <small className="mt-1 block text-xs text-slate-500">{item.trend} vs last period</small>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3" id="analytics">
            <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Ticket priority breakdown</p>
              <h3 className="mt-2 text-lg font-semibold">Service queue balance</h3>
              <div className="mt-4 grid gap-2">
                {priorityBreakdown.map((p) => (
                  <div key={p.label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="text-sm text-slate-300">{p.label}</span>
                    <strong className="text-sm">{p.value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 lg:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Rides by time</p>
              <h3 className="mt-2 text-lg font-semibold">Daily transport demand</h3>
              <div className="mt-4 grid grid-cols-5 gap-3">
                {rideBars.map((bar) => (
                  <div key={bar.label} className="flex flex-col items-center gap-2">
                    <div className="h-28 w-full rounded-xl border border-slate-800 bg-slate-950 p-2 flex items-end">
                      <div className="w-full rounded-lg bg-violet-500" style={{ height: bar.value }} />
                    </div>
                    <small className="text-xs text-slate-500">{bar.label}</small>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center" id="cta">
          <p className="text-xs uppercase tracking-wide text-violet-200">Ready to upgrade hostel life?</p>
          <h2 className="mt-2 text-3xl font-semibold">Join a safer, smarter student community.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Launch with a modern platform where verified students can live better, move safer, and resolve issues faster.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
              type="button"
              onClick={() => onNavigateToAuth('register')}
            >
              Create Account
            </button>
            <button
              className="rounded-xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-900"
              type="button"
              onClick={() => onNavigateToAuth('login')}
            >
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
    { label: 'Home', onClick: () => navigate('/') },
    { label: 'Roommates', onClick: () => document.getElementById('roommates')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Rides', onClick: () => document.getElementById('rides')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Maintenance', onClick: () => document.getElementById('maintenance')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Dashboard', onClick: () => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' }) },
  ]

  return (
    <Home
      headerNavItems={headerNavItems}
      onNavigateToRide={() => navigate('/rides')}
      onNavigateToAdminDashboard={() => navigate('/admin')}
      onNavigateToAuth={(mode) => navigate(`/auth/${mode}`)}
      onNavigateToPage={(page) => navigate(`/${page}`)}
    />
  )
}


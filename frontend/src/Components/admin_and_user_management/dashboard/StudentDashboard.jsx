import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/authStore'
import { api } from '../../../lib/apiClient'
import MainLayout from '../../shared/layout/MainLayout'
import { User, Bell, Car, Home, ArrowRight, Leaf } from 'lucide-react'
import StudentFAQChatbot from '../../shared/ui/StudentFAQChatbot'

import rightHeroImage from '../../ride_and_sharing_system/assets/chuttersnap-gts_Eh4g1lk-unsplash.jpg'
import missionImage from '../../ride_and_sharing_system/assets/make the campus fairer.png'

function Highlight({ children }) {
  return <span className="rounded bg-[#BAF91A] px-1.5 text-[#101312]">{children}</span>
}

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/users/dashboard-stats')
      .then((res) => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const primaryBtn =
    'rounded-lg bg-[#BAF91A] px-4 py-2.5 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00]'
  const secondaryBtn =
    'rounded-lg border border-[#101312]/20 bg-white px-3 py-2 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]'

  return (
    <>
    <MainLayout>
      <div
        className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 md:py-10 lg:px-8"
        style={{ fontFamily: '"Poppins", "Manrope", "Trebuchet MS", sans-serif' }}
      >
        <section className="overflow-hidden rounded-[28px] border border-[#d6e9aa] bg-gradient-to-br from-[#E2FF99] via-[#f4ffd6] to-[#FFFFFF] shadow-[0_16px_40px_rgba(16,19,18,0.08)]">
          <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#876DFF]">Stay &amp; Go · Student hub</p>
              <h1 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-[#101312] sm:text-4xl">
                Together, we make a <Highlight>greener campus</Highlight>.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#101312]/75">
                Whether you are commuting to classes, meeting friends, or returning to your hostel, Stay &amp; Go keeps
                rides safer with realtime tracking, verified profiles, and transparent journey updates — alongside
                roommate matching and maintenance in one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button type="button" className={primaryBtn} onClick={() => navigate('/rides/workspace?view=passenger')}>
                  Start a ride request
                </button>
                <button type="button" className={secondaryBtn} onClick={() => navigate('/roommate/setup')}>
                  Set up roommate profile
                </button>
                <button type="button" className={secondaryBtn} onClick={() => navigate('/rides')}>
                  Explore ride platform
                </button>
              </div>
              <p className="mt-4 text-sm text-[#101312]/80">
                Welcome back, <span className="font-semibold text-[#101312]">{user?.fullName}</span>.
              </p>
            </div>
            <div className="relative min-h-[220px] lg:min-h-[280px]">
              <div className="absolute -left-3 top-12 hidden h-12 w-16 bg-[#E2FF99] lg:block" />
              <img
                src={rightHeroImage}
                alt="Campus mobility"
                className="h-full min-h-[220px] w-full rounded-2xl object-cover lg:min-h-[280px]"
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<User className="h-5 w-5" />}
            title="Profile"
            value={user?.isVerified ? 'Verified' : 'Pending'}
            accent="bg-[#E2FF99] text-[#101312]"
          />
          <StatCard
            icon={<Bell className="h-5 w-5" />}
            title="Unread alerts"
            value={loading ? '…' : stats?.unreadNotifications ?? 0}
            accent="bg-[#876DFF]/15 text-[#5b4ccc]"
          />
          <StatCard
            icon={<Car className="h-5 w-5" />}
            title="Active rides"
            value={loading ? '…' : stats?.activeRidesJoined ?? 0}
            accent="bg-[#BAF91A]/40 text-[#101312]"
          />
          <StatCard
            icon={<Home className="h-5 w-5" />}
            title="Hostel block"
            value={user?.hostelBlock || 'Unassigned'}
            accent="bg-[#f9fce9] text-[#101312]"
          />
        </div>

        <section className="rounded-[24px] border border-[#101312]/10 bg-white px-5 py-8 text-center sm:px-8">
          <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 text-[#101312]">
            <Leaf className="h-5 w-5 text-[#BAF91A]" strokeWidth={2.2} />
            <h2 className="text-xl font-semibold sm:text-2xl">
              Safer commutes, <Highlight>fairer mobility</Highlight>
            </h2>
          </div>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#101312]/72">
            We challenge unsafe transport patterns with reliable visibility, accountability, and structured support at
            every stage of a ride — the same care extends to hostel matching and campus support tickets.
          </p>
          <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl border border-[#101312]/10 bg-[#f9fce9] p-2">
            <img src={missionImage} alt="Campus mission" className="h-auto w-full rounded-xl object-cover" />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <article
            className="group flex cursor-pointer flex-col justify-between rounded-[24px] border border-[#101312]/12 bg-white p-7 shadow-[0_8px_28px_rgba(16,19,18,0.07)] transition hover:border-[#876DFF]/35 hover:shadow-[0_14px_40px_rgba(135,109,255,0.12)]"
            onClick={() => navigate('/roommate/setup')}
            role="presentation"
          >
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#876DFF]/12 text-[#876DFF]">
                <Home className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-[#101312]">Roommate matching</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#101312]/70">
                Lifestyle profile, room preferences, and double opt-in matches — secure your campus accommodation with
                students like you.
              </p>
            </div>
            <button
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#876DFF]/30 bg-[#876DFF]/10 py-3 text-sm font-semibold text-[#5b4ccc] transition group-hover:bg-[#876DFF]/20"
            >
              Open roommate portal
              <ArrowRight className="h-4 w-4" />
            </button>
          </article>

          <article
            className="group flex cursor-pointer flex-col justify-between rounded-[24px] border border-[#d6e9aa] bg-gradient-to-br from-[#f7ffe0] to-white p-7 shadow-[0_8px_28px_rgba(16,19,18,0.06)] transition hover:border-[#BAF91A] hover:shadow-[0_14px_40px_rgba(186,249,26,0.2)]"
            onClick={() => navigate('/rides/workspace?view=passenger')}
            role="presentation"
          >
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#BAF91A] text-[#101312]">
                <Car className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-[#101312]">Ride sharing workspace</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#101312]/70">
                Live trip map, pickup on the map, fixed campus destination (SLIIT), route preview, ride history, and
                safety checkpoints — all in one flow.
              </p>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-[#BAF91A] py-3 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00]"
            >
              Open passenger workspace
            </button>
          </article>
        </div>

        <section className="rounded-2xl border border-[#101312]/10 bg-[#fafdf4] px-5 py-5 sm:flex sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-[#101312]/75">
            Need tickets or announcements? Use <strong className="text-[#101312]">Maintenance</strong> in the top bar.
          </p>
          <button
            type="button"
            onClick={() => navigate('/maintenance')}
            className="mt-3 w-full rounded-lg border border-[#101312]/20 bg-white px-4 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99] sm:mt-0 sm:w-auto"
          >
            Go to maintenance
          </button>
        </section>
      </div>
    </MainLayout>
    <StudentFAQChatbot />
    </>
  )
}

function StatCard({ icon, title, value, accent }) {
  return (
    <div className="rounded-2xl border border-[#101312]/10 bg-white p-4 shadow-sm sm:p-5">
      <div className={`mb-3 inline-flex rounded-xl p-2.5 ${accent}`}>{icon}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#101312]/55">{title}</div>
      <div className="mt-1 text-xl font-bold text-[#101312] sm:text-2xl">{value}</div>
    </div>
  )
}

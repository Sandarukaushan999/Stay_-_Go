import { useNavigate } from 'react-router-dom'

import missionImage from '../Components/ride_and_sharing_system/assets/make the campus fairer.png'
import serviceOneImage from '../Components/ride_and_sharing_system/assets/Our Ride Services1.png'
import serviceTwoImage from '../Components/ride_and_sharing_system/assets/Our Ride Services2.png'
import serviceThreeImage from '../Components/ride_and_sharing_system/assets/Our Ride Services3.png'
import safetyImage from '../Components/ride_and_sharing_system/assets/Your safety is our priority.png'
import rightHeroImage from '../Components/ride_and_sharing_system/assets/chuttersnap-gts_Eh4g1lk-unsplash.jpg'
import SystemFooter from '../Components/shared/layout/SystemFooter'

const serviceCards = [
  {
    title: 'City Rides',
    image: serviceThreeImage,
    imageAlt: 'Driver and passenger in a city ride',
    description: 'Daily hostel, boarding, and city requests with verified rider matching and transparent fare visibility.',
    details: ['Realtime location feed', 'Verified rider identity', 'Secure in-app communication'],
    chips: ['Passengers', 'Drivers'],
  },
  {
    title: 'City to City',
    image: serviceOneImage,
    imageAlt: 'Pickup coordination between rider and passenger',
    description: 'Longer student travel coordination with route preview, ETA updates, and boarding confirmation.',
    details: ['Dynamic seat matching', 'ETA route stages', 'Trip handover tracking'],
    chips: ['Passengers', 'Drivers'],
  },
  {
    title: 'Safe Payments',
    image: serviceTwoImage,
    imageAlt: 'Secure in-car payment experience',
    description: 'Trip-linked payment records and ride completion confirmation for fair and safe digital transactions.',
    details: ['Trip-linked receipt logs', 'Cancellation audit trail', 'Role-based payment access'],
    chips: ['Charging'],
  },
]

const impactCards = [
  {
    label: 'Community',
    title: 'Trusted campus mobility network',
    description: 'Every rider profile passes approval checks. Students can review trip history and safety status before joining.',
    metric: '98% profile completion in active rider accounts',
  },
  {
    label: 'Safety',
    title: 'Faster emergency response workflow',
    description: 'SOS escalation, live location, and alert triage improve coordination between admins, riders, and passengers.',
    metric: 'Median admin acknowledgement under 2 minutes',
  },
  {
    label: 'Operations',
    title: 'Transparent monitoring and planning',
    description: 'Structured dashboards show demand peaks, completion trends, and overdue signals for better daily decisions.',
    metric: 'Live trip board refreshes every 30 seconds',
  },
]

const latestUpdates = [
  {
    category: 'Corporate',
    date: 'June 26',
    title: 'Insurance partnership expanded emergency expense coverage for ride incidents.',
    detail: 'Coverage now includes rider and passenger emergency transport support during active trips.',
  },
  {
    category: 'Operations',
    date: 'May 14',
    title: 'Trip timeline module launched with pickup, route, and destination checkpoints.',
    detail: 'Admins can investigate delays with richer stage-level visibility and location context.',
  },
  {
    category: 'Safety',
    date: 'April 14',
    title: 'Automated overdue detection improved SOS trigger quality.',
    detail: 'No-movement and buffered-deadline checks now reduce false positives and improve escalation flow.',
  },
]

function Highlight({ children }) {
  return <span className="rounded bg-[#BAF91A] px-1.5 text-[#101312]">{children}</span>
}

function SectionPill({ children }) {
  return (
    <span className="inline-flex rounded-full border border-[#101312]/20 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#101312]/70">
      {children}
    </span>
  )
}

export default function RideShowcasePage() {
  const navigate = useNavigate()

  const primaryButtonClass =
    'rounded-lg bg-[#BAF91A] px-4 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#a9ea00]'
  const secondaryButtonClass =
    'rounded-lg border border-[#101312]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#101312] transition hover:bg-[#E2FF99]'

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#101312]">
      <main className="w-full space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section
          id="ride-home"
          className="overflow-hidden rounded-[32px] border border-[#d6e9aa] bg-gradient-to-br from-[#E2FF99] via-[#f4ffd6] to-[#FFFFFF] shadow-[0_16px_40px_rgba(16,19,18,0.08)]"
        >
          <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.03fr_1fr] lg:px-8 lg:py-8">
            <div className="flex flex-col justify-center">
              <h2 className="max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
                Together, We Make a <Highlight>Greener World</Highlight>.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#101312]/75">
                Whether you are commuting to classes, meeting friends, or returning to your hostel, the platform keeps
                rides safer with realtime tracking, verified profiles, and transparent journey updates.
              </p>
              <button type="button" onClick={() => navigate('/rides/workspace')} className={`mt-5 w-fit ${primaryButtonClass}`}>
                Start now
              </button>

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => navigate('/')} className={secondaryButtonClass}>
                  Home
                </button>
                <button type="button" onClick={() => navigate('/rides/workspace?view=passenger')} className={secondaryButtonClass}>
                  Passenger Dashboard
                </button>
                <button type="button" onClick={() => navigate('/rides/workspace?view=rider')} className={secondaryButtonClass}>
                  Rider Dashboard
                </button>
                <button type="button" onClick={() => navigate('/auth/register')} className={secondaryButtonClass}>
                  Create Account
                </button>
              </div>

              <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-[#101312]/65">Cities</div>
                  <div className="mt-1 text-2xl font-semibold">1000+</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-[#101312]/65">Countries</div>
                  <div className="mt-1 text-2xl font-semibold">45+</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-[#101312]/65">App Download</div>
                  <div className="mt-1 text-2xl font-semibold">237M+</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-16 hidden h-16 w-20 bg-[#E2FF99] lg:block" />
              <div className="absolute -right-4 bottom-12 hidden h-16 w-20 bg-[#E2FF99] lg:block" />
              <img src={rightHeroImage} alt="Ride system hero visual" className="h-full min-h-[340px] w-full rounded-2xl object-cover" />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#101312]/10 bg-white px-6 py-12 text-center">
          <h3 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
            Challenging injustice to <Highlight>make the world a fairer</Highlight> place for one billion people.
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#101312]/75">
            We challenge unsafe transport patterns and build a more inclusive commuting environment with reliable
            visibility, accountability, and structured support in every stage of a ride.
          </p>
          <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-[#101312]/10 bg-[#f9fce9] p-3">
            <img src={missionImage} alt="Campus mission illustration" className="h-auto w-full rounded-xl object-cover" />
          </div>
        </section>

        <section id="ride-services" className="rounded-[28px] border border-[#d6e9aa] bg-gradient-to-b from-[#E2FF99] via-[#f5ffd9] to-[#FFFFFF] px-6 py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionPill>Ride Platform</SectionPill>
              <h3 className="mt-2 text-4xl font-semibold sm:text-5xl">
                Our <Highlight>Service</Highlight>
              </h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/rides/workspace')}
              className="rounded-lg border border-[#101312]/20 bg-white px-4 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
            >
              See more {'->'}
            </button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {serviceCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-[#101312]/12 bg-white p-4 shadow-[0_8px_24px_rgba(16,19,18,0.06)]">
                <img src={card.image} alt={card.imageAlt} className="h-52 w-full rounded-xl object-cover" />
                <h4 className="mt-4 text-2xl font-semibold">{card.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#101312]/72">{card.description}</p>

                <ul className="mt-4 space-y-1 text-xs text-[#101312]/72">
                  {card.details.map((detail) => (
                    <li key={detail}>- {detail}</li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2">
                  {card.chips.map((chip) => (
                    <span key={chip} className="rounded-md border border-[#101312]/15 bg-[#E2FF99] px-2 py-1 text-xs font-semibold">
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="ride-safety" className="rounded-[28px] border border-[#d6e9aa] bg-gradient-to-b from-[#E2FF99] via-[#f6ffdf] to-[#FFFFFF] px-6 pb-12 pt-4">
          <div className="text-center">
            <SectionPill>Safety</SectionPill>
            <h3 className="mt-3 text-4xl font-semibold sm:text-5xl">
              Your safety is <Highlight>our priority</Highlight>
            </h3>
            <p className="mt-2 text-sm text-[#101312]/75">Stay on the safe side with us in every ride stage.</p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-[#101312]/12 bg-white">
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1.08fr] lg:p-6">
              <div className="flex flex-col justify-center">
                <h4 className="text-3xl font-semibold leading-tight sm:text-4xl">We want all of us to be on the same page about safety</h4>
                <p className="mt-3 text-sm leading-relaxed text-[#101312]/75">
                  Every active ride has an operational timeline, destination checks, inactivity detection, and SOS
                  escalation support. The admin workspace receives live updates for immediate action.
                </p>
                <div className="mt-4 grid gap-2 text-xs text-[#101312]/80 sm:grid-cols-2">
                  <div className="rounded-lg border border-[#101312]/10 bg-[#f9fce9] p-2.5">Realtime trip movement feed</div>
                  <div className="rounded-lg border border-[#101312]/10 bg-[#f9fce9] p-2.5">Overdue and no-update detection</div>
                  <div className="rounded-lg border border-[#101312]/10 bg-[#f9fce9] p-2.5">Rider and passenger traceability</div>
                  <div className="rounded-lg border border-[#101312]/10 bg-[#f9fce9] p-2.5">Admin SOS acknowledge and resolve flow</div>
                </div>
                <button type="button" onClick={() => navigate('/admin/ride-dashboard')} className={`mt-5 w-fit ${primaryButtonClass}`}>
                  Learn more
                </button>
              </div>

              <img src={safetyImage} alt="Priority safety section" className="h-full min-h-[320px] w-full rounded-xl object-cover" />
            </div>
          </div>
        </section>

        <section id="ride-impact" className="rounded-[28px] border border-[#101312]/10 bg-[#f7fbef] px-6 py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionPill>Impact</SectionPill>
              <h3 className="mt-2 text-4xl font-semibold sm:text-5xl">
                <Highlight>Social impact</Highlight> making a difference.
              </h3>
              <p className="mt-2 text-sm text-[#101312]/75">
                We create operational clarity and safer student commuting through measurable platform outcomes.
              </p>
            </div>
            <button type="button" onClick={() => navigate('/rides/workspace')} className={primaryButtonClass}>
              Learn more about
            </button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {impactCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-[#101312]/12 bg-white p-5 shadow-[0_8px_24px_rgba(16,19,18,0.06)]">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#876DFF]">{card.label}</div>
                <h4 className="mt-3 text-2xl font-semibold leading-snug">{card.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-[#101312]/72">{card.description}</p>
                <div className="mt-4 rounded-lg border border-[#101312]/10 bg-[#f9fce9] p-3 text-xs font-medium text-[#101312]">
                  {card.metric}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#d6e9aa] bg-gradient-to-b from-[#E2FF99] via-[#f7ffdf] to-[#FFFFFF] px-6 py-12">
          <div className="text-center">
            <SectionPill>Safety</SectionPill>
            <h3 className="mt-3 text-4xl font-semibold sm:text-5xl">
              Right now at <Highlight>STAY &amp; GO</Highlight>
            </h3>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
            <article className="rounded-2xl border border-[#101312]/12 bg-white p-5 shadow-[0_8px_24px_rgba(16,19,18,0.06)]">
              <div className="text-[11px] uppercase tracking-wide text-[#876DFF]">Corporate</div>
              <h4 className="mt-2 text-xl font-semibold">University support operations across districts are now active.</h4>
              <p className="mt-3 text-sm leading-relaxed text-[#101312]/75">
                Weekly regional operations are helping riders and passengers coordinate safer inter-city travel with
                better live route guidance and direct support channels.
              </p>
              <button
                type="button"
                onClick={() => navigate('/rides/workspace')}
                className="mt-5 rounded-lg border border-[#101312]/20 bg-white px-4 py-2 text-sm font-semibold text-[#101312] transition hover:bg-[#E2FF99]"
              >
                Learn more
              </button>
            </article>

            <div className="grid gap-3">
              {latestUpdates.map((update) => (
                <article key={update.title} className="rounded-2xl border border-[#101312]/12 bg-white p-4 shadow-[0_8px_24px_rgba(16,19,18,0.06)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex rounded-full border border-[#101312]/15 bg-[#f9fce9] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#101312]/70">
                      {update.category}
                    </span>
                    <span className="text-[11px] text-[#101312]/60">{update.date}</span>
                  </div>
                  <h5 className="mt-2 text-sm font-semibold leading-snug text-[#101312]">{update.title}</h5>
                  <p className="mt-1 text-xs leading-relaxed text-[#101312]/72">{update.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SystemFooter />
    </div>
  )
}

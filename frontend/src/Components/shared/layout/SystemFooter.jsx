import { useNavigate } from 'react-router-dom'

export default function SystemFooter({ onNavigateToPage }) {
  const navigate = useNavigate()

  function goHome() {
    if (typeof onNavigateToPage === 'function') onNavigateToPage('')
    navigate('/')
  }

  function goWorkspace() {
    navigate('/rides/workspace')
  }

  function goRideDashboard() {
    navigate('/admin/ride-dashboard')
  }

  return (
    <section className="mt-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-t-2xl bg-emerald-500 px-6 py-9">
          <div className="max-w-3xl">
            <h3 className="text-5xl font-semibold leading-tight text-slate-950">
              From Underdog to Global Leader A Journey of Growth and Innovation.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-900/85">
              The future of student transport depends on reliable operations, transparent analytics, and safe
              collaboration between riders, passengers, and admins.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={goWorkspace}
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open workspace
              </button>
              <button
                type="button"
                onClick={goRideDashboard}
                className="rounded-lg border border-slate-900/30 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
              >
                Open Ride Dashboard
              </button>
            </div>
          </div>
        </div>

        <footer className="rounded-b-2xl bg-slate-950 px-6 py-10 text-slate-300">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="text-xl font-semibold text-white">STAY &amp; GO Ride Sharing</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                We are building transparent mobility systems for students and campuses with realtime ride monitoring,
                safety workflows, and trusted rider operations.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={goHome}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs transition hover:bg-slate-900"
                >
                  Back to Home
                </button>
                <button
                  type="button"
                  onClick={goWorkspace}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Open Workspace
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Earn with us</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>City rides</li>
                <li>Campus shuttle</li>
                <li>Safe payments</li>
                <li>Driver profile</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Our services</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>Trip request</li>
                <li>Live location</li>
                <li>SOS alerts</li>
                <li>Safety checks</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">About</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>Company</li>
                <li>Careers</li>
                <li>News room</li>
                <li>Support</li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}

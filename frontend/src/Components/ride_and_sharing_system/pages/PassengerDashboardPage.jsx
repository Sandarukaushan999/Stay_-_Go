import RideHistoryTable from '../passenger/RideHistoryTable'
import PassengerLiveTripMap from '../passenger/PassengerLiveTripMap'

function PassengerDashboardPage() {
  return (
    <section className="grid gap-6">
      <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Passenger Workspace</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Create and track ride requests, follow active trip routes in real time, and review complete ride history
          with status and rider details.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <PassengerLiveTripMap />
        <RideHistoryTable />
      </div>
    </section>
  )
}

export default PassengerDashboardPage

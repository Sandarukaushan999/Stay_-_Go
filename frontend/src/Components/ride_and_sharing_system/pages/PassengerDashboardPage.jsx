import RideHistoryTable from '../passenger/RideHistoryTable'
import PassengerLiveTripMap from '../passenger/PassengerLiveTripMap'

function PassengerDashboardPage() {
  return (
    <section className="grid gap-5">
      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <PassengerLiveTripMap />
        <RideHistoryTable />
      </div>
    </section>
  )
}

export default PassengerDashboardPage

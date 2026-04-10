import RideHistoryTable from '../passenger/RideHistoryTable'
import PassengerLiveTripMap from '../passenger/PassengerLiveTripMap'

function PassengerDashboardPage() {
  return (
    <section className="grid gap-4">
      <h2 className="text-2xl font-semibold">Passenger</h2>
      <PassengerLiveTripMap />
      <RideHistoryTable />
    </section>
  )
}

export default PassengerDashboardPage;

import RideHistoryTable from '../rides/RideHistoryTable'
import RiderAvailabilityToggle from '../rider/RiderAvailabilityToggle'
import IncomingRideRequests from '../rider/IncomingRideRequests'

export default function RiderDashboardPage() {
  return (
    <section className="grid gap-4">
      <h2 className="text-2xl font-semibold">Rider</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <RiderAvailabilityToggle />
        <IncomingRideRequests />
      </div>
      <RideHistoryTable />
    </section>
  )
}


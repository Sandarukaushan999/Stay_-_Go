import { useState } from 'react'
import CreateRideRequestForm from '../passenger/CreateRideRequestForm'
import NearbyRidersList from '../passenger/NearbyRidersList'
import RideHistoryTable from '../passenger/RideHistoryTable'

function PassengerDashboardPage() {
  const [pickup, setPickup] = useState(null)
  return (
    <section className="grid gap-4">
      <h2 className="text-2xl font-semibold">Passenger</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <CreateRideRequestForm onPickupChange={setPickup} />
        <NearbyRidersList pickup={pickup} />
      </div>
      <RideHistoryTable />
    </section>
  )
}

export default PassengerDashboardPage;

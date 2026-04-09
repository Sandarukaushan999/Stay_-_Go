import { useState } from 'react'
import CreateRideRequestForm from '../rides/CreateRideRequestForm'
import NearbyRidersList from '../rides/NearbyRidersList'
import RideHistoryTable from '../rides/RideHistoryTable'

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

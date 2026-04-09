import { useEffect, useState } from 'react'
import { rideApi } from '../services/rideApi'
import Table from '../../shared/ui/Table'

export default function RideHistoryTable() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    rideApi.myRequests().then((response) => setRows(response.data.data || []))
  }, [])

  const columns = [
    { key: '_id', label: 'Request' },
    { key: 'status', label: 'Status' },
    { key: 'requestedAt', label: 'Requested At' },
  ]

  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold">Ride History</h3>
      <div className="mt-3">
        <Table columns={columns} rows={rows} />
      </div>
    </section>
  )
}

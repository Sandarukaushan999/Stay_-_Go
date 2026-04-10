import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import AdminLayout from '../layout/AdminLayout'
import { api } from '../../../lib/apiClient'
import { useSocketStore } from '../../../app/store/socketStore'

const ACTIVE_TRIP_STATUSES = new Set(['to_pickup', 'to_university', 'overdue', 'in_progress'])
const ROUTE_COLORS = ['#876DFF', '#BAF91A', '#E2FF99', '#FFFFFF', '#101312', '#876DFF', '#BAF91A', '#E2FF99']

function isActiveStatus(status) {
  return ACTIVE_TRIP_STATUSES.has(status)
}

function getTripId(trip) {
  return trip?._id ?? trip?.id ?? null
}

function shortId(value) {
  if (!value) return '-'
  return String(value).slice(-10)
}

function asNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function isPoint(value) {
  if (!value) return false
  return asNumber(value.lat) !== null && asNumber(value.lng) !== null
}

function toTuple(point) {
  if (!isPoint(point)) return null
  return [asNumber(point.lat), asNumber(point.lng)]
}

function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString()
}

function formatLocation(point) {
  if (!isPoint(point)) return '-'
  return `${asNumber(point.lat).toFixed(5)}, ${asNumber(point.lng).toFixed(5)}`
}

function personName(entity) {
  if (!entity) return '-'
  if (typeof entity === 'string') return shortId(entity)
  return entity.fullName ?? shortId(entity._id ?? entity.id)
}

function personId(entity) {
  if (!entity) return null
  if (typeof entity === 'string') return entity
  return entity._id ?? entity.id ?? null
}

function normalizeFallbackRoute(origin, destination) {
  const start = toTuple(origin)
  const end = toTuple(destination)
  if (!start || !end) return []
  return [start, end]
}

function parseGeometryToPositions(geometry) {
  const coords = geometry?.coordinates
  if (!Array.isArray(coords)) return []
  return coords
    .map((coord) => {
      if (!Array.isArray(coord) || coord.length < 2) return null
      const lng = asNumber(coord[0])
      const lat = asNumber(coord[1])
      if (lat === null || lng === null) return null
      return [lat, lng]
    })
    .filter(Boolean)
}

function MapFitToTrips({ points, fitVersion }) {
  const map = useMap()
  const lastAppliedRef = useRef(-1)

  useEffect(() => {
    if (lastAppliedRef.current === fitVersion) return
    lastAppliedRef.current = fitVersion
    if (!points.length) return
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]))
    if (!bounds.isValid()) return
    map.fitBounds(bounds.pad(0.2), { maxZoom: 15, animate: true, duration: 0.6 })
  }, [map, points, fitVersion])

  return null
}

export default function LiveTripsTable() {
  const [items, setItems] = useState([])
  const [routeByTripId, setRouteByTripId] = useState({})
  const [fitVersion, setFitVersion] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const socket = useSocketStore((s) => s.socket)
  const connect = useSocketStore((s) => s.connect)
  const routeFetchInFlightRef = useRef(new Set())

  const activeItems = useMemo(() => items.filter((t) => isActiveStatus(t?.status)), [items])

  const tripMembershipSignature = useMemo(
    () =>
      activeItems
        .map((t) => String(getTripId(t)))
        .filter(Boolean)
        .sort()
        .join('|'),
    [activeItems]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/trips/active')
      setItems((data.items ?? []).filter((t) => isActiveStatus(t?.status)))
    } catch {
      setError('Failed to load active trips')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!tripMembershipSignature) return
    setFitVersion((v) => v + 1)
  }, [tripMembershipSignature])

  useEffect(() => {
    const s = socket ?? connect()
    s.emit('join:admin')

    function onLoc(evt) {
      const id = evt.tripId
      if (!id || !evt.location) return
      setItems((prev) =>
        prev.map((t) => {
          if (String(getTripId(t)) !== String(id)) return t
          return { ...t, currentLocation: evt.location, lastMovementAt: new Date().toISOString() }
        })
      )
    }

    function onStatus(evt) {
      const id = evt.tripId ?? getTripId(evt.trip)
      if (!id) return
      const incomingTrip = evt.trip
      const nextStatus = evt.status ?? incomingTrip?.status

      setItems((prev) => {
        const idx = prev.findIndex((t) => String(getTripId(t)) === String(id))
        const active = isActiveStatus(nextStatus)

        if (idx === -1) {
          if (!incomingTrip || !active) return prev
          return [incomingTrip, ...prev]
        }

        if (!active) {
          return prev.filter((_, i) => i !== idx)
        }

        if (!incomingTrip) {
          return prev.map((t, i) => (i === idx ? { ...t, status: nextStatus } : t))
        }

        return prev.map((t, i) => (i === idx ? { ...t, ...incomingTrip } : t))
      })
    }

    s.on('trip:location', onLoc)
    s.on('trip:status', onStatus)
    return () => {
      s.off('trip:location', onLoc)
      s.off('trip:status', onStatus)
    }
  }, [socket, connect])

  useEffect(() => {
    const activeIds = new Set(activeItems.map((t) => String(getTripId(t))).filter(Boolean))

    setRouteByTripId((prev) => {
      const next = {}
      for (const [id, value] of Object.entries(prev)) {
        if (activeIds.has(id)) next[id] = value
      }
      const changed = Object.keys(next).length !== Object.keys(prev).length
      return changed ? next : prev
    })

    for (const trip of activeItems) {
      const id = String(getTripId(trip))
      const origin = trip.origin
      const destination = trip.destination
      if (!id || !isPoint(origin) || !isPoint(destination)) continue

      const routeKey = `${asNumber(origin.lat)},${asNumber(origin.lng)}|${asNumber(destination.lat)},${asNumber(destination.lng)}`
      const cached = routeByTripId[id]
      if (cached?.key === routeKey) continue
      if (routeFetchInFlightRef.current.has(id)) continue

      routeFetchInFlightRef.current.add(id)
      api
        .post('/ride-sharing/maps/route-preview', {
          origin: { lat: asNumber(origin.lat), lng: asNumber(origin.lng) },
          destination: { lat: asNumber(destination.lat), lng: asNumber(destination.lng) },
        })
        .then(({ data }) => {
          const fromApi = parseGeometryToPositions(data?.data?.geometry)
          const fallback = normalizeFallbackRoute(origin, destination)
          setRouteByTripId((prev) => ({
            ...prev,
            [id]: {
              key: routeKey,
              positions: fromApi.length ? fromApi : fallback,
              source: fromApi.length ? 'osrm' : 'fallback',
            },
          }))
        })
        .catch(() => {
          setRouteByTripId((prev) => ({
            ...prev,
            [id]: {
              key: routeKey,
              positions: normalizeFallbackRoute(origin, destination),
              source: 'fallback',
            },
          }))
        })
        .finally(() => {
          routeFetchInFlightRef.current.delete(id)
        })
    }
  }, [activeItems, routeByTripId])

  const mapTrips = useMemo(() => {
    return activeItems.map((trip, idx) => {
      const id = String(getTripId(trip))
      const originTuple = toTuple(trip.origin)
      const destinationTuple = toTuple(trip.destination)
      const currentTuple = toTuple(trip.currentLocation)
      const cachedRoute = routeByTripId[id]
      const fallbackRoute = normalizeFallbackRoute(trip.origin, trip.destination)
      const routePositions = cachedRoute?.positions?.length ? cachedRoute.positions : fallbackRoute

      return {
        id,
        shortId: shortId(id),
        status: trip.status,
        color: ROUTE_COLORS[idx % ROUTE_COLORS.length],
        originTuple,
        destinationTuple,
        currentTuple,
        routePositions,
        routeSource: cachedRoute?.source ?? 'fallback',
        riderName: personName(trip.riderId),
        passengerName: personName(trip.passengerId),
      }
    })
  }, [activeItems, routeByTripId])

  const fitPoints = useMemo(() => {
    return mapTrips
      .flatMap((trip) => {
        const points = []
        if (trip.originTuple) points.push({ lat: trip.originTuple[0], lng: trip.originTuple[1] })
        if (trip.destinationTuple) points.push({ lat: trip.destinationTuple[0], lng: trip.destinationTuple[1] })
        if (trip.currentTuple) points.push({ lat: trip.currentTuple[0], lng: trip.currentTuple[1] })
        return points
      })
      .filter((p) => isPoint(p))
  }, [mapTrips])

  const osrmRouteCount = useMemo(
    () => mapTrips.filter((t) => t.routeSource === 'osrm').length,
    [mapTrips]
  )

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold">Live Trip Monitoring</h1>
        <p className="mt-2 text-slate-400">
          Big live map with all ongoing rides, current positions, and route paths.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200">
                Live rides: {activeItems.length}
              </span>
              <span className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200">
                Route matched: {osrmRouteCount}/{activeItems.length}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFitVersion((v) => v + 1)}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
              >
                Fit All Rides
              </button>
              <button
                type="button"
                onClick={load}
                className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
              >
                Refresh
              </button>
            </div>
          </div>

          <MapContainer
            center={[6.9271, 79.8612]}
            zoom={13}
            scrollWheelZoom
            style={{ height: 620, width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFitToTrips points={fitPoints} fitVersion={fitVersion} />

            {mapTrips.map((trip) => (
              <div key={`trip-${trip.id}`}>
                {trip.routePositions.length >= 2 ? (
                  <Polyline
                    positions={trip.routePositions}
                    pathOptions={{ color: trip.color, weight: 4, opacity: 0.72 }}
                  />
                ) : null}

                {trip.originTuple && trip.currentTuple ? (
                  <Polyline
                    positions={[trip.originTuple, trip.currentTuple]}
                    pathOptions={{ color: '#876DFF', weight: 4, opacity: 0.95 }}
                  />
                ) : null}

                {trip.originTuple ? (
                  <CircleMarker
                    center={trip.originTuple}
                    radius={4}
                    pathOptions={{ color: '#BAF91A', fillColor: '#BAF91A', fillOpacity: 0.95 }}
                  >
                    <Tooltip direction="top">Pickup</Tooltip>
                  </CircleMarker>
                ) : null}

                {trip.destinationTuple ? (
                  <CircleMarker
                    center={trip.destinationTuple}
                    radius={4}
                    pathOptions={{ color: '#876DFF', fillColor: '#876DFF', fillOpacity: 0.95 }}
                  >
                    <Tooltip direction="top">Destination</Tooltip>
                  </CircleMarker>
                ) : null}

                {trip.currentTuple ? (
                  <CircleMarker
                    center={trip.currentTuple}
                    radius={8}
                    pathOptions={{ color: '#101312', fillColor: '#E2FF99', fillOpacity: 1, weight: 2 }}
                  >
                    <Tooltip direction="top">{`Trip ${trip.shortId}`}</Tooltip>
                    <Popup>
                      <div className="space-y-1 text-sm">
                        <div><strong>Trip:</strong> {trip.shortId}</div>
                        <div><strong>Status:</strong> {trip.status}</div>
                        <div><strong>Rider:</strong> {trip.riderName}</div>
                        <div><strong>Passenger:</strong> {trip.passengerName}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ) : null}
              </div>
            ))}
          </MapContainer>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950">
              <tr className="text-slate-300">
                <th className="p-3">Trip</th>
                <th className="p-3">Rider</th>
                <th className="p-3">Passenger</th>
                <th className="p-3">Started</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Route</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/30">
              {loading ? (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : activeItems.length ? (
                activeItems.map((t) => {
                  const id = String(getTripId(t))
                  const rider = t.riderId
                  const passenger = t.passengerId
                  return (
                    <tr key={id} className="border-t border-slate-800">
                      <td className="p-3 text-slate-100 font-mono text-xs">{shortId(id)}</td>
                      <td className="p-3 text-slate-300">
                        <div>{personName(rider)}</div>
                        <div className="font-mono text-xs text-slate-500">{shortId(personId(rider))}</div>
                      </td>
                      <td className="p-3 text-slate-300">
                        <div>{personName(passenger)}</div>
                        <div className="font-mono text-xs text-slate-500">{shortId(personId(passenger))}</div>
                      </td>
                      <td className="p-3 text-slate-300">{formatDateTime(t.startedAt)}</td>
                      <td className="p-3 text-slate-300">{formatDateTime(t.bufferedDeadlineAt)}</td>
                      <td className="p-3 text-slate-300">{formatLocation(t.currentLocation)}</td>
                      <td className="p-3 text-slate-300">{t.status}</td>
                      <td className="p-3 text-slate-300">{routeByTripId[id]?.source === 'osrm' ? 'OSRM' : 'Direct'}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={8}>
                    No active trips
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}


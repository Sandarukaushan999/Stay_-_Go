import L from 'leaflet'
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'

import bikeUrl from '../../ride_and_sharing_system/assets/bike.png'
import locationUrl from '../../ride_and_sharing_system/assets/location.png'
import uniUrl from '../../ride_and_sharing_system/assets/uni.png'

const ICON_PX = 42
const DEFAULT_ROUTE_COLOR = '#876DFF'
const DEFAULT_MARKER_COLOR = '#BAF91A'

function makeRideIcon(url) {
  if (!url) return null
  return new L.Icon({
    iconUrl: url,
    iconSize: [ICON_PX, ICON_PX],
    iconAnchor: [ICON_PX / 2, ICON_PX],
    popupAnchor: [0, -ICON_PX],
  })
}

const RIDE_MAP_ICONS = Object.fromEntries(
  Object.entries({
    rider: makeRideIcon(bikeUrl),
    pickup: makeRideIcon(locationUrl),
    uni: makeRideIcon(uniUrl),
  }).filter(([, icon]) => icon != null)
)

function ClickHandler({ value, onChange, readonly, valueIconKind }) {
  useMapEvents({
    click(e) {
      if (readonly) return
      onChange?.({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  if (!value) return null
  const rideIcon = valueIconKind ? RIDE_MAP_ICONS[valueIconKind] : null
  if (rideIcon) {
    return <Marker position={[value.lat, value.lng]} icon={rideIcon} />
  }
  return (
    <CircleMarker
      center={[value.lat, value.lng]}
      radius={10}
      pathOptions={{
        color: DEFAULT_MARKER_COLOR,
        fillColor: DEFAULT_MARKER_COLOR,
        fillOpacity: 0.9,
      }}
    />
  )
}

export default function MapPicker({
  value,
  onChange,
  readonly = false,
  polyline = null,
  polylines = null,
  markers = null,
  /** When set, the primary `value` marker uses ride-sharing artwork (rider / pickup / uni). */
  valueIconKind = null,
  height = 320,
  center = { lat: 6.9271, lng: 79.8612 },
  zoom = 13,
}) {
  const c = value ?? center
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300">
      <MapContainer
        center={[c.lat, c.lng]}
        zoom={zoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Array.isArray(polylines) && polylines.length
          ? polylines
              .filter((p) => Array.isArray(p?.positions) && p.positions.length)
              .map((p, idx) => (
                <Polyline
                  key={idx}
                  positions={p.positions}
                  pathOptions={{
                    color: p.color ?? DEFAULT_ROUTE_COLOR,
                    weight: p.weight ?? 5,
                    opacity: p.opacity ?? 0.9,
                  }}
                />
              ))
          : Array.isArray(polyline) && polyline.length
            ? <Polyline positions={polyline} />
            : null}
        {Array.isArray(markers) && markers.length
          ? markers
              .filter((m) => typeof m?.lat === 'number' && typeof m?.lng === 'number')
              .map((m, idx) => {
                const rideIcon = m.iconKind ? RIDE_MAP_ICONS[m.iconKind] : null
                if (rideIcon) {
                  return (
                    <Marker key={idx} position={[m.lat, m.lng]} icon={rideIcon}>
                      {m.label ? (
                        <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent>
                          {m.label}
                        </Tooltip>
                      ) : null}
                    </Marker>
                  )
                }
                return (
                  <CircleMarker
                    key={idx}
                    center={[m.lat, m.lng]}
                    radius={m.radius ?? 8}
                    pathOptions={{
                      color: m.color ?? DEFAULT_MARKER_COLOR,
                      fillColor: m.fillColor ?? m.color ?? DEFAULT_MARKER_COLOR,
                      fillOpacity: 0.9,
                    }}
                  >
                    {m.label ? (
                      <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent>
                        {m.label}
                      </Tooltip>
                    ) : null}
                  </CircleMarker>
                )
              })
          : null}
        <ClickHandler value={value} onChange={onChange} readonly={readonly} valueIconKind={valueIconKind} />
      </MapContainer>
    </div>
  )
}

import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet'

function ClickHandler({ value, onChange, readonly }) {
  useMapEvents({
    click(e) {
      if (readonly) return
      onChange?.({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  return value ? <Marker position={[value.lat, value.lng]} /> : null
}

export default function MapPicker({
  value,
  onChange,
  readonly = false,
  polyline = null,
  height = 320,
  center = { lat: 6.9271, lng: 79.8612 },
  zoom = 13,
}) {
  const c = value ?? center
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
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
        {Array.isArray(polyline) && polyline.length ? <Polyline positions={polyline} /> : null}
        <ClickHandler value={value} onChange={onChange} readonly={readonly} />
      </MapContainer>
    </div>
  )
}


import { asyncHandler } from '../../../common/utils/asyncHandler.js'
import { env } from '../../../config/env.js'

export const routePreview = asyncHandler(async (req, res) => {
  const { origin, destination } = req.body
  const url = `${env.OSRM_BASE_URL}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
  const r = await fetch(url, { headers: { 'user-agent': 'stay-go-dev' } })
  if (!r.ok) {
    return res.status(502).json({ success: false, message: 'OSRM route failed' })
  }
  const data = await r.json()
  const route = data?.routes?.[0]
  res.json({
    success: true,
    data: {
      distanceMeters: route?.distance ?? null,
      expectedDurationSeconds: route?.duration ?? null,
      geometry: route?.geometry ?? null,
    },
  })
})

export const reverseGeocode = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query
  const url = `${env.NOMINATIM_BASE_URL}/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lng)}`
  const r = await fetch(url, { headers: { 'user-agent': 'stay-go-dev' } })
  if (!r.ok) {
    return res.status(502).json({ success: false, message: 'Nominatim reverse geocode failed' })
  }
  const data = await r.json()
  res.json({ success: true, data })
})


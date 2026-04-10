import dotenv from 'dotenv'

dotenv.config()

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 5000),
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  CLIENT_URLS: (process.env.CLIENT_URLS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  MONGO_URI: required('MONGO_URI'),
  MONGO_FALLBACK_URI: process.env.MONGO_FALLBACK_URI ?? null,
  JWT_SECRET: required('JWT_SECRET'),
  JWT_TTL: process.env.JWT_TTL ?? '7d',
  PUBLIC_REGISTER: process.env.PUBLIC_REGISTER === 'true',
  PUBLIC_REGISTER_ROLES: (process.env.PUBLIC_REGISTER_ROLES ?? 'student')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
  OSRM_BASE_URL: process.env.OSRM_BASE_URL ?? 'https://router.project-osrm.org',
  NOMINATIM_BASE_URL:
    process.env.NOMINATIM_BASE_URL ?? 'https://nominatim.openstreetmap.org',
  SAFETY_CHECKIN_GRACE_MINUTES: Number(process.env.SAFETY_CHECKIN_GRACE_MINUTES ?? 5),
  TRIP_OVERDUE_BUFFER_MINUTES: Number(process.env.TRIP_OVERDUE_BUFFER_MINUTES ?? 10),
}


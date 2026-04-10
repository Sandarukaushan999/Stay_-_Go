import { z } from 'zod'
import { ROLE_VALUES } from '../../common/constants/roles.js'

const latLngSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
})

/** Normalize to 10-digit local mobile (0XXXXXXXXX). */
function normalizeSriLankaMobile(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  const d = raw.replace(/\D/g, '')
  if (d.length === 10 && /^0[1-9]\d{8}$/.test(d)) return d
  if (d.length === 11 && d.startsWith('94')) return `0${d.slice(2)}`
  if (d.length === 9 && /^7\d{8}$/.test(d)) return `0${d}`
  return null
}

function normalizeEmergencyContact(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  const mobile = normalizeSriLankaMobile(input)
  if (mobile) return mobile
  const d = raw.replace(/\D/g, '')
  if (d.length >= 3 && d.length <= 5 && /^\d+$/.test(d)) return d
  return null
}

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
    email: z.string().trim().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(ROLE_VALUES).optional(),

    phone: z.string().optional(),
    studentId: z.string().optional(),
    campusId: z.string().optional(),
    emergencyContact: z.string().optional(),

    hasVehicle: z.boolean().optional(),
    vehicleType: z.enum(['bike', 'car', 'van']).optional(),
    vehicleNumber: z.string().optional(),
    seatCount: z.number().optional(),

    /** JSON often sends explicit `null`; `.optional()` alone rejects null. */
    residenceLocation: latLngSchema.nullish(),
    vehicleOriginLocation: latLngSchema.nullish(),
  })
  .superRefine((data, ctx) => {
    const role = data.role ?? 'student'

    if (data.studentId != null && String(data.studentId).trim()) {
      const s = String(data.studentId).trim()
      if (s.length < 2 || s.length > 64) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Student ID must be 2–64 characters',
          path: ['studentId'],
        })
      }
    }

    if (role === 'student') {
      const campus = data.campusId?.trim()
      if (!campus) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Campus ID is required for students',
          path: ['campusId'],
        })
      } else if (campus.length < 2 || campus.length > 64) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Campus ID must be 2–64 characters',
          path: ['campusId'],
        })
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(campus)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Use letters, numbers, and single hyphens (e.g. uoc-main)',
          path: ['campusId'],
        })
      }

      if (!normalizeSriLankaMobile(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid 10-digit mobile (e.g. 0771234567 or +94771234567)',
          path: ['phone'],
        })
      }

      if (data.emergencyContact != null && String(data.emergencyContact).trim()) {
        if (!normalizeEmergencyContact(data.emergencyContact)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Use a 10-digit mobile or a 3–5 digit hotline (e.g. 117)',
            path: ['emergencyContact'],
          })
        }
      }

      if (data.hasVehicle) {
        const vn = String(data.vehicleNumber ?? '').replace(/\D/g, '')
        if (!vn || vn.length < 4 || vn.length > 12) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Vehicle number must be 4–12 digits only (no letters or symbols)',
            path: ['vehicleNumber'],
          })
        }
      }
    } else if (data.phone != null && String(data.phone).trim()) {
      if (!normalizeSriLankaMobile(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid phone number',
          path: ['phone'],
        })
      }
    }
  })
  .transform((data) => {
    const role = data.role ?? 'student'
    const out = { ...data }

    if (role === 'student') {
      const p = normalizeSriLankaMobile(data.phone)
      if (p) out.phone = p
      if (data.emergencyContact != null && String(data.emergencyContact).trim()) {
        const ec = normalizeEmergencyContact(data.emergencyContact)
        if (ec) out.emergencyContact = ec
      } else {
        out.emergencyContact = undefined
      }
      if (data.campusId != null) out.campusId = String(data.campusId).trim().toLowerCase()
    } else if (data.phone != null && String(data.phone).trim()) {
      const p = normalizeSriLankaMobile(data.phone)
      if (p) out.phone = p
    } else {
      out.phone = undefined
    }

    if (data.hasVehicle && data.vehicleNumber != null) {
      const vn = String(data.vehicleNumber).replace(/\D/g, '')
      out.vehicleNumber = vn || undefined
    }

    if (data.studentId != null && String(data.studentId).trim()) {
      out.studentId = String(data.studentId).trim()
    } else {
      out.studentId = undefined
    }

    return out
  })

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})


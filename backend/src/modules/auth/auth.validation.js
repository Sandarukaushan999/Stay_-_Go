import { z } from 'zod'
import { ROLE_VALUES } from '../../common/constants/roles.js'

const latLngSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
})

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
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

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})


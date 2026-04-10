import { z } from 'zod'
import { ROLE_VALUES } from '../../common/constants/roles.js'

export const listUsersSchema = z.object({
  q: z.string().optional(),
  role: z.enum(ROLE_VALUES).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
})

export const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(ROLE_VALUES),
  phone: z.string().optional(),
  studentId: z.string().optional(),
  campusId: z.string().optional(),
  emergencyContact: z.string().optional(),

  hasVehicle: z.boolean().optional(),
  vehicleType: z.enum(['bike', 'car', 'van']).optional(),
  vehicleNumber: z.string().optional(),
  seatCount: z.number().optional(),

  residenceLocation: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
  vehicleOriginLocation: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
})

export const blockUserSchema = z.object({
  isBlocked: z.boolean(),
})

export const approveRiderSchema = z.object({
  approved: z.boolean().default(true),
})


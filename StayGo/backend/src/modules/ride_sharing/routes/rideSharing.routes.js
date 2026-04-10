import { Router } from 'express'
import { requireAuth } from '../../../common/middlewares/auth.middleware.js'
import { requireRole } from '../../../common/middlewares/role.middleware.js'
import { ROLES } from '../../../common/constants/roles.js'
import { validateBody } from '../../../common/middlewares/validate.middleware.js'
import { z } from 'zod'
import * as controller from '../controllers/trip.controller.js'
import * as rideController from '../controllers/ride.controller.js'
import * as profileController from '../controllers/profile.controller.js'
import * as mapController from '../controllers/map.controller.js'
import * as riderController from '../controllers/rider.controller.js'
import * as tripLifecycle from '../controllers/tripLifecycle.controller.js'

export const rideSharingRouter = Router()

const pointSchema = z.object({ lat: z.number(), lng: z.number() })

// Profile / rider application
rideSharingRouter.get('/profile/me', requireAuth, profileController.me)
rideSharingRouter.put(
  '/profile/me/availability',
  requireAuth,
  requireRole(ROLES.RIDER),
  validateBody(z.object({ availability: z.enum(['online', 'offline']) })),
  profileController.updateAvailability
)
rideSharingRouter.put(
  '/profile/me/location',
  requireAuth,
  requireRole(ROLES.RIDER),
  validateBody(z.object({ lat: z.number(), lng: z.number() })),
  profileController.updateLocation
)
rideSharingRouter.post(
  '/rider/apply',
  requireAuth,
  requireRole(ROLES.STUDENT),
  validateBody(
    z.object({
      vehicleNumber: z.string().min(1),
      vehicleType: z.string().min(1),
      seatCount: z.number().min(1).max(10),
    })
  ),
  profileController.applyForRider
)

// Maps
rideSharingRouter.post(
  '/maps/route-preview',
  requireAuth,
  validateBody(z.object({ origin: pointSchema, destination: pointSchema })),
  mapController.routePreview
)
rideSharingRouter.get(
  '/maps/reverse-geocode',
  requireAuth,
  mapController.reverseGeocode
)

// Passenger flows
rideSharingRouter.post(
  '/rides/request',
  requireAuth,
  requireRole(ROLES.STUDENT, ROLES.RIDER, ROLES.TECHNICIAN),
  validateBody(
    z.object({
      campusId: z.string().optional(),
      origin: pointSchema,
      destination: pointSchema,
      seatCount: z.number().optional(),
      femaleOnly: z.boolean().optional(),
    })
  ),
  rideController.requestRide
)

rideSharingRouter.get(
  '/rides/nearby-riders',
  requireAuth,
  requireRole(ROLES.STUDENT, ROLES.RIDER, ROLES.TECHNICIAN),
  rideController.nearbyRiders
)

rideSharingRouter.get(
  '/rides/my-requests',
  requireAuth,
  requireRole(ROLES.STUDENT, ROLES.RIDER, ROLES.TECHNICIAN),
  rideController.myRequests
)

rideSharingRouter.get(
  '/rides/open-requests',
  requireAuth,
  requireRole(ROLES.RIDER),
  riderController.openRequests
)

// Rider flows
rideSharingRouter.post(
  '/rides/:id/accept',
  requireAuth,
  requireRole(ROLES.RIDER),
  rideController.acceptRide
)

rideSharingRouter.post(
  '/rides/:id/start',
  requireAuth,
  requireRole(ROLES.RIDER),
  rideController.startRide
)

rideSharingRouter.post(
  '/rides/:id/complete',
  requireAuth,
  requireRole(ROLES.RIDER),
  rideController.completeRide
)

rideSharingRouter.post(
  '/rides/:id/cancel',
  requireAuth,
  rideController.cancelRide
)

// Trip/SOS flows (used for monitoring + demo)
rideSharingRouter.post(
  '/trips/demo-start',
  requireAuth,
  requireRole(ROLES.RIDER),
  validateBody(
    z.object({
      passengerId: z.string(),
      origin: pointSchema,
      destination: pointSchema,
      expectedDurationSeconds: z.number().optional(),
    })
  ),
  controller.demoStartTrip
)

rideSharingRouter.post(
  '/trips/:id/location-update',
  requireAuth,
  requireRole(ROLES.RIDER),
  validateBody(z.object({ lat: z.number(), lng: z.number() })),
  controller.locationUpdate
)

rideSharingRouter.post(
  '/trips/:id/confirm-pickup',
  requireAuth,
  requireRole(ROLES.RIDER),
  tripLifecycle.confirmPickup
)

rideSharingRouter.post(
  '/trips/:id/finish',
  requireAuth,
  tripLifecycle.finishTrip
)

rideSharingRouter.post(
  '/trips/:id/sos',
  requireAuth,
  validateBody(
    z.object({
      message: z.string().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      location: pointSchema.optional(),
    })
  ),
  controller.sos
)


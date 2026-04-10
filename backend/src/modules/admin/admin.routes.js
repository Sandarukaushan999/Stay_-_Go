import { Router } from 'express'
import * as controller from './admin.controller.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'
import { requireRole } from '../../common/middlewares/role.middleware.js'
import { validateBody } from '../../common/middlewares/validate.middleware.js'
import { ROLES } from '../../common/constants/roles.js'
import { approveRiderSchema, blockUserSchema, createUserSchema } from './admin.validation.js'
import * as rideAdminController from './rideAdmin.controller.js'
import * as safetyController from './safety.controller.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN))

adminRouter.get('/dashboard', controller.dashboard)
adminRouter.get('/users', controller.listUsers)
adminRouter.post('/users', validateBody(createUserSchema), controller.createUser)
adminRouter.patch('/users/:id/block', validateBody(blockUserSchema), controller.setBlocked)
adminRouter.get('/riders/pending', controller.pendingRiders)
adminRouter.patch('/riders/:id/approve', validateBody(approveRiderSchema), controller.approveRider)
adminRouter.get('/trips/active', controller.activeTrips)
adminRouter.get('/trips/overdue', controller.overdueTrips)
adminRouter.get('/sos', controller.listSos)
adminRouter.patch('/sos/:id/acknowledge', controller.acknowledgeSos)
adminRouter.patch('/sos/:id/resolve', controller.resolveSos)

// Ride sharing workspace (admin monitoring)
adminRouter.get('/rides/dashboard', rideAdminController.rideDashboard)
adminRouter.get('/rides/requests', rideAdminController.rideRequests)
adminRouter.patch('/rides/requests/:id/cancel', rideAdminController.cancelRideRequest)
adminRouter.delete('/rides/requests/:id', rideAdminController.deleteRideRequest)
adminRouter.get('/riders/active', rideAdminController.activeRiders)
adminRouter.get('/safety/alerts', safetyController.safetyAlerts)

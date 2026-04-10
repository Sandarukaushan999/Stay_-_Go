import { Router } from 'express'
import * as controller from './admin.controller.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'
import { requireRole } from '../../common/middlewares/role.middleware.js'
import { validateBody, validateQuery } from '../../common/middlewares/validate.middleware.js'
import { ROLES } from '../../common/constants/roles.js'
import {
  approveRiderSchema,
  blockUserSchema,
  createUserSchema,
  rideDashboardQuerySchema,
  setRoleSchema,
} from './admin.validation.js'
import * as rideAdminController from './rideAdmin.controller.js'
import * as safetyController from './safety.controller.js'
import * as roommateController from './roommateAdmin.controller.js'
import * as userController from '../users/user.controller.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN))

adminRouter.get('/dashboard', controller.dashboard)
adminRouter.get('/users', controller.listUsers)
adminRouter.post('/users', validateBody(createUserSchema), controller.createUser)
adminRouter.patch('/users/:id/block', validateBody(blockUserSchema), controller.setBlocked)
adminRouter.patch('/users/:id/role', validateBody(setRoleSchema), controller.setRole)
adminRouter.get('/riders/pending', controller.pendingRiders)
adminRouter.patch('/riders/:id/approve', validateBody(approveRiderSchema), controller.approveRider)
adminRouter.get('/trips/active', controller.activeTrips)
adminRouter.get('/trips/overdue', controller.overdueTrips)
adminRouter.get('/sos', controller.listSos)
adminRouter.patch('/sos/:id/acknowledge', controller.acknowledgeSos)
adminRouter.patch('/sos/:id/resolve', controller.resolveSos)

// Ride sharing workspace (admin monitoring)
adminRouter.get('/rides/dashboard', validateQuery(rideDashboardQuerySchema), rideAdminController.rideDashboard)
adminRouter.get('/rides/requests', rideAdminController.rideRequests)
adminRouter.patch('/rides/requests/:id/cancel', rideAdminController.cancelRideRequest)
adminRouter.delete('/rides/requests/:id', rideAdminController.deleteRideRequest)
adminRouter.get('/riders/active', rideAdminController.activeRiders)
adminRouter.get('/safety/alerts', safetyController.safetyAlerts)

// Roommate workspace (admin monitoring)
adminRouter.get('/roommate/dashboard', roommateController.dashboardAnalytics)
adminRouter.get('/roommate/profiles', roommateController.listMatchProfiles)
adminRouter.get('/roommate/requests', roommateController.listMatchRequests)
adminRouter.post('/roommate/unmatch/:matchId', roommateController.unmatchUsers)

// Admin profile and logs
adminRouter.get('/profile', userController.getMyAccountProfile)
adminRouter.put('/profile', userController.updateMyAccountProfile)
adminRouter.put('/change-password', userController.changePassword)
adminRouter.get('/logs', userController.getAdminLogs)

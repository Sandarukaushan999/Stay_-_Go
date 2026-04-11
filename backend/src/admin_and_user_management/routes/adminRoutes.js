import { Router } from 'express'
import * as adminController from '../controllers/adminController.js'
import * as rideAdminController from '../controllers/rideAdminController.js'
import * as safetyController from '../controllers/safetyController.js'
import * as adminRoommateController from '../controllers/adminRoommateController.js'
import * as analyticsController from '../controllers/analyticsController.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'

export const adminRouter = Router()

adminRouter.use(requireAuth)

adminRouter.get('/analytics', analyticsController.getAnalytics)
adminRouter.get('/dashboard', adminController.dashboard)
adminRouter.get('/users', adminController.listUsers)
adminRouter.post('/users', adminController.createUser)
adminRouter.patch('/users/:id/block', adminController.setBlocked)
adminRouter.patch('/users/:id/role', adminController.setRole)
adminRouter.get('/riders/pending', adminController.pendingRiders)
adminRouter.patch('/riders/:id/approve', adminController.approveRider)
adminRouter.get('/trips/active', adminController.activeTrips)
adminRouter.get('/trips/overdue', adminController.overdueTrips)
adminRouter.get('/sos', adminController.listSos)
adminRouter.patch('/sos/:id/acknowledge', adminController.acknowledgeSos)
adminRouter.patch('/sos/:id/resolve', adminController.resolveSos)

// Ride sharing workspace (admin monitoring)
adminRouter.get('/rides/requests', rideAdminController.rideRequests)
adminRouter.get('/riders/active', rideAdminController.activeRiders)
adminRouter.get('/safety/alerts', safetyController.safetyAlerts)

// Roommate workspace
adminRouter.get('/roommate/dashboard', adminRoommateController.dashboardAnalytics)
adminRouter.get('/roommate/profiles', adminRoommateController.listMatchProfiles)
adminRouter.get('/roommate/requests', adminRoommateController.listMatchRequests)
adminRouter.post('/roommate/unmatch/:matchId', adminRoommateController.unmatchUsers)

// Admin Profile & System Logging
import * as userController from '../controllers/userController.js'
adminRouter.get('/profile', userController.getMyAccountProfile)
adminRouter.put('/profile', userController.updateMyAccountProfile)
adminRouter.put('/change-password', userController.changePassword)
adminRouter.get('/logs', userController.getAdminLogs)

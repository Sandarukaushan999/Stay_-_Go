import { Router } from 'express'
import * as technicianController from './technician.controller.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'
import { requireRole } from '../../common/middlewares/role.middleware.js'
import { ROLES } from '../../common/constants/roles.js'

export const technicianRouter = Router()

// Protect entire route boundary exclusively for technicians
technicianRouter.use(requireAuth, requireRole(ROLES.TECHNICIAN))

// Performance
technicianRouter.get('/performance', technicianController.getPerformance)

// Jobs
technicianRouter.get('/jobs', technicianController.getJobs)
technicianRouter.patch('/jobs/:id/claim', technicianController.claimJob)
technicianRouter.patch('/jobs/:id/complete', technicianController.completeJob)

// Availability System
technicianRouter.get('/availability', technicianController.getAvailability)
technicianRouter.post('/availability', technicianController.setAvailability)

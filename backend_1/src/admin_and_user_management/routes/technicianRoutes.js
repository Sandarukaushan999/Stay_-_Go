import { Router } from 'express'
import * as technicianController from '../controllers/technicianController.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'
import { requireRole } from '../../common/middlewares/role.middleware.js'

export const technicianRouter = Router()

// Protect entire route boundary exclusively for technicians
technicianRouter.use(requireAuth, requireRole('technician'))

// Performance
technicianRouter.get('/performance', technicianController.getPerformance)

// Jobs
technicianRouter.get('/jobs', technicianController.getJobs)
technicianRouter.patch('/jobs/:id/claim', technicianController.claimJob)
technicianRouter.patch('/jobs/:id/complete', technicianController.completeJob)

// Availability System
technicianRouter.get('/availability', technicianController.getAvailability)
technicianRouter.post('/availability', technicianController.setAvailability)

import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import * as technicianController from './technician.controller.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'
import { requireRole } from '../../common/middlewares/role.middleware.js'
import { ROLES } from '../../common/constants/roles.js'
import { ApiError } from '../../common/utils/ApiError.js'
import { env } from '../../config/env.js'

export const technicianRouter = Router()

// Verification documents: JPG / PNG / PDF, max 5 MB, stored in uploads/verification
const verificationDir = path.resolve(env.UPLOAD_DIR || 'uploads', 'verification')
fs.mkdirSync(verificationDir, { recursive: true })

const uploadDoc = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, verificationDir),
    filename: (req, file, cb) =>
      cb(null, `doc-${req.user.id}-${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype)
    cb(ok ? null : new ApiError(400, 'Only JPG, PNG or PDF files are allowed'), ok)
  },
})

// Protect entire route boundary exclusively for technicians
technicianRouter.use(requireAuth, requireRole(ROLES.TECHNICIAN))

// Performance
technicianRouter.get('/performance', technicianController.getPerformance)

// Jobs
technicianRouter.get('/jobs', technicianController.getJobs)
technicianRouter.patch('/jobs/:id/claim', technicianController.claimJob)
technicianRouter.patch('/jobs/:id/start', technicianController.startJob)
technicianRouter.patch('/jobs/:id/complete', technicianController.completeJob)

// Availability
technicianRouter.get('/availability', technicianController.getAvailability)
technicianRouter.post('/availability', technicianController.setAvailability)
technicianRouter.put('/availability/bulk', technicianController.setAvailabilityBulk)
technicianRouter.patch('/status', technicianController.setStatus)

// Documents & verification
technicianRouter.get('/verification', technicianController.getVerification)
technicianRouter.post('/verification/documents', uploadDoc.single('document'), technicianController.uploadVerificationDoc)
technicianRouter.delete('/verification/documents/:docId', technicianController.deleteVerificationDoc)
technicianRouter.post('/verification/submit', technicianController.submitVerification)

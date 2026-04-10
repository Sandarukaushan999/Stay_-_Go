import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { requireAuth } from '../../../common/middlewares/auth.middleware.js'
import { requireRole } from '../../../common/middlewares/role.middleware.js'
import { validateBody } from '../../../common/middlewares/validate.middleware.js'
import { ROLES } from '../../../common/constants/roles.js'
import * as ticketCtrl from '../controllers/ticket.controller.js'
import * as announcementCtrl from '../controllers/announcement.controller.js'
import {
  createTicketSchema,
  assignTicketSchema,
  rejectTicketSchema,
  resolveTicketSchema,
  rateTicketSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '../maintenance.validation.js'

// ============================================
// FILE UPLOAD SETUP using multer
// Saves uploaded ticket attachment images to uploads/maintenance
// ============================================

const uploadDir = path.resolve('uploads/maintenance')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir)
  },
  // Create a unique filename to avoid overwriting
  filename(req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueName + path.extname(file.originalname))
  },
})

// Only allow JPG/PNG, max 5MB per file
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/
    const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimeOk = allowedTypes.test(file.mimetype)
    if (extOk && mimeOk) {
      cb(null, true)
    } else {
      cb(new Error('Only JPG and PNG images are allowed'))
    }
  },
})

// ============================================
// ROUTES
// ============================================

export const maintenanceRouter = Router()

// ---------- TICKET ROUTES ----------
// All routes under /api/maintenance/tickets

// Student submits a new ticket (max 3 file attachments)
maintenanceRouter.post(
  '/tickets',
  requireAuth,
  upload.array('attachments', 3),
  validateBody(createTicketSchema),
  ticketCtrl.createTicket
)

// Student gets their own tickets
maintenanceRouter.get('/tickets/my', requireAuth, ticketCtrl.getMyTickets)

// Technician gets tickets assigned to them
maintenanceRouter.get(
  '/tickets/assigned',
  requireAuth,
  requireRole(ROLES.TECHNICIAN),
  ticketCtrl.getAssignedTickets
)

// Admin gets analytics data for charts
maintenanceRouter.get(
  '/tickets/analytics',
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ticketCtrl.getAnalytics
)

// Admin gets list of technicians (for the assign dropdown)
maintenanceRouter.get(
  '/tickets/technicians',
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ticketCtrl.getTechnicians
)

// Admin gets all tickets (with optional query filters)
maintenanceRouter.get(
  '/tickets',
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ticketCtrl.getAllTickets
)

// Any authenticated user gets a single ticket detail
maintenanceRouter.get('/tickets/:id', requireAuth, ticketCtrl.getTicketById)

// Admin assigns a technician
maintenanceRouter.patch(
  '/tickets/:id/assign',
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validateBody(assignTicketSchema),
  ticketCtrl.assignTicket
)

// Admin rejects a ticket
maintenanceRouter.patch(
  '/tickets/:id/reject',
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validateBody(rejectTicketSchema),
  ticketCtrl.rejectTicket
)

// Technician starts work
maintenanceRouter.patch(
  '/tickets/:id/start',
  requireAuth,
  requireRole(ROLES.TECHNICIAN),
  ticketCtrl.startTicket
)

// Technician marks resolved
maintenanceRouter.patch(
  '/tickets/:id/resolve',
  requireAuth,
  requireRole(ROLES.TECHNICIAN),
  validateBody(resolveTicketSchema),
  ticketCtrl.resolveTicket
)

// Student rates and closes ticket
maintenanceRouter.patch(
  '/tickets/:id/rate',
  requireAuth,
  validateBody(rateTicketSchema),
  ticketCtrl.rateTicket
)

// ---------- ANNOUNCEMENT ROUTES ----------
// All routes under /api/maintenance/announcements

// All authenticated users get active announcements
maintenanceRouter.get('/announcements', requireAuth, announcementCtrl.getActiveAnnouncements)

// Admin gets all announcements (including hidden)
maintenanceRouter.get(
  '/announcements/all',
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  announcementCtrl.getAllAnnouncements
)

// Admin creates a new announcement
maintenanceRouter.post(
  '/announcements',
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validateBody(createAnnouncementSchema),
  announcementCtrl.createAnnouncement
)

// Admin updates an announcement
maintenanceRouter.put(
  '/announcements/:id',
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validateBody(updateAnnouncementSchema),
  announcementCtrl.updateAnnouncement
)

// Admin deletes an announcement
maintenanceRouter.delete(
  '/announcements/:id',
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  announcementCtrl.deleteAnnouncement
)

// Admin toggles announcement visibility
maintenanceRouter.patch(
  '/announcements/:id/toggle',
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  announcementCtrl.toggleAnnouncement
)

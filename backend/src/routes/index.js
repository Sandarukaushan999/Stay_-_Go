import { Router } from 'express'

// ── Core auth & user management (admin_and_user_management module) ──────────
import { authRouter }       from '../admin_and_user_management/routes/authRoutes.js'
import { adminRouter }      from '../admin_and_user_management/routes/adminRoutes.js'
import { userRouter }       from '../admin_and_user_management/routes/userRoutes.js'
import { technicianRouter } from '../admin_and_user_management/routes/technicianRoutes.js'
import { twoFactorRouter }  from '../admin_and_user_management/routes/twoFactorRoutes.js'

// ── Ride sharing ────────────────────────────────────────────────────────────
import { rideSharingRouter } from '../modules/ride_sharing/routes/rideSharing.routes.js'

// ── Maintenance ──────────────────────────────────────────────────────────────
import { maintenanceRouter } from '../modules/maintenance/routes/maintenance.routes.js'

// ── Roommate Matching ────────────────────────────────────────────────────────
import { studentRouter }      from '../roommate/routes/studentRoutes.js'
import { preferenceRouter }   from '../roommate/routes/roomPreferenceRoutes.js'
import { matchingRouter }     from '../roommate/routes/matchingRoutes.js'
import { issueRouter }        from '../roommate/routes/issueRoutes.js'
import { roomRouter }         from '../roommate/routes/roomRoutes.js'
import { notificationRouter } from '../roommate/routes/roommateNotificationRoutes.js'

// ── Dev / Seed (remove before production) ───────────────────────────────────
import { seedRouter } from './seedRoutes.js'

export const apiRouter = Router()

apiRouter.get('/health', (req, res) => {
  res.json({ success: true, name: 'Stay & Go API', time: new Date().toISOString() })
})

// Auth & users
apiRouter.use('/auth',       authRouter)
apiRouter.use('/2fa',        twoFactorRouter)
apiRouter.use('/admin',      adminRouter)
apiRouter.use('/users',      userRouter)
apiRouter.use('/technician', technicianRouter)

// Ride sharing
apiRouter.use('/ride-sharing', rideSharingRouter)

// Maintenance
apiRouter.use('/maintenance', maintenanceRouter)

// Roommate module
apiRouter.use('/roommate/students',      studentRouter)
apiRouter.use('/roommate/preferences',   preferenceRouter)
apiRouter.use('/roommate/matching',      matchingRouter)
apiRouter.use('/roommate/issues',        issueRouter)
apiRouter.use('/roommate/rooms',         roomRouter)
apiRouter.use('/roommate/notifications', notificationRouter)

// Seed (dev only)
apiRouter.use('/seed', seedRouter)

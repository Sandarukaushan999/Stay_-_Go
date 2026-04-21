import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.routes.js'
import { googleAuthRouter } from '../modules/google_auth/googleAuth.routes.js'
import { adminRouter } from '../modules/admin/admin.routes.js'
import { rideSharingRouter } from '../modules/ride_sharing/routes/rideSharing.routes.js'
import { maintenanceRouter } from '../modules/maintenance/routes/maintenance.routes.js'
import { userRouter } from '../modules/users/user.routes.js'
import { technicianRouter } from '../modules/technician/technician.routes.js'
import { twoFactorRouter } from '../modules/two_factor/twoFactor.routes.js'
import { studentRouter } from '../roommate/routes/studentRoutes.js'
import { preferenceRouter } from '../roommate/routes/roomPreferenceRoutes.js'
import { matchingRouter } from '../roommate/routes/matchingRoutes.js'
import { issueRouter } from '../roommate/routes/issueRoutes.js'
import { roomRouter } from '../roommate/routes/roomRoutes.js'
import { notificationRouter } from '../roommate/routes/roommateNotificationRoutes.js'

export const apiRouter = Router()

apiRouter.get('/health', (req, res) => {
  res.json({ success: true, name: 'Stay & Go API', time: new Date().toISOString() })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/auth', googleAuthRouter)
apiRouter.use('/2fa', twoFactorRouter)
apiRouter.use('/admin', adminRouter)
apiRouter.use('/users', userRouter)
apiRouter.use('/ride-sharing', rideSharingRouter)
apiRouter.use('/maintenance', maintenanceRouter)
apiRouter.use('/technician', technicianRouter)

apiRouter.use('/roommate/students', studentRouter)
apiRouter.use('/roommate/preferences', preferenceRouter)
apiRouter.use('/roommate/matching', matchingRouter)
apiRouter.use('/roommate/issues', issueRouter)
apiRouter.use('/roommate/rooms', roomRouter)
apiRouter.use('/roommate/notifications', notificationRouter)


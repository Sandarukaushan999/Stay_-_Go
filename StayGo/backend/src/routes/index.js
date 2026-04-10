import { Router } from 'express'
import { authRouter } from '../admin_and_user_management/routes/authRoutes.js'
import { adminRouter } from '../admin_and_user_management/routes/adminRoutes.js'
import { userRouter } from '../admin_and_user_management/routes/userRoutes.js'
import { rideSharingRouter } from '../modules/ride_sharing/routes/rideSharing.routes.js'

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

import { technicianRouter } from '../admin_and_user_management/routes/technicianRoutes.js'

apiRouter.use('/auth', authRouter)
apiRouter.use('/admin', adminRouter)
apiRouter.use('/users', userRouter)
apiRouter.use('/ride-sharing', rideSharingRouter)
apiRouter.use('/technician', technicianRouter)

// Roommate Module routes
apiRouter.use('/roommate/students', studentRouter)
apiRouter.use('/roommate/preferences', preferenceRouter)
apiRouter.use('/roommate/matching', matchingRouter)
apiRouter.use('/roommate/issues', issueRouter)
apiRouter.use('/roommate/rooms', roomRouter)
apiRouter.use('/roommate/notifications', notificationRouter)


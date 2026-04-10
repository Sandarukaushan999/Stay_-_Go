import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.routes.js'
import { adminRouter } from '../modules/admin/admin.routes.js'
import { rideSharingRouter } from '../modules/ride_sharing/routes/rideSharing.routes.js'
import { maintenanceRouter } from '../modules/maintenance/routes/maintenance.routes.js'

export const apiRouter = Router()

apiRouter.get('/health', (req, res) => {
  res.json({ success: true, name: 'Stay & Go API', time: new Date().toISOString() })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/admin', adminRouter)
apiRouter.use('/ride-sharing', rideSharingRouter)
apiRouter.use('/maintenance', maintenanceRouter)


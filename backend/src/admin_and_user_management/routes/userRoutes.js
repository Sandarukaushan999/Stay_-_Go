import { Router } from 'express'
import * as userController from '../controllers/userController.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'

export const userRouter = Router()

userRouter.use(requireAuth)
userRouter.get('/dashboard-stats', userController.getMyDashboardStats)
userRouter.get('/profile/me', userController.getMyAccountProfile)
userRouter.put('/profile/me', userController.updateMyAccountProfile)

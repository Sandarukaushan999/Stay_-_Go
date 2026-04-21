import { Router } from 'express'
import * as userController from './user.controller.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'
import { uploadAvatar } from '../../common/middlewares/upload.middleware.js'

export const userRouter = Router()

userRouter.use(requireAuth)
userRouter.get('/dashboard-stats', userController.getMyDashboardStats)
userRouter.get('/profile/me', userController.getMyAccountProfile)
userRouter.put('/profile/me', userController.updateMyAccountProfile)
userRouter.post('/profile/image', uploadAvatar.single('avatar'), userController.uploadProfileImage)
userRouter.delete('/profile/image', userController.deleteProfileImage)
userRouter.put('/profile/password', userController.changePassword)

import { Router } from 'express'
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/roommateNotificationController.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'

export const notificationRouter = Router()

notificationRouter.use(requireAuth)

notificationRouter.get('/', getMyNotifications)
notificationRouter.patch('/read-all', markAllAsRead)
notificationRouter.patch('/:notificationId/read', markAsRead)

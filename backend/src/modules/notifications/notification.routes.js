import { Router } from 'express'
import mongoose from 'mongoose'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'
import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { ApiError } from '../../common/utils/ApiError.js'
import { Notification } from './notification.model.js'

export const notificationRouter = Router()

notificationRouter.use(requireAuth)

// GET /api/notifications?page=1&limit=30&unread=true
notificationRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30))
    const filter = { userId: req.user.id }
    if (req.query.unread === 'true') filter.isRead = false

    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ])
    res.json({ success: true, items, total, unreadCount, page })
  })
)

notificationRouter.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true })
    res.json({ success: true, message: 'All notifications marked as read' })
  })
)

notificationRouter.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid notification id')
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    )
    if (!n) throw new ApiError(404, 'Notification not found')
    res.json({ success: true, item: n })
  })
)

notificationRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid notification id')
    await Notification.deleteOne({ _id: req.params.id, userId: req.user.id })
    res.json({ success: true })
  })
)

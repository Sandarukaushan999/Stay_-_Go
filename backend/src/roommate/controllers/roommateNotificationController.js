import { RoommateNotification } from '../models/RoommateNotification.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { ApiError } from '../../common/utils/ApiError.js'

export const getMyNotifications = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) {
      return res.json({
        success: true,
        message: 'Notifications retrieved',
        data: { notifications: [], unreadCount: 0, total: 0, page: 1, pages: 0 },
      })
    }

    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 50))
    const skip = (page - 1) * limit

    const [notifications, total, unreadCount] = await Promise.all([
      RoommateNotification.find({ studentId: profile._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RoommateNotification.countDocuments({ studentId: profile._id }),
      RoommateNotification.countDocuments({ studentId: profile._id, isRead: false }),
    ])

    res.json({
      success: true,
      message: 'Notifications retrieved',
      data: {
        notifications,
        unreadCount,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    next(err)
  }
}

export const markAsRead = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) throw new ApiError(404, 'Profile not found')

    const notification = await RoommateNotification.findOne({
      _id: req.params.notificationId,
      studentId: profile._id,
    })

    if (!notification) throw new ApiError(404, 'Notification not found')

    notification.isRead = true
    await notification.save()

    res.json({ success: true, message: 'Notification marked as read', data: notification })
  } catch (err) {
    next(err)
  }
}

export const markAllAsRead = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) {
      return res.json({ success: true, message: 'All notifications marked as read', data: null })
    }

    await RoommateNotification.updateMany({ studentId: profile._id, isRead: false }, { isRead: true })

    res.json({ success: true, message: 'All notifications marked as read', data: null })
  } catch (err) {
    next(err)
  }
}

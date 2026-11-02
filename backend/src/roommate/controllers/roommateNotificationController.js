import { RoommateNotification } from '../models/RoommateNotification.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { ApiError } from '../../common/utils/ApiError.js'

export const getMyNotifications = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) {
      return res.json({
        success: true,
        data: { notifications: [], total: 0, unreadCount: 0, page: 1, pages: 0 },
      })
    }

    const { page = 1, limit = 50 } = req.query
    const skip = (page - 1) * limit

    const notifications = await RoommateNotification.find({ studentId: profile._id })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))

    const [total, unreadCount] = await Promise.all([
      RoommateNotification.countDocuments({ studentId: profile._id }),
      RoommateNotification.countDocuments({ studentId: profile._id, isRead: false }),
    ])

    res.json({
      success: true,
      message: 'Notifications retrieved',
      data: {
        notifications,
        total,
        unreadCount,
        page: Number(page),
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
    if (!profile) throw new ApiError(404, 'Profile not found')

    await RoommateNotification.updateMany({ studentId: profile._id, isRead: false }, { isRead: true })

    res.json({ success: true, message: 'All notifications marked as read', data: null })
  } catch (err) {
    next(err)
  }
}

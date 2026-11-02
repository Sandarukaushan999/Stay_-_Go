import mongoose from 'mongoose'

// In-app notification for any user (admin broadcasts, job assignments, verification results…).
// Roommate matching keeps its own student-profile notifications (RoommateNotification).
const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['system', 'announcement', 'job', 'complaint', 'verification'],
      default: 'system',
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 600 },
    priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
    link: { type: String, default: null }, // in-app route to open, e.g. /technician/jobs/assigned
    isRead: { type: Boolean, default: false, index: true },
    broadcastId: { type: mongoose.Schema.Types.ObjectId, ref: 'Broadcast', default: null },
  },
  { timestamps: true }
)
NotificationSchema.index({ userId: 1, createdAt: -1 })

export const Notification = mongoose.model('Notification', NotificationSchema)

// One record per admin broadcast (history shown on the admin Notifications page).
const BroadcastSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: { type: String, enum: ['all', 'student', 'rider', 'technician', 'admin'], required: true },
    priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
    recipientCount: { type: Number, default: 0 },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

export const Broadcast = mongoose.model('Broadcast', BroadcastSchema)

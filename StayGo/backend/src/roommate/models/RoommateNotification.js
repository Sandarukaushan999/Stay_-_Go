import mongoose from 'mongoose'
import { NOTIFICATION_TYPE } from '../constants/enums.js'

const notificationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(NOTIFICATION_TYPE),
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

notificationSchema.index({ studentId: 1, createdAt: -1 })

export const RoommateNotification = mongoose.model('RoommateNotification', notificationSchema)

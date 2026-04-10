import mongoose from 'mongoose'

// ============================================
// ANNOUNCEMENT MODEL
// Admin posts announcements about maintenance schedules,
// water cuts, power outages, or any hostel related updates
// All authenticated users can view active announcements
// ============================================

const announcementSchema = new mongoose.Schema(
  {
    // Title of the announcement
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      trim: true,
    },

    // Full content/body of the announcement
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [20, 'Content must be at least 20 characters'],
      maxlength: [500, 'Content cannot exceed 500 characters'],
      trim: true,
    },

    // How important is this announcement
    // urgent = red styling, important = yellow, normal = default
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent'],
      default: 'normal',
    },

    // Admin can hide announcements without deleting them
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Which admin created this announcement
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export const Announcement = mongoose.model('Announcement', announcementSchema)

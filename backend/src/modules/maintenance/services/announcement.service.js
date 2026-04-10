import { Announcement } from '../models/Announcement.js'
import { ApiError } from '../../../common/utils/ApiError.js'

// ============================================
// ANNOUNCEMENT SERVICE - Business logic for maintenance announcements
// Admin can create, update, delete, and toggle announcements
// All authenticated users can view active announcements
// ============================================

// ---- CREATE: Admin creates a new announcement ----
export async function createAnnouncement({ userId, title, content, priority }) {
  const announcement = await Announcement.create({
    title,
    content,
    priority: priority || 'normal',
    createdBy: userId,
  })

  return announcement.toObject()
}

// ---- READ: Get all active announcements (for all users) ----
export async function getActiveAnnouncements() {
  return Announcement.find({ isActive: true })
    .populate('createdBy', 'fullName role')
    .sort({ createdAt: -1 })
    .lean()
}

// ---- READ: Get all announcements including hidden (Admin) ----
export async function getAllAnnouncements() {
  return Announcement.find()
    .populate('createdBy', 'fullName role')
    .sort({ createdAt: -1 })
    .lean()
}

// ---- UPDATE: Admin edits an existing announcement ----
export async function updateAnnouncement({ announcementId, title, content, priority }) {
  const announcement = await Announcement.findByIdAndUpdate(
    announcementId,
    { title, content, priority },
    { new: true, runValidators: true }
  )

  if (!announcement) throw new ApiError(404, 'Announcement not found')
  return announcement.toObject()
}

// ---- DELETE: Admin deletes an announcement permanently ----
export async function deleteAnnouncement(announcementId) {
  const announcement = await Announcement.findByIdAndDelete(announcementId)
  if (!announcement) throw new ApiError(404, 'Announcement not found')
}

// ---- TOGGLE: Admin hides or shows an announcement ----
export async function toggleAnnouncement(announcementId) {
  const announcement = await Announcement.findById(announcementId)
  if (!announcement) throw new ApiError(404, 'Announcement not found')

  announcement.isActive = !announcement.isActive
  await announcement.save()

  return announcement.toObject()
}

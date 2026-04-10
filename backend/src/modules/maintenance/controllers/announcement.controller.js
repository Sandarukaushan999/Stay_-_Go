import { asyncHandler } from '../../../common/utils/asyncHandler.js'
import * as announcementService from '../services/announcement.service.js'

// ============================================
// MAINTENANCE ANNOUNCEMENT CONTROLLER
// Thin controllers — business logic lives in announcement.service.js
// ============================================

// ---- Admin creates a new announcement ----
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, priority } = req.body
  const announcement = await announcementService.createAnnouncement({
    userId: req.user.id,
    title,
    content,
    priority,
  })
  res.status(201).json({ success: true, message: 'Announcement created successfully!', data: announcement })
})

// ---- All authenticated users get active announcements ----
export const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.getActiveAnnouncements()
  res.json({ success: true, data: announcements })
})

// ---- Admin gets all announcements (including hidden) ----
export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.getAllAnnouncements()
  res.json({ success: true, data: announcements })
})

// ---- Admin updates an existing announcement ----
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, priority } = req.body
  const announcement = await announcementService.updateAnnouncement({
    announcementId: req.params.id,
    title,
    content,
    priority,
  })
  res.json({ success: true, message: 'Announcement updated!', data: announcement })
})

// ---- Admin deletes an announcement permanently ----
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await announcementService.deleteAnnouncement(req.params.id)
  res.json({ success: true, message: 'Announcement deleted successfully' })
})

// ---- Admin toggles announcement visibility ----
export const toggleAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.toggleAnnouncement(req.params.id)
  const statusText = announcement.isActive ? 'activated' : 'deactivated'
  res.json({ success: true, message: `Announcement ${statusText}!`, data: announcement })
})

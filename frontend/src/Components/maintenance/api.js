// ============================================
// MAINTENANCE API SERVICE
// Uses the project's axios client with automatic JWT token injection
// All endpoints are under /api/maintenance/
// ============================================

import { api } from '../../lib/apiClient'

// ============================================
// TICKET API CALLS
// ============================================

// Student: Create a new ticket (with optional file attachments)
export async function createTicket(formData) {
  // If there are file attachments, use FormData for multipart upload
  if (formData.files && formData.files.length > 0) {
    const form = new FormData()
    form.append('title', formData.title)
    form.append('category', formData.category)
    form.append('priority', formData.priority)
    form.append('hostelBlock', formData.hostelBlock)
    form.append('roomNumber', formData.roomNumber)
    form.append('description', formData.description)
    formData.files.forEach((file) => {
      form.append('attachments', file)
    })
    const res = await api.post('/maintenance/tickets', form)
    return res.data
  }

  // No files - send as JSON
  const res = await api.post('/maintenance/tickets', formData)
  return res.data
}

// Student: Get my tickets
export async function getMyTickets() {
  const res = await api.get('/maintenance/tickets/my')
  return res.data.data
}

// Technician: Get tickets assigned to me
export async function getAssignedTickets() {
  const res = await api.get('/maintenance/tickets/assigned')
  return res.data.data
}

// Admin: Get all tickets (with optional filters)
export async function getAllTickets(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)
  if (filters.priority) params.append('priority', filters.priority)
  if (filters.category) params.append('category', filters.category)
  if (filters.search) params.append('search', filters.search)

  const queryString = params.toString()
  const endpoint = queryString
    ? `/maintenance/tickets?${queryString}`
    : '/maintenance/tickets'

  const res = await api.get(endpoint)
  return res.data.data
}

// Any user: Get single ticket by ID
export async function getTicketById(id) {
  const res = await api.get(`/maintenance/tickets/${id}`)
  return res.data.data
}

// Admin: Get list of technicians (for assign dropdown)
export async function getTechnicians() {
  const res = await api.get('/maintenance/tickets/technicians')
  return res.data.data
}

// Admin: Assign technician to ticket
export async function assignTicket(ticketId, technicianId) {
  const res = await api.patch(`/maintenance/tickets/${ticketId}/assign`, { technicianId })
  return res.data
}

// Admin: Reject ticket
export async function rejectTicket(ticketId, reason) {
  const res = await api.patch(`/maintenance/tickets/${ticketId}/reject`, { reason })
  return res.data
}

// Technician: Start working on ticket
export async function startTicket(ticketId) {
  const res = await api.patch(`/maintenance/tickets/${ticketId}/start`)
  return res.data
}

// Technician: Resolve ticket
export async function resolveTicket(ticketId, resolutionNote) {
  const res = await api.patch(`/maintenance/tickets/${ticketId}/resolve`, { resolutionNote })
  return res.data
}

// Student: Rate and close ticket
export async function rateTicket(ticketId, rating, ratingFeedback) {
  const res = await api.patch(`/maintenance/tickets/${ticketId}/rate`, { rating, ratingFeedback })
  return res.data
}

// Admin: Get analytics data
export async function getAnalytics() {
  const res = await api.get('/maintenance/tickets/analytics')
  return res.data.data
}

// ============================================
// ANNOUNCEMENT API CALLS
// ============================================

// All users: Get active announcements
export async function getActiveAnnouncements() {
  const res = await api.get('/maintenance/announcements')
  return res.data.data
}

// Admin: Get all announcements (including hidden)
export async function getAllAnnouncements() {
  const res = await api.get('/maintenance/announcements/all')
  return res.data.data
}

// Admin: Create announcement
export async function createAnnouncement(data) {
  const res = await api.post('/maintenance/announcements', data)
  return res.data
}

// Admin: Update announcement
export async function updateAnnouncement(id, data) {
  const res = await api.put(`/maintenance/announcements/${id}`, data)
  return res.data
}

// Admin: Delete announcement
export async function deleteAnnouncement(id) {
  const res = await api.delete(`/maintenance/announcements/${id}`)
  return res.data
}

// Admin: Toggle announcement visibility
export async function toggleAnnouncement(id) {
  const res = await api.patch(`/maintenance/announcements/${id}/toggle`)
  return res.data
}

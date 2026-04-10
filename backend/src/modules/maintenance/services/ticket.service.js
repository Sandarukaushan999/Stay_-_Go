import { Ticket } from '../models/Ticket.js'
import { User } from '../../users/user.model.js'
import { ApiError } from '../../../common/utils/ApiError.js'
import { ROLES } from '../../../common/constants/roles.js'

// ============================================
// TICKET SERVICE - Business logic for maintenance tickets
// Keeps controllers thin — all DB queries and rules live here
// ============================================

// ---- Generate unique ticket ID ----
// Format: MT-YYYYMMDD-XXX (e.g., MT-20260325-001)
async function generateTicketId() {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
  const prefix = `MT-${dateStr}`

  // Count tickets created today to get the next number
  const count = await Ticket.countDocuments({
    ticketId: { $regex: `^${prefix}` },
  })

  const number = String(count + 1).padStart(3, '0')
  return `${prefix}-${number}`
}

// ---- CREATE: Student submits a new ticket ----
export async function createTicket({ userId, title, category, priority, hostelBlock, roomNumber, description, attachments }) {
  const ticketId = await generateTicketId()

  const ticket = await Ticket.create({
    ticketId,
    title,
    category,
    priority,
    hostelBlock,
    roomNumber,
    description,
    attachments: attachments || [],
    status: 'submitted',
    submittedBy: userId,
    statusHistory: [
      {
        status: 'submitted',
        changedBy: userId,
        note: 'Ticket submitted by student',
      },
    ],
  })

  return ticket.toObject()
}

// ---- READ: Get tickets for the logged-in student ----
export async function getMyTickets(userId) {
  return Ticket.find({ submittedBy: userId })
    .populate('assignedTo', 'fullName email role')
    .sort({ createdAt: -1 })
    .lean()
}

// ---- READ: Get tickets assigned to the logged-in technician ----
export async function getAssignedTickets(userId) {
  return Ticket.find({ assignedTo: userId })
    .populate('submittedBy', 'fullName email role')
    .sort({ createdAt: -1 })
    .lean()
}

// ---- READ: Get all tickets with optional filters (Admin) ----
export async function getAllTickets({ status, priority, category, hostelBlock, search }) {
  const filter = {}
  if (status) filter.status = status
  if (priority) filter.priority = priority
  if (category) filter.category = category
  if (hostelBlock) filter.hostelBlock = hostelBlock

  // Search in ticket ID, title, or room number
  if (search) {
    filter.$or = [
      { ticketId: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { roomNumber: { $regex: search, $options: 'i' } },
    ]
  }

  return Ticket.find(filter)
    .populate('submittedBy', 'fullName email role')
    .populate('assignedTo', 'fullName email role')
    .sort({ createdAt: -1 })
    .lean()
}

// ---- READ: Get a single ticket by its MongoDB _id ----
export async function getTicketById(ticketId) {
  const ticket = await Ticket.findById(ticketId)
    .populate('submittedBy', 'fullName email role')
    .populate('assignedTo', 'fullName email role')
    .populate('statusHistory.changedBy', 'fullName role')

  if (!ticket) throw new ApiError(404, 'Ticket not found')
  return ticket.toObject()
}

// ---- UPDATE: Admin assigns a technician to a ticket ----
export async function assignTicket({ ticketId, technicianId, adminId }) {
  const ticket = await Ticket.findById(ticketId)
  if (!ticket) throw new ApiError(404, 'Ticket not found')

  if (ticket.status !== 'submitted') {
    throw new ApiError(400, 'Can only assign tickets that are in "submitted" status')
  }

  ticket.assignedTo = technicianId
  ticket.status = 'assigned'
  ticket.statusHistory.push({
    status: 'assigned',
    changedBy: adminId,
    note: 'Technician assigned by admin',
  })

  await ticket.save()
  return ticket.toObject()
}

// ---- UPDATE: Admin rejects a ticket ----
export async function rejectTicket({ ticketId, reason, adminId }) {
  const ticket = await Ticket.findById(ticketId)
  if (!ticket) throw new ApiError(404, 'Ticket not found')

  if (ticket.status !== 'submitted') {
    throw new ApiError(400, 'Can only reject tickets that are in "submitted" status')
  }

  ticket.status = 'rejected'
  ticket.rejectionReason = reason.trim()
  ticket.statusHistory.push({
    status: 'rejected',
    changedBy: adminId,
    note: reason.trim(),
  })

  await ticket.save()
  return ticket.toObject()
}

// ---- UPDATE: Technician starts working on a ticket ----
export async function startTicket({ ticketId, technicianId }) {
  const ticket = await Ticket.findById(ticketId)
  if (!ticket) throw new ApiError(404, 'Ticket not found')

  if (ticket.status !== 'assigned') {
    throw new ApiError(400, 'Can only start tickets that are in "assigned" status')
  }

  // Verify this technician is the one assigned
  if (ticket.assignedTo && ticket.assignedTo.toString() !== technicianId) {
    throw new ApiError(403, 'You are not assigned to this ticket')
  }

  ticket.status = 'in_progress'
  ticket.statusHistory.push({
    status: 'in_progress',
    changedBy: technicianId,
    note: 'Technician started working on the issue',
  })

  await ticket.save()
  return ticket.toObject()
}

// ---- UPDATE: Technician marks ticket as resolved ----
export async function resolveTicket({ ticketId, technicianId, resolutionNote }) {
  const ticket = await Ticket.findById(ticketId)
  if (!ticket) throw new ApiError(404, 'Ticket not found')

  if (ticket.status !== 'in_progress') {
    throw new ApiError(400, 'Can only resolve tickets that are in "in progress" status')
  }

  if (ticket.assignedTo && ticket.assignedTo.toString() !== technicianId) {
    throw new ApiError(403, 'You are not assigned to this ticket')
  }

  ticket.status = 'resolved'
  ticket.resolutionNote = resolutionNote.trim()
  ticket.statusHistory.push({
    status: 'resolved',
    changedBy: technicianId,
    note: resolutionNote.trim(),
  })

  await ticket.save()
  return ticket.toObject()
}

// ---- UPDATE: Student rates the resolved ticket ----
export async function rateTicket({ ticketId, userId, rating, ratingFeedback }) {
  const ticket = await Ticket.findById(ticketId)
  if (!ticket) throw new ApiError(404, 'Ticket not found')

  if (ticket.status !== 'resolved') {
    throw new ApiError(400, 'Can only rate tickets that are in "resolved" status')
  }

  // Only the student who submitted can rate
  if (ticket.submittedBy.toString() !== userId) {
    throw new ApiError(403, 'Only the student who submitted this ticket can rate it')
  }

  ticket.status = 'closed'
  ticket.rating = Number(rating)
  ticket.ratingFeedback = ratingFeedback || null
  ticket.statusHistory.push({
    status: 'closed',
    changedBy: userId,
    note: `Student rated ${rating}/5${ratingFeedback ? ': ' + ratingFeedback : ''}`,
  })

  await ticket.save()
  return ticket.toObject()
}

// ---- READ: Get analytics data for admin dashboard ----
export async function getAnalytics() {
  const totalTickets = await Ticket.countDocuments()

  const openTickets = await Ticket.countDocuments({
    status: { $nin: ['closed', 'rejected'] },
  })

  // Count tickets by each status
  const statusCounts = await Ticket.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  // Count tickets by each priority
  const priorityCounts = await Ticket.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ])

  // Count tickets by each hostel block
  const blockCounts = await Ticket.aggregate([
    { $group: { _id: '$hostelBlock', count: { $sum: 1 } } },
  ])

  // Calculate average rating from closed tickets
  const avgRatingResult = await Ticket.aggregate([
    { $match: { rating: { $ne: null } } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } },
  ])

  return {
    totalTickets,
    openTickets,
    avgRating: avgRatingResult[0]?.avgRating?.toFixed(1) || '0.0',
    statusCounts,
    priorityCounts,
    blockCounts,
  }
}

// ---- READ: Get list of all technicians ----
export async function getTechnicians() {
  return User.find({ role: ROLES.TECHNICIAN })
    .select('fullName email role')
    .lean()
}

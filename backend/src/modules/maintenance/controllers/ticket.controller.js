import { asyncHandler } from '../../../common/utils/asyncHandler.js'
import * as ticketService from '../services/ticket.service.js'

// ============================================
// MAINTENANCE TICKET CONTROLLER
// Thin controllers — business logic lives in ticket.service.js
// req.user.id is a string (set by requireAuth middleware)
// ============================================

// ---- Student submits a new maintenance ticket ----
export const createTicket = asyncHandler(async (req, res) => {
  const { title, category, priority, hostelBlock, roomNumber, description } = req.body

  // Get file paths if any attachments were uploaded via multer
  const attachments = req.files ? req.files.map((file) => file.path) : []

  const ticket = await ticketService.createTicket({
    userId: req.user.id,
    title,
    category,
    priority,
    hostelBlock,
    roomNumber,
    description,
    attachments,
  })

  res.status(201).json({ success: true, message: 'Ticket submitted successfully!', data: ticket })
})

// ---- Student gets their own tickets ----
export const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getMyTickets(req.user.id)
  res.json({ success: true, data: tickets })
})

// ---- Technician gets tickets assigned to them ----
export const getAssignedTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getAssignedTickets(req.user.id)
  res.json({ success: true, data: tickets })
})

// ---- Admin gets all tickets (with optional filters) ----
export const getAllTickets = asyncHandler(async (req, res) => {
  const { status, priority, category, hostelBlock, search } = req.query
  const tickets = await ticketService.getAllTickets({ status, priority, category, hostelBlock, search })
  res.json({ success: true, data: tickets })
})

// ---- Any authenticated user gets a single ticket by ID ----
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await ticketService.getTicketById(req.params.id)
  res.json({ success: true, data: ticket })
})

// ---- Admin assigns a technician to a ticket ----
export const assignTicket = asyncHandler(async (req, res) => {
  const { technicianId } = req.body
  const ticket = await ticketService.assignTicket({
    ticketId: req.params.id,
    technicianId,
    adminId: req.user.id,
  })
  res.json({ success: true, message: 'Technician assigned successfully!', data: ticket })
})

// ---- Admin rejects a ticket ----
export const rejectTicket = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const ticket = await ticketService.rejectTicket({
    ticketId: req.params.id,
    reason,
    adminId: req.user.id,
  })
  res.json({ success: true, message: 'Ticket rejected', data: ticket })
})

// ---- Technician starts working on a ticket ----
export const startTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.startTicket({
    ticketId: req.params.id,
    technicianId: req.user.id,
  })
  res.json({ success: true, message: 'Ticket is now in progress', data: ticket })
})

// ---- Technician marks ticket as resolved ----
export const resolveTicket = asyncHandler(async (req, res) => {
  const { resolutionNote } = req.body
  const ticket = await ticketService.resolveTicket({
    ticketId: req.params.id,
    technicianId: req.user.id,
    resolutionNote,
  })
  res.json({ success: true, message: 'Ticket resolved!', data: ticket })
})

// ---- Student rates and closes a resolved ticket ----
export const rateTicket = asyncHandler(async (req, res) => {
  const { rating, ratingFeedback } = req.body
  const ticket = await ticketService.rateTicket({
    ticketId: req.params.id,
    userId: req.user.id,
    rating,
    ratingFeedback,
  })
  res.json({ success: true, message: 'Thank you for your feedback! Ticket is now closed.', data: ticket })
})

// ---- Admin gets analytics data for dashboard charts ----
export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await ticketService.getAnalytics()
  res.json({ success: true, data: analytics })
})

// ---- Admin gets list of technicians (for assigning tickets) ----
export const getTechnicians = asyncHandler(async (req, res) => {
  const technicians = await ticketService.getTechnicians()
  res.json({ success: true, data: technicians })
})

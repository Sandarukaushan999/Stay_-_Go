import { z } from 'zod'

// ============================================
// ZOD VALIDATION SCHEMAS — Maintenance Module
// Used with validateBody() middleware on routes
// ============================================

// ---- Create ticket (student submitting a complaint) ----
export const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  category: z.enum(['plumbing', 'electrical', 'furniture', 'cleaning', 'network', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  hostelBlock: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
  roomNumber: z.string().min(1, 'Room number is required'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(500, 'Description cannot exceed 500 characters'),
})

// ---- Admin assigns a technician to a ticket ----
export const assignTicketSchema = z.object({
  technicianId: z.string().min(1, 'Technician ID is required'),
})

// ---- Admin rejects a ticket ----
export const rejectTicketSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
})

// ---- Technician marks a ticket as resolved ----
export const resolveTicketSchema = z.object({
  resolutionNote: z.string().min(10, 'Resolution note must be at least 10 characters'),
})

// ---- Student rates a resolved ticket ----
export const rateTicketSchema = z.object({
  rating: z.number().int().min(1).max(5),
  ratingFeedback: z.string().max(200, 'Feedback cannot exceed 200 characters').optional(),
})

// ---- Create announcement (admin) ----
export const createAnnouncementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters').max(500, 'Content cannot exceed 500 characters'),
  priority: z.enum(['normal', 'important', 'urgent']).optional(),
})

// ---- Update announcement (admin) ----
export const updateAnnouncementSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  content: z.string().min(20).max(500).optional(),
  priority: z.enum(['normal', 'important', 'urgent']).optional(),
})

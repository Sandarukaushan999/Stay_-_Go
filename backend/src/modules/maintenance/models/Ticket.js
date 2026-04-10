import mongoose from 'mongoose'

// ============================================
// TICKET MODEL - Hostel Maintenance Management
// Each ticket represents a complaint/issue reported by a student
// Tickets follow this workflow:
// submitted -> assigned -> in_progress -> resolved -> closed
// (or submitted -> rejected)
// ============================================

// Sub-schema for tracking every status change
// This builds the timeline shown in the ticket detail view
const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
)

const ticketSchema = new mongoose.Schema(
  {
    // Unique ticket ID like "MT-20260325-001"
    ticketId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    // Short title describing the issue
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      trim: true,
    },

    // Issue category - helps admin assign the right technician
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['plumbing', 'electrical', 'furniture', 'cleaning', 'network', 'other'],
    },

    // How urgent is this issue
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['low', 'medium', 'high', 'emergency'],
    },

    // Which hostel block the issue is in
    hostelBlock: {
      type: String,
      required: [true, 'Hostel block is required'],
      enum: ['A', 'B', 'C', 'D', 'E', 'F'],
    },

    // Room number where the issue is
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },

    // Detailed description of the problem
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
      trim: true,
    },

    // File paths for photos uploaded by student
    attachments: [{ type: String }],

    // Current ticket status - changes as it moves through workflow
    status: {
      type: String,
      enum: ['submitted', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
      default: 'submitted',
      index: true,
    },

    // Which student submitted this ticket
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Which technician is working on this ticket (set by admin)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // If admin rejects, must provide a reason
    rejectionReason: { type: String, default: null },

    // Note from technician explaining what they did to fix it
    resolutionNote: { type: String, default: null },

    // Student rating after issue is resolved (1 to 5 stars)
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    // Optional feedback text along with the rating
    ratingFeedback: {
      type: String,
      maxlength: [200, 'Feedback cannot exceed 200 characters'],
      default: null,
    },

    // Array storing every status change - used for the timeline
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
)

export const Ticket = mongoose.model('Ticket', ticketSchema)

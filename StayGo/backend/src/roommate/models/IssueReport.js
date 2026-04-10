import mongoose from 'mongoose'
import { ISSUE_CATEGORY, ISSUE_PRIORITY, ISSUE_STATUS } from '../constants/enums.js'

const issueReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // roomId is optional — student may not have an assigned room yet
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    // Human-readable room number typed by student
    roomNumber: { type: String, default: null, trim: true },
    category: {
      type: String,
      required: true,
      enum: Object.values(ISSUE_CATEGORY),
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: {
      type: String,
      required: true,
      enum: Object.values(ISSUE_PRIORITY),
      default: ISSUE_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ISSUE_STATUS),
      default: ISSUE_STATUS.SUBMITTED,
    },
    imageUrl: { type: String, default: null },
    additionalNotes: { type: String, default: null },
    adminComment: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const IssueReport = mongoose.model('IssueReport', issueReportSchema)

import mongoose from 'mongoose'
import { MATCH_REQUEST_STATUS } from '../constants/enums.js'

const matchRequestSchema = new mongoose.Schema(
  {
    senderStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    receiverStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    compatibilityScore: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(MATCH_REQUEST_STATUS),
      default: MATCH_REQUEST_STATUS.PENDING,
    },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

matchRequestSchema.index({ senderStudentId: 1, receiverStudentId: 1 })

export const MatchRequest = mongoose.model('MatchRequest', matchRequestSchema)

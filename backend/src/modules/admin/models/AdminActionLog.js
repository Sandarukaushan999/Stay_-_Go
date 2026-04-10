import mongoose from 'mongoose'

const AdminActionLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actionType: { type: String, required: true },
    description: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

export const AdminActionLog = mongoose.model('AdminActionLog', AdminActionLogSchema)

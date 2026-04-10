import mongoose from 'mongoose'

const PointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
)

const SOSAlertSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high', index: true },
    message: { type: String, default: '' },
    location: { type: PointSchema, default: null },

    status: { type: String, enum: ['pending', 'acknowledged', 'resolved'], default: 'pending', index: true },
    acknowledgedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const SOSAlert = mongoose.model('SOSAlert', SOSAlertSchema)


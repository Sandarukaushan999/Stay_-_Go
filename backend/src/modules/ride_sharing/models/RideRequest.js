import mongoose from 'mongoose'

const PointSchema = new mongoose.Schema(
  { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  { _id: false }
)

const RideRequestSchema = new mongoose.Schema(
  {
    campusId: { type: String, default: null, index: true },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    origin: { type: PointSchema, required: true },
    destination: { type: PointSchema, required: true },
    seatCount: { type: Number, default: 1 },
    femaleOnly: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['requested', 'accepted', 'cancelled', 'completed'],
      default: 'requested',
      index: true,
    },

    requestedAt: { type: Date, default: () => new Date(), index: true },
    acceptedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    feedback: {
      rating: { type: Number, default: null, min: 1, max: 5 },
      complaint: { type: Boolean, default: false },
      complaintText: { type: String, default: '' },
      submittedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
)

export const RideRequest = mongoose.model('RideRequest', RideRequestSchema)

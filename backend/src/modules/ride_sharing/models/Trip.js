import mongoose from 'mongoose'

const PointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
)

const TripSchema = new mongoose.Schema(
  {
    rideRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'RideRequest', default: null },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    origin: { type: PointSchema, required: true },
    destination: { type: PointSchema, required: true },

    expectedDurationSeconds: { type: Number, default: null },
    bufferMinutes: { type: Number, default: 10 },
    bufferedDeadlineAt: { type: Date, default: null, index: true },

    currentLocation: { type: PointSchema, default: null },
    lastMovementAt: { type: Date, default: null, index: true },
    suspiciousStopFlag: { type: Boolean, default: false, index: true },
    noUpdateFlag: { type: Boolean, default: false, index: true },
    autoSosTriggered: { type: Boolean, default: false, index: true },

    status: {
      type: String,
      enum: ['to_pickup', 'to_university', 'overdue', 'completed', 'cancelled'],
      default: 'to_pickup',
      index: true,
    },

    startedAt: { type: Date, default: () => new Date(), index: true },
    pickedUpAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const Trip = mongoose.model('Trip', TripSchema)


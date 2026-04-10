import mongoose from 'mongoose'

const TechnicianAvailabilitySchema = new mongoose.Schema(
  {
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0 = Sunday, 1 = Monday, etc.
    startTime: { type: String, required: true }, // Format: 'HH:mm'
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
)

// Ensure a technician only has one config per day
TechnicianAvailabilitySchema.index({ technicianId: 1, dayOfWeek: 1 }, { unique: true })

export const TechnicianAvailability = mongoose.model('TechnicianAvailability', TechnicianAvailabilitySchema)

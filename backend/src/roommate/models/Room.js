import mongoose from 'mongoose'
import { AVAILABILITY_STATUS } from '../constants/enums.js'

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    block: { type: String, required: true, trim: true },
    floor: { type: String, default: null, trim: true },
    capacity: { type: Number, required: true, min: 1, max: 10 },
    occupancyCount: { type: Number, default: 0 },
    acType: {
      type: String,
      required: true,
      enum: ['AC', 'NON_AC'],
    },
    roomPosition: {
      type: String,
      enum: ['BALCONY', 'MIDDLE', null],
      default: null,
    },
    // Use availabilityStatus to match admin page expectations
    availabilityStatus: {
      type: String,
      enum: Object.values(AVAILABILITY_STATUS),
      default: AVAILABILITY_STATUS.AVAILABLE,
    },
  },
  { timestamps: true }
)

// Auto-compute availability before save
roomSchema.pre('save', function (next) {
  if (this.availabilityStatus !== AVAILABILITY_STATUS.MAINTENANCE) {
    if (this.occupancyCount <= 0) {
      this.availabilityStatus = AVAILABILITY_STATUS.AVAILABLE
    } else if (this.occupancyCount < this.capacity) {
      this.availabilityStatus = AVAILABILITY_STATUS.PARTIALLY_FILLED
    } else {
      this.availabilityStatus = AVAILABILITY_STATUS.FULL
    }
  }
  next()
})

export const Room = mongoose.model('Room', roomSchema)

import mongoose from 'mongoose'
import { ROLE_VALUES, ROLES } from '../../common/constants/roles.js'

const UserSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ROLE_VALUES, default: ROLES.STUDENT, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: null },

    address: { type: String, default: null },
    gender: { type: String, default: null },
    studentId: { type: String, default: null, index: true },
    campusId: { type: String, default: null, index: true },
    hostelBlock: { type: String, default: null },
    roomNumber: { type: String, default: null },

    isVerified: { type: Boolean, default: false, index: true },
    isBlocked: { type: Boolean, default: false, index: true },

    profileImage: { type: String, default: null },
    emergencyContact: { type: String, default: null },

    hasVehicle: { type: Boolean, default: false, index: true },
    vehicleNumber: { type: String, default: null },
    vehicleType: { type: String, default: null },
    seatCount: { type: Number, default: 0 },
    availability: { type: String, default: 'offline' },
    rating: { type: Number, default: 5 },
    complaintCount: { type: Number, default: 0 },

    currentLocation: {
      type: { lat: Number, lng: Number },
      default: null,
    },

    residenceLocation: { type: { lat: Number, lng: Number }, default: null },
    vehicleOriginLocation: { type: { lat: Number, lng: Number }, default: null },

    riderVerificationStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
      index: true,
    },
    riderAppliedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const User = mongoose.model('User', UserSchema)


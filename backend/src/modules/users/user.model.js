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
    vehicleModel: { type: String, default: null },
    vehicleType: { type: String, default: null },
    seatCount: { type: Number, default: 0 },
    driverLicenseUrl: { type: String, default: null },
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
    lastLogin: { type: Date, default: null },

    systemSettings: {
      theme: { type: String, default: 'dark', enum: ['dark', 'light'] },
      language: { type: String, default: 'English' },
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      sosAlerts: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true },
      twoFactorEnabled: { type: Boolean, default: false },
<<<<<<< HEAD
=======
      rideRequestAlerts: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      maintenanceUpdates: { type: Boolean, default: true },
      promotionsToggle: { type: Boolean, default: false },
    },

    adminNotes: { type: String, default: '' },
    permissions: [{ type: String }],
    adminStats: {
      systemAudits: { type: Number, default: 0 },
      usersBanned: { type: Number, default: 0 },
      criticalResolutions: { type: Number, default: 0 },
    },
    loginHistory: [{
      timestamp: { type: Date, default: Date.now },
      ipAddress: String,
      device: String
    }],
    sessionManagement: {
      maxConcurrentSessions: { type: Number, default: 3 },
      sessionTimeoutMinutes: { type: Number, default: 60 },
    },
    emergencyClearance: {
      type: String,
      default: 'Standard',
      enum: ['Standard', 'Elevated', 'Maximum'],
    },

    bio: { type: String, default: '' },

    ridePreferences: {
      preferredRole: { type: String, default: 'Both', enum: ['Driver', 'Passenger', 'Both'] },
      usualTravelTime: { type: String, default: 'Morning (7AM - 10AM)' },
      preferredPickupLocations: { type: String, default: 'Main Campus Gate' },
      music: { type: String, default: 'Any' },
      ac: { type: String, default: 'Any' },
      smoking: { type: String, default: 'No Smoking' },
      genderPreference: { type: String, default: 'Any' },
    },

    privacySettings: {
      profileVisibility: { type: String, default: 'public', enum: ['public', 'campus_only', 'matches_only', 'private'] },
      phoneVisibility: { type: String, default: 'matches_only', enum: ['public', 'campus_only', 'matches_only', 'private'] },
      emailVisibility: { type: String, default: 'matches_only', enum: ['public', 'campus_only', 'matches_only', 'private'] },
    },

    verifications: {
      email: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      student: { type: Boolean, default: false },
      license: { type: Boolean, default: false },
    },

    activityStats: {
      tripsJoined: { type: Number, default: 0 },
      tripsOffered: { type: Number, default: 0 },
      completedTrips: { type: Number, default: 0 },
>>>>>>> 461d32b321f3780c45ad6f481ab155cffd87c2b3
    },

    is2FAEnabled: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
  },
  { timestamps: true }
)

UserSchema.virtual('name').get(function () {
  return this.fullName
})

UserSchema.virtual('contactNumber').get(function () {
  return this.phone
})

export const User = mongoose.model('User', UserSchema)

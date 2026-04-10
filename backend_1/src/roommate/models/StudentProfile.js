import mongoose from 'mongoose'
import { SLEEP_SCHEDULE, SOCIAL_HABITS, STUDY_HABITS } from '../constants/enums.js'

const studentProfileSchema = new mongoose.Schema(
  {
    // Link to the User document from the auth system
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    address: { type: String, default: '', trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    whatsApp: { type: String, default: '', trim: true },
    gender: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1 },
    bio: { type: String, default: '', trim: true },
    interests: { type: String, default: '', trim: true },
    photoUrl: { type: String, default: null },

    sleepSchedule: {
      type: String,
      required: true,
      enum: Object.values(SLEEP_SCHEDULE),
    },
    cleanliness: { type: Number, required: true, min: 1, max: 5 },
    socialHabits: {
      type: String,
      required: true,
      enum: Object.values(SOCIAL_HABITS),
    },
    studyHabits: {
      type: String,
      required: true,
      enum: Object.values(STUDY_HABITS),
    },
    noisePreference: { type: String, default: 'MODERATE' },
    guestPolicy: { type: String, default: 'OCCASIONAL' },

    profileCompleted: { type: Boolean, default: false },
    roomPreferenceCompleted: { type: Boolean, default: false },
    finalLockCompleted: { type: Boolean, default: false },

    // Ratings from roommates (post-match)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },

    // Assigned room (set by admin)
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  },
  { timestamps: true }
)

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema)

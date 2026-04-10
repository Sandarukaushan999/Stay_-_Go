import mongoose from 'mongoose'
import { AC_TYPE, ROOM_POSITION } from '../constants/enums.js'

const roomPreferenceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      unique: true,
    },
    block: { type: String, required: true, trim: true },
    floor: { type: String, required: true, trim: true },
    acType: {
      type: String,
      required: true,
      enum: Object.values(AC_TYPE),
    },
    roomPosition: {
      type: String,
      required: true,
      enum: Object.values(ROOM_POSITION),
    },
    capacity: { type: Number, required: true, min: 1, max: 4 },
  },
  { timestamps: true }
)

export const RoomPreference = mongoose.model('RoomPreference', roomPreferenceSchema)

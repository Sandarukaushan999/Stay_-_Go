/**
 * createAdmin.js — One-time script to create an admin user in MongoDB
 * Run: node src/createAdmin.js
 */

import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// ── Config ─────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI
const ADMIN_EMAIL = 'admin@staygo.lk'
const ADMIN_PASSWORD = 'Admin@StayGo2025'
const ADMIN_NAME = 'Stay & Go Admin'
const ADMIN_ROLE = 'admin'          // or 'super_admin'

// ── Schema (minimal inline so we don't need the full app) ──────────────────
const UserSchema = new mongoose.Schema({
  role: { type: String, default: 'student' },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)

// ── Main ───────────────────────────────────────────────────────────────────
async function createAdmin() {
  if (!MONGO_URI) {
    console.error('❌  MONGO_URI not found in .env')
    process.exit(1)
  }

  await mongoose.connect(MONGO_URI)
  console.log('✅  Connected to MongoDB')

  // Check if admin already exists
  const existing = await User.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    console.log(`ℹ️   Admin already exists → email: ${ADMIN_EMAIL}  role: ${existing.role}`)
    await mongoose.disconnect()
    return
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  await User.create({
    role: ADMIN_ROLE,
    fullName: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
    isVerified: true,
    isBlocked: false,
  })

  console.log('\n🎉  Admin user created successfully!\n')
  console.log('  Email    :', ADMIN_EMAIL)
  console.log('  Password :', ADMIN_PASSWORD)
  console.log('  Role     :', ADMIN_ROLE)
  console.log('\n  ⚠️  Please change the password after your first login.\n')

  await mongoose.disconnect()
}

createAdmin().catch((err) => {
  console.error('❌  Error:', err.message)
  process.exit(1)
})

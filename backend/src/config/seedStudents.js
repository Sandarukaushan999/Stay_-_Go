/**
 * Dummy Student Seed Script
 * Run: npm run seed:students
 *
 * Creates 8 student auth accounts with complete roommate profiles
 * and room preferences stored in MongoDB Atlas.
 * Skips any email that already exists.
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../modules/users/user.model.js'
import { StudentProfile } from '../roommate/models/StudentProfile.js'
import { RoomPreference } from '../roommate/models/RoomPreference.js'

/* ─── Connect ─────────────────────────────────────────────── */
const uri = process.env.MONGO_URI
if (!uri) { console.error('❌  MONGO_URI not set in .env'); process.exit(1) }

await mongoose.connect(uri, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 30000,
})
console.log('✅  Connected to MongoDB\n')

/* ─── Dummy student definitions ───────────────────────────── */
const STUDENTS = [
  {
    user: {
      fullName: 'Kavindu Perera',
      email: 'kavindu.perera@student.ac.lk',
      password: 'Test@1234',
      gender: 'MALE',
      phone: '+94771234501',
      isVerified: true,
    },
    profile: {
      firstName: 'Kavindu', lastName: 'Perera',
      address: '12 Rajagiriya Road, Colombo',
      whatsApp: '+94771234501',
      gender: 'MALE', age: 21,
      sleepSchedule: 'EARLY_BIRD',
      cleanliness: 4,
      socialHabits: 'MODERATE',
      studyHabits: 'SILENT',
    },
    pref: { block: 'A', floor: '2', acType: 'AC', roomPosition: 'BALCONY', capacity: 2 },
  },
  {
    user: {
      fullName: 'Thilina Bandara',
      email: 'thilina.bandara@student.ac.lk',
      password: 'Test@1234',
      gender: 'MALE',
      phone: '+94771234502',
      isVerified: true,
    },
    profile: {
      firstName: 'Thilina', lastName: 'Bandara',
      address: '45 Nugegoda Main Street, Colombo',
      whatsApp: '+94771234502',
      gender: 'MALE', age: 22,
      sleepSchedule: 'EARLY_BIRD',
      cleanliness: 5,
      socialHabits: 'QUIET',
      studyHabits: 'SILENT',
    },
    pref: { block: 'A', floor: '2', acType: 'AC', roomPosition: 'BALCONY', capacity: 2 },
  },
  {
    user: {
      fullName: 'Isuru Jayasinghe',
      email: 'isuru.jayasinghe@student.ac.lk',
      password: 'Test@1234',
      gender: 'MALE',
      phone: '+94771234503',
      isVerified: true,
    },
    profile: {
      firstName: 'Isuru', lastName: 'Jayasinghe',
      address: '88 Kandy Road, Peradeniya',
      whatsApp: '+94771234503',
      gender: 'MALE', age: 20,
      sleepSchedule: 'NIGHT_OWL',
      cleanliness: 3,
      socialHabits: 'SOCIAL',
      studyHabits: 'SOME_NOISE',
    },
    pref: { block: 'B', floor: '1', acType: 'NON_AC', roomPosition: 'MIDDLE', capacity: 3 },
  },
  {
    user: {
      fullName: 'Chathura Wijesekara',
      email: 'chathura.wijesekara@student.ac.lk',
      password: 'Test@1234',
      gender: 'MALE',
      phone: '+94771234504',
      isVerified: true,
    },
    profile: {
      firstName: 'Chathura', lastName: 'Wijesekara',
      address: '23 Matara Road, Galle',
      whatsApp: '+94771234504',
      gender: 'MALE', age: 23,
      sleepSchedule: 'NIGHT_OWL',
      cleanliness: 4,
      socialHabits: 'MODERATE',
      studyHabits: 'SOME_NOISE',
    },
    pref: { block: 'B', floor: '1', acType: 'NON_AC', roomPosition: 'MIDDLE', capacity: 3 },
  },
  {
    user: {
      fullName: 'Nimasha Fernando',
      email: 'nimasha.fernando@student.ac.lk',
      password: 'Test@1234',
      gender: 'FEMALE',
      phone: '+94771234505',
      isVerified: true,
    },
    profile: {
      firstName: 'Nimasha', lastName: 'Fernando',
      address: '7 Ward Place, Colombo 7',
      whatsApp: '+94771234505',
      gender: 'FEMALE', age: 20,
      sleepSchedule: 'EARLY_BIRD',
      cleanliness: 5,
      socialHabits: 'QUIET',
      studyHabits: 'SILENT',
    },
    pref: { block: 'C', floor: '3', acType: 'AC', roomPosition: 'BALCONY', capacity: 2 },
  },
  {
    user: {
      fullName: 'Sanduni Rathnayake',
      email: 'sanduni.rathnayake@student.ac.lk',
      password: 'Test@1234',
      gender: 'FEMALE',
      phone: '+94771234506',
      isVerified: true,
    },
    profile: {
      firstName: 'Sanduni', lastName: 'Rathnayake',
      address: '56 Kotte Road, Sri Jayawardenepura',
      whatsApp: '+94771234506',
      gender: 'FEMALE', age: 21,
      sleepSchedule: 'EARLY_BIRD',
      cleanliness: 4,
      socialHabits: 'MODERATE',
      studyHabits: 'SILENT',
    },
    pref: { block: 'C', floor: '3', acType: 'AC', roomPosition: 'BALCONY', capacity: 2 },
  },
  {
    user: {
      fullName: 'Dilini Wickramasinghe',
      email: 'dilini.wickramasinghe@student.ac.lk',
      password: 'Test@1234',
      gender: 'FEMALE',
      phone: '+94771234507',
      isVerified: true,
    },
    profile: {
      firstName: 'Dilini', lastName: 'Wickramasinghe',
      address: '33 Hospital Road, Kurunegala',
      whatsApp: '+94771234507',
      gender: 'FEMALE', age: 22,
      sleepSchedule: 'NIGHT_OWL',
      cleanliness: 3,
      socialHabits: 'SOCIAL',
      studyHabits: 'SOME_NOISE',
    },
    pref: { block: 'D', floor: '2', acType: 'NON_AC', roomPosition: 'MIDDLE', capacity: 2 },
  },
  {
    user: {
      fullName: 'Nadeesha Abeysekara',
      email: 'nadeesha.abeysekara@student.ac.lk',
      password: 'Test@1234',
      gender: 'FEMALE',
      phone: '+94771234508',
      isVerified: true,
    },
    profile: {
      firstName: 'Nadeesha', lastName: 'Abeysekara',
      address: '18 Beach Road, Negombo',
      whatsApp: '+94771234508',
      gender: 'FEMALE', age: 23,
      sleepSchedule: 'NIGHT_OWL',
      cleanliness: 4,
      socialHabits: 'SOCIAL',
      studyHabits: 'ANY',
    },
    pref: { block: 'D', floor: '2', acType: 'NON_AC', roomPosition: 'MIDDLE', capacity: 2 },
  },
]

/* ─── Insert ──────────────────────────────────────────────── */
let created = 0, skipped = 0

for (const data of STUDENTS) {
  const { user: u, profile: p, pref } = data
  const email = u.email.toLowerCase().trim()

  // Skip if auth user already exists
  const existing = await User.findOne({ email })
  if (existing) {
    console.log(`  ⏭️  Skipped (already exists): ${u.fullName} <${email}>`)
    skipped++
    continue
  }

  // 1. Create auth user
  const passwordHash = await bcrypt.hash(u.password, 10)
  const newUser = await User.create({
    fullName: u.fullName,
    email,
    passwordHash,
    phone: u.phone,
    gender: u.gender,
    role: 'student',
    isVerified: u.isVerified ?? true,
  })

  // 2. Create student profile (fully completed)
  const profile = await StudentProfile.create({
    userId: newUser._id,
    email,
    profileCompleted: true,
    roomPreferenceCompleted: true,
    finalLockCompleted: false,
    ...p,
  })

  // 3. Create room preference
  await RoomPreference.create({
    studentId: profile._id,
    ...pref,
  })

  console.log(`  ✅  Created: ${u.fullName} <${email}>  [Block ${pref.block} · ${pref.acType} · ${pref.roomPosition}]`)
  created++
}

/* ─── Summary ─────────────────────────────────────────────── */
console.log(`\n── Seed complete ──────────────────────────────`)
console.log(`   Created : ${created}`)
console.log(`   Skipped : ${skipped}`)
console.log(`   Total   : ${STUDENTS.length}`)
console.log(`\n📌 Login password for all dummy students: Test@1234`)
console.log(`──────────────────────────────────────────────\n`)

await mongoose.disconnect()
process.exit(0)

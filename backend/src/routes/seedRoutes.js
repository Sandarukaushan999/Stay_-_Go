import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../modules/users/user.model.js'
import { StudentProfile } from '../roommate/models/StudentProfile.js'
import { RoomPreference } from '../roommate/models/RoomPreference.js'

export const seedRouter = Router()

const STUDENTS = [
  {
    user: { fullName: 'Kavindu Perera',         email: 'kavindu.perera@student.ac.lk',       gender: 'MALE',   phone: '+94771234501' },
    profile: { firstName: 'Kavindu', lastName: 'Perera',         address: '12 Rajagiriya Road, Colombo',             whatsApp: '+94771234501', gender: 'MALE',   age: 21, sleepSchedule: 'EARLY_BIRD', cleanliness: 4, socialHabits: 'MODERATE', studyHabits: 'SILENT' },
    pref: { block: 'A', floor: '2', acType: 'AC',     roomPosition: 'BALCONY', capacity: 2 },
  },
  {
    user: { fullName: 'Thilina Bandara',         email: 'thilina.bandara@student.ac.lk',       gender: 'MALE',   phone: '+94771234502' },
    profile: { firstName: 'Thilina', lastName: 'Bandara',         address: '45 Nugegoda Main Street, Colombo',        whatsApp: '+94771234502', gender: 'MALE',   age: 22, sleepSchedule: 'EARLY_BIRD', cleanliness: 5, socialHabits: 'QUIET',    studyHabits: 'SILENT' },
    pref: { block: 'A', floor: '2', acType: 'AC',     roomPosition: 'BALCONY', capacity: 2 },
  },
  {
    user: { fullName: 'Isuru Jayasinghe',        email: 'isuru.jayasinghe@student.ac.lk',      gender: 'MALE',   phone: '+94771234503' },
    profile: { firstName: 'Isuru',   lastName: 'Jayasinghe',      address: '88 Kandy Road, Peradeniya',               whatsApp: '+94771234503', gender: 'MALE',   age: 20, sleepSchedule: 'NIGHT_OWL',  cleanliness: 3, socialHabits: 'SOCIAL',   studyHabits: 'SOME_NOISE' },
    pref: { block: 'B', floor: '1', acType: 'NON_AC', roomPosition: 'MIDDLE',  capacity: 3 },
  },
  {
    user: { fullName: 'Chathura Wijesekara',     email: 'chathura.wijesekara@student.ac.lk',  gender: 'MALE',   phone: '+94771234504' },
    profile: { firstName: 'Chathura',lastName: 'Wijesekara',      address: '23 Matara Road, Galle',                   whatsApp: '+94771234504', gender: 'MALE',   age: 23, sleepSchedule: 'NIGHT_OWL',  cleanliness: 4, socialHabits: 'MODERATE', studyHabits: 'SOME_NOISE' },
    pref: { block: 'B', floor: '1', acType: 'NON_AC', roomPosition: 'MIDDLE',  capacity: 3 },
  },
  {
    user: { fullName: 'Nimasha Fernando',        email: 'nimasha.fernando@student.ac.lk',      gender: 'FEMALE', phone: '+94771234505' },
    profile: { firstName: 'Nimasha', lastName: 'Fernando',         address: '7 Ward Place, Colombo 7',                 whatsApp: '+94771234505', gender: 'FEMALE', age: 20, sleepSchedule: 'EARLY_BIRD', cleanliness: 5, socialHabits: 'QUIET',    studyHabits: 'SILENT' },
    pref: { block: 'C', floor: '3', acType: 'AC',     roomPosition: 'BALCONY', capacity: 2 },
  },
  {
    user: { fullName: 'Sanduni Rathnayake',      email: 'sanduni.rathnayake@student.ac.lk',   gender: 'FEMALE', phone: '+94771234506' },
    profile: { firstName: 'Sanduni', lastName: 'Rathnayake',       address: '56 Kotte Road, Sri Jayawardenepura',      whatsApp: '+94771234506', gender: 'FEMALE', age: 21, sleepSchedule: 'EARLY_BIRD', cleanliness: 4, socialHabits: 'MODERATE', studyHabits: 'SILENT' },
    pref: { block: 'C', floor: '3', acType: 'AC',     roomPosition: 'BALCONY', capacity: 2 },
  },
  {
    user: { fullName: 'Dilini Wickramasinghe',   email: 'dilini.wickramasinghe@student.ac.lk', gender: 'FEMALE', phone: '+94771234507' },
    profile: { firstName: 'Dilini',  lastName: 'Wickramasinghe',   address: '33 Hospital Road, Kurunegala',            whatsApp: '+94771234507', gender: 'FEMALE', age: 22, sleepSchedule: 'NIGHT_OWL',  cleanliness: 3, socialHabits: 'SOCIAL',   studyHabits: 'SOME_NOISE' },
    pref: { block: 'D', floor: '2', acType: 'NON_AC', roomPosition: 'MIDDLE',  capacity: 2 },
  },
  {
    user: { fullName: 'Nadeesha Abeysekara',     email: 'nadeesha.abeysekara@student.ac.lk',  gender: 'FEMALE', phone: '+94771234508' },
    profile: { firstName: 'Nadeesha',lastName: 'Abeysekara',       address: '18 Beach Road, Negombo',                  whatsApp: '+94771234508', gender: 'FEMALE', age: 23, sleepSchedule: 'NIGHT_OWL',  cleanliness: 4, socialHabits: 'SOCIAL',   studyHabits: 'ANY' },
    pref: { block: 'D', floor: '2', acType: 'NON_AC', roomPosition: 'MIDDLE',  capacity: 2 },
  },
]

// GET /api/seed/students  —  inserts dummy students, skips existing
seedRouter.get('/students', async (req, res) => {
  const results = { created: [], skipped: [] }
  const password = 'Test@1234'
  const passwordHash = await bcrypt.hash(password, 10)

  for (const data of STUDENTS) {
    const { user: u, profile: p, pref } = data
    const email = u.email.toLowerCase().trim()

    const existing = await User.findOne({ email })
    if (existing) { results.skipped.push(email); continue }

    const newUser = await User.create({
      fullName: u.fullName, email, passwordHash,
      phone: u.phone, gender: u.gender,
      role: 'student', isVerified: true,
    })

    const profile = await StudentProfile.create({
      userId: newUser._id, email,
      profileCompleted: true, roomPreferenceCompleted: true, finalLockCompleted: false,
      ...p,
    })

    await RoomPreference.create({ studentId: profile._id, ...pref })
    results.created.push({ name: u.fullName, email, block: pref.block, acType: pref.acType })
  }

  res.json({
    success: true,
    message: `Created ${results.created.length}, Skipped ${results.skipped.length}`,
    password,
    data: results,
  })
})

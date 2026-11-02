/**
 * seedRoommate.js — dummy data for the Roommate Matching module.
 * Run: npm run seed:roommate
 *
 * Idempotent: only touches records tied to the @staygo-demo.lk email domain
 * (plus the demo rooms), so real data is never removed.
 *
 * Demo logins (password for all: Demo@12345)
 *   students   : <first>.<last>@staygo-demo.lk  e.g. nimali.perera@staygo-demo.lk
 *   admin      : admin@staygo-demo.lk
 *   rider      : rider@staygo-demo.lk
 *   technician : technician@staygo-demo.lk
 */
import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../../modules/users/user.model.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { RoomPreference } from '../models/RoomPreference.js'
import { Room } from '../models/Room.js'
import { MatchRequest } from '../models/MatchRequest.js'
import { MatchPair } from '../models/MatchPair.js'
import { RoommateNotification } from '../models/RoommateNotification.js'
import { IssueReport } from '../models/IssueReport.js'
import { calculateRawScore, toVisibleScore } from '../utils/matchScore.js'
import fs from 'fs'
import path from 'path'
import { Notification, Broadcast } from '../../modules/notifications/notification.model.js'
import { Announcement } from '../../modules/maintenance/models/Announcement.js'
import { TechnicianAvailability } from '../../modules/technician/models/TechnicianAvailability.js'

const DOMAIN = 'staygo-demo.lk'
const PASSWORD = 'Demo@12345'

const STUDENTS = [
  // firstName, lastName, gender, age, sleep, clean, social, study, interests, bio
  ['Nimali', 'Perera', 'Female', 21, 'EARLY_BIRD', 5, 'QUIET', 'SILENT', 'Reading, yoga', 'Software engineering student who loves a tidy room.'],
  ['Dilini', 'Fernando', 'Female', 20, 'EARLY_BIRD', 4, 'QUIET', 'SILENT', 'Painting, baking', 'Early riser, library regular.'],
  ['Kavindi', 'Silva', 'Female', 22, 'NIGHT_OWL', 3, 'SOCIAL', 'ANY', 'Music, movies', 'Night-time coder, always up for a chat.'],
  ['Sachini', 'Jayawardena', 'Female', 21, 'NIGHT_OWL', 3, 'MODERATE', 'SOME_NOISE', 'Gaming, anime', 'Business student, relaxed and friendly.'],
  ['Tharushi', 'Wickramasinghe', 'Female', 23, 'EARLY_BIRD', 5, 'MODERATE', 'SILENT', 'Running, journaling', 'Postgrad, keeps a strict study routine.'],
  ['Hasini', 'Rajapaksa', 'Female', 20, 'NIGHT_OWL', 2, 'SOCIAL', 'ANY', 'Dance, travel', 'Outgoing and loves hosting friends.'],
  ['Amaya', 'Gunasekara', 'Female', 21, 'EARLY_BIRD', 4, 'MODERATE', 'SOME_NOISE', 'Photography', 'Design student, neat and calm.'],
  ['Ishara', 'Bandara', 'Female', 22, 'EARLY_BIRD', 4, 'MODERATE', 'SOME_NOISE', 'Cooking, hiking', 'Weekend hiker, weekday studier.'],
  ['Kasun', 'Perera', 'Male', 22, 'NIGHT_OWL', 3, 'SOCIAL', 'ANY', 'Football, guitar', 'Engineering student, plays in the campus band.'],
  ['Dasun', 'Fernando', 'Male', 21, 'EARLY_BIRD', 5, 'QUIET', 'SILENT', 'Chess, coding', 'Quiet and organised, competitive programmer.'],
  ['Supun', 'Rathnayake', 'Male', 23, 'NIGHT_OWL', 2, 'MODERATE', 'SOME_NOISE', 'Cricket, gaming', 'Laid-back, studies best at night.'],
  ['Chamara', 'Dissanayake', 'Male', 20, 'EARLY_BIRD', 4, 'QUIET', 'SOME_NOISE', 'Swimming, reading', 'First-year, adjusting to hostel life.'],
  ['Nuwan', 'Herath', 'Male', 22, 'NIGHT_OWL', 3, 'SOCIAL', 'ANY', 'Cycling, vlogging', 'Content creator, social and easy going.'],
  ['Ravindu', 'Senanayake', 'Male', 21, 'EARLY_BIRD', 5, 'MODERATE', 'SILENT', 'Robotics, badminton', 'Likes a clean desk and quiet evenings.'],
]

const ROOMS = [
  ['A101', 'A', '1', 2, 'AC', 'BALCONY'],
  ['A102', 'A', '1', 2, 'AC', 'MIDDLE'],
  ['A201', 'A', '2', 3, 'NON_AC', 'MIDDLE'],
  ['B101', 'B', '1', 2, 'AC', 'BALCONY'],
  ['B102', 'B', '1', 2, 'NON_AC', 'MIDDLE'],
  ['B201', 'B', '2', 4, 'NON_AC', 'BALCONY'],
  ['C101', 'C', '1', 2, 'AC', 'MIDDLE'],
  ['C201', 'C', '2', 2, 'NON_AC', 'BALCONY'],
]

// Room preferences per student (index-aligned with STUDENTS). Same acType/position/capacity = suggestable.
const P = (block, floor, acType, roomPosition) => ({ block, floor, acType, roomPosition, capacity: 2 })
const PREFS = [
  P('A', '1', 'AC', 'BALCONY'), P('A', '1', 'AC', 'BALCONY'), // 0,1 locked pair
  P('A', '1', 'AC', 'MIDDLE'), P('A', '2', 'AC', 'MIDDLE'), P('B', '1', 'AC', 'MIDDLE'), P('B', '1', 'AC', 'MIDDLE'),
  P('C', '2', 'NON_AC', 'BALCONY'), P('C', '2', 'NON_AC', 'BALCONY'),
  P('B', '1', 'AC', 'BALCONY'), P('B', '1', 'AC', 'BALCONY'), // 8,9 locked pair
  P('C', '1', 'NON_AC', 'MIDDLE'), P('C', '1', 'AC', 'MIDDLE'), P('C', '2', 'NON_AC', 'MIDDLE'), P('C', '2', 'NON_AC', 'MIDDLE'),
]

const email = (first, last) => `${first}.${last}@${DOMAIN}`.toLowerCase()

async function main() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI not set in .env')
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
  console.log('✅ Connected to', mongoose.connection.name)

  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  // ── 1. Clean previous demo data ──────────────────────────────────────────
  const oldUsers = await User.find({ email: new RegExp(`@${DOMAIN.replace('.', '\\.')}$`) }).select('_id')
  const oldUserIds = oldUsers.map((u) => u._id)
  const oldProfiles = await StudentProfile.find({ userId: { $in: oldUserIds } }).select('_id')
  const oldProfileIds = oldProfiles.map((p) => p._id)
  await Promise.all([
    RoomPreference.deleteMany({ studentId: { $in: oldProfileIds } }),
    MatchRequest.deleteMany({
      $or: [{ senderStudentId: { $in: oldProfileIds } }, { receiverStudentId: { $in: oldProfileIds } }],
    }),
    MatchPair.deleteMany({ $or: [{ studentA: { $in: oldProfileIds } }, { studentB: { $in: oldProfileIds } }] }),
    RoommateNotification.deleteMany({ studentId: { $in: oldProfileIds } }),
    IssueReport.deleteMany({ reportedBy: { $in: oldUserIds } }),
    Notification.deleteMany({ userId: { $in: oldUserIds } }),
    Broadcast.deleteMany({ sentBy: { $in: oldUserIds } }),
    Announcement.deleteMany({ createdBy: { $in: oldUserIds } }),
    TechnicianAvailability.deleteMany({ technicianId: { $in: oldUserIds } }),
    StudentProfile.deleteMany({ _id: { $in: oldProfileIds } }),
    Room.deleteMany({ roomNumber: { $in: ROOMS.map((r) => r[0]) } }),
    User.deleteMany({ _id: { $in: oldUserIds } }),
  ])

  // ── 2. Staff users (one per role, for testing role-based redirects) ──────
  const staff = [
    { role: 'admin', fullName: 'Demo Admin', email: `admin@${DOMAIN}` },
    { role: 'rider', fullName: 'Demo Rider', email: `rider@${DOMAIN}`, hasVehicle: true, vehicleType: 'car', vehicleNumber: 'CAB-1234', seatCount: 3, riderVerificationStatus: 'approved' },
    { role: 'technician', fullName: 'Demo Technician', email: `technician@${DOMAIN}` },
  ]
  const staffDocs = []
  for (const s of staff) {
    staffDocs.push(await User.create({ ...s, passwordHash, isVerified: true }))
  }
  const technician = staffDocs.find((u) => u.role === 'technician')

  // ── 3. Rooms ─────────────────────────────────────────────────────────────
  const rooms = {}
  for (const [roomNumber, block, floor, capacity, acType, roomPosition] of ROOMS) {
    rooms[roomNumber] = await Room.create({ roomNumber, block, floor, capacity, acType, roomPosition })
  }

  // ── 4. Students: user + profile + room preference ────────────────────────
  const profiles = []
  for (const [i, s] of STUDENTS.entries()) {
    const [firstName, lastName, gender, age, sleepSchedule, cleanliness, socialHabits, studyHabits, interests, bio] = s
    const user = await User.create({
      role: 'student',
      fullName: `${firstName} ${lastName}`,
      email: email(firstName, lastName),
      passwordHash,
      phone: `07${1 + (i % 8)}${String(1000000 + i * 7919).slice(0, 7)}`,
      gender: gender.toLowerCase(),
      studentId: `IT22${String(1000 + i)}`,
      isVerified: true,
    })
    const profile = await StudentProfile.create({
      userId: user._id,
      firstName,
      lastName,
      email: user.email,
      whatsApp: user.phone,
      address: 'Colombo, Sri Lanka',
      gender,
      age,
      bio,
      interests,
      sleepSchedule,
      cleanliness,
      socialHabits,
      studyHabits,
      profileCompleted: true,
      roomPreferenceCompleted: true,
      rating: Math.round((3.5 + ((i * 37) % 15) / 10) * 10) / 10,
      ratingCount: 2 + (i % 5),
    })
    await RoomPreference.create({
      studentId: profile._id,
      ...PREFS[i],
    })
    profiles.push(profile)
  }

  const score = (a, b) => toVisibleScore(calculateRawScore(a, b))

  // ── 5. Locked pairs (female pair → A101, male pair → B101) ───────────────
  const pairs = [
    [0, 1, 'A101'],
    [8, 9, 'B101'],
  ]
  for (const [a, b, roomNumber] of pairs) {
    const room = rooms[roomNumber]
    await MatchRequest.create({
      senderStudentId: profiles[a]._id,
      receiverStudentId: profiles[b]._id,
      compatibilityScore: score(profiles[a], profiles[b]),
      status: 'ACCEPTED',
      respondedAt: new Date(),
    })
    await MatchPair.create({
      studentA: profiles[a]._id,
      studentB: profiles[b]._id,
      compatibilityScore: score(profiles[a], profiles[b]),
      roomId: room._id,
    })
    for (const idx of [a, b]) {
      profiles[idx].finalLockCompleted = true
      profiles[idx].roomId = room._id
      await profiles[idx].save()
    }
    room.occupancyCount = 2
    await room.save()
    await RoommateNotification.create({
      studentId: profiles[a]._id,
      type: 'ROOMMATE_PAIR_LOCKED',
      title: 'Roommate locked in',
      message: `You and ${profiles[b].firstName} are now roommates in room ${roomNumber}.`,
    })
    await RoommateNotification.create({
      studentId: profiles[b]._id,
      type: 'ROOMMATE_PAIR_LOCKED',
      title: 'Roommate locked in',
      message: `You and ${profiles[a].firstName} are now roommates in room ${roomNumber}.`,
    })
  }

  // ── 6. Pending / rejected requests for the request & notification pages ──
  const requests = [
    [2, 3, 'PENDING'],
    [4, 2, 'PENDING'],
    [5, 3, 'REJECTED'],
    [10, 12, 'PENDING'],
    [11, 13, 'PENDING'],
  ]
  for (const [from, to, status] of requests) {
    const req = await MatchRequest.create({
      senderStudentId: profiles[from]._id,
      receiverStudentId: profiles[to]._id,
      compatibilityScore: score(profiles[from], profiles[to]),
      status,
      respondedAt: status === 'PENDING' ? null : new Date(),
    })
    if (status === 'PENDING') {
      await RoommateNotification.create({
        studentId: profiles[to]._id,
        type: 'MATCH_REQUEST_RECEIVED',
        title: 'New roommate request',
        message: `${profiles[from].firstName} ${profiles[from].lastName} wants to be your roommate (${req.compatibilityScore}% match).`,
        relatedEntityId: req._id,
      })
    } else {
      await RoommateNotification.create({
        studentId: profiles[from]._id,
        type: 'MATCH_REQUEST_REJECTED',
        title: 'Request declined',
        message: `${profiles[to].firstName} declined your roommate request.`,
        relatedEntityId: req._id,
      })
    }
  }

  // ── 7. Issue reports ─────────────────────────────────────────────────────
  const owner = async (idx) => (await User.findById(profiles[idx].userId))._id
  const issues = [
    [0, 'A101', 'ELECTRICITY', 'Flickering ceiling light', 'The light above the study desk flickers constantly.', 'MEDIUM', 'SUBMITTED'],
    [1, 'A101', 'WATER', 'Bathroom tap leaking', 'The wash basin tap keeps dripping through the night.', 'HIGH', 'IN_PROGRESS'],
    [8, 'B101', 'CLEANING', 'Corridor not cleaned', 'The corridor outside B101 has not been cleaned this week.', 'LOW', 'RESOLVED'],
    [9, 'B101', 'SAFETY', 'Broken window latch', 'The window latch is broken and will not lock.', 'EMERGENCY', 'SUBMITTED'],
    [6, null, 'FACILITIES', 'Wi-Fi very slow', 'Wi-Fi in block C drops every evening.', 'MEDIUM', 'IN_PROGRESS'],
  ]
  for (const [idx, roomNumber, category, title, description, priority, status] of issues) {
    await IssueReport.create({
      reportedBy: await owner(idx),
      roomId: roomNumber ? rooms[roomNumber]._id : null,
      roomNumber,
      category,
      title,
      description,
      priority,
      status,
      assignedTechnician: status === 'SUBMITTED' ? null : technician._id,
      startedAt: status === 'SUBMITTED' ? null : new Date(),
      resolvedAt: status === 'RESOLVED' ? new Date() : null,
      completedAt: status === 'RESOLVED' ? new Date() : null,
    })
  }

  // ── 8. Communication + verification demo data ────────────────────────────
  const admin = staffDocs.find((u) => u.role === 'admin')

  // A second technician whose documents are waiting for admin review
  const docDir = path.resolve(process.env.UPLOAD_DIR || 'uploads', 'verification')
  fs.mkdirSync(docDir, { recursive: true })
  const pdf = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 100]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF'
  fs.writeFileSync(path.join(docDir, 'demo-nic.pdf'), pdf)
  fs.writeFileSync(path.join(docDir, 'demo-certificate.pdf'), pdf)
  await User.create({
    role: 'technician',
    fullName: 'Pradeep Kumara',
    email: `pradeep.kumara@${DOMAIN}`,
    passwordHash,
    phone: '0771234567',
    isVerified: true,
    availability: 'available',
    technicianVerificationStatus: 'pending',
    technicianSubmittedAt: new Date(Date.now() - 3600 * 1000 * 5),
    verificationDocs: [
      { docType: 'nic', label: 'Front and back', url: '/uploads/verification/demo-nic.pdf', originalName: 'nic-scan.pdf' },
      { docType: 'certificate', label: 'NVQ Level 4 Electrician', url: '/uploads/verification/demo-certificate.pdf', originalName: 'nvq-electrician.pdf' },
    ],
  })

  // The main demo technician: live status + a Mon–Fri weekly schedule
  await User.updateOne({ _id: technician._id }, { availability: 'available' })
  await TechnicianAvailability.insertMany(
    [0, 1, 2, 3, 4, 5, 6].map((d) => ({
      technicianId: technician._id,
      dayOfWeek: d,
      startTime: '08:00',
      endTime: '17:00',
      isAvailable: d >= 1 && d <= 5,
    }))
  )

  // A rider application waiting for approval
  await User.create({
    role: 'student',
    fullName: 'Lahiru Madushanka',
    email: `lahiru.madushanka@${DOMAIN}`,
    passwordHash,
    isVerified: true,
    studentId: 'IT22900',
    hasVehicle: true,
    vehicleType: 'bike',
    vehicleNumber: 'BHK-4521',
    seatCount: 1,
    riderVerificationStatus: 'pending',
    riderAppliedAt: new Date(Date.now() - 3600 * 1000 * 26),
  })

  // One unassigned emergency issue so the Complaint Center has something to assign
  await IssueReport.create({
    reportedBy: await owner(2),
    roomNumber: 'A201',
    category: 'ELECTRICITY',
    title: 'Socket sparks when charger is plugged in',
    description: 'The wall socket next to the bed sparks every time a charger is plugged in. Please check urgently.',
    priority: 'EMERGENCY',
    status: 'SUBMITTED',
  })

  await Announcement.insertMany([
    { title: 'Water supply cut — Block A', content: 'Water will be unavailable in Block A on Saturday from 8:00 AM to 1:00 PM for tank cleaning. Please store water in advance.', priority: 'important', createdBy: admin._id },
    { title: 'Scheduled power maintenance', content: 'Electricity will be switched off briefly in Blocks B and C on Sunday evening while the main panel is serviced.', priority: 'normal', createdBy: admin._id },
  ])
  const welcome = await Broadcast.create({
    title: 'Welcome to the new Stay & Go portal',
    message: 'You can now report issues, find roommates and track maintenance in one place.',
    audience: 'all',
    recipientCount: staffDocs.length + 1,
    sentBy: admin._id,
  })
  await Notification.insertMany([
    { userId: technician._id, type: 'job', title: 'New job assigned', message: 'You were assigned: Bathroom tap leaking', priority: 'important', link: '/technician/jobs/assigned' },
    { userId: technician._id, type: 'announcement', title: welcome.title, message: welcome.message, broadcastId: welcome._id },
    { userId: admin._id, type: 'verification', title: 'Technician verification request', message: 'Pradeep Kumara submitted 2 document(s) for verification.', link: '/admin/verification-requests' },
    { userId: admin._id, type: 'complaint', title: 'Emergency issue reported', message: 'Socket sparks when charger is plugged in (Room A201)', priority: 'urgent', link: '/admin/complaints' },
  ])

  console.log(`\n🌱 Seeded: ${staffDocs.length} staff, ${STUDENTS.length} students, ${ROOMS.length} rooms, ${pairs.length} locked pairs, ${requests.length} requests, ${issues.length} issues`)
  console.log(`\nLogin password for every demo account: ${PASSWORD}`)
  console.log(`  student    : ${email(STUDENTS[0][0], STUDENTS[0][1])}   (locked with ${STUDENTS[1][0]})`)
  console.log(`  student    : ${email(STUDENTS[2][0], STUDENTS[2][1])}   (has pending requests)`)
  console.log(`  student    : ${email(STUDENTS[12][0], STUDENTS[12][1])}   (free — browse suggestions)`)
  console.log(`  admin      : admin@${DOMAIN}`)
  console.log(`  rider      : rider@${DOMAIN}`)
  console.log(`  technician : technician@${DOMAIN}`)
  console.log(`  technician : pradeep.kumara@${DOMAIN}   (verification pending)`)

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('❌ Seed failed:', err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})

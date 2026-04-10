import { User } from '../../users/user.model.js'
import { Ticket } from '../models/Ticket.js'
import { Announcement } from '../models/Announcement.js'
import { ROLES } from '../../../common/constants/roles.js'
import { hashPassword } from '../../../common/utils/password.js'

// ============================================
// MAINTENANCE SEED SCRIPT
// Creates maintenance test users (students + technicians)
// And populates sample tickets and announcements
// ============================================

// Helper to create or update a user
async function upsertUser({ email, password, role, fullName, studentId, phone }) {
  const normalizedEmail = email.toLowerCase().trim()
  const existing = await User.findOne({ email: normalizedEmail })
  const passwordHash = await hashPassword(password)

  const userData = {
    role,
    fullName,
    email: normalizedEmail,
    passwordHash,
    studentId: studentId || null,
    phone: phone || null,
    isVerified: true,
    isBlocked: false,
  }

  if (existing) {
    Object.assign(existing, userData)
    await existing.save()
    return existing
  }

  return User.create(userData)
}

export async function seedMaintenanceData() {
  // ---- CREATE STUDENT USERS ----
  const student1 = await upsertUser({
    email: 'kasun@university.edu',
    password: 'password123',
    role: ROLES.STUDENT,
    fullName: 'Kasun Perera',
    studentId: 'IT23000001',
    phone: '+94-77-100-0001',
  })

  const student2 = await upsertUser({
    email: 'nimali@university.edu',
    password: 'password123',
    role: ROLES.STUDENT,
    fullName: 'Nimali Fernando',
    studentId: 'IT23000002',
    phone: '+94-77-100-0002',
  })

  // ---- CREATE TECHNICIAN USERS ----
  const tech1 = await upsertUser({
    email: 'nimal@university.edu',
    password: 'password123',
    role: ROLES.TECHNICIAN,
    fullName: 'Nimal Silva',
    phone: '+94-77-200-0001',
  })

  const tech2 = await upsertUser({
    email: 'ruwan@university.edu',
    password: 'password123',
    role: ROLES.TECHNICIAN,
    fullName: 'Ruwan Fernando',
    phone: '+94-77-200-0002',
  })

  const tech3 = await upsertUser({
    email: 'chaminda@university.edu',
    password: 'password123',
    role: ROLES.TECHNICIAN,
    fullName: 'Chaminda Jayasinghe',
    phone: '+94-77-200-0003',
  })

  // ---- CREATE MAINTENANCE ADMIN ----
  const maintenanceAdmin = await upsertUser({
    email: 'sarah@university.edu',
    password: 'password123',
    role: ROLES.ADMIN,
    fullName: 'Sarah M.D.',
    phone: '+94-77-300-0001',
  })

  // ---- CLEAR EXISTING SAMPLE DATA ----
  // Only clear maintenance data, leave team's other data alone
  await Ticket.deleteMany({})
  await Announcement.deleteMany({})

  // ---- CREATE SAMPLE TICKETS ----
  await Ticket.insertMany([
    {
      ticketId: 'MT-20260320-001',
      title: 'Broken tap in bathroom',
      category: 'plumbing',
      priority: 'high',
      hostelBlock: 'A',
      roomNumber: '204',
      description: 'The hot water tap in the shared bathroom on the second floor is leaking badly. Water is dripping continuously and the floor is getting wet which is dangerous.',
      status: 'submitted',
      submittedBy: student1._id,
      statusHistory: [
        { status: 'submitted', changedBy: student1._id, changedAt: new Date('2026-03-20T08:30:00'), note: 'Ticket submitted by student' },
      ],
      createdAt: new Date('2026-03-20T08:30:00'),
    },
    {
      ticketId: 'MT-20260319-003',
      title: 'Power socket not working in room',
      category: 'electrical',
      priority: 'medium',
      hostelBlock: 'B',
      roomNumber: '312',
      description: 'The power socket near the study desk stopped working since yesterday. I cannot charge my laptop or use the desk lamp. Other sockets in the room are working fine.',
      status: 'assigned',
      submittedBy: student1._id,
      assignedTo: tech1._id,
      statusHistory: [
        { status: 'submitted', changedBy: student1._id, changedAt: new Date('2026-03-19T14:20:00'), note: 'Ticket submitted by student' },
        { status: 'assigned', changedBy: maintenanceAdmin._id, changedAt: new Date('2026-03-19T16:45:00'), note: 'Technician assigned by admin' },
      ],
      createdAt: new Date('2026-03-19T14:20:00'),
    },
    {
      ticketId: 'MT-20260318-002',
      title: 'WiFi connection dropping frequently',
      category: 'network',
      priority: 'high',
      hostelBlock: 'A',
      roomNumber: '105',
      description: 'The WiFi keeps disconnecting every few minutes in my room. It started after the weekend and multiple students on this floor are facing the same issue.',
      status: 'in_progress',
      submittedBy: student1._id,
      assignedTo: tech2._id,
      statusHistory: [
        { status: 'submitted', changedBy: student1._id, changedAt: new Date('2026-03-18T09:10:00'), note: 'Ticket submitted by student' },
        { status: 'assigned', changedBy: maintenanceAdmin._id, changedAt: new Date('2026-03-18T10:30:00'), note: 'Technician assigned by admin' },
        { status: 'in_progress', changedBy: tech2._id, changedAt: new Date('2026-03-18T13:00:00'), note: 'Technician started working on the issue' },
      ],
      createdAt: new Date('2026-03-18T09:10:00'),
    },
    {
      ticketId: 'MT-20260317-001',
      title: 'Broken chair in study room',
      category: 'furniture',
      priority: 'low',
      hostelBlock: 'C',
      roomNumber: '401',
      description: 'One of the chairs in the common study room has a broken leg and is unstable. Someone might fall and get hurt if they try to sit on it.',
      status: 'resolved',
      submittedBy: student1._id,
      assignedTo: tech3._id,
      resolutionNote: 'Replaced the broken chair leg with a new one. Chair is now stable and safe to use.',
      statusHistory: [
        { status: 'submitted', changedBy: student1._id, changedAt: new Date('2026-03-17T07:45:00'), note: 'Ticket submitted by student' },
        { status: 'assigned', changedBy: maintenanceAdmin._id, changedAt: new Date('2026-03-17T09:00:00'), note: 'Technician assigned by admin' },
        { status: 'in_progress', changedBy: tech3._id, changedAt: new Date('2026-03-17T10:30:00'), note: 'Technician started working on the issue' },
        { status: 'resolved', changedBy: tech3._id, changedAt: new Date('2026-03-17T14:00:00'), note: 'Replaced the broken chair leg with a new one.' },
      ],
      createdAt: new Date('2026-03-17T07:45:00'),
    },
    {
      ticketId: 'MT-20260315-002',
      title: 'Ceiling fan making loud noise',
      category: 'electrical',
      priority: 'medium',
      hostelBlock: 'D',
      roomNumber: '208',
      description: 'The ceiling fan in my room is making a very loud rattling noise when turned on. It vibrates a lot and I am worried it might fall down.',
      status: 'closed',
      submittedBy: student1._id,
      assignedTo: tech1._id,
      resolutionNote: 'Tightened the fan mounting screws and balanced the blades. Fan is now running smoothly without noise.',
      rating: 4,
      ratingFeedback: 'Good service, fixed quickly. Thank you!',
      statusHistory: [
        { status: 'submitted', changedBy: student1._id, changedAt: new Date('2026-03-15T11:20:00'), note: 'Ticket submitted by student' },
        { status: 'assigned', changedBy: maintenanceAdmin._id, changedAt: new Date('2026-03-15T13:00:00'), note: 'Technician assigned by admin' },
        { status: 'in_progress', changedBy: tech1._id, changedAt: new Date('2026-03-15T14:30:00'), note: 'Technician started working' },
        { status: 'resolved', changedBy: tech1._id, changedAt: new Date('2026-03-15T16:00:00'), note: 'Tightened screws and balanced blades.' },
        { status: 'closed', changedBy: student1._id, changedAt: new Date('2026-03-16T08:00:00'), note: 'Student rated 4/5: Good service!' },
      ],
      createdAt: new Date('2026-03-15T11:20:00'),
    },
    {
      ticketId: 'MT-20260316-001',
      title: 'Duplicate complaint test',
      category: 'other',
      priority: 'low',
      hostelBlock: 'E',
      roomNumber: '101',
      description: 'This is a test complaint that was submitted by mistake and was rejected by the admin as it was a duplicate of another existing ticket.',
      status: 'rejected',
      submittedBy: student2._id,
      rejectionReason: 'This is a duplicate of ticket MT-20260315-002. Please check your existing tickets before submitting new ones.',
      statusHistory: [
        { status: 'submitted', changedBy: student2._id, changedAt: new Date('2026-03-16T09:00:00'), note: 'Ticket submitted by student' },
        { status: 'rejected', changedBy: maintenanceAdmin._id, changedAt: new Date('2026-03-16T09:30:00'), note: 'Duplicate of MT-20260315-002.' },
      ],
      createdAt: new Date('2026-03-16T09:00:00'),
    },
    {
      ticketId: 'MT-20260322-001',
      title: 'Water heater not heating',
      category: 'plumbing',
      priority: 'emergency',
      hostelBlock: 'A',
      roomNumber: '301',
      description: 'The water heater in the bathroom is not working at all. No hot water is coming out even after waiting for a long time. Many students need hot water for bathing.',
      status: 'submitted',
      submittedBy: student2._id,
      statusHistory: [
        { status: 'submitted', changedBy: student2._id, changedAt: new Date('2026-03-22T06:15:00'), note: 'Ticket submitted by student' },
      ],
      createdAt: new Date('2026-03-22T06:15:00'),
    },
    {
      ticketId: 'MT-20260321-001',
      title: 'Common area floor needs cleaning',
      category: 'cleaning',
      priority: 'low',
      hostelBlock: 'B',
      roomNumber: '000',
      description: 'The common area floor on the ground floor is very dirty and has not been cleaned for the past few days. It looks bad and smells unpleasant.',
      status: 'assigned',
      submittedBy: student1._id,
      assignedTo: tech2._id,
      statusHistory: [
        { status: 'submitted', changedBy: student1._id, changedAt: new Date('2026-03-21T10:00:00'), note: 'Ticket submitted by student' },
        { status: 'assigned', changedBy: maintenanceAdmin._id, changedAt: new Date('2026-03-21T11:30:00'), note: 'Technician assigned by admin' },
      ],
      createdAt: new Date('2026-03-21T10:00:00'),
    },
  ])

  // ---- CREATE SAMPLE ANNOUNCEMENTS ----
  await Announcement.insertMany([
    {
      title: 'Scheduled water supply maintenance - Block A & B',
      content: 'Water supply will be temporarily cut off on Block A and Block B on 28th March from 8:00 AM to 12:00 PM for pipe maintenance work. Please store enough water before that time.',
      priority: 'urgent',
      isActive: true,
      createdBy: maintenanceAdmin._id,
    },
    {
      title: 'New maintenance request process update',
      content: 'From now on all maintenance requests should be submitted through the STAY & GO platform only. Phone calls and informal messages will not be accepted as official requests.',
      priority: 'important',
      isActive: true,
      createdBy: maintenanceAdmin._id,
    },
    {
      title: 'Monthly pest control schedule',
      content: 'Regular pest control treatment will be carried out in all hostel blocks during the first week of April. Students are requested to keep their rooms tidy and remove any food items.',
      priority: 'normal',
      isActive: true,
      createdBy: maintenanceAdmin._id,
    },
  ])

  // Print credentials for easy testing
  console.log('\n========================================')
  console.log('  MAINTENANCE TEST CREDENTIALS')
  console.log('========================================')
  console.log('  Student:    kasun@university.edu    / password123')
  console.log('  Student 2:  nimali@university.edu   / password123')
  console.log('  Technician: nimal@university.edu    / password123')
  console.log('  Technician: ruwan@university.edu    / password123')
  console.log('  Technician: chaminda@university.edu / password123')
  console.log('  Admin:      sarah@university.edu    / password123')
  console.log('========================================\n')

  return {
    students: [student1, student2],
    technicians: [tech1, tech2, tech3],
    admin: maintenanceAdmin,
  }
}

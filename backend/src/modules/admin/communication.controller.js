import mongoose from 'mongoose'
import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { ApiError } from '../../common/utils/ApiError.js'
import { ROLES } from '../../common/constants/roles.js'
import { User } from '../users/user.model.js'
import { sanitizeUser } from '../auth/auth.service.js'
import { Ticket } from '../maintenance/models/Ticket.js'
import * as ticketService from '../maintenance/services/ticket.service.js'
import { IssueReport } from '../../roommate/models/IssueReport.js'
import { ISSUE_STATUS } from '../../roommate/constants/enums.js'
import { Notification, Broadcast } from '../notifications/notification.model.js'
import { notifyUser, notifyUsers } from '../notifications/notification.service.js'
import { AdminActionLog } from './models/AdminActionLog.js'

const AUDIENCES = ['all', 'student', 'rider', 'technician', 'admin']
const PRIORITIES = ['normal', 'important', 'urgent']

// Room numbers like "A101" already include the block letter; plain ones ("12") do not.
const roomLabel = (block, roomNumber) =>
  !block || String(roomNumber).toUpperCase().startsWith(String(block).toUpperCase()) ? String(roomNumber) : `${block}-${roomNumber}`

const checkId = (id, label = 'id') => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `Invalid ${label}`)
}

// ───────────────────────── Notifications (broadcast) ─────────────────────────

// POST /admin/notifications/broadcast  { audience, title, message, priority }
export const broadcast = asyncHandler(async (req, res) => {
  const { audience = 'all', priority = 'normal' } = req.body
  const title = (req.body.title || '').trim()
  const message = (req.body.message || '').trim()

  if (!AUDIENCES.includes(audience)) throw new ApiError(400, `audience must be one of: ${AUDIENCES.join(', ')}`)
  if (!PRIORITIES.includes(priority)) throw new ApiError(400, `priority must be one of: ${PRIORITIES.join(', ')}`)
  if (title.length < 3 || title.length > 100) throw new ApiError(400, 'Title must be 3–100 characters')
  if (message.length < 5 || message.length > 500) throw new ApiError(400, 'Message must be 5–500 characters')

  const filter = { isBlocked: false }
  if (audience === 'admin') filter.role = { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }
  else if (audience !== 'all') filter.role = audience

  const recipients = await User.find(filter).select('_id').lean()
  if (!recipients.length) throw new ApiError(400, 'No users found for this audience')

  const record = await Broadcast.create({
    title,
    message,
    audience,
    priority,
    recipientCount: recipients.length,
    sentBy: req.user.id,
  })
  await Notification.insertMany(
    recipients.map((r) => ({
      userId: r._id,
      type: 'announcement',
      title,
      message,
      priority,
      broadcastId: record._id,
    }))
  )
  await AdminActionLog.create({
    adminId: req.user.id,
    actionType: 'BROADCAST',
    description: `Sent "${title}" to ${audience} (${recipients.length} users)`,
    targetId: record._id,
  })

  res.status(201).json({ success: true, broadcast: record })
})

// GET /admin/notifications/broadcasts
export const listBroadcasts = asyncHandler(async (_req, res) => {
  const items = await Broadcast.find().sort({ createdAt: -1 }).limit(50).populate('sentBy', 'fullName').lean()
  res.json({ success: true, items })
})

// ───────────────────────── Complaint center ─────────────────────────

const TICKET_STATUS = {
  submitted: 'open',
  assigned: 'assigned',
  in_progress: 'in_progress',
  resolved: 'resolved',
  closed: 'resolved',
  rejected: 'rejected',
}

const fromTicket = (t) => ({
  id: t._id.toString(),
  source: 'ticket',
  ref: t.ticketId,
  title: t.title,
  description: t.description,
  category: t.category,
  priority: t.priority,
  status: TICKET_STATUS[t.status] || t.status,
  rawStatus: t.status,
  room: `${t.hostelBlock}-${t.roomNumber}`,
  reporter: { name: t.submittedBy?.fullName || '—', email: t.submittedBy?.email || '' },
  assignedTo: t.assignedTo ? { id: t.assignedTo._id.toString(), name: t.assignedTo.fullName } : null,
  createdAt: t.createdAt,
})

const fromIssue = (i) => {
  const status =
    i.status === ISSUE_STATUS.RESOLVED
      ? 'resolved'
      : i.status === ISSUE_STATUS.IN_PROGRESS
        ? 'in_progress'
        : i.assignedTechnician
          ? 'assigned'
          : 'open'
  return {
    id: i._id.toString(),
    source: 'issue',
    ref: `RM-${i._id.toString().slice(-6).toUpperCase()}`,
    title: i.title,
    description: i.description,
    category: (i.category || '').toLowerCase().replace('_', ' '),
    priority: (i.priority || 'MEDIUM').toLowerCase(),
    status,
    rawStatus: i.status,
    room: i.roomNumber || '—',
    reporter: { name: i.reportedBy?.fullName || '—', email: i.reportedBy?.email || '' },
    assignedTo: i.assignedTechnician
      ? { id: i.assignedTechnician._id.toString(), name: i.assignedTechnician.fullName }
      : null,
    createdAt: i.createdAt,
  }
}

// GET /admin/complaints?source=all|ticket|issue
export const listComplaints = asyncHandler(async (req, res) => {
  const source = req.query.source || 'all'
  const [tickets, issues] = await Promise.all([
    source === 'issue'
      ? []
      : Ticket.find().populate('submittedBy', 'fullName email').populate('assignedTo', 'fullName').sort({ createdAt: -1 }).limit(200).lean(),
    source === 'ticket'
      ? []
      : IssueReport.find().populate('reportedBy', 'fullName email').populate('assignedTechnician', 'fullName').sort({ createdAt: -1 }).limit(200).lean(),
  ])

  const items = [...tickets.map(fromTicket), ...issues.map(fromIssue)].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
  const count = (fn) => items.filter(fn).length
  const summary = {
    total: items.length,
    open: count((c) => c.status === 'open'),
    inProgress: count((c) => c.status === 'assigned' || c.status === 'in_progress'),
    resolved: count((c) => c.status === 'resolved'),
    emergency: count((c) => ['emergency', 'high'].includes(c.priority) && !['resolved', 'rejected'].includes(c.status)),
  }
  res.json({ success: true, items, summary })
})

// PATCH /admin/complaints/:source/:id/assign  { technicianId }
export const assignComplaint = asyncHandler(async (req, res) => {
  const { source, id } = req.params
  const { technicianId } = req.body
  checkId(id, 'complaint id')
  checkId(technicianId, 'technician id')

  const tech = await User.findOne({ _id: technicianId, role: ROLES.TECHNICIAN, isBlocked: false }).select('fullName')
  if (!tech) throw new ApiError(404, 'Technician not found')

  let title
  if (source === 'ticket') {
    const ticket = await ticketService.assignTicket({ ticketId: id, technicianId, adminId: req.user.id })
    title = ticket.title
  } else if (source === 'issue') {
    const issue = await IssueReport.findById(id)
    if (!issue) throw new ApiError(404, 'Issue not found')
    if (issue.status === ISSUE_STATUS.RESOLVED) throw new ApiError(400, 'Issue is already resolved')
    issue.assignedTechnician = technicianId
    await issue.save()
    title = issue.title
  } else {
    throw new ApiError(400, 'source must be "ticket" or "issue"')
  }

  await notifyUser(technicianId, {
    type: 'job',
    title: 'New job assigned',
    message: `You were assigned: ${title}`,
    priority: 'important',
    link: source === 'ticket' ? '/technician/maintenance' : '/technician/jobs/assigned',
  })
  await AdminActionLog.create({
    adminId: req.user.id,
    actionType: 'COMPLAINT_ASSIGN',
    description: `Assigned ${source} "${title}" to ${tech.fullName}`,
    targetId: id,
  })
  res.json({ success: true, message: `Assigned to ${tech.fullName}` })
})

// ───────────────────────── Verification requests ─────────────────────────

// GET /admin/verification-requests?type=all|rider|technician&status=pending|approved|rejected|all
export const listVerificationRequests = asyncHandler(async (req, res) => {
  const type = req.query.type || 'all'
  const status = req.query.status || 'pending'

  const [riders, technicians] = await Promise.all([
    type === 'technician'
      ? []
      : User.find(status === 'all' ? { riderVerificationStatus: { $in: ['pending', 'approved', 'rejected'] } } : { riderVerificationStatus: status })
          .sort({ riderAppliedAt: -1, createdAt: -1 })
          .limit(200)
          .lean(),
    type === 'rider'
      ? []
      : User.find(
          status === 'all'
            ? { technicianVerificationStatus: { $in: ['pending', 'approved', 'rejected'] } }
            : { technicianVerificationStatus: status }
        )
          .sort({ technicianSubmittedAt: -1, createdAt: -1 })
          .limit(200)
          .lean(),
  ])

  const items = [
    ...riders.map((u) => ({
      id: u._id.toString(),
      kind: 'rider',
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      status: u.riderVerificationStatus,
      submittedAt: u.riderAppliedAt || u.createdAt,
      note: null,
      vehicle: { type: u.vehicleType, number: u.vehicleNumber, seats: u.seatCount },
      docs: [],
    })),
    ...technicians.map((u) => ({
      id: u._id.toString(),
      kind: 'technician',
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      status: u.technicianVerificationStatus,
      submittedAt: u.technicianSubmittedAt || u.createdAt,
      note: u.technicianVerificationNote,
      docs: (u.verificationDocs || []).map((d) => ({
        id: d._id.toString(),
        docType: d.docType,
        label: d.label,
        url: d.url,
        originalName: d.originalName,
      })),
    })),
  ].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  const [pendingRiders, pendingTechnicians] = await Promise.all([
    User.countDocuments({ riderVerificationStatus: 'pending' }),
    User.countDocuments({ technicianVerificationStatus: 'pending' }),
  ])
  res.json({ success: true, items, counts: { pendingRiders, pendingTechnicians } })
})

// PATCH /admin/verification-requests/technician/:id  { approved, note }
export const decideTechnicianVerification = asyncHandler(async (req, res) => {
  checkId(req.params.id, 'user id')
  const approved = req.body.approved === true
  const note = (req.body.note || '').toString().trim().slice(0, 300)
  if (!approved && !note) throw new ApiError(400, 'Please give a reason when rejecting')

  const user = await User.findOne({ _id: req.params.id, role: ROLES.TECHNICIAN })
  if (!user) throw new ApiError(404, 'Technician not found')
  if (user.technicianVerificationStatus !== 'pending') {
    throw new ApiError(400, 'This request is not waiting for review')
  }

  user.technicianVerificationStatus = approved ? 'approved' : 'rejected'
  user.technicianVerificationNote = note || null
  if (approved) user.isVerified = true
  await user.save()

  await notifyUser(user._id, {
    type: 'verification',
    title: approved ? 'Verification approved' : 'Verification rejected',
    message: approved
      ? 'Your documents were approved. You are now a verified technician.'
      : `Your documents were rejected: ${note}. Please upload corrected documents and resubmit.`,
    priority: approved ? 'normal' : 'important',
    link: '/technician/verification',
  })
  await AdminActionLog.create({
    adminId: req.user.id,
    actionType: approved ? 'TECHNICIAN_APPROVED' : 'TECHNICIAN_REJECTED',
    description: `${approved ? 'Approved' : 'Rejected'} technician ${user.email}`,
    targetId: user._id,
  })
  res.json({ success: true, user: sanitizeUser(user) })
})

// ───────────────────────── Role user lists (enrichment) ─────────────────────────

// Adds role-specific figures to the rows returned by GET /admin/users?role=…
export async function enrichUsers(items, role) {
  if (!items.length) return items
  const ids = items.map((u) => new mongoose.Types.ObjectId(u.id))

  if (role === ROLES.TECHNICIAN) {
    const [issueStats, ticketStats] = await Promise.all([
      IssueReport.aggregate([
        { $match: { assignedTechnician: { $in: ids } } },
        { $group: { _id: { t: '$assignedTechnician', done: { $eq: ['$status', ISSUE_STATUS.RESOLVED] } }, n: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $match: { assignedTo: { $in: ids } } },
        { $group: { _id: { t: '$assignedTo', done: { $in: ['$status', ['resolved', 'closed']] } }, n: { $sum: 1 } } },
      ]),
    ])
    const stats = {}
    for (const row of [...issueStats, ...ticketStats]) {
      const key = row._id.t.toString()
      stats[key] ||= { openJobs: 0, resolvedJobs: 0 }
      stats[key][row._id.done ? 'resolvedJobs' : 'openJobs'] += row.n
    }
    return items.map((u) => ({ ...u, openJobs: stats[u.id]?.openJobs ?? 0, resolvedJobs: stats[u.id]?.resolvedJobs ?? 0 }))
  }

  if (role === ROLES.STUDENT) {
    const { StudentProfile } = await import('../../roommate/models/StudentProfile.js')
    const profiles = await StudentProfile.find({ userId: { $in: ids } })
      .select('userId profileCompleted roomPreferenceCompleted finalLockCompleted roomId')
      .populate('roomId', 'roomNumber block')
      .lean()
    const byUser = Object.fromEntries(profiles.map((p) => [p.userId.toString(), p]))
    return items.map((u) => {
      const p = byUser[u.id]
      return {
        ...u,
        roommateStatus: !p ? 'none' : p.finalLockCompleted ? 'matched' : p.roomPreferenceCompleted ? 'matching' : 'profile',
        hostelRoom: p?.roomId ? roomLabel(p.roomId.block, p.roomId.roomNumber) : null,
      }
    })
  }

  return items
}

import fs from 'fs'
import path from 'path'
import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { ApiError } from '../../common/utils/ApiError.js'
import { IssueReport } from '../../roommate/models/IssueReport.js'
import { TechnicianAvailability } from './models/TechnicianAvailability.js'
import { ISSUE_STATUS } from '../../roommate/constants/enums.js'
import { User } from '../users/user.model.js'
import { ROLES } from '../../common/constants/roles.js'
import { notifyUsers } from '../notifications/notification.service.js'
import { env } from '../../config/env.js'

const PRIORITY_RANK = { EMERGENCY: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
const byPriorityThenNewest = (a, b) =>
  (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) ||
  new Date(b.createdAt) - new Date(a.createdAt)

// --- Performance ---
export const getPerformance = asyncHandler(async (req, res) => {
  const techId = req.user.id

  const [allAssigned, completed, inProgress] = await Promise.all([
    IssueReport.countDocuments({ assignedTechnician: techId }),
    IssueReport.countDocuments({ assignedTechnician: techId, status: ISSUE_STATUS.RESOLVED }),
    IssueReport.countDocuments({ assignedTechnician: techId, status: ISSUE_STATUS.IN_PROGRESS }),
  ])

  const completedJobs = await IssueReport.find({
    assignedTechnician: techId,
    status: ISSUE_STATUS.RESOLVED,
    startedAt: { $ne: null },
    completedAt: { $ne: null },
  })
  let timeSum = 0
  completedJobs.forEach((j) => {
    timeSum += new Date(j.completedAt) - new Date(j.startedAt)
  })
  const avgCompletionMs = completedJobs.length > 0 ? timeSum / completedJobs.length : 0

  res.json({ success: true, stats: { allAssigned, completed, inProgress, avgCompletionMs } })
})

// --- Job Management ---
// filter: all | assigned | pending | completed | active | requests
export const getJobs = asyncHandler(async (req, res) => {
  const filter = req.query.filter || 'all'
  const techId = req.user.id

  const unclaimed = { status: ISSUE_STATUS.SUBMITTED, assignedTechnician: null }
  const mine = { assignedTechnician: techId }

  let query
  switch (filter) {
    case 'assigned': // my open jobs (not resolved yet)
      query = { ...mine, status: { $ne: ISSUE_STATUS.RESOLVED } }
      break
    case 'completed':
      query = { ...mine, status: ISSUE_STATUS.RESOLVED }
      break
    case 'pending': // shared pool nobody has claimed
      query = unclaimed
      break
    case 'active': // I am working on it right now
      query = { ...mine, status: ISSUE_STATUS.IN_PROGRESS }
      break
    case 'requests': // unclaimed pool + jobs the admin assigned to me that I haven't started
      query = { $or: [unclaimed, { ...mine, status: ISSUE_STATUS.SUBMITTED }] }
      break
    default: // all = everything I can see
      query = { $or: [mine, unclaimed] }
  }

  const jobs = await IssueReport.find(query)
    .populate('reportedBy', 'fullName email')
    .populate('assignedTechnician', 'fullName')
    .lean()

  jobs.sort(byPriorityThenNewest)
  res.json({ success: true, jobs })
})

export const claimJob = asyncHandler(async (req, res) => {
  const job = await IssueReport.findById(req.params.id)
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' })

  if (job.assignedTechnician && job.assignedTechnician.toString() !== req.user.id) {
    return res.status(400).json({ success: false, message: 'Job already claimed' })
  }
  if (job.status === ISSUE_STATUS.RESOLVED) {
    return res.status(400).json({ success: false, message: 'Job is already resolved' })
  }

  job.assignedTechnician = req.user.id
  job.status = ISSUE_STATUS.IN_PROGRESS
  job.startedAt = job.startedAt || new Date()
  await job.save()

  res.json({ success: true, job })
})

// Start a job the admin already assigned to me (same transition as claim, but only for my own jobs)
export const startJob = asyncHandler(async (req, res) => {
  const job = await IssueReport.findById(req.params.id)
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' })
  if (job.assignedTechnician?.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized for this job' })
  }
  if (job.status === ISSUE_STATUS.RESOLVED) {
    return res.status(400).json({ success: false, message: 'Job is already resolved' })
  }
  job.status = ISSUE_STATUS.IN_PROGRESS
  job.startedAt = job.startedAt || new Date()
  await job.save()
  res.json({ success: true, job })
})

export const completeJob = asyncHandler(async (req, res) => {
  const job = await IssueReport.findById(req.params.id)
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' })

  if (job.assignedTechnician?.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized for this job' })
  }

  job.status = ISSUE_STATUS.RESOLVED
  job.startedAt = job.startedAt || new Date()
  job.completedAt = new Date()
  job.resolvedAt = new Date()
  await job.save()

  res.json({ success: true, job })
})

// --- Availability ---
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const STATUSES = ['available', 'busy', 'offline']

function validateDay({ dayOfWeek, startTime, endTime, isAvailable }) {
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new ApiError(400, 'dayOfWeek must be 0 (Sunday) to 6 (Saturday)')
  }
  if (!TIME_RE.test(startTime || '') || !TIME_RE.test(endTime || '')) {
    throw new ApiError(400, 'startTime and endTime must be in HH:mm format')
  }
  if (isAvailable !== false && endTime <= startTime) {
    throw new ApiError(400, 'End time must be after start time')
  }
}

export const getAvailability = asyncHandler(async (req, res) => {
  const [schedule, user] = await Promise.all([
    TechnicianAvailability.find({ technicianId: req.user.id }).sort({ dayOfWeek: 1 }).lean(),
    User.findById(req.user.id).select('availability').lean(),
  ])
  res.json({ success: true, schedule, status: user?.availability || 'offline' })
})

export const setAvailability = asyncHandler(async (req, res) => {
  const { dayOfWeek, startTime, endTime } = req.body
  const isAvailable = req.body.isAvailable !== false
  validateDay({ dayOfWeek, startTime, endTime, isAvailable })

  const sched = await TechnicianAvailability.findOneAndUpdate(
    { technicianId: req.user.id, dayOfWeek },
    { startTime, endTime, isAvailable },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
  res.json({ success: true, schedule: sched })
})

// Save the whole week at once: { days: [{ dayOfWeek, startTime, endTime, isAvailable }] }
export const setAvailabilityBulk = asyncHandler(async (req, res) => {
  const days = Array.isArray(req.body.days) ? req.body.days : []
  if (!days.length) throw new ApiError(400, 'days is required')
  days.forEach((d) => validateDay({ ...d, isAvailable: d.isAvailable !== false }))

  await TechnicianAvailability.bulkWrite(
    days.map((d) => ({
      updateOne: {
        filter: { technicianId: req.user.id, dayOfWeek: d.dayOfWeek },
        update: {
          $set: { startTime: d.startTime, endTime: d.endTime, isAvailable: d.isAvailable !== false },
          $setOnInsert: { technicianId: req.user.id, dayOfWeek: d.dayOfWeek },
        },
        upsert: true,
      },
    }))
  )
  const schedule = await TechnicianAvailability.find({ technicianId: req.user.id }).sort({ dayOfWeek: 1 }).lean()
  res.json({ success: true, schedule })
})

// Live status shown to admins: available | busy | offline
export const setStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!STATUSES.includes(status)) throw new ApiError(400, `status must be one of: ${STATUSES.join(', ')}`)
  await User.findByIdAndUpdate(req.user.id, { availability: status })
  res.json({ success: true, status })
})

// --- Documents & verification ---
const DOC_TYPES = ['nic', 'certificate', 'license', 'police_report', 'other']

const verificationPayload = (u) => ({
  status: u.technicianVerificationStatus || 'none',
  note: u.technicianVerificationNote || null,
  submittedAt: u.technicianSubmittedAt || null,
  docs: (u.verificationDocs || []).map((d) => ({
    id: d._id.toString(),
    docType: d.docType,
    label: d.label,
    url: d.url,
    originalName: d.originalName,
    uploadedAt: d.uploadedAt,
  })),
})

function assertEditable(user) {
  if (user.technicianVerificationStatus === 'pending') {
    throw new ApiError(400, 'Your documents are under review — they can be changed after the admin responds.')
  }
  if (user.technicianVerificationStatus === 'approved') {
    throw new ApiError(400, 'You are already verified. Contact an admin to change your documents.')
  }
}

export const getVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError(404, 'User not found')
  res.json({ success: true, verification: verificationPayload(user) })
})

export const uploadVerificationDoc = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please choose a file (JPG, PNG or PDF, max 5 MB)')
  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError(404, 'User not found')

  try {
    assertEditable(user)
  } catch (err) {
    fs.promises.unlink(req.file.path).catch(() => {})
    throw err
  }
  if ((user.verificationDocs || []).length >= 8) {
    fs.promises.unlink(req.file.path).catch(() => {})
    throw new ApiError(400, 'You can upload up to 8 documents')
  }

  const docType = DOC_TYPES.includes(req.body.docType) ? req.body.docType : 'other'
  user.verificationDocs.push({
    docType,
    label: (req.body.label || '').toString().slice(0, 80),
    url: `/uploads/verification/${req.file.filename}`,
    originalName: req.file.originalname,
  })
  await user.save()
  res.status(201).json({ success: true, verification: verificationPayload(user) })
})

export const deleteVerificationDoc = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError(404, 'User not found')
  assertEditable(user)

  const doc = user.verificationDocs.id(req.params.docId)
  if (!doc) throw new ApiError(404, 'Document not found')

  const file = path.resolve(env.UPLOAD_DIR || 'uploads', 'verification', path.basename(doc.url))
  fs.promises.unlink(file).catch(() => {})
  doc.deleteOne()
  await user.save()
  res.json({ success: true, verification: verificationPayload(user) })
})

export const submitVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError(404, 'User not found')
  assertEditable(user)
  if (!user.verificationDocs.length) throw new ApiError(400, 'Upload at least one document before submitting')

  user.technicianVerificationStatus = 'pending'
  user.technicianVerificationNote = null
  user.technicianSubmittedAt = new Date()
  await user.save()

  // Let the admins know there is something to review
  const admins = await User.find({ role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }, isBlocked: false }).select('_id').lean()
  await notifyUsers(
    admins.map((a) => a._id),
    {
      type: 'verification',
      title: 'Technician verification request',
      message: `${user.fullName} submitted ${user.verificationDocs.length} document(s) for verification.`,
      link: '/admin/verification-requests',
    }
  )
  res.json({ success: true, verification: verificationPayload(user) })
})

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { IssueReport } from '../../roommate/models/IssueReport.js'
import { TechnicianAvailability } from './models/TechnicianAvailability.js'
import { ISSUE_STATUS } from '../../roommate/constants/enums.js'

// --- Performance ---
export const getPerformance = asyncHandler(async (req, res) => {
    // Collect stats for this specific technician
    const techId = req.user.id

    const [allAssigned, completed, inProgress] = await Promise.all([
        IssueReport.countDocuments({ assignedTechnician: techId }),
        IssueReport.countDocuments({ assignedTechnician: techId, status: ISSUE_STATUS.RESOLVED }),
        IssueReport.countDocuments({ assignedTechnician: techId, status: ISSUE_STATUS.IN_PROGRESS }),
    ])

    // Average resolution time
    const completedJobs = await IssueReport.find({ assignedTechnician: techId, status: ISSUE_STATUS.RESOLVED, startedAt: { $ne: null }, completedAt: { $ne: null } })
    let timeSum = 0
    completedJobs.forEach(j => {
        timeSum += (new Date(j.completedAt) - new Date(j.startedAt))
    })
    const avgCompletionMs = completedJobs.length > 0 ? timeSum / completedJobs.length : 0

    res.json({
        success: true,
        stats: {
            allAssigned,
            completed,
            inProgress,
            avgCompletionMs, // Can be parsed via moment/dayjs on frontend into "4 hours"
        }
    })
})

// --- Job Management ---
export const getJobs = asyncHandler(async (req, res) => {
    const filter = req.query.filter || 'all' // all, assigned, pending, completed
    const techId = req.user.id

    let query = {}

    if (filter === 'assigned') {
        query.assignedTechnician = techId
        query.status = { $ne: ISSUE_STATUS.RESOLVED }
    } else if (filter === 'completed') {
        query.assignedTechnician = techId
        query.status = ISSUE_STATUS.RESOLVED
    } else if (filter === 'pending') {
        query.status = ISSUE_STATUS.SUBMITTED // Global pool of unclaimed requests
    }

    const unassignedGlobal = await IssueReport.find({ status: ISSUE_STATUS.SUBMITTED, assignedTechnician: null }).populate('reportedBy', 'fullName email')

    const myJobs = await IssueReport.find(query)
        .populate('reportedBy', 'fullName email')
        .sort({ priority: -1, createdAt: -1 })
        .lean()

    res.json({ success: true, jobs: filter === 'pending' ? unassignedGlobal : myJobs })
})

export const claimJob = asyncHandler(async (req, res) => {
    const job = await IssueReport.findById(req.params.id)
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })

    if (job.assignedTechnician && job.assignedTechnician.toString() !== req.user.id) {
        return res.status(400).json({ success: false, message: 'Job already claimed' })
    }

    job.assignedTechnician = req.user.id
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
    job.completedAt = new Date()
    job.resolvedAt = new Date()
    await job.save()

    res.json({ success: true, job })
})

// --- Availability ---
export const getAvailability = asyncHandler(async (req, res) => {
    const schedule = await TechnicianAvailability.find({ technicianId: req.user.id }).sort({ dayOfWeek: 1 }).lean()
    res.json({ success: true, schedule })
})

export const setAvailability = asyncHandler(async (req, res) => {
    const { dayOfWeek, startTime, endTime, isAvailable } = req.body
    
    let sched = await TechnicianAvailability.findOne({ technicianId: req.user.id, dayOfWeek })
    if (sched) {
        sched.startTime = startTime
        sched.endTime = endTime
        sched.isAvailable = isAvailable
        await sched.save()
    } else {
        sched = await TechnicianAvailability.create({
            technicianId: req.user.id, dayOfWeek, startTime, endTime, isAvailable
        })
    }

    res.json({ success: true, schedule: sched })
})

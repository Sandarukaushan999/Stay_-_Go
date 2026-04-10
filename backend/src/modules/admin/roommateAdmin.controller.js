import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { StudentProfile } from '../../roommate/models/StudentProfile.js'
import { MatchRequest } from '../../roommate/models/MatchRequest.js'
import { MatchPair } from '../../roommate/models/MatchPair.js'
import { MATCH_REQUEST_STATUS } from '../../roommate/constants/enums.js'

function toLegacyMatchStatus(status) {
  if (status === MATCH_REQUEST_STATUS.ACCEPTED) return 'CONFIRMED'
  return status
}

export const dashboardAnalytics = asyncHandler(async (req, res) => {
  const [totalProfiles, totalRequests, confirmedMatches, pendingRequests, rejectedRequests] =
    await Promise.all([
      StudentProfile.countDocuments({ profileCompleted: true }),
      MatchRequest.countDocuments(),
      MatchPair.countDocuments({ isLocked: true }),
      MatchRequest.countDocuments({ status: MATCH_REQUEST_STATUS.PENDING }),
      MatchRequest.countDocuments({ status: MATCH_REQUEST_STATUS.REJECTED }),
    ])

  const confirmedDocs = await MatchPair.find({ isLocked: true }).select('compatibilityScore').lean()
  const avgScore =
    confirmedDocs.length > 0
      ? confirmedDocs.reduce((acc, curr) => acc + (curr.compatibilityScore || 0), 0) / confirmedDocs.length
      : 0

  res.json({
    success: true,
    data: {
      totalProfiles,
      totalRequests,
      confirmedMatches,
      pendingRequests,
      rejectedRequests,
      averageCompatibility: Math.round(avgScore),
      successRate:
        confirmedMatches + rejectedRequests > 0
          ? Math.round((confirmedMatches / (confirmedMatches + rejectedRequests)) * 100)
          : 0,
    },
  })
})

export const listMatchProfiles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const safePage = Math.max(1, Number(page) || 1)
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20))
  const skip = (safePage - 1) * safeLimit

  const items = await StudentProfile.find()
    .populate('userId', 'fullName email isBlocked role address gender')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit)
    .lean()

  const total = await StudentProfile.countDocuments()
  res.json({ success: true, items, total, page: safePage, limit: safeLimit })
})

export const unmatchUsers = asyncHandler(async (req, res) => {
  const { matchId } = req.params

  const matchRequest = await MatchRequest.findById(matchId)
  if (!matchRequest) {
    return res.status(404).json({ success: false, message: 'Match request not found' })
  }

  if (matchRequest.status !== MATCH_REQUEST_STATUS.ACCEPTED) {
    return res
      .status(400)
      .json({ success: false, message: 'Only confirmed matches can be unmatched' })
  }

  matchRequest.status = MATCH_REQUEST_STATUS.REJECTED
  matchRequest.respondedAt = new Date()
  await matchRequest.save()

  const senderStudentId = matchRequest.senderStudentId
  const receiverStudentId = matchRequest.receiverStudentId

  await MatchPair.findOneAndUpdate(
    {
      $or: [
        { studentA: senderStudentId, studentB: receiverStudentId },
        { studentA: receiverStudentId, studentB: senderStudentId },
      ],
      isLocked: true,
    },
    { isLocked: false }
  )

  await StudentProfile.updateMany(
    { _id: { $in: [senderStudentId, receiverStudentId] } },
    { $set: { finalLockCompleted: false, roomId: null } }
  )

  res.json({ success: true, message: 'Users successfully unmatched' })
})

export const listMatchRequests = asyncHandler(async (req, res) => {
  const itemsRaw = await MatchRequest.find()
    .populate({
      path: 'senderStudentId',
      populate: { path: 'userId', select: 'fullName email' },
    })
    .populate({
      path: 'receiverStudentId',
      populate: { path: 'userId', select: 'fullName email' },
    })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()

  const items = itemsRaw.map((row) => ({
    _id: row._id?.toString?.() ?? row._id,
    compatibilityScore: row.compatibilityScore ?? 0,
    status: toLegacyMatchStatus(row.status),
    createdAt: row.createdAt ?? null,
    senderId: row.senderStudentId?.userId
      ? {
          _id: row.senderStudentId.userId._id?.toString?.() ?? row.senderStudentId.userId._id,
          fullName: row.senderStudentId.userId.fullName ?? null,
          email: row.senderStudentId.userId.email ?? null,
        }
      : null,
    receiverId: row.receiverStudentId?.userId
      ? {
          _id: row.receiverStudentId.userId._id?.toString?.() ?? row.receiverStudentId.userId._id,
          fullName: row.receiverStudentId.userId.fullName ?? null,
          email: row.receiverStudentId.userId.email ?? null,
        }
      : null,
  }))

  res.json({ success: true, items })
})


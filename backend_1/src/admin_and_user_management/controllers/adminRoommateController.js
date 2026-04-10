import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { StudentProfile } from '../../roommate/models/StudentProfile.js'
import { MatchRequest } from '../../roommate/models/MatchRequest.js'
import { IssueReport } from '../../roommate/models/IssueReport.js'

export const dashboardAnalytics = asyncHandler(async (req, res) => {
  const [
    totalProfiles,
    totalRequests,
    confirmedMatches,
    pendingRequests,
    rejectedRequests
  ] = await Promise.all([
    StudentProfile.countDocuments({ profileCompleted: true }),
    MatchRequest.countDocuments(),
    MatchRequest.countDocuments({ status: 'CONFIRMED' }),
    MatchRequest.countDocuments({ status: 'PENDING' }),
    MatchRequest.countDocuments({ status: 'REJECTED' })
  ])

  // Average compatibility score of confirmed matches
  const confirmedDocs = await MatchRequest.find({ status: 'CONFIRMED' }).select('compatibilityScore').lean()
  const avgScore = confirmedDocs.length > 0 
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
      successRate: (confirmedMatches + rejectedRequests) > 0 
        ? Math.round((confirmedMatches / (confirmedMatches + rejectedRequests)) * 100) 
        : 0
    }
  })
})

export const listMatchProfiles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const skip = (Math.max(1, Number(page)) - 1) * Number(limit)

  const items = await StudentProfile.find()
    .populate('userId', 'fullName email isBlocked role address gender')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean()

  const total = await StudentProfile.countDocuments()

  res.json({ success: true, items, total, page: Number(page), limit: Number(limit) })
})

// Force Unmatch two users
export const unmatchUsers = asyncHandler(async (req, res) => {
  const { matchId } = req.params

  const match = await MatchRequest.findById(matchId)
  if (!match) {
    return res.status(404).json({ success: false, message: 'Match request not found' })
  }

  if (match.status !== 'CONFIRMED') {
    return res.status(400).json({ success: false, message: 'Only confirmed matches can be unmatched' })
  }

  match.status = 'REJECTED'
  await match.save()

  // Remove locks from StudentProfiles
  await StudentProfile.updateMany(
    { userId: { $in: [match.senderId, match.receiverId] } },
    { $set: { finalLockCompleted: false, currentRoomId: null } }
  )

  res.json({ success: true, message: 'Users successfully unmatched' })
})

// Get detailed match requests
export const listMatchRequests = asyncHandler(async (req, res) => {
  const items = await MatchRequest.find()
    .populate('senderId', 'fullName email')
    .populate('receiverId', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()
    
  res.json({ success: true, items })
})

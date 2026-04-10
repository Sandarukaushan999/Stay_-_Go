import { StudentProfile } from '../models/StudentProfile.js'
import { MatchRequest } from '../models/MatchRequest.js'
import { MatchPair } from '../models/MatchPair.js'
import { getSuggestions as gSuggestions, validateCompatibility } from '../services/matchingService.js'
import { createNotification } from '../services/roommateNotificationService.js'
import { MATCH_REQUEST_STATUS, NOTIFICATION_TYPE } from '../constants/enums.js'
import { ApiError } from '../../common/utils/ApiError.js'

// ── GET /api/roommate/matching/suggestions ──
export const getSuggestions = async (req, res, next) => {
  try {
    // In our new architecture, studentId is tied to the StudentProfile which has userId.
    // The auth middleware gives us req.user.id. We must find the StudentProfile.
    const student = await StudentProfile.findOne({ userId: req.user.id })
    if (!student) throw new ApiError(404, 'Roommate profile not found. Please complete the setup.')
    if (!student.profileCompleted) throw new ApiError(400, 'Complete your profile first')
    if (!student.roomPreferenceCompleted) throw new ApiError(400, 'Set your room preference first')
    if (student.finalLockCompleted) throw new ApiError(400, 'You already have a locked roommate')

    const suggestions = await gSuggestions(student._id)
    res.json({ success: true, message: 'Suggestions retrieved', data: suggestions })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/roommate/matching/requests/:receiverStudentId ──
export const sendRequest = async (req, res, next) => {
  try {
    const senderProfile = await StudentProfile.findOne({ userId: req.user.id })
    if (!senderProfile) throw new ApiError(404, 'Roommate profile not found.')
    
    const senderId = senderProfile._id.toString()
    const { receiverStudentId } = req.params

    if (senderId === receiverStudentId) {
      throw new ApiError(400, 'Cannot send a request to yourself')
    }

    const { sender, visibleScore } = await validateCompatibility(senderId, receiverStudentId)

    const existingRequest = await MatchRequest.findOne({
      $or: [
        { senderStudentId: senderId, receiverStudentId, status: MATCH_REQUEST_STATUS.PENDING },
        { senderStudentId: receiverStudentId, receiverStudentId: senderId, status: MATCH_REQUEST_STATUS.PENDING },
      ],
    })

    if (existingRequest) {
      throw new ApiError(409, 'An active request already exists between you and this student')
    }

    const matchRequest = await MatchRequest.create({
      senderStudentId: senderId,
      receiverStudentId,
      compatibilityScore: visibleScore,
    })

    await createNotification(
      receiverStudentId,
      NOTIFICATION_TYPE.MATCH_REQUEST_RECEIVED,
      'New Match Request',
      `${sender.firstName} ${sender.lastName} sent you a roommate request (${visibleScore}% match).`,
      matchRequest._id
    )

    res.status(201).json({ success: true, message: 'Match request sent', data: matchRequest })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/roommate/matching/requests/sent ──
export const getSentRequests = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) return res.json({ success: true, data: [] })

    // Populate the userId inside the receiver so we can get the actual full name and detailed profile
    const requests = await MatchRequest.find({ senderStudentId: profile._id })
      .populate({
        path: 'receiverStudentId',
        select: 'firstName lastName gender age bio interests sleepSchedule noisePreference cleanliness socialHabits studyRoutine guestPreference profileImage isVerified userId',
        populate: { path: 'userId', select: 'fullName email phone' }
      })
      .sort({ createdAt: -1 })
      
    res.json({ success: true, message: 'Sent requests retrieved', data: requests })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/roommate/matching/requests/received ──
export const getReceivedRequests = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) return res.json({ success: true, data: [] })

    const requests = await MatchRequest.find({ receiverStudentId: profile._id })
      .populate({
        path: 'senderStudentId',
        select: 'firstName lastName gender age bio interests sleepSchedule noisePreference cleanliness socialHabits studyRoutine guestPreference profileImage isVerified userId',
        populate: { path: 'userId', select: 'fullName email phone' }
      })
      .sort({ createdAt: -1 })

    res.json({ success: true, message: 'Received requests retrieved', data: requests })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/roommate/matching/requests/:requestId/accept ──
export const acceptRequest = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) throw new ApiError(404, 'Roommate profile not found.')

    const request = await MatchRequest.findById(req.params.requestId)
    if (!request) throw new ApiError(404, 'Request not found')

    if (request.receiverStudentId.toString() !== profile._id.toString()) {
      throw new ApiError(403, 'Only the receiver can accept this request')
    }
    if (request.status !== MATCH_REQUEST_STATUS.PENDING) {
      throw new ApiError(400, `Cannot accept a request with status: ${request.status}`)
    }

    const sender = await StudentProfile.findById(request.senderStudentId).populate('userId', 'fullName')
    const receiver = await StudentProfile.findById(request.receiverStudentId).populate('userId', 'fullName')
    if (sender.finalLockCompleted || receiver.finalLockCompleted) {
      throw new ApiError(400, 'One or both students already have a locked roommate')
    }

    request.status = MATCH_REQUEST_STATUS.ACCEPTED
    request.respondedAt = new Date()
    await request.save()

    // Cancel all other pending requests involving either student
    await MatchRequest.updateMany(
      {
        _id: { $ne: request._id },
        status: MATCH_REQUEST_STATUS.PENDING,
        $or: [
          { senderStudentId: { $in: [request.senderStudentId, request.receiverStudentId] } },
          { receiverStudentId: { $in: [request.senderStudentId, request.receiverStudentId] } },
        ],
      },
      { status: MATCH_REQUEST_STATUS.CANCELLED, respondedAt: new Date() }
    )

    const pair = await MatchPair.create({
      studentA: request.senderStudentId,
      studentB: request.receiverStudentId,
      compatibilityScore: request.compatibilityScore,
      isLocked: true,
      lockedAt: new Date(),
    })

    sender.finalLockCompleted = true
    receiver.finalLockCompleted = true
    await sender.save()
    await receiver.save()

    const senderName = sender.userId?.fullName?.split(' ')[0] || sender.firstName
    const receiverName = receiver.userId?.fullName?.split(' ')[0] || receiver.firstName

    await createNotification(
      request.senderStudentId,
      NOTIFICATION_TYPE.MATCH_REQUEST_ACCEPTED,
      'Request Accepted',
      `${receiverName} accepted your roommate request!`,
      pair._id
    )
    await createNotification(
      request.receiverStudentId,
      NOTIFICATION_TYPE.ROOMMATE_PAIR_LOCKED,
      'Roommate Locked',
      `You and ${senderName} are now roommates!`,
      pair._id
    )
    await createNotification(
      request.senderStudentId,
      NOTIFICATION_TYPE.ROOMMATE_PAIR_LOCKED,
      'Roommate Locked',
      `You and ${receiverName} are now roommates!`,
      pair._id
    )

    res.json({ success: true, message: 'Request accepted and roommate pair locked', data: { request, pair } })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/roommate/matching/requests/:requestId/reject ──
export const rejectRequest = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) throw new ApiError(404, 'Roommate profile not found.')

    const request = await MatchRequest.findById(req.params.requestId)
    if (!request) throw new ApiError(404, 'Request not found')

    if (request.receiverStudentId.toString() !== profile._id.toString()) {
      throw new ApiError(403, 'Only the receiver can reject this request')
    }
    if (request.status !== MATCH_REQUEST_STATUS.PENDING) {
      throw new ApiError(400, `Cannot reject a request with status: ${request.status}`)
    }

    request.status = MATCH_REQUEST_STATUS.REJECTED
    request.respondedAt = new Date()
    await request.save()

    const receiver = await StudentProfile.findById(profile._id).populate('userId', 'fullName')
    const receiverName = receiver.userId?.fullName?.split(' ')[0] || receiver.firstName

    await createNotification(
      request.senderStudentId,
      NOTIFICATION_TYPE.MATCH_REQUEST_REJECTED,
      'Request Rejected',
      `${receiverName} declined your roommate request.`,
      request._id
    )

    res.json({ success: true, message: 'Request rejected', data: request })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/roommate/matching/requests/:requestId/cancel ──
export const cancelRequest = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) throw new ApiError(404, 'Roommate profile not found.')

    const request = await MatchRequest.findById(req.params.requestId)
    if (!request) throw new ApiError(404, 'Request not found')

    if (request.senderStudentId.toString() !== profile._id.toString()) {
      throw new ApiError(403, 'Only the sender can cancel this request')
    }
    if (request.status !== MATCH_REQUEST_STATUS.PENDING) {
      throw new ApiError(400, `Cannot cancel a request with status: ${request.status}`)
    }

    request.status = MATCH_REQUEST_STATUS.CANCELLED
    request.respondedAt = new Date()
    await request.save()

    res.json({ success: true, message: 'Request cancelled', data: request })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/roommate/matching/pair/me ──
export const getMyPair = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
    if (!profile) return res.json({ success: true, data: null })

    const pair = await MatchPair.findOne({
      $or: [{ studentA: profile._id }, { studentB: profile._id }],
      isLocked: true,
    })
      .populate({ path: 'studentA', populate: { path: 'userId', select: 'fullName email phone' } })
      .populate({ path: 'studentB', populate: { path: 'userId', select: 'fullName email phone' } })
      .populate('roomId')

    if (!pair) {
      return res.json({ success: true, message: 'No locked pair found', data: null })
    }

    res.json({ success: true, message: 'Roommate pair retrieved', data: pair })
  } catch (err) {
    next(err)
  }
}

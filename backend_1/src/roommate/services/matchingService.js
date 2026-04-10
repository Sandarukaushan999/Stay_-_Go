import { StudentProfile } from '../models/StudentProfile.js'
import { RoomPreference } from '../models/RoomPreference.js'
import { calculateRawScore, toVisibleScore } from '../utils/matchScore.js'
import { ApiError } from '../../common/utils/ApiError.js'

export async function getSuggestions(studentId) {
  const student = await StudentProfile.findById(studentId)
  if (!student) throw new Error('Student not found')

  const roomPref = await RoomPreference.findOne({ studentId })
  if (!roomPref) throw new Error('Room preference not found')

  const candidates = await StudentProfile.find({
    _id: { $ne: studentId },
    gender: student.gender,
    profileCompleted: true,
    roomPreferenceCompleted: true,
    finalLockCompleted: false,
  }).populate('userId', 'fullName email')

  if (candidates.length === 0) return []

  const candidateIds = candidates.map((c) => c._id)
  const candidatePrefs = await RoomPreference.find({
    studentId: { $in: candidateIds },
  })

  const prefMap = {}
  candidatePrefs.forEach((p) => {
    prefMap[p.studentId.toString()] = p
  })

  const suggestions = []

  for (const candidate of candidates) {
    const cPref = prefMap[candidate._id.toString()]
    if (!cPref) continue

    if (
      cPref.acType !== roomPref.acType ||
      cPref.roomPosition !== roomPref.roomPosition ||
      cPref.capacity !== roomPref.capacity
    ) {
      continue
    }

    const rawScore = calculateRawScore(student, candidate)
    const visibleScore = toVisibleScore(rawScore)

    // Append standard User fields via populate 
    const fullName = candidate.userId?.fullName || `${candidate.firstName} ${candidate.lastName}`

    suggestions.push({
      studentId: candidate._id,
      fullName: fullName,
      gender: candidate.gender,
      age: candidate.age,
      compatibilityScore: visibleScore,
      sleepSchedule: candidate.sleepSchedule,
      cleanliness: candidate.cleanliness,
      socialHabits: candidate.socialHabits,
      studyHabits: candidate.studyHabits,
      roomPreference: {
        block: cPref.block,
        floor: cPref.floor,
        acType: cPref.acType,
        roomPosition: cPref.roomPosition,
        capacity: cPref.capacity,
      },
    })
  }

  suggestions.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

  return suggestions
}

export async function validateCompatibility(senderId, receiverId) {
  const sender = await StudentProfile.findById(senderId).populate('userId', 'fullName')
  if (!sender) throw new ApiError(404, 'Sender profile not found')

  const receiver = await StudentProfile.findById(receiverId).populate('userId', 'fullName')
  if (!receiver) throw new ApiError(404, 'Receiver student not found')

  if (!sender.profileCompleted) throw new ApiError(400, 'Complete your profile before sending a request')
  if (!receiver.profileCompleted) throw new ApiError(400, 'Receiver has not completed their profile')
  if (!sender.roomPreferenceCompleted) throw new ApiError(400, 'Set your room preference before sending a request')
  if (!receiver.roomPreferenceCompleted) throw new ApiError(400, 'Receiver has not completed their room preference')
  if (sender.finalLockCompleted) throw new ApiError(400, 'You already have a locked roommate')
  if (receiver.finalLockCompleted) throw new ApiError(400, 'Receiver already has a locked roommate')

  const senderPref = await RoomPreference.findOne({ studentId: senderId })
  if (!senderPref) throw new ApiError(400, 'Your room preference record is missing')

  const receiverPref = await RoomPreference.findOne({ studentId: receiverId })
  if (!receiverPref) throw new ApiError(400, 'Receiver room preference record is missing')

  if (sender.gender !== receiver.gender) throw new ApiError(400, 'Cannot send request: gender mismatch')
  if (senderPref.acType !== receiverPref.acType) throw new ApiError(400, 'Cannot send request: AC type mismatch')
  if (senderPref.roomPosition !== receiverPref.roomPosition) throw new ApiError(400, 'Cannot send request: room position mismatch')
  if (senderPref.capacity !== receiverPref.capacity) throw new ApiError(400, 'Cannot send request: room capacity mismatch')

  const rawScore = calculateRawScore(sender, receiver)
  const visibleScore = toVisibleScore(rawScore)

  // Attach proper names to sender/receiver to be used in notifications
  sender.firstName = sender.userId?.fullName?.split(' ')[0] || sender.firstName 
  sender.lastName = sender.userId?.fullName?.split(' ').slice(1).join(' ') || sender.lastName

  receiver.firstName = receiver.userId?.fullName?.split(' ')[0] || receiver.firstName
  receiver.lastName = receiver.userId?.fullName?.split(' ').slice(1).join(' ') || receiver.lastName


  return { compatible: true, sender, receiver, senderPref, receiverPref, visibleScore }
}

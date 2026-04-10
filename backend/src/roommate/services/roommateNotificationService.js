import { RoommateNotification } from '../models/RoommateNotification.js'
import { getIo } from '../../config/socket.js'

export async function createNotification(studentId, type, title, message, relatedEntityId = null) {
  const notification = await RoommateNotification.create({
    studentId,
    type,
    title,
    message,
    relatedEntityId,
  })

  try {
    const io = getIo()
    // Find User document ID from studentId
    // Because studentId is the StudentProfile _id. We need to alert the user via socket.
    // We can populate or assume studentId === userId depending on how we set up the profile.
    // In our schema StudentProfile has a direct `userId` field. Let's look it up.
    import('../models/StudentProfile.js').then(({ StudentProfile }) => {
      StudentProfile.findById(studentId).then(profile => {
        if (profile && profile.userId) {
          io.to(`user:${profile.userId.toString()}`).emit('notification', notification)
        }
      })
    })
  } catch (err) {
    console.error('Socket.IO not ready down the line or error emitting', err)
  }

  return notification
}

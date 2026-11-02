import { Notification } from './notification.model.js'

// Notifications are best-effort: a failure here must never break the action that triggered it.
export async function notifyUser(userId, { type = 'system', title, message, priority = 'normal', link = null }) {
  if (!userId) return null
  try {
    return await Notification.create({ userId, type, title, message, priority, link })
  } catch (err) {
    console.warn('notifyUser failed:', err.message)
    return null
  }
}

export async function notifyUsers(userIds, payload) {
  const ids = [...new Set(userIds.map(String))]
  if (!ids.length) return 0
  try {
    const docs = ids.map((userId) => ({ ...payload, userId }))
    const created = await Notification.insertMany(docs)
    return created.length
  } catch (err) {
    console.warn('notifyUsers failed:', err.message)
    return 0
  }
}

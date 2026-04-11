import { User } from '../modules/users/user.model.js'
import { hashPassword } from '../common/utils/password.js'

/**
 * Seeds a default admin account if none exists.
 * Runs automatically on server startup.
 * Safe to run anytime - skips if admin already exists.
 */
export async function seedDefaultAdmin() {
  try {
    const existing = await User.findOne({ role: { $in: ['admin', 'super_admin'] } }).lean()
    if (existing) return // Admin already exists, nothing to do

    const passwordHash = await hashPassword('Admin@123')
    await User.create({
      fullName: 'System Admin',
      email: 'admin@staygo.com',
      passwordHash,
      role: 'admin',
      isVerified: true,
      isBlocked: false,
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('[SEED] Default admin created:')
    console.log('[SEED]   Email:    admin@staygo.com')
    console.log('[SEED]   Password: Admin@123')
    console.log('[SEED] Change this password after first login!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  } catch (err) {
    // Non-fatal - don't crash the server if seeding fails
    console.warn('[SEED] Could not seed default admin:', err.message)
  }
}

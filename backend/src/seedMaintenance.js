import { connectDb } from './config/db.js'
import { seedMaintenanceData } from './modules/maintenance/seed/seedMaintenanceData.js'

// ============================================
// Standalone seed runner for maintenance data
// Run with: node src/seedMaintenance.js
// ============================================

async function main() {
  console.log('Connecting to database...')
  await connectDb()
  console.log('Connected! Seeding maintenance data...')

  await seedMaintenanceData()

  console.log('Maintenance data seeded successfully!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

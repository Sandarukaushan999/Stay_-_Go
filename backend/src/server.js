import http from 'http'
import { createApp } from './app.js'
import { connectDb } from './config/db.js'
import { seedDefaultAdmin } from './config/seed.js'
import { env } from './config/env.js'
import { createSocketServer } from './config/socket.js'
import { startSafetyMonitorJob } from './jobs/safetyMonitor.job.js'

async function main() {
  await connectDb()
  await seedDefaultAdmin()

  const app = createApp()
  const httpServer = http.createServer(app)
  createSocketServer(httpServer)
  startSafetyMonitorJob()

  httpServer.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})


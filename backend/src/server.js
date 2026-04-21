import http from 'http'
import net from 'net'
import { createApp } from './app.js'
import { connectDb } from './config/db.js'
import { env } from './config/env.js'
import { createSocketServer } from './config/socket.js'
import { startSafetyMonitorJob } from './jobs/safetyMonitor.job.js'

// ─────────────────────────────────────────────────────────────────────────────
// Helper: check if a port is available
// Returns the port number if free, otherwise tries the next one (up to maxTries)
// ─────────────────────────────────────────────────────────────────────────────
function findAvailablePort(preferredPort, maxTries = 10) {
  return new Promise((resolve, reject) => {
    let attempt = 0

    const tryPort = (port) => {
      if (attempt >= maxTries) {
        return reject(new Error(`Could not find a free port after ${maxTries} attempts starting from ${preferredPort}`))
      }
      attempt++

      const tester = net.createServer()
      tester.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`⚠️  Port ${port} is already in use — trying ${port + 1}…`)
          tester.close(() => tryPort(port + 1))
        } else {
          reject(err)
        }
      })
      tester.once('listening', () => {
        tester.close(() => resolve(port))
      })
      tester.listen(port)
    }

    tryPort(preferredPort)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await connectDb()

  const app = createApp()
  const httpServer = http.createServer(app)
  createSocketServer(httpServer)
  startSafetyMonitorJob()

  // Determine PORT: prefer env.PORT (from .env), fall back to 5000
  const preferredPort = Number(env.PORT ?? 5000)
  const port = await findAvailablePort(preferredPort)

  if (port !== preferredPort) {
    console.warn(`\n⚠️  Port ${preferredPort} was busy — server started on port ${port} instead.`)
    console.warn(`   Update your frontend VITE_API_BASE_URL to http://localhost:${port}/api if needed.\n`)
  }

  // Attach a server-level error handler for any runtime errors after startup
  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} became unavailable. Please restart the server.`)
    } else {
      console.error('Server error:', err)
    }
    process.exit(1)
  })

  httpServer.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`\n✅ API listening on http://localhost:${port}`)
    if (port !== preferredPort) {
      console.log(`   (originally wanted port ${preferredPort})\n`)
    }
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to start server:', err)
  process.exit(1)
})

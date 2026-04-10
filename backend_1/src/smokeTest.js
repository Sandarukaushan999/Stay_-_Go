import http from 'http'
import { createApp } from './app.js'
import { connectDb } from './config/db.js'

async function requestJson(url, { method = 'GET', headers, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, json }
}

async function main() {
  await connectDb()

  const app = createApp()
  const server = http.createServer(app)

  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()
  const base = `http://localhost:${port}/api`

  const health = await requestJson(`${base}/health`)
  if (health.status !== 200) throw new Error(`Health failed: ${health.status}`)

  const email = `demo_${Date.now()}@staygo.local`
  const password = 'password123'

  const reg = await requestJson(`${base}/auth/register`, {
    method: 'POST',
    body: { fullName: 'Demo Admin', email, password, role: 'admin' },
  })
  if (reg.status !== 201) throw new Error(`Register failed: ${reg.status}`)

  const login = await requestJson(`${base}/auth/login`, {
    method: 'POST',
    body: { email, password },
  })
  if (login.status !== 200) throw new Error(`Login failed: ${login.status}`)

  const me = await requestJson(`${base}/auth/me`, {
    headers: { authorization: `Bearer ${login.json.token}` },
  })
  if (me.status !== 200) throw new Error(`Me failed: ${me.status}`)

  // eslint-disable-next-line no-console
  console.log('SMOKE OK', { health: health.json?.success, user: me.json?.user?.email })

  await new Promise((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve()))
  )
  process.exit(0)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('SMOKE FAILED', err)
  process.exit(1)
})


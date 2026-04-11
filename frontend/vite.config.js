import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyPort = (env.VITE_API_PORT || '5000').trim() || '5000'
  const proxyTarget = `http://127.0.0.1:${proxyPort}`

  return {
    plugins: [react()],
    server: {
      // Optional: set VITE_API_BASE_URL=/api in frontend/.env to route API calls through Vite (same origin).
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})

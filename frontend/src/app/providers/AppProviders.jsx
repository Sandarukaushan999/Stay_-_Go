import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'

export function AppProviders({ children }) {
  const hydrateMe = useAuthStore((s) => s.hydrateMe)
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const connectSocket = useSocketStore((s) => s.connect)
  const disconnectSocket = useSocketStore((s) => s.disconnect)

  useEffect(() => {
    hydrateMe()
  }, [hydrateMe])

  useEffect(() => {
    if (status === 'authed' && user?.id) connectSocket({ userId: user.id })
    else disconnectSocket()
  }, [status, user?.id, connectSocket, disconnectSocket])

  return children
}


import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'
import { DevIdentityProvider } from '../../Components/Room_Mate_Matching/contexts/DevIdentityContext'

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
    if (status === 'authed' && user?._id) connectSocket({ userId: user._id })
    else disconnectSocket()
  }, [status, user?._id, connectSocket, disconnectSocket])

  return (
      <DevIdentityProvider>
          {children}
      </DevIdentityProvider>
  )
}



import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export function AppProviders({ children }) {
  const hydrateMe = useAuthStore((s) => s.hydrateMe)

  useEffect(() => {
    hydrateMe()
  }, [hydrateMe])

  return children
}

import AppRouter from './app/router/AppRouter'
import { AppProviders } from './app/providers/AppProviders'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
      <Toaster position="top-right" />
    </AppProviders>
  )
}

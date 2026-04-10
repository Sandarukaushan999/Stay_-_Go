import AppRouter from './app/router/AppRouter'
import { AppProviders } from './app/providers/AppProviders'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}

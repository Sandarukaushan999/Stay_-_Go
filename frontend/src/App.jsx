import AppRouter from './app/router/AppRouter'
import { AppProviders } from './app/providers/AppProviders'
import LogoutModal from './Components/shared/modals/LogoutModal'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
      <LogoutModal />
    </AppProviders>
  )
}

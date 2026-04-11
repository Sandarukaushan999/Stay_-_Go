import AppRouter from './app/router/AppRouter'
import { AppProviders } from './app/providers/AppProviders'
<<<<<<< HEAD
import { Toaster } from 'react-hot-toast'
=======
import LogoutModal from './Components/shared/modals/LogoutModal'
>>>>>>> 461d32b321f3780c45ad6f481ab155cffd87c2b3

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
<<<<<<< HEAD
      <Toaster position="top-right" />
=======
      <LogoutModal />
>>>>>>> 461d32b321f3780c45ad6f481ab155cffd87c2b3
    </AppProviders>
  )
}

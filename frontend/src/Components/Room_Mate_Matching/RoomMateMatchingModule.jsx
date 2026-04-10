import { MemoryRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DevIdentityProvider } from './contexts/DevIdentityContext';
import AppRoutes from './routes/AppRoutes';
import './index.css';

export default function RoomMateMatchingModule({ onExit }) {
  return (
    <div className="roommate-module">
      <div className="roommate-module-toolbar">
        <div className="roommate-module-hint">Room Mate Matching module</div>
        {onExit ? (
          <button type="button" onClick={onExit} className="roommate-module-exit">
            ← Back to Home
          </button>
        ) : null}
      </div>

      <DevIdentityProvider>
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '16px',
                border: '1px solid rgba(16, 19, 18, 0.08)',
                background: 'rgba(255,255,255,0.96)',
                color: '#101312',
                boxShadow: '0 18px 38px rgba(16, 19, 18, 0.12)',
              },
              success: {
                iconTheme: {
                  primary: '#BAF91A',
                  secondary: '#101312',
                },
              },
              error: {
                iconTheme: {
                  primary: '#876DFF',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </MemoryRouter>
      </DevIdentityProvider>
    </div>
  );
}

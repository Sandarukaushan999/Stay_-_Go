import { useEffect } from 'react'
import TechnicianSidebar from './TechnicianSidebar'
import TechnicianTopNavbar from './TechnicianTopNavbar'

// Apply saved theme immediately (before first render)
const saved = localStorage.getItem('sg-admin-theme') || 'light'
document.documentElement.setAttribute('data-theme', saved)
if (saved === 'dark') document.documentElement.classList.add('dark')
else document.documentElement.classList.remove('dark')

export default function TechnicianLayout({ children }) {
  return (
    <div 
      className="min-h-screen flex transition-colors duration-300"
      style={{
        background: 'var(--admin-bg)',
        color: 'var(--admin-text)',
        fontFamily: '"Poppins", "Manrope", "Trebuchet MS", sans-serif',
      }}
    >
      <TechnicianSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TechnicianTopNavbar />
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}

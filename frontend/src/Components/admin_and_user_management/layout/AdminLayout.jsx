import { useEffect } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopNavbar from './AdminTopNavbar'

// Apply saved theme immediately (before first render)
const saved = localStorage.getItem('sg-admin-theme') || 'light'
document.documentElement.setAttribute('data-theme', saved)
if (saved === 'dark') document.documentElement.classList.add('dark')
else document.documentElement.classList.remove('dark')

export default function AdminLayout({ children }) {
  return (
    <div
      className="min-h-screen flex transition-colors duration-300"
      style={{
        background: 'var(--admin-bg)',
        color: 'var(--admin-text)',
      }}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopNavbar />
        <main className="flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

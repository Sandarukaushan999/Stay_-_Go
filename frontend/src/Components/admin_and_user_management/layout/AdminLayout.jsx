import AdminSidebar from './AdminSidebar'
import AdminTopNavbar from './AdminTopNavbar'

export default function AdminLayout({ children }) {
  return (
    <div
      className="min-h-screen flex bg-gradient-to-b from-[#E2FF99] via-[#f4ffd7] to-[#FFFFFF] text-[#101312]"
      style={{ fontFamily: '"Poppins", "Manrope", "Trebuchet MS", sans-serif' }}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopNavbar />
        <main className="flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

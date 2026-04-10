import AdminSidebar from './AdminSidebar'
import AdminTopNavbar from './AdminTopNavbar'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-b from-emerald-200 via-emerald-100 to-slate-50 text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopNavbar />
        <main className="flex-1 px-4 pb-8 pt-5 sm:px-6">{children}</main>
      </div>
    </div>
  )
}

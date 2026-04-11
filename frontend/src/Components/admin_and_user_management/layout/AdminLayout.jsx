import AdminSidebar from './AdminSidebar'
import AdminTopNavbar from './AdminTopNavbar'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopNavbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}


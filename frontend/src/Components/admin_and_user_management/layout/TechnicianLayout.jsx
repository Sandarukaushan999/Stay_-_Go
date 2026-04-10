import TechnicianSidebar from './TechnicianSidebar'
import TechnicianTopNavbar from './TechnicianTopNavbar'

export default function TechnicianLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <TechnicianSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TechnicianTopNavbar />
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}

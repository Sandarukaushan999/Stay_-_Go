import TopNavbar from './TopNavbar'
import SystemFooter from './SystemFooter'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-200 via-emerald-100 to-slate-50">
      <TopNavbar />
      <main className="flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-8">{children}</main>
      <SystemFooter />
    </div>
  )
}

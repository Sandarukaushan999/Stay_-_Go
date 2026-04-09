import TopNavbar from './TopNavbar'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavbar />
      <main className="flex-1 p-6 bg-slate-950">{children}</main>
    </div>
  )
}


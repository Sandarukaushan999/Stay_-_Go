import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-slate-400">You don’t have access to this page.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link className="rounded-xl border border-slate-800 px-4 py-2" to="/">
            Home
          </Link>
          <Link className="rounded-xl bg-violet-600 px-4 py-2 font-medium text-white" to="/auth/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}


import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-slate-400">That route doesn’t exist.</p>
        <div className="mt-6">
          <Link className="rounded-xl bg-violet-600 px-4 py-2 font-medium text-white" to="/">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}


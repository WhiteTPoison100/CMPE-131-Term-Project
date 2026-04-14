import { Link } from 'react-router-dom'
import { Home, Swords } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-500/30">
        <Swords className="h-8 w-8 text-indigo-200" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">This route is out of bounds</h1>
      <p className="mt-3 max-w-md text-sm text-slate-400">
        Double-check the URL—or head back to the dashboard to keep exploring the mock tournament
        universe.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500"
      >
        <Home className="h-4 w-4" />
        Return home
      </Link>
    </div>
  )
}

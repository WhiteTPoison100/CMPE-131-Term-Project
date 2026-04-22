import { Link, useLocation } from 'react-router-dom'
import { Menu, Swords } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const crumb =
    pathname === '/dashboard'
      ? 'Dashboard'
      : pathname.startsWith('/tournaments/new')
        ? 'Create tournament'
        : pathname.startsWith('/tournaments/')
          ? 'Tournament'
          : pathname.startsWith('/tournaments')
            ? 'Tournaments'
            : pathname.startsWith('/participants')
              ? 'Participants'
              : pathname.startsWith('/matches')
                ? 'Matches'
                : pathname === '/login'
                  ? 'Login'
                  : 'Tournament OS'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <Swords className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-white">Tournament OS</span>
          </Link>
          <div className="hidden lg:block">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Overview</p>
            <p className="text-sm font-semibold text-white">{crumb}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-500">
                  {user.role === 'TO' ? 'Tournament Organizer' : 'Viewer'}
                </p>
              </div>
              <span
                className={`hidden rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset sm:inline-flex ${
                  user.role === 'TO'
                    ? 'bg-indigo-500/15 text-indigo-200 ring-indigo-500/30'
                    : 'bg-slate-600/30 text-slate-200 ring-slate-500/35'
                }`}
              >
                {user.role === 'TO' ? 'Organizer' : 'Viewer'}
              </span>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

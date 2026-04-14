import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Swords,
  Trophy,
  Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const linkBase =
  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/80 hover:text-white'

const linkActive = 'bg-indigo-500/15 text-white ring-1 ring-indigo-500/25'

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/80 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800/80 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40">
          <Swords className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Tournament OS</p>
          <p className="text-xs text-slate-500">CMPE-131</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          <LayoutDashboard className="h-5 w-5 opacity-80" />
          Dashboard
        </NavLink>
        <NavLink to="/tournaments" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          <Trophy className="h-5 w-5 opacity-80" />
          Tournaments
        </NavLink>
        <NavLink
          to="/participants"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}
        >
          <Users className="h-5 w-5 opacity-80" />
          Participants
        </NavLink>
        <NavLink to="/matches" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          <Swords className="h-5 w-5 opacity-80" />
          Matches / Brackets
        </NavLink>
      </nav>
      <div className="border-t border-slate-800/80 p-3">
        {user ? (
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/80 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => `${linkBase} w-full ${isActive ? linkActive : ''}`}
          >
            <LogIn className="h-5 w-5" />
            Login
          </NavLink>
        )}
      </div>
    </aside>
  )
}

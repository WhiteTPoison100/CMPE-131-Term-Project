import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  LogIn,
  Plus,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Settings & Notifications are intentionally excluded here —
// they are only reachable via the top-bar icons or the user dropdown.
const baseNavItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/tournaments',  label: 'Tournaments',  icon: Trophy },
  { to: '/participants', label: 'Participants', icon: Users },
  { to: '/matches',      label: 'Matches',      icon: Swords },
]
const adminNavItem = { to: '/admin', label: 'Admin Panel', icon: ShieldCheck }

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="hidden w-60 shrink-0 flex-col lg:flex" style={{ backgroundColor: '#0a0f1e', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
          <Swords className="h-4.5 w-4.5 text-white" aria-hidden />
        </div>
        <span
          className="text-sm font-bold uppercase tracking-widest text-indigo-300"
          style={{ letterSpacing: '0.18em' }}
        >
          Tournament OS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-4" aria-label="Main">
        {[...baseNavItems, ...(user?.role === 'TO' ? [adminNavItem] : [])].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-500/15 text-white shadow-[inset_0_0_0_1px_rgba(99,102,241,0.25)]'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
                <Icon className="h-4.5 w-4.5 shrink-0 opacity-80" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 space-y-2">
        {/* Create Tournament CTA — TO only */}
        {user?.role === 'TO' && (
          <NavLink
            to="/tournaments/new"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-[0_4px_15px_rgba(99,102,241,0.35)] transition hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(99,102,241,0.45)] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Create Tournament
          </NavLink>
        )}

        {/* User profile / logout */}
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt={user.name} className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white/10" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
              {user?.name?.charAt(0) ?? '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user?.name ?? 'Guest'}</p>
            <p className="truncate text-[10px] text-indigo-300" style={{ letterSpacing: '0.04em' }}>
              {user?.role === 'TO' ? 'Organizer' : 'Viewer'}
            </p>
          </div>
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              title="Logout"
            >
              <LogIn className="h-3.5 w-3.5 rotate-180" />
            </button>
          ) : (
            <NavLink to="/login" className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white">
              <LogIn className="h-3.5 w-3.5" />
            </NavLink>
          )}
        </div>
      </div>
    </aside>
  )
}

import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Gamepad2,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { useAuth } from '../../context/AuthContext'

const mobileNavItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/tournaments',  label: 'Tournaments',  icon: Trophy },
  { to: '/participants', label: 'Participants', icon: Users },
  { to: '/matches',      label: 'Matches',      icon: Swords },
  { to: '/settings',     label: 'Settings',     icon: Settings },
]

export function MainLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="flex h-svh overflow-hidden bg-slate-950">
      <Sidebar />

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className="absolute left-0 top-0 flex h-full w-[min(88vw,300px)] flex-col"
            style={{
              background: 'rgba(10, 15, 32, 0.97)',
              backdropFilter: 'blur(24px)',
              borderRight: '1px solid rgba(192,193,255,0.08)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(192,193,255,0.07)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                    boxShadow: '0 0 14px rgba(99,102,241,0.5)',
                  }}
                >
                  <Gamepad2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-indigo-100">
                  Tournament OS
                </span>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-0.5 p-3" onClick={() => setOpen(false)}>
              <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Navigation
              </p>
              {mobileNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-200'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-500'}`} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}

              {user?.role === 'TO' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-200'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <ShieldCheck className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-500'}`} />
                      Admin Panel
                    </>
                  )}
                </NavLink>
              )}
            </nav>

            {/* Footer: logout / login */}
            <div className="mt-auto p-4" style={{ borderTop: '1px solid rgba(192,193,255,0.07)' }}>
              {user ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                  onClick={() => { setOpen(false); logout() }}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              ) : (
                <NavLink
                  to="/login"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.05] hover:text-white"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  Sign in
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

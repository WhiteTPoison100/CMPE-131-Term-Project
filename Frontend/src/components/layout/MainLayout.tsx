import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Swords,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { useAuth } from '../../context/AuthContext'

const mobileLink =
  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800'

export function MainLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="flex h-svh overflow-hidden bg-slate-950">
      <Sidebar />
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(88vw,320px)] flex-col border-r border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <p className="text-sm font-semibold text-white">Menu</p>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-3" onClick={() => setOpen(false)}>
              <NavLink to="/dashboard" className={mobileLink}>
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </NavLink>
              <NavLink to="/tournaments" className={mobileLink}>
                <Trophy className="h-5 w-5" />
                Tournaments
              </NavLink>
              <NavLink to="/participants" className={mobileLink}>
                <Users className="h-5 w-5" />
                Participants
              </NavLink>
              <NavLink to="/matches" className={mobileLink}>
                <Swords className="h-5 w-5" />
                Matches / Brackets
              </NavLink>
              {user ? (
                <button type="button" className={`${mobileLink} text-left`} onClick={() => logout()}>
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              ) : (
                <NavLink to="/login" className={mobileLink}>
                  <LogIn className="h-5 w-5" />
                  Login
                </NavLink>
              )}
            </nav>
          </div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

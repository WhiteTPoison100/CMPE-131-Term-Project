import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// ── Reusable nav item ─────────────────────────────────────────────────────────

function SideNavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
          isActive
            ? 'text-indigo-200'
            : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active gradient background */}
          {isActive && (
            <div
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{
                background:
                  'linear-gradient(90deg, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.06) 55%, transparent 100%)',
              }}
            />
          )}

          {/* Active glowing left beam */}
          {isActive && (
            <span
              className="absolute left-0 rounded-r-full"
              style={{
                top: '18%',
                height: '64%',
                width: '3px',
                background: 'linear-gradient(180deg, #818cf8 0%, #a78bfa 100%)',
                boxShadow: '0 0 12px rgba(165,180,252,0.9), 0 0 28px rgba(165,180,252,0.35)',
              }}
            />
          )}

          {/* Icon */}
          <Icon
            className={`relative z-10 h-[17px] w-[17px] shrink-0 nav-icon-animate ${
              isActive
                ? 'nav-icon-active text-indigo-300'
                : 'text-slate-500 group-hover:text-indigo-400'
            }`}
          />

          {/* Label */}
          <span className="relative z-10 tracking-[0.01em]">{label}</span>
        </>
      )}
    </NavLink>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function NavSection({ label }: { label: string }) {
  return (
    <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
      {label}
    </p>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    // Brief pause for animation to play before clearing state
    await new Promise(r => setTimeout(r, 1100))
    logout()
  }

  return (
    <>
    <aside
      className="hidden lg:flex w-72 shrink-0 flex-col overflow-y-auto"
      style={{
        background: 'rgba(10, 15, 32, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(192, 193, 255, 0.07)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.035)',
      }}
    >

      {/* ── Brand ──────────────────────────────────────────────────────────── */}
      <div className="relative flex items-center gap-3.5 px-5 pb-4 pt-5">
        {/* Atmospheric glow blob */}
        <div
          className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full opacity-50 blur-[44px]"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, transparent 70%)' }}
        />

        {/* Logo box */}
        <div
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
            boxShadow: '0 0 20px rgba(99,102,241,0.55), 0 0 48px rgba(99,102,241,0.18)',
          }}
        >
          <Gamepad2 className="h-[22px] w-[22px] text-white" />
        </div>

        {/* Name + status */}
        <div className="relative min-w-0">
          <h1 className="text-sm font-black uppercase leading-none tracking-[0.16em] text-indigo-100">
            Tournament OS
          </h1>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="dot-pulse inline-block h-[7px] w-[7px] rounded-full bg-indigo-400"
              style={{ boxShadow: '0 0 8px rgba(165,180,252,1)' }}
            />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.11em] text-slate-500">
              Elite Management
            </span>
          </div>
        </div>
      </div>

      {/* ── Main navigation ────────────────────────────────────────────────── */}
      <nav className="flex flex-1 flex-col px-3 pt-2" aria-label="Main navigation">
        <NavSection label="Navigation" />
        <div className="flex flex-col gap-0.5">
          <SideNavItem to="/dashboard"    label="Dashboard"    icon={LayoutDashboard} />
          <SideNavItem to="/tournaments"  label="Tournaments"  icon={Trophy} />
          <SideNavItem to="/participants" label="Participants" icon={Users} />
          <SideNavItem to="/matches"      label="Matches"      icon={Swords} />
        </div>

        {/* ── Preferences ──────────────────────────────────────────────────── */}
        <div className="mt-5 border-t border-white/[0.05] pt-4">
          <NavSection label="Preferences" />
          <div className="flex flex-col gap-0.5">
            <SideNavItem to="/settings" label="Settings" icon={Settings} />
            {user?.role === 'TO' && (
              <SideNavItem to="/admin" label="Admin Panel" icon={ShieldCheck} />
            )}
          </div>
        </div>
      </nav>

      {/* ── Bottom ─────────────────────────────────────────────────────────── */}
      <div className="p-4 pt-3 space-y-3">
        {/* Thin gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

        {/* Create Tournament — TO only */}
        {user?.role === 'TO' && (
          <NavLink
            to="/tournaments/new"
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-2.5 text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
              boxShadow: '0 4px 22px rgba(99,102,241,0.45), 0 1px 0 rgba(255,255,255,0.1) inset',
            }}
          >
            {/* Shimmer sweep on hover */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[900ms] group-hover:translate-x-full" />
            <Plus className="relative z-10 h-4 w-4" />
            <span className="relative z-10 tracking-wide">Create Tournament</span>
          </NavLink>
        )}

        {/* Glass user card */}
        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(25, 31, 52, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(192, 193, 255, 0.09)',
            borderTopColor: 'rgba(192, 193, 255, 0.22)',
          }}
        >
          {/* Top row: avatar + name + action icons */}
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user?.name ?? 'User'}
                  className="h-9 w-9 rounded-full object-cover"
                  style={{ border: '1px solid rgba(165,180,252,0.3)' }}
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                    border: '1px solid rgba(165,180,252,0.3)',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
              )}
              {/* Online indicator dot */}
              <span
                className="dot-pulse absolute -bottom-px -right-px h-3 w-3 rounded-full border-2 bg-indigo-400"
                style={{
                  borderColor: 'rgba(10,15,32,0.95)',
                  boxShadow: '0 0 8px rgba(165,180,252,0.95)',
                }}
              />
            </div>

            {/* Name + role */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold leading-none text-white">
                {user?.name ?? 'Guest'}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-indigo-400">
                {user?.role === 'TO' ? 'Organizer' : 'Viewer'}
              </p>
            </div>

            {/* Action icons */}
            <div className="flex shrink-0 items-center gap-1">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate('/settings')}
                title="Settings"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.07] hover:text-indigo-300"
              >
                <Settings className="h-3.5 w-3.5" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleSignOut}
                disabled={signingOut}
                title="Sign out"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-60"
              >
                <LogOut className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

    </aside>

      {/* ── Sign-out overlay — rendered via portal so it covers the full page ── */}
      {createPortal(
        <AnimatePresence>
          {signingOut && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4"
              style={{ background: 'rgba(5, 8, 20, 0.92)', backdropFilter: 'blur(12px)' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-12 w-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-400"
              />
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-sm font-semibold tracking-widest text-slate-400 uppercase"
              >
                Signing out…
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

import { Menu, Settings } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserDropdown } from './UserDropdown'
import { NotificationsDropdown } from '../notifications/NotificationsDropdown'
import { SearchBar } from './SearchBar'

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const onSettings = pathname === '/settings'

  return (
    <header
      className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 px-5"
      style={{
        background: 'rgba(10, 15, 30, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(192, 193, 255, 0.07)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.025), 0 4px 24px rgba(0,0,0,0.25)',
      }}
    >
      {/* Subtle indigo ambient glow on the left edge */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-32 opacity-20"
        style={{
          background: 'linear-gradient(90deg, rgba(99,102,241,0.25) 0%, transparent 100%)',
        }}
      />

      {/* ── Mobile menu button ─────────────────────────────────────────── */}
      <button
        type="button"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-slate-400 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.08] hover:text-white lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* ── Search bar ────────────────────────────────────────────────── */}
      <div className="hidden flex-1 lg:block">
        <SearchBar />
      </div>

      {/* ── Right actions ─────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-end gap-2.5">

        {/* Notifications bell */}
        <NotificationsDropdown />

        {/* Settings */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          title="Settings"
          className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 ${
            onSettings
              ? 'border-indigo-500/35 bg-indigo-500/12 text-indigo-300 shadow-[0_0_0_1px_rgba(99,102,241,0.2),0_0_16px_rgba(99,102,241,0.12)]'
              : 'border-white/[0.06] bg-white/[0.04] text-slate-400 hover:border-white/10 hover:bg-white/[0.08] hover:text-white'
          }`}
        >
          <Settings
            className={`h-4 w-4 transition-transform duration-500 ${onSettings ? 'rotate-90' : 'hover:rotate-45'}`}
          />
        </button>

        {/* User dropdown */}
        <UserDropdown />
      </div>
    </header>
  )
}

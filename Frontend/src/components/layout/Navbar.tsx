import { Bell, ChevronDown, Search, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface NavbarProps {
  onMenuClick?: () => void
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth()

  return (
    <header
      className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 px-5"
      style={{
        backgroundColor: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Mobile menu button */}
      <button
        type="button"
        className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <div className="relative hidden flex-1 max-w-md lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          placeholder="Search tournaments, players…"
          className="w-full rounded-xl border border-white/5 bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-slate-300 outline-none placeholder:text-slate-600 focus:border-indigo-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20 transition"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        {/* Icon actions */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] text-slate-400 transition hover:border-white/10 hover:bg-white/[0.08] hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] text-slate-400 transition hover:border-white/10 hover:bg-white/[0.08] hover:text-white"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* User greeting */}
        {user && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2 text-sm transition hover:border-white/10 hover:bg-white/[0.07]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
              {user.name?.charAt(0) ?? '?'}
            </div>
            <span className="hidden text-slate-200 sm:block">
              {getGreeting()}, <span className="font-semibold text-white">{user.name?.split(' ')[0]}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>
        )}
      </div>
    </header>
  )
}

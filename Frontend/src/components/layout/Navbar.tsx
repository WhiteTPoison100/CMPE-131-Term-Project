import { Search, Settings } from 'lucide-react' // Search kept for mobile menu button
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
      <div className="hidden flex-1 lg:block">
        <SearchBar />
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">

        {/* Notifications bell — self-contained dropdown popup */}
        <NotificationsDropdown />

        {/* Settings gear — navigates to /settings page */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
            onSettings
              ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
              : 'border-white/5 bg-white/[0.04] text-slate-400 hover:border-white/10 hover:bg-white/[0.08] hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* User dropdown */}
        <UserDropdown />
      </div>
    </header>
  )
}

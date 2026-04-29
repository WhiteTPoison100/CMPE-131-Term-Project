import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePageTransition } from '../../context/TransitionContext'

// ── Role badge ────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  if (role === 'TO') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300"
        style={{ letterSpacing: '0.08em' }}>
        <ShieldCheck className="h-2.5 w-2.5" />
        Organizer
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/25 bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
      style={{ letterSpacing: '0.08em' }}>
      Viewer
    </span>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, photoUrl, size = 'sm' }: { name: string; photoUrl?: string; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'h-11 w-11 text-sm' : 'h-7 w-7 text-[10px]'
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`shrink-0 rounded-full object-cover ring-2 ring-white/10 ${sz}`}
      />
    )
  }
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white ring-2 ring-white/10 ${sz}`}>
      {name?.charAt(0)?.toUpperCase() ?? '?'}
    </div>
  )
}

// ── Dropdown item ──────────────────────────────────────────────────────────────

interface DropdownItemProps {
  icon: React.ElementType
  label: string
  sublabel?: string
  onClick?: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
  comingSoon?: boolean
}

function DropdownItem({ icon: Icon, label, sublabel, onClick, variant = 'default', disabled, comingSoon }: DropdownItemProps) {
  const isDisabled = disabled || comingSoon
  return (
    <div className="relative group/item">
      <motion.button
        type="button"
        onClick={comingSoon ? undefined : onClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { x: 2 } : undefined}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
          comingSoon ? 'cursor-default opacity-60' : 'disabled:opacity-40'
        } ${
          variant === 'danger'
            ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
            : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
        }`}
      >
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
          variant === 'danger'
            ? 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20'
            : 'bg-white/[0.06] text-slate-400 group-hover:bg-indigo-500/15 group-hover:text-indigo-300'
        }`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium leading-none ${variant === 'danger' ? '' : 'group-hover:text-white'}`}>
            {label}
          </p>
          {sublabel && (
            <p className="mt-0.5 text-[11px] text-slate-600">{sublabel}</p>
          )}
        </div>
        {comingSoon && (
          <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
            Soon
          </span>
        )}
      </motion.button>

      {/* Tooltip on hover */}
      {comingSoon && (
        <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover/item:opacity-100">
          <div
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-xl"
            style={{
              background: 'rgba(15,23,42,0.97)',
              border: '1px solid rgba(245,158,11,0.25)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            🚧 Coming soon — stay tuned!
            {/* Arrow */}
            <span
              className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
              style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(245,158,11,0.25)', borderBottom: 'none', borderRight: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main dropdown ─────────────────────────────────────────────────────────────

export function UserDropdown() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { runTransition } = usePageTransition()
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Position the portal menu under the trigger button
  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      })
    }
    setOpen(v => !v)
  }

  // Close on outside click or ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onClick = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  if (!user) return null

  const firstName = user.name?.split(' ')[0] ?? user.name ?? 'User'

  const handleLogout = () => {
    setOpen(false)
    runTransition('logout', logout)
  }

  return (
    <>
      {/* ── Trigger ─────────────────────────────────────────────────── */}
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200 ${
          open
            ? 'border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
            : 'border-white/5 bg-white/[0.04] hover:border-white/10 hover:bg-white/[0.07]'
        }`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Avatar name={user.name} photoUrl={user.photoUrl} size="sm" />
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-200 sm:block">
          {firstName}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </motion.div>
      </motion.button>

      {/* ── Portal menu ─────────────────────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Invisible backdrop to catch outside clicks */}
              <div
                className="fixed inset-0"
                style={{ zIndex: 9998 }}
                onClick={() => setOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="w-72 overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)]"
                style={{
                  ...menuStyle,
                  backgroundColor: 'rgba(8, 12, 28, 0.97)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                }}
              >
                {/* ── User info card ─────────────────────────────── */}
                <div className="relative overflow-hidden px-4 pb-3 pt-4">
                  {/* Ambient glow behind avatar */}
                  <div
                    className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full blur-2xl"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)', opacity: 0.5 }}
                  />
                  <div className="relative flex items-center gap-3">
                    <Avatar name={user.name} photoUrl={user.photoUrl} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
                      <div className="mt-1.5">
                        <RoleBadge role={user.role} />
                      </div>
                    </div>
                  </div>
                  {/* subtle separator line */}
                  <div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                </div>

                {/* ── Menu items ─────────────────────────────────── */}
                <div className="px-2 pb-2">

                  {/* Group 1: Account */}
                  <div className="py-1">
                    <p className="px-3 pb-1 pt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Account
                    </p>
                    <DropdownItem
                      icon={User}
                      label="Profile"
                      sublabel="View your public profile"
                      onClick={() => { setOpen(false); navigate('/profile') }}
                    />
                    <DropdownItem
                      icon={Settings}
                      label="Settings"
                      sublabel="Preferences & security"
                      onClick={() => { setOpen(false); navigate('/settings') }}
                    />
                  </div>

                  {/* Group 2: Admin (TO only) */}
                  {user.role === 'TO' && (
                    <>
                      <div className="mx-3 my-1 h-px bg-white/[0.05]" />
                      <div className="py-1">
                        <p className="px-3 pb-1 pt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                          Administration
                        </p>
                        <DropdownItem
                          icon={ShieldCheck}
                          label="Admin Panel"
                          sublabel="Manage users & roles"
                          onClick={() => { setOpen(false); navigate('/admin') }}
                        />
                      </div>
                    </>
                  )}

                  {/* Group 3: Help */}
                  <div className="mx-3 my-1 h-px bg-white/[0.05]" />
                  <div className="py-1">
                    <DropdownItem
                      icon={HelpCircle}
                      label="Help & Documentation"
                      onClick={() => setOpen(false)}
                    />
                  </div>

                  {/* Divider */}
                  <div className="mx-3 my-1 h-px bg-white/[0.05]" />

                  {/* Logout */}
                  <div className="py-1">
                    <DropdownItem
                      icon={LogOut}
                      label="Sign out"
                      sublabel={user.email ?? undefined}
                      variant="danger"
                      onClick={handleLogout}
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

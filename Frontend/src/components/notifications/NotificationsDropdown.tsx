import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  CheckCheck,
  Settings,
  Swords,
  Trophy,
  UserCheck,
  Zap,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

// ── Types ─────────────────────────────────────────────────────────────────────

type NType = 'tournament' | 'match' | 'participant' | 'bracket' | 'role'

interface Notification {
  id: number
  type: NType
  title: string
  time: string
  read: boolean
  priority?: 'high' | 'medium' | 'low'
}

// ── Static data ───────────────────────────────────────────────────────────────

const INITIAL: Notification[] = [
  { id: 1, type: 'tournament',  title: 'Tournament IPL has started',  time: '2 mins ago',  read: false, priority: 'high'   },
  { id: 2, type: 'match',       title: 'Match A vs B is ready',       time: '15 mins ago', read: false, priority: 'medium' },
  { id: 3, type: 'participant', title: 'New participant added',        time: '1 hour ago',  read: true                      },
  { id: 4, type: 'bracket',     title: 'Bracket generated successfully', time: '3 hours ago', read: true                   },
  { id: 5, type: 'role',        title: 'Admin access granted',         time: 'Yesterday',   read: false, priority: 'low'   },
]

// ── Icon + color map ──────────────────────────────────────────────────────────

const TYPE_META: Record<NType, { icon: React.ElementType; color: string; bg: string }> = {
  tournament:  { icon: Trophy,    color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  match:       { icon: Swords,    color: '#89ceff', bg: 'rgba(137,206,255,0.12)' },
  participant: { icon: UserCheck, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  bracket:     { icon: Zap,       color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  role:        { icon: Settings,  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
}

const PRIORITY_DOT: Record<string, string> = {
  high:   '#22c55e',
  medium: '#89ceff',
  low:    '#f59e0b',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NotificationsDropdown() {
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const onPage    = pathname === '/notifications'

  const [open, setOpen]   = useState(false)
  const [items, setItems] = useState<Notification[]>(INITIAL)
  const [pos, setPos]     = useState<React.CSSProperties>({})
  const triggerRef        = useRef<HTMLButtonElement>(null)

  const unread = items.filter(n => !n.read).length

  // If already on the notifications page → navigate there (no popup)
  // Otherwise → toggle the popup
  const handleOpen = () => {
    if (onPage) return
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({
        position: 'fixed',
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      })
    }
    setOpen(v => !v)
  }

  // Close popup whenever we navigate to the notifications page
  useEffect(() => { if (onPage) setOpen(false) }, [onPage])

  // Close on outside click or ESC
  useEffect(() => {
    if (!open) return
    const onKey   = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
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

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })))
  const markRead    = (id: number) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <>
      {/* ── Bell trigger ──────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition ${
          open || onPage
            ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]'
            : 'border-white/10 bg-white/[0.05] text-slate-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300'
        }`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(99,102,241,0.7)]">
            {unread}
          </span>
        )}
      </button>

      {/* ── Portal popup ──────────────────────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* backdrop */}
              <div
                className="fixed inset-0"
                style={{ zIndex: 9998 }}
                onClick={() => setOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -8 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{   opacity: 0, scale: 0.96, y: -8  }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  ...pos,
                  width: 360,
                  backgroundColor: '#0c1424',
                  border: '1px solid rgba(99,102,241,0.18)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {/* ── Header ────────────────────────────────────────── */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="text-sm font-bold text-white" style={{ letterSpacing: '-0.01em' }}>
                    Notifications
                  </span>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-indigo-300"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Mark all as read
                      </button>
                    )}
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
                      aria-label="Notification settings"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── List ──────────────────────────────────────────── */}
                <ul className="max-h-[360px] overflow-y-auto">
                  {items.map((n, i) => {
                    const meta = TYPE_META[n.type]
                    const Icon = meta.icon
                    return (
                      <motion.li
                        key={n.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => markRead(n.id)}
                        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03]"
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          backgroundColor: !n.read ? 'rgba(99,102,241,0.04)' : undefined,
                          borderLeft: !n.read ? '2px solid rgba(99,102,241,0.5)' : '2px solid transparent',
                        }}
                      >
                        {/* Icon chip */}
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: meta.bg }}
                        >
                          <Icon className="h-4 w-4" style={{ color: meta.color }} />
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-medium ${n.read ? 'text-slate-400' : 'text-white'}`}>
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-600">{n.time}</p>
                        </div>

                        {/* Priority dot */}
                        {!n.read && n.priority && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{
                              backgroundColor: PRIORITY_DOT[n.priority],
                              boxShadow: `0 0 6px ${PRIORITY_DOT[n.priority]}`,
                            }}
                          />
                        )}
                      </motion.li>
                    )
                  })}
                </ul>

                {/* ── Footer ────────────────────────────────────────── */}
                <button
                  type="button"
                  onClick={() => { setOpen(false); navigate('/notifications') }}
                  className="flex w-full items-center justify-center py-3 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/10 hover:text-indigo-300"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  View all notifications
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

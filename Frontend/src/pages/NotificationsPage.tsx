import { useState } from 'react'
import { Bell, CheckCheck, Settings, Swords, Trophy, UserCheck, Zap } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type NType = 'tournament' | 'match' | 'participant' | 'bracket' | 'role'
type Filter = 'all' | 'unread'

interface Notification {
  id: number
  type: NType
  title: string
  body: string
  time: string
  read: boolean
  priority?: 'high' | 'medium' | 'low'
}

// ── Data ──────────────────────────────────────────────────────────────────────

const INITIAL: Notification[] = [
  { id: 1, type: 'tournament',  title: 'Tournament IPL has started',     body: 'The IPL tournament has moved to ACTIVE status. The bracket is now live and matches are being scheduled.',  time: '2 mins ago',  read: false, priority: 'high'   },
  { id: 2, type: 'match',       title: 'Match A vs B is ready',          body: 'Your scheduled match between Team A and Team B is ready to begin. Please confirm your availability.',         time: '15 mins ago', read: false, priority: 'medium' },
  { id: 3, type: 'participant', title: 'New participant added',           body: 'A new participant "JohnDoe99" has registered and joined the Demo Cup tournament.',                             time: '1 hour ago',  read: true                      },
  { id: 4, type: 'bracket',     title: 'Bracket generated successfully', body: 'The bracket for Demo Cup has been generated. 16 teams have been seeded across 4 groups.',                     time: '3 hours ago', read: true                      },
  { id: 5, type: 'role',        title: 'Admin access granted',           body: 'Your account has been promoted to Tournament Organizer by the platform administrator.',                        time: 'Yesterday',   read: false, priority: 'low'   },
  { id: 6, type: 'tournament',  title: 'Tournament registration open',   body: 'Registration for Spring Championship 2025 is now open. Invite participants before slots fill up.',            time: '2 days ago',  read: true                      },
  { id: 7, type: 'match',       title: 'Score submitted',                body: 'Match #4 result has been recorded: PlayerA 2 – 1 PlayerB. The bracket has been updated accordingly.',         time: '3 days ago',  read: true                      },
]

// ── Meta ──────────────────────────────────────────────────────────────────────

const TYPE_META: Record<NType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  tournament:  { icon: Trophy,    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Tournament' },
  match:       { icon: Swords,    color: '#89ceff', bg: 'rgba(137,206,255,0.12)', label: 'Match'      },
  participant: { icon: UserCheck, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Participant'},
  bracket:     { icon: Zap,       color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Bracket'    },
  role:        { icon: Settings,  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Role'       },
}

const PRIORITY_DOT: Record<string, string> = {
  high:   '#22c55e',
  medium: '#89ceff',
  low:    '#f59e0b',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const [items, setItems]   = useState<Notification[]>(INITIAL)
  const [filter, setFilter] = useState<Filter>('all')

  const unread   = items.filter(n => !n.read).length
  const visible  = filter === 'unread' ? items.filter(n => !n.read) : items

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })))
  const markRead    = (id: number) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <div className="relative mx-auto max-w-2xl space-y-6 pb-12">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full blur-[120px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)' }}
      />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>

        {unread > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/[0.08] hover:text-white"
          >
            <CheckCheck className="h-4 w-4 text-indigo-400" />
            Mark all read
          </button>
        )}
      </div>

      {/* ── Filter tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1 w-fit">
        {(['all', 'unread'] as Filter[]).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
              filter === f
                ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {f === 'unread' ? `Unread (${unread})` : 'All'}
          </button>
        ))}
      </div>

      {/* ── List ─────────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl border border-white/[0.06]"
        style={{ backgroundColor: 'rgba(12,20,36,0.6)', backdropFilter: 'blur(12px)' }}
      >
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-600">
            <Bell className="h-10 w-10 opacity-30" />
            <p className="text-sm">No notifications here</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {visible.map(n => {
              const meta = TYPE_META[n.type]
              const Icon = meta.icon
              return (
                <li
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="flex cursor-pointer items-start gap-4 px-5 py-4 transition hover:bg-white/[0.02]"
                  style={{
                    backgroundColor: !n.read ? 'rgba(99,102,241,0.04)' : undefined,
                    borderLeft: !n.read ? '2px solid rgba(99,102,241,0.45)' : '2px solid transparent',
                  }}
                >
                  {/* Icon chip */}
                  <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/[0.06]"
                    style={{ background: meta.bg }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: meta.color }} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold leading-none ${n.read ? 'text-slate-300' : 'text-white'}`}>
                        {n.title}
                      </p>
                      {!n.read && n.priority && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: PRIORITY_DOT[n.priority],
                            boxShadow: `0 0 6px ${PRIORITY_DOT[n.priority]}`,
                          }}
                        />
                      )}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{n.body}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{
                          color: meta.color,
                          borderColor: meta.color + '33',
                          backgroundColor: meta.bg,
                        }}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-slate-600">{n.time}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

import { Bell, CheckCheck, Swords, Trophy, UserCheck } from 'lucide-react'

// ── types ─────────────────────────────────────────────────────────────────────

type NType = 'match' | 'tournament' | 'role' | 'system'

interface Notification {
  id: number
  type: NType
  title: string
  body: string
  time: string
  read: boolean
}

// ── placeholder data ──────────────────────────────────────────────────────────

const MOCK: Notification[] = [
  { id: 1, type: 'match',      title: 'Match ready',            body: 'Your match in Demo Cup — Round 1 is ready to play.',          time: '2 min ago',  read: false },
  { id: 2, type: 'tournament', title: 'Tournament started',     body: 'Demo Cup has moved to ACTIVE status. Bracket is live.',       time: '1 hr ago',   read: false },
  { id: 3, type: 'role',       title: 'Role updated',           body: 'You have been promoted to Organizer by organizer.',           time: '3 hr ago',   read: true  },
  { id: 4, type: 'match',      title: 'Score submitted',        body: 'Match #4 result has been recorded: PlayerA 2 – 1 PlayerB.',  time: 'Yesterday',  read: true  },
  { id: 5, type: 'system',     title: 'Welcome to Tournament OS', body: 'Your account is all set. Explore tournaments and matches.', time: '2 days ago', read: true  },
]

const TYPE_META: Record<NType, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  match:      { icon: Swords,    iconBg: 'bg-sky-500/15',    iconColor: 'text-sky-400'    },
  tournament: { icon: Trophy,    iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400' },
  role:       { icon: UserCheck, iconBg: 'bg-emerald-500/15',iconColor: 'text-emerald-400'},
  system:     { icon: Bell,      iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-400' },
}

// ── page ──────────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const unread = MOCK.filter(n => !n.read).length

  return (
    <div className="relative mx-auto max-w-2xl space-y-6 pb-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-[100px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="flex items-center justify-between">
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
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/[0.08] hover:text-white"
          >
            <CheckCheck className="h-4 w-4 text-indigo-400" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div
        className="overflow-hidden rounded-3xl border border-white/[0.06] backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(15,23,42,0.55)' }}
      >
        {MOCK.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-600">
            <Bell className="h-10 w-10 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {MOCK.map((n, i) => {
              const meta = TYPE_META[n.type]
              const Icon = meta.icon
              return (
                <li
                  key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 transition hover:bg-white/[0.02] ${!n.read ? 'bg-indigo-500/[0.03]' : ''}`}
                >
                  {/* Icon */}
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.iconBg} ring-1 ring-white/[0.06]`}>
                    <Icon className={`h-4 w-4 ${meta.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${n.read ? 'text-slate-300' : 'text-white'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{n.body}</p>
                  </div>

                  {/* Time */}
                  <span className="shrink-0 text-xs text-slate-600 whitespace-nowrap">{n.time}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

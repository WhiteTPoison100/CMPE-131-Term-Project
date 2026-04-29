import { useState } from 'react'
import { Bell, CheckCheck, Swords, Trophy, UserCheck } from 'lucide-react'
import { SlidePanel } from './SlidePanel'

type NType = 'match' | 'tournament' | 'role' | 'system'

interface Notification {
  id: number
  type: NType
  title: string
  body: string
  time: string
  read: boolean
}

const INITIAL: Notification[] = [
  { id: 1, type: 'match',      title: 'Match ready',              body: 'Your match in Demo Cup — Round 1 is ready to play.',        time: '2 min ago',  read: false },
  { id: 2, type: 'tournament', title: 'Tournament started',       body: 'Demo Cup moved to ACTIVE. Bracket is live.',                time: '1 hr ago',   read: false },
  { id: 3, type: 'role',       title: 'Role updated',             body: 'You have been promoted to Organizer.',                      time: '3 hr ago',   read: true  },
  { id: 4, type: 'match',      title: 'Score submitted',          body: 'Match #4 result recorded: PlayerA 2 – 1 PlayerB.',         time: 'Yesterday',  read: true  },
  { id: 5, type: 'system',     title: 'Welcome to Tournament OS', body: 'Your account is set up. Explore tournaments and matches.', time: '2 days ago', read: true  },
]

const TYPE_META: Record<NType, { icon: React.ElementType; bg: string; color: string }> = {
  match:      { icon: Swords,    bg: 'bg-sky-500/15',     color: 'text-sky-400'     },
  tournament: { icon: Trophy,    bg: 'bg-violet-500/15',  color: 'text-violet-400'  },
  role:       { icon: UserCheck, bg: 'bg-emerald-500/15', color: 'text-emerald-400' },
  system:     { icon: Bell,      bg: 'bg-indigo-500/15',  color: 'text-indigo-400'  },
}

interface Props {
  open: boolean
  onClose: () => void
}

export function NotificationsPanel({ open, onClose }: Props) {
  const [items, setItems] = useState<Notification[]>(INITIAL)
  const unread = items.filter(n => !n.read).length

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })))
  const markRead    = (id: number) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title="Notifications"
      subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
      icon={Bell}
      width="w-[min(100vw,420px)]"
    >
      {/* Mark all read */}
      {unread > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-indigo-500/30 hover:text-indigo-300"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06]" style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-slate-600">
            <Bell className="h-9 w-9 opacity-25" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {items.map(n => {
              const meta = TYPE_META[n.type]
              const Icon = meta.icon
              return (
                <li
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex cursor-pointer items-start gap-3.5 px-4 py-3.5 transition hover:bg-white/[0.03] ${!n.read ? 'bg-indigo-500/[0.04]' : ''}`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.bg} ring-1 ring-white/[0.05]`}>
                    <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold leading-none ${n.read ? 'text-slate-300' : 'text-white'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{n.body}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-600 whitespace-nowrap">{n.time}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </SlidePanel>
  )
}

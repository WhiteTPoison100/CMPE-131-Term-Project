import { Trophy, Swords, UserPlus, Sparkles, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ElementType } from 'react'
import type { Notification, NotificationType } from '../../types'

const TYPE_META: Record<
  NotificationType,
  { icon: ElementType; iconClass: string; railClass: string }
> = {
  tournament: {
    icon: Trophy,
    iconClass: 'text-[#22d3ee] bg-[#22d3ee]/12',
    railClass: 'bg-[#22d3ee]',
  },
  match: {
    icon: Swords,
    iconClass: 'text-[#38bdf8] bg-[#38bdf8]/12',
    railClass: 'bg-[#38bdf8]',
  },
  participant: {
    icon: UserPlus,
    iconClass: 'text-[#a78bfa] bg-[#a78bfa]/12',
    railClass: 'bg-[#a78bfa]',
  },
  system: {
    icon: Sparkles,
    iconClass: 'text-[#8b5cf6] bg-[#8b5cf6]/12',
    railClass: 'bg-[#8b5cf6]',
  },
  role: {
    icon: ShieldCheck,
    iconClass: 'text-[#f59e0b] bg-[#f59e0b]/12',
    railClass: 'bg-[#f59e0b]',
  },
}

interface NotificationItemProps {
  item: Notification
  onOpen: (id: string) => void
}

export function NotificationItem({ item, onOpen }: NotificationItemProps) {
  const meta = TYPE_META[item.type]
  const Icon = meta.icon

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(item.id)}
      layout
      whileHover={{ x: 2 }}
      className={`group relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
        item.isRead
          ? 'bg-transparent hover:bg-white/[0.03]'
          : 'bg-[#191f31]/80 hover:bg-[#23293c]'
      }`}
    >
      <div
        className={`absolute left-0 top-2 h-[calc(100%-1rem)] w-[2px] rounded-full ${item.isRead ? 'bg-transparent' : meta.railClass}`}
      />

      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 ${meta.iconClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <p
            className={`text-sm font-semibold leading-5 ${
              item.isRead ? 'text-[#c7c4d7]' : 'text-[#dce1fb]'
            } break-words`}
          >
            {item.title}
          </p>
          <AnimatePresence>
            {!item.isRead ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.16 }}
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.7)]"
              />
            ) : null}
          </AnimatePresence>
        </div>
        {item.description ? (
          <p className="mt-1 break-words text-xs leading-5 text-[#908fa0]">{item.description}</p>
        ) : null}
        <p className="mt-1 text-[11px] text-[#908fa0]">{item.timestamp}</p>
      </div>
    </motion.button>
  )
}

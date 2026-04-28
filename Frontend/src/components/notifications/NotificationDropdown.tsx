import { Settings } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Notification } from '../../types'
import { NotificationItem } from './NotificationItem'
import { NotificationsEmptyState } from './NotificationsEmptyState'

interface NotificationDropdownProps {
  isOpen: boolean
  notifications: Notification[]
  unreadCount: number
  onItemClick: (id: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationDropdown({
  isOpen,
  notifications,
  unreadCount,
  onItemClick,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="notification-dropdown"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[20.5rem] overflow-x-hidden overflow-y-hidden rounded-2xl border border-[#464554] bg-[#0c1324] shadow-[0_24px_64px_rgba(12,19,36,0.75)] backdrop-blur-xl"
          role="menu"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-[#464554] bg-[#0c1324] px-4 py-3">
            <p className="text-base font-semibold tracking-[-0.01em] text-[#dce1fb]">
              Notifications
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
                className="text-xs font-semibold text-[#c0c1ff] transition hover:text-[#e1e0ff] disabled:cursor-not-allowed disabled:text-[#908fa0]"
              >
                Mark all as read
              </button>
              <button
                type="button"
                aria-label="Notification settings"
                className="rounded-md border border-[#464554] bg-[#151b2d] p-1.5 text-[#c7c4d7] transition hover:text-[#dce1fb]"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <NotificationsEmptyState />
          ) : (
            <ul className="notifications-scroll max-h-[22rem] overflow-x-hidden overflow-y-auto divide-y divide-[#2e3447]">
              {notifications.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, delay: index * 0.04 }}
                >
                  <NotificationItem item={item} onOpen={onItemClick} />
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationBadge } from './NotificationBadge'
import { NotificationDropdown } from './NotificationDropdown'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={wrapperRef}>
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        whileTap={{ scale: 0.96 }}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition ${
          isOpen
            ? 'border-[#8083ff]/50 bg-[#151b2d] text-[#dce1fb]'
            : 'border-[#464554] bg-[#151b2d]/75 text-[#c7c4d7] hover:border-[#8083ff]/40 hover:text-[#dce1fb]'
        }`}
      >
        <Bell className="h-4 w-4" />
        <NotificationBadge count={unreadCount} />
      </motion.button>

      <NotificationDropdown
        isOpen={isOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        onItemClick={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  )
}

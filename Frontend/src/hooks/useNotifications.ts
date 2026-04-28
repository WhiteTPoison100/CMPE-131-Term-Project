import { useMemo, useState } from 'react'
import { MOCK_NOTIFICATIONS } from '../data/notifications/mockNotifications'
import type { Notification } from '../types'

export function useNotifications(initialData: Notification[] = MOCK_NOTIFICATIONS) {
  const [notifications, setNotifications] = useState<Notification[]>(initialData)

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  )

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}

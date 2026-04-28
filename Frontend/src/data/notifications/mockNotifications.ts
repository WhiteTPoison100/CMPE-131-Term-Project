import type { Notification } from '../../types'

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'tournament',
    title: 'Tournament IPL has started',
    timestamp: '2 mins ago',
    isRead: false,
  },
  {
    id: 'notif-2',
    type: 'match',
    title: 'Match A vs B is ready',
    timestamp: '15 mins ago',
    isRead: false,
  },
  {
    id: 'notif-3',
    type: 'participant',
    title: 'New participant added',
    description: 'OrbitOwls joined Spring Invitational 2026.',
    timestamp: '1 hour ago',
    isRead: true,
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Bracket generated successfully',
    timestamp: '3 hours ago',
    isRead: true,
  },
  {
    id: 'notif-5',
    type: 'role',
    title: 'Admin access granted',
    description: 'Tournament Organizer permissions are active.',
    timestamp: 'Yesterday',
    isRead: false,
  },
]

import { AnimatePresence, motion } from 'framer-motion'

interface NotificationBadgeProps {
  count: number
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.span
          key="notification-count"
          initial={{ opacity: 0, scale: 0.7, y: 2 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 2 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full border border-[#191f31] bg-[#0ea5e9] px-1 text-[10px] font-bold leading-none text-[#001e2f]"
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      ) : null}
    </AnimatePresence>
  )
}

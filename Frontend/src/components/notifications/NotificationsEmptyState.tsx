import { BellOff } from 'lucide-react'

export function NotificationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <BellOff className="h-5 w-5 text-[#908fa0]" />
      </div>
      <p className="text-sm font-semibold text-[#dce1fb]">No notifications</p>
      <p className="text-xs text-[#908fa0]">You're all caught up for now.</p>
    </div>
  )
}

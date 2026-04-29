import { Settings } from 'lucide-react'
import { SlidePanel } from './SlidePanel'
import { SettingsPage } from '../../pages/SettingsPage'

interface Props {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: Props) {
  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title="Settings"
      subtitle="Account, preferences & privacy"
      icon={Settings}
      width="w-[min(100vw,580px)]"
    >
      {/* Reuse the full settings page content — it adapts to any container width */}
      <SettingsPage insidePanel />
    </SlidePanel>
  )
}

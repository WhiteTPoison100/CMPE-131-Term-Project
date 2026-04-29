import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface SlidePanelProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: React.ElementType
  width?: string
  children: React.ReactNode
}

export function SlidePanel({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  width = 'w-[min(100vw,520px)]',
  children,
}: SlidePanelProps) {
  // ESC to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9980] flex justify-end">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={`relative flex ${width} flex-col border-l border-white/[0.07] shadow-[−32px_0_80px_rgba(0,0,0,0.6)]`}
            style={{ backgroundColor: 'rgba(7, 11, 24, 0.98)', backdropFilter: 'blur(24px)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
          >
            {/* Top accent line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-6 py-4">
              {Icon && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-base font-bold text-white" style={{ letterSpacing: '-0.01em' }}>
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-slate-500">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

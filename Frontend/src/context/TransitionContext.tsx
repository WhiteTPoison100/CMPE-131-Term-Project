import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Swords } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type TransitionType = 'login' | 'logout'

interface PageTransitionContextValue {
  /** Show the overlay, call `action` at peak visibility, then auto-dismiss. */
  runTransition: (type: TransitionType, action: () => void, name?: string) => void
  /** Lightweight flash with no blocking action (login only). */
  flashLogin: (name?: string) => void
}

// ── Context ───────────────────────────────────────────────────────────────────

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null)

// ── Overlay visual ────────────────────────────────────────────────────────────

interface OverlayState {
  visible: boolean
  type: TransitionType
  name?: string
}

function TransitionOverlay({ state }: { state: OverlayState }) {
  const isLogin = state.type === 'login'

  return createPortal(
    <AnimatePresence>
      {state.visible && (
        <motion.div
          key="page-transition-overlay"
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{ backgroundColor: '#020617', zIndex: 99999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* Radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: isLogin
                ? 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(99,102,241,0.2) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(139,92,246,0.18) 0%, transparent 70%)',
            }}
          />

          {/* Subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Content */}
          <motion.div
            className="relative flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.94, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Icon with pulse rings */}
            <div className="relative flex h-20 w-20 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(99,102,241,0.4)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-2 rounded-full"
                style={{ border: '1px solid rgba(99,102,241,0.2)' }}
                animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              />
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(139,92,246,0.28) 100%)',
                  border: '1px solid rgba(99,102,241,0.45)',
                  boxShadow: '0 0 48px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                <Swords className="h-7 w-7 text-indigo-300" />
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-400">
                Tournament OS
              </span>
              <p className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                {isLogin
                  ? state.name ? `Welcome back, ${state.name.split(' ')[0]}` : 'Welcome back'
                  : 'See you soon!'}
              </p>
              <p className="text-sm text-slate-500">
                {isLogin ? 'Loading your dashboard…' : 'Signing you out safely…'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="h-px w-44 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.95, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayState>({ visible: false, type: 'login' })

  /**
   * Show overlay → call action at peak visibility → auto-dismiss.
   * Use this for logout (action = logout fn).
   */
  const runTransition = useCallback((type: TransitionType, action: () => void, name?: string) => {
    setOverlay({ visible: true, type, name })
    // Call the action while overlay is fully opaque (after fade-in ~300ms)
    setTimeout(() => action(), 450)
    // Dismiss overlay after animation completes
    setTimeout(() => setOverlay(prev => ({ ...prev, visible: false })), 1200)
  }, [])

  /**
   * Flash the overlay without blocking (for login — navigation happens via <Navigate>).
   */
  const flashLogin = useCallback((name?: string) => {
    setOverlay({ visible: true, type: 'login', name })
    setTimeout(() => setOverlay(prev => ({ ...prev, visible: false })), 1200)
  }, [])

  return (
    <PageTransitionContext.Provider value={{ runTransition, flashLogin }}>
      {children}
      <TransitionOverlay state={overlay} />
    </PageTransitionContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePageTransition(): PageTransitionContextValue {
  const ctx = useContext(PageTransitionContext)
  if (!ctx) throw new Error('usePageTransition must be used inside PageTransitionProvider')
  return ctx
}

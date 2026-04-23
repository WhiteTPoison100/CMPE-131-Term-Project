import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  accent?: 'indigo' | 'emerald' | 'amber' | 'violet' | 'sky'
  trend?: string
}

const accents = {
  indigo: {
    chip: 'bg-indigo-500/15 ring-indigo-400/20 text-indigo-300',
    glow: 'rgba(99,102,241,0.18)',
    hover: 'hover:border-indigo-400/25',
    trend: 'text-emerald-400',
  },
  emerald: {
    chip: 'bg-emerald-500/15 ring-emerald-400/20 text-emerald-300',
    glow: 'rgba(16,185,129,0.18)',
    hover: 'hover:border-emerald-400/25',
    trend: 'text-emerald-400',
  },
  amber: {
    chip: 'bg-amber-500/15 ring-amber-400/20 text-amber-300',
    glow: 'rgba(245,158,11,0.18)',
    hover: 'hover:border-amber-400/25',
    trend: 'text-amber-300',
  },
  violet: {
    chip: 'bg-violet-500/15 ring-violet-400/20 text-violet-300',
    glow: 'rgba(139,92,246,0.18)',
    hover: 'hover:border-violet-400/25',
    trend: 'text-emerald-400',
  },
  sky: {
    chip: 'bg-sky-500/15 ring-sky-400/20 text-sky-300',
    glow: 'rgba(14,165,233,0.18)',
    hover: 'hover:border-sky-400/25',
    trend: 'text-emerald-400',
  },
} as const

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])
  return count
}

function StatValue({ value }: { value: string | number }) {
  const numeric = typeof value === 'number' ? value : parseFloat(String(value))
  const isNumber = !isNaN(numeric) && String(value) === String(numeric)
  const count = useCountUp(isNumber ? numeric : 0)
  return <>{isNumber ? count.toLocaleString() : value}</>
}

export function StatCard({ label, value, hint, icon: Icon, accent = 'indigo', trend }: StatCardProps) {
  const a = accents[accent]
  const isNeg = trend?.startsWith('-')
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.06] p-5 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] ${a.hover}`}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
    >
      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-70"
        style={{ background: `radial-gradient(circle, ${a.glow} 0%, transparent 70%)` }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${a.chip}`}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          {trend ? (
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${isNeg ? 'text-red-400' : a.trend}`}>
              {isNeg ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {trend}
            </span>
          ) : null}
        </div>

        <p
          className="mt-4 text-[11px] font-semibold uppercase text-slate-500"
          style={{ letterSpacing: '0.1em' }}
        >
          {label}
        </p>
        <p
          className="mt-1 font-bold tabular-nums text-white"
          style={{ fontSize: '2rem', lineHeight: 1.1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}
        >
          <StatValue value={value} />
        </p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  )
}

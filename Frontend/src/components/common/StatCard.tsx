import type { LucideIcon } from 'lucide-react'
import { TrendingUp } from 'lucide-react'

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
    chip: 'bg-indigo-500/15 ring-indigo-400/25 text-indigo-300',
    trend: 'text-emerald-400',
    hover: 'hover:border-indigo-400/30',
    glow: 'bg-indigo-500/20',
  },
  emerald: {
    chip: 'bg-emerald-500/15 ring-emerald-400/25 text-emerald-300',
    trend: 'text-emerald-400',
    hover: 'hover:border-emerald-400/30',
    glow: 'bg-emerald-500/20',
  },
  amber: {
    chip: 'bg-amber-500/15 ring-amber-400/25 text-amber-300',
    trend: 'text-amber-300',
    hover: 'hover:border-amber-400/30',
    glow: 'bg-amber-500/20',
  },
  violet: {
    chip: 'bg-violet-500/15 ring-violet-400/25 text-violet-300',
    trend: 'text-emerald-400',
    hover: 'hover:border-violet-400/30',
    glow: 'bg-violet-500/20',
  },
  sky: {
    chip: 'bg-sky-500/15 ring-sky-400/25 text-sky-300',
    trend: 'text-emerald-400',
    hover: 'hover:border-sky-400/30',
    glow: 'bg-sky-500/20',
  },
} as const

export function StatCard({ label, value, hint, icon: Icon, accent = 'indigo', trend }: StatCardProps) {
  const a = accents[accent]
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/5 p-5 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(2,6,23,0.9)] ${a.hover}`}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
    >
      <div className={`pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full blur-3xl opacity-60 ${a.glow}`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${a.chip}`}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          {trend ? (
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${a.trend}`}>
              <TrendingUp className="h-3 w-3" />
              {trend}
            </span>
          ) : null}
        </div>
        <p
          className="mt-5 text-[11px] font-semibold uppercase text-slate-400"
          style={{ letterSpacing: '0.08em' }}
        >
          {label}
        </p>
        <p
          className="mt-1 text-[32px] font-bold tabular-nums text-white"
          style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
        >
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  )
}

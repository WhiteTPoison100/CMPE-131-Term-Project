import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  accent?: 'indigo' | 'emerald' | 'amber' | 'violet' | 'sky'
}

const accents = {
  indigo: 'from-indigo-500/20 to-violet-600/10 ring-indigo-500/25 text-indigo-200',
  emerald: 'from-emerald-500/20 to-teal-600/10 ring-emerald-500/25 text-emerald-200',
  amber: 'from-amber-500/20 to-orange-600/10 ring-amber-500/25 text-amber-200',
  violet: 'from-violet-500/20 to-fuchsia-600/10 ring-violet-500/25 text-violet-200',
  sky: 'from-sky-500/20 to-blue-600/10 ring-sky-500/25 text-sky-200',
} as const

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'indigo',
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-[1px] ring-1 ring-inset ${accents[accent]}`}
    >
      <div className="rounded-2xl bg-slate-900/90 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{value}</p>
            {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
          </div>
          <div className="rounded-xl bg-slate-800/80 p-2 ring-1 ring-slate-700/80">
            <Icon className="h-5 w-5 text-indigo-300" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}

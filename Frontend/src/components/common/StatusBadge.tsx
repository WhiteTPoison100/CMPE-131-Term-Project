import type { MatchStatus, TournamentStatus } from '../../types'

const tournamentStyles: Record<TournamentStatus, string> = {
  UPCOMING:
    'bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/30',
  ACTIVE:
    'bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-500/30',
  COMPLETED:
    'bg-slate-500/20 text-slate-300 ring-1 ring-inset ring-slate-500/35',
}

const matchStyles: Record<MatchStatus, string> = {
  PENDING: 'bg-slate-600/40 text-slate-300 ring-1 ring-inset ring-slate-500/40',
  READY: 'bg-sky-500/15 text-sky-200 ring-1 ring-inset ring-sky-500/35',
  COMPLETED:
    'bg-violet-500/15 text-violet-200 ring-1 ring-inset ring-violet-500/35',
}

interface TournamentBadgeProps {
  status: TournamentStatus
  className?: string
}

export function TournamentStatusBadge({ status, className = '' }: TournamentBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${tournamentStyles[status]} ${className}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}

interface MatchBadgeProps {
  status: MatchStatus
  className?: string
}

export function MatchStatusBadge({ status, className = '' }: MatchBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${matchStyles[status]} ${className}`}
    >
      {status}
    </span>
  )
}

import type { Match } from '../../types'
import { MatchStatusBadge } from '../common/StatusBadge'

interface MatchCardProps {
  match: Match
  onOpen?: (match: Match) => void
  canEdit?: boolean
}

const bracketLabel: Record<Match['bracketType'], string> = {
  WINNERS: 'Winners',
  LOSERS: 'Losers',
  GRAND_FINAL: 'Grand Final',
}

export function MatchCard({ match, onOpen, canEdit }: MatchCardProps) {
  const score =
    match.score1 != null && match.score2 != null
      ? `${match.score1} — ${match.score2}`
      : '—'

  const interactive = Boolean(onOpen)
  const className = `w-full rounded-2xl border border-slate-800/90 bg-slate-900/50 p-4 text-left ring-0 transition ${
    interactive
      ? 'hover:border-indigo-500/40 hover:bg-slate-900/80 hover:shadow-md hover:shadow-indigo-950/20'
      : ''
  } ${interactive && canEdit && match.status !== 'COMPLETED' ? 'cursor-pointer' : ''}`

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-300/90">
          {bracketLabel[match.bracketType]} · R{match.round} M{match.matchNumber}
        </span>
        <MatchStatusBadge status={match.status} />
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
        <div>
          <p className="text-xs text-slate-500">Player 1</p>
          <p className="font-semibold text-white">{match.player1}</p>
        </div>
        <div className="rounded-lg bg-slate-950/70 px-3 py-1 text-center text-xs font-mono text-slate-200 ring-1 ring-slate-800">
          {score}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Player 2</p>
          <p className="font-semibold text-white">{match.player2}</p>
        </div>
      </div>
      {match.winner ? (
        <p className="mt-3 text-xs text-emerald-300/90">
          Winner: <span className="font-semibold text-emerald-200">{match.winner}</span>
        </p>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          {canEdit && interactive
            ? 'Click to report scores (organizer).'
            : 'Spectating — scores appear when organizers post results.'}
        </p>
      )}
    </>
  )

  if (interactive) {
    return (
      <button type="button" onClick={() => onOpen?.(match)} className={className}>
        {body}
      </button>
    )
  }

  return <div className={className}>{body}</div>
}

import { Pencil } from 'lucide-react'
import type { Match } from '../../types'

interface MatchCardProps {
  match: Match
  onOpen?: (match: Match) => void
  canEdit?: boolean
}

const uppercase = { letterSpacing: '0.12em' } as const
const mono = { fontFamily: 'ui-monospace, monospace' } as const

function TeamInitials({ name }: { name: string }) {
  const isTbd = !name || name === 'TBD' || name === '—'
  if (isTbd) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[9px] font-bold text-slate-600">
        ?
      </span>
    )
  }
  const initials = name
    .split(/[\s_]+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/20 text-[9px] font-bold text-indigo-200 ring-1 ring-indigo-400/25">
      {initials}
    </span>
  )
}

function ScoreCell({ score }: { score: number | null }) {
  if (score == null) return <span className="text-slate-600" style={mono}>—</span>
  return <span className="font-bold tabular-nums text-white" style={mono}>{score}</span>
}

export function MatchCard({ match, onOpen, canEdit }: MatchCardProps) {
  const isLive = match.status === 'READY'
  const isDone = match.status === 'COMPLETED'
  const isTbd = (s: string) => !s || s === 'TBD' || s === '—'
  const canClick = Boolean(onOpen) && canEdit && !isDone

  const cardBase = `relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
    isLive
      ? 'border-sky-500/30 bg-sky-500/[0.04] shadow-[0_0_20px_rgba(14,165,233,0.1)]'
      : isDone
        ? 'border-violet-500/20 bg-violet-500/[0.03]'
        : 'border-white/[0.06] bg-white/[0.02]'
  } ${canClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.15)]' : ''}`

  const body = (
    <>
      {/* Top accent line */}
      {isLive && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
      )}
      {isDone && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
      )}

      <div className="p-4">
        {/* Header: match number + status */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-semibold uppercase text-slate-500"
            style={uppercase}
          >
            Match #{match.matchNumber ?? match.id.slice(-3)}
          </span>
          {isLive ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-300"
              style={uppercase}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400 shadow-[0_0_6px_rgba(14,165,233,0.8)]" />
              Live / Ready
            </span>
          ) : isDone ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-300"
              style={uppercase}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              Completed
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500"
              style={uppercase}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
              Pending
            </span>
          )}
        </div>

        {/* Player rows */}
        <div className="space-y-1.5">
          {[
            { name: match.player1, score: match.score1, isWinner: match.winner === match.player1 },
            { name: match.player2, score: match.score2, isWinner: match.winner === match.player2 },
          ].map(({ name, score, isWinner }, i) => {
            const tbd = isTbd(name)
            return (
              <div
                key={i}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${
                  isWinner
                    ? 'bg-emerald-500/[0.08] ring-1 ring-emerald-400/20'
                    : 'bg-white/[0.03] ring-1 ring-white/[0.04]'
                }`}
              >
                <TeamInitials name={name} />
                <span
                  className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                    tbd ? 'italic text-slate-600' : isWinner ? 'text-emerald-300' : 'text-white'
                  }`}
                >
                  {tbd ? 'TBD' : name}
                </span>
                <ScoreCell score={score} />
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-3">
          {isDone && match.winner ? (
            <p className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] px-3 py-1.5 text-xs text-emerald-300">
              Winner:{' '}
              <span className="font-semibold">{match.winner}</span>{' '}
              <span className="text-emerald-400/60">advances to R{match.round + 1}</span>
            </p>
          ) : isLive && canEdit ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/[0.06] px-3 py-1.5 text-xs font-semibold text-sky-300">
              <Pencil className="h-3 w-3" />
              Click to report scores
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              {isTbd(match.player1) || isTbd(match.player2)
                ? 'Awaiting previous matches'
                : canEdit
                  ? 'Pending — no scores yet'
                  : 'Spectating — scores appear when posted.'}
            </p>
          )}
        </div>
      </div>
    </>
  )

  if (canClick) {
    return (
      <button type="button" onClick={() => onOpen?.(match)} className={cardBase}>
        {body}
      </button>
    )
  }

  return <div className={cardBase}>{body}</div>
}

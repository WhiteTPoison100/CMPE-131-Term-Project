import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Swords } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { MatchCard } from '../components/matches/MatchCard'
import { ScoreSubmissionModal } from '../components/matches/ScoreSubmissionModal'
import type { Match } from '../types'

const uppercase = { letterSpacing: '0.14em' } as const
const tight = { letterSpacing: '-0.02em' } as const

function groupByRound(matches: Match[]): Map<number, Match[]> {
  const map = new Map<number, Match[]>()
  for (const m of matches) {
    const arr = map.get(m.round) ?? []
    arr.push(m)
    map.set(m.round, arr)
  }
  return map
}

export function MatchesPage() {
  const { matches, tournaments, getTournament, updateMatchScore, loading } = useAppData()
  const { user } = useAuth()
  const isOrganizer = user?.role === 'TO'

  const [filter, setFilter] = useState<string>('ALL')
  const [active, setActive] = useState<Match | null>(null)

  const options = useMemo(
    () => [
      { value: 'ALL', label: 'All Tournaments' },
      ...tournaments.map((t) => ({ value: t.id, label: t.name })),
    ],
    [tournaments],
  )

  const filtered = useMemo(
    () => (filter === 'ALL' ? matches : matches.filter((m) => m.tournamentId === filter)),
    [matches, filter],
  )

  const grouped = useMemo(() => ({
    WINNERS: groupByRound(filtered.filter((m) => m.bracketType === 'WINNERS')),
    LOSERS: groupByRound(filtered.filter((m) => m.bracketType === 'LOSERS')),
    GRAND_FINAL: groupByRound(filtered.filter((m) => m.bracketType === 'GRAND_FINAL')),
  }), [filtered])

  const canSubmitScore = (m: Match) =>
    isOrganizer &&
    m.status !== 'COMPLETED' &&
    !['TBD', '—'].includes(m.player1) &&
    !['TBD', '—'].includes(m.player2)

  const lanes = [
    {
      key: 'WINNERS' as const,
      label: 'Winners Bracket',
      roundPrefix: 'Round',
      accent: 'text-indigo-400',
      divider: 'bg-indigo-500/40',
    },
    {
      key: 'LOSERS' as const,
      label: 'Losers Bracket',
      roundPrefix: 'L-Round',
      accent: 'text-red-400',
      divider: 'bg-red-500/40',
    },
    {
      key: 'GRAND_FINAL' as const,
      label: 'Grand Final',
      roundPrefix: 'Round',
      accent: 'text-fuchsia-400',
      divider: 'bg-fuchsia-500/40',
    },
  ]

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-16 h-80 w-80 rounded-full blur-[120px] opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <Swords className="h-5 w-5 text-indigo-400" />
              <h1 className="text-3xl font-bold text-white" style={tight}>
                Matches &amp; Brackets
              </h1>
            </div>
            <p className="text-sm text-slate-400 max-w-xl">
              Lane-based layout mirrors broadcast overlays. Manage live scoring, update
              match statuses, and monitor tournament progression in real-time.
            </p>
          </div>

          {/* Filters + Directory */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none rounded-xl border border-white/10 bg-white/[0.05] py-2.5 pl-4 pr-8 text-sm font-medium text-slate-200 outline-none transition focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-xl"
              >
                {options.map((o) => (
                  <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <Link
              to="/tournaments"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition hover:border-indigo-400/30 hover:bg-indigo-500/[0.08]"
            >
              <FolderOpen className="h-4 w-4" />
              Directory
            </Link>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-10">
            {[1, 2].map((section) => (
              <div key={section} className="space-y-4">
                {/* Section header skeleton */}
                <div className="flex items-center gap-3">
                  <div className="h-4 w-0.5 rounded-full bg-slate-800" />
                  <div className="h-3 w-32 rounded-full bg-slate-800 animate-pulse" />
                  <div className="flex-1 h-px bg-white/[0.04]" />
                </div>
                {/* Round label skeleton */}
                <div className="h-2.5 w-16 rounded-full bg-slate-800/80 animate-pulse" />
                {/* Card skeletons */}
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map((card) => (
                    <div
                      key={card}
                      className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 space-y-3"
                      style={{ animationDelay: `${card * 80}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-24 rounded-full bg-slate-800 animate-pulse" />
                        <div className="h-5 w-16 rounded-full bg-slate-800/60 animate-pulse" />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="h-4 w-20 rounded-full bg-slate-800 animate-pulse" />
                        <div className="h-6 w-10 rounded-lg bg-slate-800/60 animate-pulse" />
                        <div className="h-3 w-5 rounded-full bg-slate-700/40 animate-pulse" />
                        <div className="h-6 w-10 rounded-lg bg-slate-800/60 animate-pulse" />
                        <div className="h-4 w-20 rounded-full bg-slate-800 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state — only shown after loading completes */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03]">
              <Swords className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">No matches to display</p>
              <p className="mt-1 text-xs text-slate-500">Generate a bracket after seeding participants, or widen the filter above.</p>
            </div>
            <Link
              to="/tournaments"
              className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.4)] transition hover:-translate-y-px"
            >
              Go to tournaments
            </Link>
          </div>
        )}

        {/* Bracket lanes */}
        {!loading && <div className="space-y-12">
          {lanes.map(({ key, label, roundPrefix, accent, divider }) => {
            const byRound = grouped[key]
            if (byRound.size === 0) return null
            const rounds = Array.from(byRound.keys()).sort((a, b) => a - b)

            return (
              <section key={key}>
                {/* Section header */}
                <div className="mb-5 flex items-center gap-3">
                  <div className={`h-4 w-0.5 rounded-full ${divider}`} />
                  <h2
                    className={`text-[11px] font-bold uppercase ${accent}`}
                    style={uppercase}
                  >
                    {label}
                  </h2>
                  <div className="flex-1 h-px bg-white/[0.05]" />
                </div>

                {/* Rounds */}
                <div className="space-y-6">
                  {rounds.map((round) => {
                    const roundMatches = byRound.get(round) ?? []
                    return (
                      <div key={round}>
                        {/* Round label */}
                        <div className="mb-3 flex items-center justify-between">
                          <span
                            className="text-[10px] font-semibold uppercase text-slate-500"
                            style={uppercase}
                          >
                            {roundPrefix} {round}
                          </span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {roundMatches.map((m) => {
                            const t = getTournament(m.tournamentId)
                            return (
                              <div key={m.id} className="space-y-1.5">
                                {t && filter === 'ALL' && (
                                  <p className="truncate text-[10px] font-medium text-slate-600" style={uppercase}>
                                    <Link
                                      to={`/tournaments/${t.id}`}
                                      className="text-indigo-400/70 hover:text-indigo-300 transition"
                                    >
                                      {t.name}
                                    </Link>
                                  </p>
                                )}
                                <MatchCard
                                  match={m}
                                  canEdit={isOrganizer}
                                  onOpen={canSubmitScore(m) ? (mm) => setActive(mm) : undefined}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>}
      </div>

      {isOrganizer && (
        <ScoreSubmissionModal
          match={active}
          open={Boolean(active)}
          onClose={() => setActive(null)}
          onSubmit={updateMatchScore}
        />
      )}
    </div>
  )
}

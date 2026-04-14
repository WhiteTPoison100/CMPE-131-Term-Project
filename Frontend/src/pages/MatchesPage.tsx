import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swords } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import { SelectInput } from '../components/forms/SelectInput'
import { EmptyState } from '../components/common/EmptyState'
import { MatchCard } from '../components/matches/MatchCard'
import { ScoreSubmissionModal } from '../components/matches/ScoreSubmissionModal'
import type { Match } from '../types'

export function MatchesPage() {
  const { matches, tournaments, getTournament, updateMatchScore } = useAppData()
  const { user } = useAuth()
  const isOrganizer = user?.role === 'TO'

  const [filter, setFilter] = useState<string>('ALL')
  const [active, setActive] = useState<Match | null>(null)

  const options = useMemo(
    () => [
      { value: 'ALL', label: 'All tournaments' },
      ...tournaments.map((t) => ({ value: t.id, label: t.name })),
    ],
    [tournaments],
  )

  const filtered = useMemo(
    () =>
      filter === 'ALL' ? matches : matches.filter((m) => m.tournamentId === filter),
    [matches, filter],
  )

  const grouped = useMemo(() => {
    const winners = filtered.filter((m) => m.bracketType === 'WINNERS')
    const losers = filtered.filter((m) => m.bracketType === 'LOSERS')
    const gf = filtered.filter((m) => m.bracketType === 'GRAND_FINAL')
    return { winners, losers, gf }
  }, [filtered])

  const canSubmitScore = (m: Match) =>
    isOrganizer &&
    m.status !== 'COMPLETED' &&
    !['TBD', '—'].includes(m.player1) &&
    !['TBD', '—'].includes(m.player2)

  return (
    <div>
      <PageHeader
        title="Matches & brackets"
        subtitle="Lane-based layout mirrors broadcast overlays—swap in live data from your Spring controllers."
        actions={
          <Link
            to="/tournaments"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Tournament directory
          </Link>
        }
      />

      <div className="mb-8 max-w-md">
        <SelectInput
          label="Tournament focus"
          name="tournament"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={options}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="No matches to display"
          description="Generate a bracket after seeding participants, or widen the tournament filter above."
          action={
            <Link
              to="/tournaments"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Go to tournaments
            </Link>
          }
        />
      ) : (
        <div className="space-y-12">
          {(['WINNERS', 'LOSERS', 'GRAND_FINAL'] as const).map((lane) => {
            const list =
              lane === 'WINNERS'
                ? grouped.winners
                : lane === 'LOSERS'
                  ? grouped.losers
                  : grouped.gf
            const label =
              lane === 'WINNERS'
                ? 'Winners bracket'
                : lane === 'LOSERS'
                  ? 'Losers bracket'
                  : 'Grand final'
            const accent =
              lane === 'WINNERS'
                ? 'text-indigo-200/90'
                : lane === 'LOSERS'
                  ? 'text-amber-200/90'
                  : 'text-fuchsia-200/90'
            return (
              <section key={lane}>
                <h2 className={`mb-4 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}>
                  {label}
                </h2>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((m) => {
                    const t = getTournament(m.tournamentId)
                    return (
                      <div key={m.id} className="space-y-2">
                        {t ? (
                          <p className="text-xs font-medium text-slate-500">
                            <Link
                              to={`/tournaments/${t.id}`}
                              className="text-indigo-200 hover:text-white"
                            >
                              {t.name}
                            </Link>
                          </p>
                        ) : null}
                        <MatchCard
                          match={m}
                          canEdit={isOrganizer}
                          onOpen={canSubmitScore(m) ? (mm) => setActive(mm) : undefined}
                        />
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {isOrganizer ? (
        <ScoreSubmissionModal
          match={active}
          open={Boolean(active)}
          onClose={() => setActive(null)}
          onSubmit={updateMatchScore}
        />
      ) : null}
    </div>
  )
}

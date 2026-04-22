import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertTriangle, Shuffle, Swords, Trash2, UserPlus, Wand2 } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import { TournamentStatusBadge } from '../components/common/StatusBadge'
import { RoleGuard } from '../components/guards/RoleGuard'
import { ParticipantTable } from '../components/participants/ParticipantTable'
import { AddParticipantModal } from '../components/participants/AddParticipantModal'
import { MatchCard } from '../components/matches/MatchCard'
import { ScoreSubmissionModal } from '../components/matches/ScoreSubmissionModal'
import { formatDate } from '../utils/formatDate'
import type { Match } from '../types'

type Tab = 'overview' | 'participants' | 'bracket'

export function TournamentDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const editHint = searchParams.get('edit') === '1'
  const { user } = useAuth()
  const isOrganizer = user?.role === 'TO'

  const {
    getTournament,
    getParticipants,
    getMatches,
    participantCountFor,
    deleteTournament,
    addParticipant,
    removeParticipant,
    generateBracket,
    updateMatchScore,
  } = useAppData()

  const tournament = id ? getTournament(id) : undefined
  const [tab, setTab] = useState<Tab>('overview')
  const [addOpen, setAddOpen] = useState(false)
  const [activeMatch, setActiveMatch] = useState<Match | null>(null)
  const [bracketMsg, setBracketMsg] = useState<string | null>(null)

  const participants = id ? getParticipants(id) : []
  const matches = useMemo(() => (id ? getMatches(id) : []), [id, getMatches])

  const grouped = useMemo(() => {
    const winners = matches.filter((m) => m.bracketType === 'WINNERS')
    const losers = matches.filter((m) => m.bracketType === 'LOSERS')
    const gf = matches.filter((m) => m.bracketType === 'GRAND_FINAL')
    return { winners, losers, gf }
  }, [matches])

  const canSubmitScore = (m: Match) =>
    isOrganizer &&
    m.status !== 'COMPLETED' &&
    !['TBD', '—'].includes(m.player1) &&
    !['TBD', '—'].includes(m.player2)

  if (!id || !tournament) {
    return <Navigate to="/tournaments" replace />
  }

  const nextSeed =
    participants.reduce((max, p) => Math.max(max, p.seed), 0) + 1 || 1

  const onGenerate = async () => {
    setBracketMsg(null)
    const res = await generateBracket(tournament.id)
    setBracketMsg(res.ok ? 'Bracket generated.' : res.message ?? '')
    if (res.ok) setTab('bracket')
  }

  return (
    <div>
      {editHint ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <p>
            You opened this page from the organizer <span className="font-semibold">edit</span>{' '}
            shortcut. Use the actions below—full inline editing can map to{' '}
            <code className="rounded bg-slate-950/60 px-1 py-0.5 font-mono text-xs">PATCH /tournaments/:id</code>{' '}
            later.
          </p>
        </div>
      ) : null}

      <PageHeader
        title={tournament.name}
        subtitle={`${tournament.gameTitle} · ${tournament.format}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <TournamentStatusBadge status={tournament.status} />
            <Link
              to="/tournaments"
              className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Back to list
            </Link>
            <RoleGuard allow="TO">
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete “${tournament.name}”? This cannot be undone in the mock UI.`,
                    )
                  ) {
                    deleteTournament(tournament.id)
                    navigate('/tournaments')
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </RoleGuard>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-800 pb-1">
        {(
          [
            ['overview', 'Overview'],
            ['participants', 'Participants'],
            ['bracket', 'Bracket / Matches'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
              tab === key
                ? 'bg-slate-900 text-white ring-1 ring-b-0 ring-slate-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 rounded-2xl border border-slate-800/90 bg-slate-900/40 p-6">
            <h2 className="text-sm font-semibold text-white">General details</h2>
            <p className="text-sm leading-relaxed text-slate-300">{tournament.description}</p>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-950/50 p-4 ring-1 ring-slate-800">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Created</dt>
                <dd className="mt-1 text-sm font-medium text-white">
                  {formatDate(tournament.createdAt)}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-950/50 p-4 ring-1 ring-slate-800">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Capacity</dt>
                <dd className="mt-1 text-sm font-medium text-white">
                  {participantCountFor(tournament.id)} / {tournament.maxParticipants} registered
                </dd>
              </div>
            </dl>
          </div>
          <aside className="space-y-3 rounded-2xl border border-slate-800/90 bg-slate-900/40 p-6">
            <h2 className="text-sm font-semibold text-white">Organizer actions</h2>
            <RoleGuard
              allow="TO"
              fallback={
                <p className="text-sm text-slate-500">
                  Signed in as a viewer—enjoy the broadcast-style layout without management controls.
                </p>
              }
            >
              <div className="flex flex-col gap-2">
                <Link
                  to={`/tournaments/new`}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
                >
                  Create another event
                </Link>
                <button
                  type="button"
                  onClick={() => setTab('participants')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <UserPlus className="h-4 w-4" />
                  Add participant
                </button>
                <button
                  type="button"
                  onClick={onGenerate}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-100 hover:bg-indigo-500/15"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate bracket
                </button>
                <Link
                  to="/matches"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
                >
                  <Swords className="h-4 w-4" />
                  Open matches workspace
                </Link>
              </div>
              {bracketMsg ? (
                <p className="text-xs text-indigo-200/90">{bracketMsg}</p>
              ) : null}
            </RoleGuard>
          </aside>
        </div>
      ) : null}

      {tab === 'participants' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Participants</h2>
            <RoleGuard allow="TO">
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <UserPlus className="h-4 w-4" />
                Add participant
              </button>
            </RoleGuard>
          </div>
          <ParticipantTable
            participants={participants}
            onRemove={removeParticipant}
            emptyHint="No participants yet. Organizers can seed the roster before generating a bracket."
          />
          <RoleGuard allow="TO">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-400">
              <Shuffle className="h-4 w-4 text-indigo-300" />
              Bracket generation pairs players by ascending seed in this first draft.
            </div>
          </RoleGuard>
        </div>
      ) : null}

      {tab === 'bracket' ? (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Bracket preview</h2>
              <p className="text-sm text-slate-500">
                Winners, losers, and grand final lanes mirror what players expect on broadcast.
              </p>
            </div>
            <RoleGuard allow="TO">
              <button
                type="button"
                onClick={onGenerate}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Regenerate bracket
              </button>
            </RoleGuard>
          </div>

          {matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-6 py-12 text-center text-sm text-slate-400">
              No matches yet. Add participants, then generate a bracket to populate this view.
            </div>
          ) : (
            <div className="space-y-10">
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-200/90">
                  Winners bracket
                </h3>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {grouped.winners.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      canEdit={isOrganizer}
                      onOpen={canSubmitScore(m) ? (mm) => setActiveMatch(mm) : undefined}
                    />
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-200/90">
                  Losers bracket
                </h3>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {grouped.losers.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      canEdit={isOrganizer}
                      onOpen={canSubmitScore(m) ? (mm) => setActiveMatch(mm) : undefined}
                    />
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-fuchsia-200/90">
                  Grand final
                </h3>
                <div className="mx-auto grid max-w-xl gap-3">
                  {grouped.gf.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      canEdit={isOrganizer}
                      onOpen={canSubmitScore(m) ? (mm) => setActiveMatch(mm) : undefined}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      ) : null}

      <AddParticipantModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        tournamentId={tournament.id}
        nextSeed={nextSeed}
        onCreate={addParticipant}
      />

      {isOrganizer ? (
        <ScoreSubmissionModal
          match={activeMatch}
          open={Boolean(activeMatch)}
          onClose={() => setActiveMatch(null)}
          onSubmit={updateMatchScore}
        />
      ) : null}
    </div>
  )
}

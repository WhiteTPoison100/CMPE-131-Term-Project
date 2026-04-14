import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, Plus } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { TournamentTable } from '../components/tournaments/TournamentTable'
import { TournamentCard } from '../components/tournaments/TournamentCard'
import { SelectInput } from '../components/forms/SelectInput'
import { TextInput } from '../components/forms/TextInput'
import { RoleGuard } from '../components/guards/RoleGuard'
import type { TournamentStatus } from '../types'

type ViewMode = 'table' | 'cards'

export function TournamentListPage() {
  const { tournaments, participantCountFor, deleteTournament } = useAppData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'ALL' | TournamentStatus>('ALL')
  const [game, setGame] = useState('ALL')
  const [view, setView] = useState<ViewMode>('table')

  const gameOptions = useMemo(() => {
    const titles = Array.from(new Set(tournaments.map((t) => t.gameTitle))).sort()
    return [{ value: 'ALL', label: 'All games' }, ...titles.map((g) => ({ value: g, label: g }))]
  }, [tournaments])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tournaments.filter((t) => {
      const okStatus = status === 'ALL' || t.status === status
      const okGame = game === 'ALL' || t.gameTitle === game
      const okQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.gameTitle.toLowerCase().includes(q) ||
        t.format.toLowerCase().includes(q)
      return okStatus && okGame && okQuery
    })
  }, [tournaments, query, status, game])

  const rows = useMemo(
    () =>
      filtered.map((t) => ({
        tournament: t,
        participantCount: participantCountFor(t.id),
      })),
    [filtered, participantCountFor],
  )

  return (
    <div>
      <PageHeader
        title="Tournaments"
        subtitle="Search, filter, and drill into each event. Organizers get extra row actions."
        actions={
          <RoleGuard allow="TO">
            <Link
              to="/tournaments/new"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Create tournament
            </Link>
          </RoleGuard>
        }
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <TextInput
              label="Search"
              name="q"
              placeholder="Name, game, format…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <SelectInput
            label="Status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            options={[
              { value: 'ALL', label: 'All statuses' },
              { value: 'UPCOMING', label: 'Upcoming' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
          <SelectInput
            label="Game title"
            name="game"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            options={gameOptions}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('table')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-inset transition ${
              view === 'table'
                ? 'bg-indigo-500/15 text-white ring-indigo-500/30'
                : 'bg-slate-900 text-slate-400 ring-slate-800 hover:text-white'
            }`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setView('cards')}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-inset transition ${
              view === 'cards'
                ? 'bg-indigo-500/15 text-white ring-indigo-500/30'
                : 'bg-slate-900 text-slate-400 ring-slate-800 hover:text-white'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Cards
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <TournamentTable rows={rows} onDelete={deleteTournament} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ tournament, participantCount }) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              participantCount={participantCount}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          No tournaments match your filters—try clearing search or switching status.
        </p>
      ) : null}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, Plus, Table2, Trophy } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { TournamentTable } from '../components/tournaments/TournamentTable'
import { TournamentCard } from '../components/tournaments/TournamentCard'
import { RoleGuard } from '../components/guards/RoleGuard'
import type { TournamentStatus } from '../types'

type ViewMode = 'table' | 'cards'

const uppercase = { letterSpacing: '0.08em' } as const
const tight = { letterSpacing: '-0.02em' } as const

function FilterInput({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase text-slate-500" style={uppercase}>{label}</label>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/5 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 transition focus:border-indigo-500/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  )
}

function FilterSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase text-slate-500" style={uppercase}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-white/5 bg-white/[0.04] px-3.5 py-2.5 pr-9 text-sm text-slate-200 outline-none transition focus:border-indigo-500/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20"
        >
          {options.map(o => <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>)}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  )
}

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
      const okQuery = !q || t.name.toLowerCase().includes(q) || t.gameTitle.toLowerCase().includes(q) || t.format.toLowerCase().includes(q)
      return okStatus && okGame && okQuery
    })
  }, [tournaments, query, status, game])

  const rows = useMemo(
    () => filtered.map((t) => ({ tournament: t, participantCount: participantCountFor(t.id) })),
    [filtered, participantCountFor],
  )

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-[100px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-indigo-400" />
              <h1 className="text-3xl font-bold text-white" style={tight}>Tournaments</h1>
            </div>
            <p className="text-sm text-slate-400">
              Search, filter, and drill into each event. Organizers get extra row actions.
            </p>
          </div>
          <RoleGuard allow="TO">
            <Link
              to="/tournaments/new"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(99,102,241,0.6),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_16px_40px_-12px_rgba(99,102,241,0.7)] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Create tournament
            </Link>
          </RoleGuard>
        </div>

        {/* Filter row */}
        <div
          className="mb-5 flex flex-col gap-4 rounded-2xl border border-white/5 p-4 backdrop-blur-xl sm:flex-row sm:items-end"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
        >
          <div className="flex-1">
            <FilterInput label="Search" value={query} onChange={setQuery} placeholder="Name, game, format…" />
          </div>
          <div className="w-full sm:w-44">
            <FilterSelect
              label="Status"
              value={status}
              onChange={v => setStatus(v as typeof status)}
              options={[
                { value: 'ALL', label: 'All statuses' },
                { value: 'UPCOMING', label: 'Upcoming' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
            />
          </div>
          <div className="w-full sm:w-44">
            <FilterSelect label="Game title" value={game} onChange={setGame} options={gameOptions} />
          </div>

          {/* View toggle */}
          <div className="flex shrink-0 gap-1 self-end rounded-xl border border-white/5 bg-slate-950/60 p-1">
            <button
              type="button"
              onClick={() => setView('table')}
              title="Table view"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                view === 'table'
                  ? 'bg-indigo-500/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-indigo-400/30'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              Table
            </button>
            <button
              type="button"
              onClick={() => setView('cards')}
              title="Cards view"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                view === 'cards'
                  ? 'bg-indigo-500/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-indigo-400/30'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
          </div>
        </div>

        {/* Content */}
        {view === 'table' ? (
          <TournamentTable rows={rows} onDelete={deleteTournament} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map(({ tournament, participantCount }) => (
              <TournamentCard key={tournament.id} tournament={tournament} participantCount={participantCount} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03]">
              <Trophy className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">No tournaments found</p>
              <p className="mt-1 text-xs text-slate-500">Try clearing your search or adjusting the filters.</p>
            </div>
            <button
              type="button"
              onClick={() => { setQuery(''); setStatus('ALL'); setGame('ALL') }}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-500/[0.06]"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

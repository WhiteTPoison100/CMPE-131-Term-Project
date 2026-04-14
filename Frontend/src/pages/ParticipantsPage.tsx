import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Users } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import { SelectInput } from '../components/forms/SelectInput'
import { EmptyState } from '../components/common/EmptyState'
import { RoleGuard } from '../components/guards/RoleGuard'
import { AddParticipantModal } from '../components/participants/AddParticipantModal'

export function ParticipantsPage() {
  const { tournaments, participants, getTournament, addParticipant, removeParticipant } =
    useAppData()
  const { user } = useAuth()
  const isOrganizer = user?.role === 'TO'

  const [filterTournament, setFilterTournament] = useState<string>('ALL')
  const [addFor, setAddFor] = useState<string | null>(null)

  const options = useMemo(
    () => [
      { value: 'ALL', label: 'All tournaments' },
      ...tournaments.map((t) => ({ value: t.id, label: t.name })),
    ],
    [tournaments],
  )

  const rows = useMemo(() => {
    const list =
      filterTournament === 'ALL'
        ? participants
        : participants.filter((p) => p.tournamentId === filterTournament)
    return [...list].sort((a, b) => a.seed - b.seed)
  }, [participants, filterTournament])

  const addTarget = addFor ? getTournament(addFor) : undefined
  const nextSeedForAdd =
    addFor != null
      ? (() => {
          const seeds = participants
            .filter((p) => p.tournamentId === addFor)
            .map((p) => p.seed)
          return seeds.length ? Math.max(...seeds) + 1 : 1
        })()
      : 1

  return (
    <div>
      <PageHeader
        title="Participants"
        subtitle="Cross-tournament roster view—ideal for verifying imports before API wiring."
        actions={
          <RoleGuard allow="TO">
            <button
              type="button"
              disabled={filterTournament === 'ALL'}
              onClick={() => {
                if (filterTournament !== 'ALL') setAddFor(filterTournament)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <UserPlus className="h-4 w-4" />
              Add to selected
            </button>
          </RoleGuard>
        }
      />

      <div className="mb-6 max-w-md">
        <SelectInput
          label="Filter by tournament"
          name="tournament"
          value={filterTournament}
          onChange={(e) => setFilterTournament(e.target.value)}
          options={options}
        />
        <RoleGuard allow="TO">
          <p className="mt-2 text-xs text-slate-500">
            Pick a specific tournament to enable quick adds from this page.
          </p>
        </RoleGuard>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No participants in this slice"
          description={
            filterTournament === 'ALL'
              ? 'Seed players from each tournament detail page, then revisit this aggregate roster.'
              : 'This tournament has no roster entries yet. Add participants from the detail view or use Add to selected when a tournament is chosen.'
          }
          action={
            <Link
              to="/tournaments"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Browse tournaments
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-400">Tournament</th>
                  <th className="px-4 py-3 font-semibold text-slate-400">Seed</th>
                  <th className="px-4 py-3 font-semibold text-slate-400">Gamer tag</th>
                  <th className="px-4 py-3 font-semibold text-slate-400">Email</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rows.map((p) => {
                  const t = getTournament(p.tournamentId)
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        {t ? (
                          <Link
                            to={`/tournaments/${t.id}`}
                            className="font-medium text-indigo-200 hover:text-white"
                          >
                            {t.name}
                          </Link>
                        ) : (
                          <span className="text-slate-500">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-300">{p.seed}</td>
                      <td className="px-4 py-3 font-medium text-white">{p.gamerTag}</td>
                      <td className="px-4 py-3 text-slate-400">{p.email}</td>
                      <td className="px-4 py-3 text-right">
                        {isOrganizer ? (
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-300 hover:text-red-200"
                            onClick={() => removeParticipant(p.id)}
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">View only</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {addTarget ? (
        <AddParticipantModal
          open={Boolean(addFor)}
          onClose={() => setAddFor(null)}
          tournamentId={addTarget.id}
          nextSeed={nextSeedForAdd}
          onCreate={addParticipant}
        />
      ) : null}
    </div>
  )
}

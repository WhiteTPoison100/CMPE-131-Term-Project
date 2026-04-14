import { Link } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { Tournament } from '../../types'
import { TournamentStatusBadge } from '../common/StatusBadge'
import { formatDateShort } from '../../utils/formatDate'
import { RoleGuard } from '../guards/RoleGuard'

interface TournamentTableProps {
  rows: { tournament: Tournament; participantCount: number }[]
  onDelete?: (id: string) => void
}

export function TournamentTable({ rows, onDelete }: TournamentTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/40 shadow-inner shadow-slate-950/40">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-950/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-400">Tournament</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Game</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Format</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Players</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Created</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {rows.map(({ tournament, participantCount }) => (
              <tr key={tournament.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium text-white">{tournament.name}</td>
                <td className="px-4 py-3 text-slate-300">{tournament.gameTitle}</td>
                <td className="px-4 py-3 text-slate-300">{tournament.format}</td>
                <td className="px-4 py-3">
                  <TournamentStatusBadge status={tournament.status} />
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-300">
                  {participantCount}
                  <span className="text-slate-600">/{tournament.maxParticipants}</span>
                </td>
                <td className="px-4 py-3 text-slate-400">{formatDateShort(tournament.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/tournaments/${tournament.id}`}
                      className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <RoleGuard allow="TO">
                      <Link
                        to={`/tournaments/${tournament.id}?edit=1`}
                        className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-indigo-200"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {onDelete ? (
                        <button
                          type="button"
                          title="Delete"
                          className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-red-950/40 hover:text-red-300"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete “${tournament.name}”? This removes related mock data in the UI.`,
                              )
                            ) {
                              onDelete(tournament.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </RoleGuard>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

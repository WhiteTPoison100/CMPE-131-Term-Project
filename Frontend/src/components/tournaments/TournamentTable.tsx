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

const uppercase = { letterSpacing: '0.1em' } as const

export function TournamentTable({ rows, onDelete }: TournamentTableProps) {
  return (
    <div
      className="overflow-hidden rounded-3xl border border-white/5 backdrop-blur-xl"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)' }}>
            <tr>
              {['Tournament', 'Game', 'Format', 'Status', 'Players', 'Created', 'Actions'].map((h) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 text-[10px] font-semibold uppercase text-slate-500 ${h === 'Actions' ? 'text-right' : ''}`}
                  style={uppercase}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map(({ tournament, participantCount }) => (
              <tr
                key={tournament.id}
                className="group transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.03] hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)]"
              >
                <td className="px-5 py-4">
                  <Link
                    to={`/tournaments/${tournament.id}`}
                    className="font-semibold text-white transition hover:text-indigo-300"
                  >
                    {tournament.name}
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-400">{tournament.gameTitle}</td>
                <td className="px-5 py-4 text-slate-400">{tournament.format}</td>
                <td className="px-5 py-4">
                  <TournamentStatusBadge status={tournament.status} />
                </td>
                <td className="px-5 py-4 tabular-nums">
                  <span className="font-semibold text-white">{participantCount}</span>
                  <span className="text-slate-600">/{tournament.maxParticipants}</span>
                </td>
                <td className="px-5 py-4 text-slate-400">{formatDateShort(tournament.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/tournaments/${tournament.id}`}
                      title="View"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <RoleGuard allow="TO">
                      <Link
                        to={`/tournaments/${tournament.id}?edit=1`}
                        title="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-500/10 hover:text-indigo-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {onDelete ? (
                        <button
                          type="button"
                          title="Delete"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                          onClick={() => {
                            if (window.confirm(`Delete "${tournament.name}"? This removes related mock data in the UI.`)) {
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

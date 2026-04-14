import { Trash2 } from 'lucide-react'
import type { Participant } from '../../types'
import { RoleGuard } from '../guards/RoleGuard'

interface ParticipantTableProps {
  participants: Participant[]
  onRemove?: (id: string) => void
  emptyHint?: string
}

export function ParticipantTable({
  participants,
  onRemove,
  emptyHint = 'No participants yet.',
}: ParticipantTableProps) {
  if (participants.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30 px-4 py-8 text-center text-sm text-slate-500">
        {emptyHint}
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/40">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-950/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-400">Seed</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Gamer tag / Team</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Email</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {participants.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 tabular-nums text-slate-300">{p.seed}</td>
                <td className="px-4 py-3 font-medium text-white">{p.gamerTag}</td>
                <td className="px-4 py-3 text-slate-400">{p.email}</td>
                <td className="px-4 py-3 text-right">
                  <RoleGuard allow="TO">
                    {onRemove ? (
                      <button
                        type="button"
                        className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-red-950/40 hover:text-red-300"
                        title="Remove"
                        onClick={() => onRemove(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </RoleGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

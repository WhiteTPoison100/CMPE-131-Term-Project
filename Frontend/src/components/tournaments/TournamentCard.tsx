import { Link } from 'react-router-dom'
import { ChevronRight, Gamepad2, Users } from 'lucide-react'
import type { Tournament } from '../../types'
import { TournamentStatusBadge } from '../common/StatusBadge'
import { formatDateShort } from '../../utils/formatDate'

interface TournamentCardProps {
  tournament: Tournament
  participantCount: number
}

export function TournamentCard({ tournament, participantCount }: TournamentCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/90 to-slate-950 p-5 shadow-sm transition hover:border-indigo-500/35 hover:shadow-lg hover:shadow-indigo-950/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <TournamentStatusBadge status={tournament.status} />
          <h3 className="mt-3 text-lg font-semibold text-white">{tournament.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
            <Gamepad2 className="h-4 w-4 text-indigo-300" aria-hidden />
            {tournament.gameTitle}
          </p>
        </div>
        <Link
          to={`/tournaments/${tournament.id}`}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-300 opacity-0 transition group-hover:opacity-100 hover:bg-indigo-500/10"
        >
          View
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-950/50 px-3 py-2 ring-1 ring-slate-800/80">
          <dt className="text-xs text-slate-500">Format</dt>
          <dd className="font-medium text-slate-200">{tournament.format}</dd>
        </div>
        <div className="rounded-xl bg-slate-950/50 px-3 py-2 ring-1 ring-slate-800/80">
          <dt className="text-xs text-slate-500">Participants</dt>
          <dd className="flex items-center gap-1 font-medium text-slate-200">
            <Users className="h-4 w-4 text-slate-500" />
            {participantCount}/{tournament.maxParticipants}
          </dd>
        </div>
        <div className="col-span-2 rounded-xl bg-slate-950/50 px-3 py-2 ring-1 ring-slate-800/80">
          <dt className="text-xs text-slate-500">Created</dt>
          <dd className="font-medium text-slate-200">{formatDateShort(tournament.createdAt)}</dd>
        </div>
      </dl>
    </div>
  )
}

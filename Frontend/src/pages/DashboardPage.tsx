import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  CheckCircle2,
  Clock3,
  Plus,
  Swords,
  Trophy,
  Users,
} from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import { StatCard } from '../components/common/StatCard'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { RoleGuard } from '../components/guards/RoleGuard'
import { MatchStatusBadge, TournamentStatusBadge } from '../components/common/StatusBadge'
import { formatDate } from '../utils/formatDate'

export function DashboardPage() {
  const { user } = useAuth()
  const { tournaments, participants, matches } = useAppData()
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 420)
    return () => window.clearTimeout(t)
  }, [])

  const stats = useMemo(() => {
    const totalTournaments = tournaments.length
    const activeTournaments = tournaments.filter((t) => t.status === 'ACTIVE').length
    const completedTournaments = tournaments.filter((t) => t.status === 'COMPLETED').length
    const totalParticipants = participants.length
    const pendingMatches = matches.filter((m) => m.status === 'PENDING' || m.status === 'READY')
      .length
    return {
      totalTournaments,
      activeTournaments,
      completedTournaments,
      totalParticipants,
      pendingMatches,
    }
  }, [tournaments, participants, matches])

  const recentTournaments = useMemo(
    () => [...tournaments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
    [tournaments],
  )

  const recentMatches = useMemo(
    () =>
      [...matches]
        .filter((m) => m.status !== 'PENDING' || m.round <= 2)
        .slice(0, 5),
    [matches],
  )

  if (booting) {
    return <LoadingSpinner label="Preparing your dashboard…" />
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
        subtitle="High-level health of your program—swap mock data for live API responses when ready."
        actions={
          <RoleGuard allow="TO">
            <Link
              to="/tournaments/new"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              New tournament
            </Link>
          </RoleGuard>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total tournaments"
          value={stats.totalTournaments}
          icon={Trophy}
          accent="indigo"
        />
        <StatCard
          label="Active"
          value={stats.activeTournaments}
          hint="Live or in-progress events"
          icon={Activity}
          accent="emerald"
        />
        <StatCard
          label="Completed"
          value={stats.completedTournaments}
          icon={CheckCircle2}
          accent="violet"
        />
        <StatCard
          label="Participants"
          value={stats.totalParticipants}
          icon={Users}
          accent="sky"
        />
        <StatCard
          label="Pending matches"
          value={stats.pendingMatches}
          hint="Ready or waiting to start"
          icon={Clock3}
          accent="amber"
        />
      </div>

      <RoleGuard allow="TO">
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            to="/tournaments"
            className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-indigo-500/40 hover:bg-slate-900"
          >
            Browse tournaments
          </Link>
          <Link
            to="/participants"
            className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-indigo-500/40 hover:bg-slate-900"
          >
            Participant roster
          </Link>
          <Link
            to="/matches"
            className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-indigo-500/40 hover:bg-slate-900"
          >
            Brackets & matches
          </Link>
        </div>
      </RoleGuard>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800/90 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent tournaments</h2>
            <Link to="/tournaments" className="text-xs font-semibold text-indigo-300 hover:text-indigo-200">
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800/80">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="px-3 py-2 font-medium text-slate-400">Name</th>
                  <th className="px-3 py-2 font-medium text-slate-400">Game</th>
                  <th className="px-3 py-2 font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentTournaments.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="px-3 py-2">
                      <Link
                        to={`/tournaments/${t.id}`}
                        className="font-medium text-white hover:text-indigo-200"
                      >
                        {t.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-slate-400">{t.gameTitle}</td>
                    <td className="px-3 py-2">
                      <TournamentStatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/90 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent matches</h2>
            <Link to="/matches" className="text-xs font-semibold text-indigo-300 hover:text-indigo-200">
              Open brackets
            </Link>
          </div>
          <ul className="space-y-3">
            {recentMatches.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/80 text-indigo-200">
                    <Swords className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {m.player1} <span className="text-slate-500">vs</span> {m.player2}
                    </p>
                    <p className="text-xs text-slate-500">
                      {m.bracketType.replace('_', ' ')} · Round {m.round}
                    </p>
                  </div>
                </div>
                <MatchStatusBadge status={m.status} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Timestamps appear when matches sync from the API.</p>
        </section>
      </div>

      <p className="mt-8 text-xs text-slate-600">
        Snapshot generated {formatDate(new Date().toISOString())}
      </p>
    </div>
  )
}

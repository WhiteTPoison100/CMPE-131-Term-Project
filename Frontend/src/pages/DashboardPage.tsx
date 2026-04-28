import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  GitBranch,
  Plus,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
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
    const pendingMatches = matches.filter((m) => m.status === 'PENDING' || m.status === 'READY').length
    return { totalTournaments, activeTournaments, completedTournaments, totalParticipants, pendingMatches }
  }, [tournaments, participants, matches])

  const participantsByTournament = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of participants) map.set(p.tournamentId, (map.get(p.tournamentId) ?? 0) + 1)
    return map
  }, [participants])

  const recentTournaments = useMemo(
    () => [...tournaments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [tournaments],
  )

  const liveMatches = useMemo(
    () => matches.filter((m) => m.status === 'READY' || m.status === 'PENDING').slice(0, 3),
    [matches],
  )
  const hasLiveMatch = liveMatches.some((m) => m.status === 'READY')

  if (booting) {
    return <LoadingSpinner label="Preparing your dashboard…" />
  }

  const uppercase = { letterSpacing: '0.1em' } as const
  const tightHeading = { letterSpacing: '-0.03em' } as const

  return (
    <div className="relative">
      {/* Blink keyframes for LIVE indicator */}
      <style>{`
        @keyframes liveBlink { 0%, 60%, 100% { opacity: 1; } 30% { opacity: 0.35; } }
        .live-dot { animation: liveBlink 1.2s ease-in-out infinite; }
      `}</style>

      {/* Ambient radial glows */}
      <div
        className="pointer-events-none absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full blur-[120px] opacity-60"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, rgba(99,102,241,0) 70%)' }}
      />
      <div
        className="pointer-events-none absolute right-0 top-1/3 h-[480px] w-[480px] rounded-full blur-[120px] opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0) 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/4 h-[380px] w-[380px] rounded-full blur-[120px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0) 70%)' }}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/[0.08] px-3 py-1 text-[11px] font-semibold uppercase text-indigo-200 backdrop-blur-sm"
              style={uppercase}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live Console
            </div>
            <h1
              className="text-4xl font-bold text-white sm:text-5xl"
              style={tightHeading}
            >
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-violet-400 bg-clip-text text-transparent">
                {user?.name ?? 'there'}
              </span>
            </h1>
            <div className="mt-2 h-0.5 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500/0" />
          </div>
        </div>

        {/* Stats grid — icon top-left, trend top-right, label & value below */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total tournaments" value={stats.totalTournaments} icon={Trophy} accent="indigo" trend="+12%" />
          <StatCard label="Active" value={stats.activeTournaments} hint="Live or in-progress" icon={Activity} accent="emerald" trend="+8%" />
          <StatCard label="Completed" value={stats.completedTournaments} icon={CheckCircle2} accent="violet" trend="0%" />
          <StatCard label="Participants" value={stats.totalParticipants} icon={Users} accent="sky" trend="+24%" />
          <StatCard label="Pending matches" value={stats.pendingMatches} hint="Ready or waiting" icon={Clock3} accent="amber" trend="-3%" />
        </div>

        {/* Quick actions — 4 tiles, TO only */}
        <RoleGuard allow="TO">
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { to: '/tournaments/new', label: 'Create Tournament', hint: 'Launch new event', icon: Plus, accent: 'indigo' },
              { to: '/participants', label: 'Add Participant', hint: 'Register new player', icon: UserPlus, accent: 'sky' },
              { to: '/matches', label: 'Generate Bracket', hint: 'Auto-seed matches', icon: GitBranch, accent: 'violet' },
              { to: '/matches', label: 'View Matches', hint: 'Real-time oversight', icon: Eye, accent: 'emerald' },
            ].map(({ to, label, hint, icon: Icon, accent }) => {
              const chips: Record<string, string> = {
                indigo: 'bg-indigo-500/15 ring-indigo-400/25 text-indigo-300 group-hover:bg-indigo-500/25',
                sky: 'bg-sky-500/15 ring-sky-400/25 text-sky-300 group-hover:bg-sky-500/25',
                violet: 'bg-violet-500/15 ring-violet-400/25 text-violet-300 group-hover:bg-violet-500/25',
                emerald: 'bg-emerald-500/15 ring-emerald-400/25 text-emerald-300 group-hover:bg-emerald-500/25',
              }
              return (
                <Link
                  key={label}
                  to={to}
                  className="group flex items-center gap-3 rounded-2xl border border-white/5 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/30"
                  style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition ${chips[accent]}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="truncate text-xs text-slate-500">{hint}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </RoleGuard>

        {/* Main grid: Recent Tournaments + Live Matches */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          {/* Recent Tournaments — full table */}
          <section
            className="overflow-hidden rounded-3xl border border-white/5 backdrop-blur-xl"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          >
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h2 className="text-base font-semibold text-white" style={tightHeading}>
                Recent Tournaments
              </h2>
              <Link
                to="/tournaments"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 transition hover:text-indigo-200"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)' }}>
                  <tr>
                    {['Tournament Name', 'Status', 'Participants', 'Max', 'Date'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-[10px] font-semibold uppercase text-slate-500"
                        style={uppercase}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentTournaments.map((t) => {
                    const count = participantsByTournament.get(t.id) ?? 0
                    return (
                      <tr key={t.id} className="transition hover:bg-slate-800/30">
                        <td className="px-5 py-4">
                          <Link
                            to={`/tournaments/${t.id}`}
                            className="font-semibold text-white transition hover:text-indigo-300"
                          >
                            {t.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-slate-500">{t.gameTitle}</p>
                        </td>
                        <td className="px-5 py-4">
                          <TournamentStatusBadge status={t.status} />
                        </td>
                        <td className="px-5 py-4 tabular-nums text-slate-300">
                          {count} / {t.maxParticipants}
                        </td>
                        <td className="px-5 py-4 tabular-nums text-slate-300">{t.maxParticipants}</td>
                        <td className="px-5 py-4 text-slate-400">{formatDate(t.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Live Matches panel */}
          <section
            className="flex flex-col overflow-hidden rounded-3xl border border-white/5 backdrop-blur-xl"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          >
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h2 className="text-base font-semibold text-white" style={tightHeading}>
                Live Matches
              </h2>
              {hasLiveMatch ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-red-300"
                  style={uppercase}
                >
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(251,44,54,0.9)]" />
                  Live
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-slate-800/60 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500"
                  style={uppercase}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  Idle
                </span>
              )}
            </div>

            <div className="flex-1 space-y-3 p-4">
              {liveMatches.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-slate-500">No matches queued.</p>
              ) : (
                liveMatches.map((m) => {
                  const isLive = m.status === 'READY'
                  const p1Init = m.player1.charAt(0).toUpperCase()
                  const p2Init = m.player2.charAt(0).toUpperCase()
                  return (
                    <div
                      key={m.id}
                      className={`overflow-hidden rounded-2xl border p-4 transition-all duration-200 ${
                        isLive ? 'border-indigo-500/20 bg-indigo-500/[0.04]' : 'border-white/5 bg-slate-950/40'
                      }`}
                    >
                      {/* Bracket header */}
                      <div className="mb-3 flex items-center justify-between">
                        <p
                          className="text-[10px] font-bold uppercase text-slate-500"
                          style={uppercase}
                        >
                          {m.bracketType.replace('_', ' ')} · Round {m.round}
                        </p>
                        <MatchStatusBadge status={m.status} />
                      </div>
                      {/* 3-col: player | score | player */}
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        {/* Player 1 */}
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-base font-bold text-white ring-2 ring-indigo-500/30">
                            {p1Init}
                          </div>
                          <p className="max-w-full truncate text-center text-xs font-semibold text-white">{m.player1}</p>
                        </div>
                        {/* Score box */}
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="rounded-xl bg-slate-950/70 px-4 py-2 font-bold text-white"
                            style={{ fontFamily: 'ui-monospace, monospace', fontSize: '1.25rem', letterSpacing: '-0.02em' }}
                          >
                            {m.score1 ?? 0}
                            <span className="mx-1.5 text-slate-600">:</span>
                            {m.score2 ?? 0}
                          </div>
                          {isLive && (
                            <p className="text-[9px] font-semibold uppercase text-slate-500" style={uppercase}>
                              Live Map
                            </p>
                          )}
                        </div>
                        {/* Player 2 */}
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-800 text-base font-bold text-white ring-2 ring-violet-500/30">
                            {p2Init}
                          </div>
                          <p className="max-w-full truncate text-center text-xs font-semibold text-white">{m.player2}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              <Link
                to="/matches"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-xs font-semibold text-slate-300 transition hover:-translate-y-px hover:border-indigo-400/30 hover:bg-indigo-500/[0.06]"
              >
                View Full Bracket
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Platform Uptime bar */}
            <div className="border-t border-white/5 px-5 py-4">
              <p
                className="mb-3 text-[10px] font-semibold uppercase text-slate-500"
                style={uppercase}
              >
                Platform Uptime
              </p>
              <div className="flex items-end gap-1">
                {[70, 85, 60, 90, 75, 95, 88, 92, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-500"
                    style={{
                      height: `${h * 0.36}px`,
                      backgroundColor: h === 100 ? '#10b981' : `rgba(16,185,129,${0.3 + h * 0.005})`,
                      boxShadow: h === 100 ? '0 0 8px rgba(16,185,129,0.6)' : 'none',
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] text-slate-500">99.98% Service Health</p>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-400"
                  style={uppercase}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  Live
                </span>
              </div>
            </div>
          </section>
        </div>

        <p
          className="mt-10 text-center text-[10px] font-semibold uppercase text-slate-600"
          style={uppercase}
        >
          Snapshot generated {formatDate(new Date().toISOString())}
        </p>
      </div>
    </div>
  )
}

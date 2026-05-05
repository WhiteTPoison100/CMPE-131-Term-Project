import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { AddParticipantModal } from '../components/participants/AddParticipantModal'
import type { TournamentStatus } from '../types'

// ── Constants ─────────────────────────────────────────────────────────────────

const PER_PAGE = 8

type StatusFilter = 'all' | 'active' | 'waitlisted' | 'inactive'

// ── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: 'rgba(99,102,241,0.18)',  ring: 'rgba(99,102,241,0.4)',  text: '#a5b4fc' },
  { bg: 'rgba(139,92,246,0.18)', ring: 'rgba(139,92,246,0.4)', text: '#c4b5fd' },
  { bg: 'rgba(34,197,94,0.18)',  ring: 'rgba(34,197,94,0.4)',  text: '#86efac' },
  { bg: 'rgba(245,158,11,0.18)', ring: 'rgba(245,158,11,0.4)', text: '#fcd34d' },
  { bg: 'rgba(236,72,153,0.18)', ring: 'rgba(236,72,153,0.4)', text: '#f9a8d4' },
]

function avatarColor(tag: string) {
  return AVATAR_PALETTE[tag.charCodeAt(0) % AVATAR_PALETTE.length]
}

function deriveStatus(status?: TournamentStatus): StatusFilter {
  if (status === 'ACTIVE')    return 'active'
  if (status === 'UPCOMING')  return 'waitlisted'
  return 'inactive'
}

const STATUS_CFG: Record<string, { label: string; dot: string; text: string; bg: string; border: string; pulse: boolean }> = {
  active:    { label: 'Active',     dot: '#22c55e', text: '#4ade80', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  pulse: true  },
  waitlisted:{ label: 'Waitlisted', dot: '#818cf8', text: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', pulse: false },
  inactive:  { label: 'Inactive',   dot: '#64748b', text: '#94a3b8', bg: 'rgba(100,116,139,0.08)',border: 'rgba(100,116,139,0.2)', pulse: false },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StatusFilter }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.inactive
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
      style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${cfg.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
}) {
  return (
    <div
      className="relative flex items-center gap-4 overflow-hidden rounded-2xl p-5"
      style={{
        background: 'rgba(15,23,42,0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: 'inset 0 1px 0 rgba(99,102,241,0.08)',
      }}
    >
      {/* Hover glow bubble */}
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-30 blur-2xl transition-transform duration-500 group-hover:scale-150"
        style={{ background: color }}
      />
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}22` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ParticipantsPage() {
  const { tournaments, participants, getTournament, addParticipant, removeParticipant, loading } = useAppData()
  const { user } = useAuth()
  const canDelete = user?.role === 'TO' || user?.role === 'VIEWER'

  const [filterTournament, setFilterTournament] = useState('ALL')
  const [filterStatus, setFilterStatus]         = useState<StatusFilter>('all')
  const [selected, setSelected]                 = useState<Set<string>>(new Set())
  const [page, setPage]                         = useState(1)
  const [addFor, setAddFor]                     = useState<string | null>(null)

  // ── Derived data ───────────────────────────────────────────────────────────

  const tournamentOptions = useMemo(() => [
    { value: 'ALL', label: 'All Tournaments' },
    ...tournaments.map(t => ({ value: t.id, label: t.name })),
  ], [tournaments])

  const filteredRows = useMemo(() => {
    let list = filterTournament === 'ALL'
      ? participants
      : participants.filter(p => p.tournamentId === filterTournament)

    if (filterStatus !== 'all') {
      list = list.filter(p => {
        const t = getTournament(p.tournamentId)
        return deriveStatus(t?.status) === filterStatus
      })
    }

    return [...list].sort((a, b) => a.seed - b.seed)
  }, [participants, filterTournament, filterStatus, getTournament])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filteredRows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  // Stats
  const activeTournamentsCount = tournaments.filter(t => t.status === 'ACTIVE').length
  const uniqueTournamentIds    = new Set(participants.map(p => p.tournamentId)).size

  // Selection helpers
  const allPageSelected = pageRows.length > 0 && pageRows.every(p => selected.has(p.id))
  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev)
      if (allPageSelected) pageRows.forEach(p => next.delete(p.id))
      else                  pageRows.forEach(p => next.add(p.id))
      return next
    })
  }
  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Export CSV
  const handleExport = () => {
    const rows = filteredRows
    const csv  = [
      ['Gamer Tag', 'Email', 'Seed', 'Tournament'],
      ...rows.map(p => {
        const t = getTournament(p.tournamentId)
        return [p.gamerTag, p.email, String(p.seed), t?.name ?? '']
      }),
    ].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'participants.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Add participant
  const addTarget    = addFor ? getTournament(addFor) : undefined
  const nextSeedForAdd = addFor
    ? (() => {
        const seeds = participants.filter(p => p.tournamentId === addFor).map(p => p.seed)
        return seeds.length ? Math.max(...seeds) + 1 : 1
      })()
    : 1

  const handleAddClick = () => {
    const target = filterTournament !== 'ALL' ? filterTournament : tournaments[0]?.id
    if (target) setAddFor(target)
  }

  // Page change helper
  const goPage = (n: number) => setPage(Math.max(1, Math.min(n, totalPages)))

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative space-y-6 pb-10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full blur-[120px] opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full blur-[100px] opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
            Participants
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-slate-400">
            Manage and monitor cross-tournament rosters. View performance history, seed
            distribution, and participant status across all active league segments.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={handleAddClick}
              disabled={tournaments.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              <UserPlus className="h-4 w-4" />
              Add to selected
            </button>
          )}
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-4 rounded-2xl p-4"
        style={{
          background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: 'inset 0 1px 0 rgba(99,102,241,0.08)',
        }}
      >
        {/* Tournament filter */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Tournament
          </span>
          <div className="relative">
            <select
              value={filterTournament}
              onChange={e => { setFilterTournament(e.target.value); setPage(1) }}
              className="appearance-none rounded-lg border border-white/10 bg-slate-950/50 py-2 pl-3 pr-7 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {tournamentOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-slate-500" />
          </div>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Status
          </span>
          <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.04] p-1">
            {(['all', 'active', 'waitlisted'] as StatusFilter[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { setFilterStatus(s); setPage(1) }}
                className={`rounded-md px-3 py-1 text-xs font-bold capitalize transition ${
                  filterStatus === s
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="ml-auto text-sm text-slate-500">
          Showing{' '}
          <span className="font-bold text-indigo-400">{filteredRows.length.toLocaleString()}</span>{' '}
          participants
        </p>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: 'inset 0 1px 0 rgba(99,102,241,0.08), inset 0 0 20px rgba(99,102,241,0.03)',
        }}
      >
        {loading ? (
          <div className="space-y-0">
            {/* Skeleton header */}
            <div
              className="grid px-5 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-700"
              style={{ gridTemplateColumns: '3rem 22% 18% 8% 1fr 14% 12%', background: 'rgba(10,16,32,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span /> <span>Gamer Tag</span> <span>Tournament</span> <span>Seed</span> <span>Email</span> <span>Status</span> <span />
            </div>
            {/* Skeleton rows */}
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div
                key={row}
                className="flex items-center gap-4 px-5 py-3.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="h-4 w-4 rounded bg-slate-800 animate-pulse shrink-0" />
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-800 animate-pulse shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded-full bg-slate-800 animate-pulse" />
                    <div className="h-2 w-16 rounded-full bg-slate-800/60 animate-pulse" />
                  </div>
                </div>
                <div className="h-3 w-24 rounded-full bg-slate-800/60 animate-pulse" />
                <div className="h-5 w-10 rounded bg-slate-800/50 animate-pulse" />
                <div className="h-3 w-36 rounded-full bg-slate-800/50 animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-slate-800/60 animate-pulse" />
                <div className="h-6 w-14 rounded-lg bg-slate-800/40 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-600">
            <Users className="h-10 w-10 opacity-30" />
            <p className="text-sm">No participants match the current filters</p>
          </div>
        ) : (
          <>
            {/* Scrollable table — sticky thead, overflow-y only */}
            <div
              className="overflow-x-hidden overflow-y-auto"
              style={{
                maxHeight: '352px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(99,102,241,0.35) transparent',
              }}
            >
              <table className="w-full table-fixed border-collapse text-left">
                <thead className="sticky top-0 z-10">
                  <tr
                    className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400"
                    style={{ background: 'rgba(10,16,32,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="w-[22%] px-5 py-3">Gamer Tag / Team</th>
                    <th className="w-[18%] px-4 py-3">Tournament</th>
                    <th className="w-[8%] px-4 py-3">Seed</th>
                    <th className="w-[24%] px-4 py-3">Email Address</th>
                    <th className="w-[14%] px-4 py-3">Status</th>
                    <th className="w-[12%] px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {pageRows.map((p, i) => {
                      const t      = getTournament(p.tournamentId)
                      const status = deriveStatus(t?.status)
                      const ac     = avatarColor(p.gamerTag)
                      const isSelected = selected.has(p.id)

                      return (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ delay: i * 0.03 }}
                          className="group/row cursor-pointer"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            backgroundColor: isSelected ? 'rgba(99,102,241,0.07)' : undefined,
                            transition: 'background-color 0.15s, transform 0.2s',
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget
                            el.style.backgroundColor = 'rgba(99,102,241,0.08)'
                            el.style.transform = 'translateX(3px)'
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget
                            el.style.backgroundColor = isSelected ? 'rgba(99,102,241,0.07)' : ''
                            el.style.transform = ''
                          }}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOne(p.id)}
                              className="h-4 w-4 rounded border-white/20 bg-transparent text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>

                          {/* Gamer tag */}
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                                style={{ background: ac.bg, boxShadow: `0 0 0 2px ${ac.ring}`, color: ac.text }}
                              >
                                {p.gamerTag.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-bold text-white transition-colors group-hover/row:text-indigo-300">
                                  {p.gamerTag}
                                </p>
                                <p className="truncate text-[10px] font-bold text-slate-500">
                                  {t?.gameTitle ?? '—'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Tournament */}
                          <td className="px-4 py-3">
                            {t ? (
                              <Link
                                to={`/tournaments/${t.id}`}
                                className="block truncate font-medium text-indigo-400 underline-offset-4 transition hover:text-indigo-300 hover:underline"
                              >
                                {t.name}
                              </Link>
                            ) : (
                              <span className="text-slate-600">Unknown</span>
                            )}
                          </td>

                          {/* Seed */}
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-white">
                              #{String(p.seed).padStart(2, '0')}
                            </span>
                          </td>

                          {/* Email */}
                          <td className="truncate px-4 py-3 text-sm text-slate-400">
                            {p.email}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <StatusBadge status={status} />
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
                              <button
                                type="button"
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => removeParticipant(p.id)}
                                  className="rounded-lg p-1.5 text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Page {safePage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/[0.05] disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const n = i + 1
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => goPage(n)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                        safePage === n
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                          : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      {n}
                    </button>
                  )
                })}
                {totalPages > 5 && <span className="text-xs text-slate-600">…</span>}
                <button
                  type="button"
                  onClick={() => goPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/[0.05] disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Bottom stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Rosters"
          value={`${uniqueTournamentIds} Tournaments`}
          color="#6366f1"
        />
        <StatCard
          icon={TrophyIcon}
          label="Active Events"
          value={`${activeTournamentsCount} Tournaments`}
          color="#22c55e"
        />
        <StatCard
          icon={BadgeCheckIcon}
          label="Verified Tags"
          value={`${participants.length.toLocaleString()} Players`}
          color="#a78bfa"
        />
      </div>

      {/* ── Add modal ───────────────────────────────────────────────── */}
      {addTarget && (
        <AddParticipantModal
          open={Boolean(addFor)}
          onClose={() => setAddFor(null)}
          tournamentId={addTarget.id}
          nextSeed={nextSeedForAdd}
          onCreate={addParticipant}
        />
      )}
    </div>
  )
}

// ── Inline icon shims (avoid extra imports) ───────────────────────────────────

function TrophyIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  )
}

function BadgeCheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3.85 8.62a4 4 0 014.78-4.77 4 4 0 016.74 0 4 4 0 014.78 4.78 4 4 0 010 6.74 4 4 0 01-4.77 4.78 4 4 0 01-6.75 0 4 4 0 01-4.78-4.77 4 4 0 010-6.76z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

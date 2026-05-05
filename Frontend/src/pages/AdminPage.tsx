import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Activity,
  ChevronDown,
  Eye,
  KeyRound,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../services/apiClient'

// ── Types ───────────────────────────────────────────────────────────────────

type UserRole = 'TO' | 'VIEWER'
type AuthMethod = 'Google' | 'Email' | 'Demo'
type AdminTab = 'users' | 'roles' | 'activity'

interface AdminUser {
  id: string
  username: string
  name: string
  email: string
  role: UserRole
  authMethod: AuthMethod
  joinedAt: string
}

// ── API helpers ──────────────────────────────────────────────────────────────


interface BackendUser {
  id: number
  username: string
  email: string
  displayName: string
  role: string
  authProvider: string
  firebaseProvider: string
}

function mapAuthMethod(provider: string, firebaseProvider: string): AuthMethod {
  if (provider === 'FIREBASE') {
    return firebaseProvider === 'GOOGLE' ? 'Google' : 'Email'
  }
  return 'Demo'
}

function mapBackendUser(u: BackendUser): AdminUser {
  return {
    id: String(u.id),
    username: u.username,
    name: u.displayName || u.username,
    email: u.email || '—',
    role: u.role as UserRole,
    authMethod: mapAuthMethod(u.authProvider, u.firebaseProvider),
    joinedAt: new Date().toISOString().slice(0, 10),
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const uppercase = { letterSpacing: '0.1em' } as const
const tight     = { letterSpacing: '-0.02em' } as const

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const colors = [
    'from-indigo-500 to-violet-600',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ]
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-xs font-bold text-white ring-2 ring-white/10`}>
      {initials(name)}
    </div>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  return role === 'TO' ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/25 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300">
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
      Organizer
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/25 bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
      <Eye className="h-3 w-3" />
      Viewer
    </span>
  )
}

function AuthBadge({ method }: { method: AuthMethod }) {
  if (method === 'Google') return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Google
    </span>
  )
  if (method === 'Email') return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
      <Mail className="h-3.5 w-3.5 text-sky-400" /> Email
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
      <KeyRound className="h-3.5 w-3.5 text-amber-400" /> Demo
    </span>
  )
}

function RoleDropdown({
  user,
  currentUsername,
  onChangeRole,
}: {
  user: AdminUser
  currentUsername: string
  onChangeRole: (id: string, role: UserRole) => void
}) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const isSelf = user.username === currentUsername

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen(v => !v)
  }

  if (isSelf) {
    return <span className="text-xs text-slate-600 italic">You</span>
  }

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-indigo-400/30 hover:bg-indigo-500/[0.08]"
      >
        Edit Role
        <ChevronDown className="h-3 w-3 text-slate-500" />
      </button>

      {open && createPortal(
        <>
          {/* backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          {/* menu */}
          <div
            className="fixed z-[9999] w-44 overflow-hidden rounded-xl border border-white/10 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
            style={{
              top: menuPos.top,
              right: menuPos.right,
              backgroundColor: 'rgba(10, 15, 30, 0.97)',
            }}
          >
            <div className="p-1">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase text-slate-500" style={uppercase}>
                Change role
              </p>
              {(['TO', 'VIEWER'] as UserRole[]).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { onChangeRole(user.id, role); setOpen(false) }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    user.role === role
                      ? 'bg-indigo-500/20 text-white'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {role === 'TO' ? (
                    <><ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Organizer</>
                  ) : (
                    <><Eye className="h-3.5 w-3.5 text-slate-400" /> Viewer</>
                  )}
                  {user.role === role && <span className="ml-auto text-indigo-400">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

function RolesTab() {
  return (
    <div className="space-y-4">
      {[
        {
          role: 'Organizer (TO)',
          color: 'indigo',
          icon: ShieldCheck,
          perms: [
            'Create, edit, delete tournaments',
            'Manage participants and brackets',
            'Submit and update match scores',
            'Access Admin Panel',
            'Promote / demote Viewers',
          ],
        },
        {
          role: 'Viewer',
          color: 'slate',
          icon: Eye,
          perms: [
            'View all tournaments (read-only)',
            'View participant rosters',
            'View match brackets and results',
          ],
        },
      ].map(({ role, color, icon: Icon, perms }) => (
        <div
          key={role}
          className="overflow-hidden rounded-2xl border border-white/5 backdrop-blur-xl"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
        >
          <div className={`flex items-center gap-2.5 border-b border-white/5 px-5 py-3.5`}>
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${color === 'indigo' ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/25' : 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/25'}`}>
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-white">{role}</h3>
          </div>
          <ul className="space-y-2 px-5 py-4">
            {perms.map(p => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-slate-300">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color === 'indigo' ? 'bg-indigo-400' : 'bg-slate-500'}`} />
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

// ── Activity log types ────────────────────────────────────────────────────────

interface ActivityEntry {
  id: number
  actorUsername: string
  action: string
  targetUsername: string
  detail: string
  createdAt: string
}

const ACTION_META: Record<string, { label: string; color: string }> = {
  ROLE_PROMOTED:       { label: 'promoted',                  color: 'text-emerald-400' },
  ROLE_DEMOTED:        { label: 'demoted',                   color: 'text-amber-400'   },
  TOURNAMENT_CREATED:  { label: 'created tournament',        color: 'text-indigo-400'  },
  TOURNAMENT_DELETED:  { label: 'deleted tournament',        color: 'text-red-400'     },
  BRACKET_GENERATED:   { label: 'generated bracket for',     color: 'text-violet-400'  },
  SCORE_SUBMITTED:     { label: 'submitted score',           color: 'text-sky-400'     },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Yesterday'
  return `${d}d ago`
}

function ActivityTab() {
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiClient.get<ActivityEntry[]>('/admin/activity')
      .then(res => { setEntries(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/5 backdrop-blur-xl"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
    >
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
        <Activity className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Audit log</h3>
        <span className="ml-auto text-xs text-slate-500">
          {loading ? 'Loading…' : `${entries.length} events`}
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          <span className="text-sm">Fetching logs…</span>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-600">
          No activity recorded yet.
        </div>
      )}

      {!loading && entries.length > 0 && (
        <ul className="divide-y divide-white/[0.04]">
          {entries.map(e => {
            const meta = ACTION_META[e.action] ?? { label: e.action.toLowerCase().replace('_', ' '), color: 'text-slate-400' }
            return (
              <li key={e.id} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-white/[0.02] transition">
                {/* Actor avatar */}
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-400/20">
                  {initials(e.actorUsername)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-slate-300">
                    <span className="font-semibold text-white">{e.actorUsername}</span>{' '}
                    <span className={meta.color}>{meta.label}</span>
                    {e.targetUsername && (
                      <>{' '}<span className="font-medium text-slate-200">{e.targetUsername}</span></>
                    )}
                    {e.detail && (
                      <span className="text-slate-500"> — {e.detail}</span>
                    )}
                  </p>
                </div>

                <span className="shrink-0 whitespace-nowrap text-xs text-slate-600" title={new Date(e.createdAt).toLocaleString()}>
                  {timeAgo(e.createdAt)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AdminPage() {
  const { user: currentUser } = useAuth()

  // All hooks must run before any conditional return
  const [tab, setTab] = useState<AdminTab>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const isTO = currentUser?.role === 'TO'

  // Fetch real users from backend (only runs when logged-in as TO)
  useEffect(() => {
    if (!isTO) return
    let cancelled = false
    setLoadingUsers(true)
    setFetchError(null)
    apiClient.get<BackendUser[]>('/admin/users')
      .then(res => {
        if (!cancelled) {
          setUsers(res.data.map(mapBackendUser))
          setLoadingUsers(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setFetchError(err.message ?? 'Failed to load users')
          setLoadingUsers(false)
        }
      })
    return () => { cancelled = true }
  }, [isTO])

  const stats = useMemo(() => ({
    total: users.length,
    organizers: users.filter(u => u.role === 'TO').length,
    viewers: users.filter(u => u.role === 'VIEWER').length,
  }), [users])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(u => {
      const okRole = roleFilter === 'ALL' || u.role === roleFilter
      const okSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      return okRole && okSearch
    })
  }, [users, search, roleFilter])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleRoleChange = (id: string, newRole: UserRole) => {
    const target = users.find(u => u.id === id)
    const prevRole = target?.role

    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))

    apiClient.patch(`/admin/users/${id}/role`, { role: newRole })
      .then(() => {
        const label = newRole === 'TO' ? 'Organizer' : 'Viewer'
        showToast(`${target?.name ?? 'User'} updated to ${label}`, 'success')
      })
      .catch((err: unknown) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: prevRole ?? u.role } : u))
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? 'Failed to update role — reverted'
        showToast(msg, 'error')
      })
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Users }[] = [
    { id: 'users',    label: 'Users',              icon: Users },
    { id: 'roles',    label: 'Roles / Permissions', icon: ShieldCheck },
    { id: 'activity', label: 'Activity Log',        icon: Activity },
  ]

  // Guard: only TO can access (after all hooks)
  if (!currentUser || !isTO) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="relative">
      {/* Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-[100px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute -right-10 top-40 h-60 w-60 rounded-full blur-[100px] opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl ${
          toast.type === 'error'
            ? 'border-red-400/20 bg-red-500/10 text-red-300'
            : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
        }`}>
          <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${toast.type === 'error' ? 'bg-red-400' : 'bg-emerald-400'}`} />
          {toast.msg}
        </div>
      )}

      <div className="relative">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white" style={tight}>Admin Panel</h1>
          </div>
          <p className="max-w-xl text-sm text-slate-400">
            Manage users and access permissions across the entire Tournament OS ecosystem.
            Monitor activity and enforce platform integrity.
          </p>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Users',  value: stats.total,      icon: Users,       accent: 'indigo' },
            { label: 'Organizers',   value: stats.organizers, icon: ShieldCheck, accent: 'violet' },
            { label: 'Viewers',      value: stats.viewers,    icon: Eye,         accent: 'sky' },
          ].map(({ label, value, icon: Icon, accent }) => {
            const glows: Record<string, string> = {
              indigo: 'rgba(99,102,241,0.2)',
              violet: 'rgba(139,92,246,0.2)',
              sky:    'rgba(14,165,233,0.2)',
            }
            const chips: Record<string, string> = {
              indigo: 'bg-indigo-500/15 ring-indigo-400/20 text-indigo-300',
              violet: 'bg-violet-500/15 ring-violet-400/20 text-violet-300',
              sky:    'bg-sky-500/15 ring-sky-400/20 text-sky-300',
            }
            return (
              <div
                key={label}
                className="relative overflow-hidden rounded-3xl border border-white/[0.06] p-5 backdrop-blur-xl"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-70"
                  style={{ background: `radial-gradient(circle, ${glows[accent]} 0%, transparent 70%)` }} />
                <div className="relative flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-slate-500" style={uppercase}>{label}</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums text-white" style={{ letterSpacing: '-0.03em' }}>
                      {value}
                    </p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${chips[accent]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex gap-0 border-b border-white/[0.06]">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative px-4 pb-3 pt-1 text-sm font-semibold transition-colors ${
                tab === id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {label}
              {tab === id && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              )}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {tab === 'users' && (
          <div>
            {/* Loading state */}
            {loadingUsers && (
              <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                <span className="text-sm">Loading users…</span>
              </div>
            )}

            {/* Error state */}
            {!loadingUsers && fetchError && (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                <span className="font-semibold">Error: </span>{fetchError}
              </div>
            )}

            {/* Filters + Table */}
            {!loadingUsers && !fetchError && (
            <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 transition focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Filter by Role:</span>
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
                    className="appearance-none rounded-xl border border-white/10 bg-white/[0.05] py-2 pl-3 pr-8 text-sm text-slate-200 outline-none transition focus:border-indigo-500/40"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="TO">Organizer</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div
              className="overflow-hidden rounded-3xl border border-white/5 backdrop-blur-xl"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)' }}>
                    <tr>
                      {['User', 'Contact', 'Role', 'Auth', 'Joined', 'Actions'].map(h => (
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
                    {filtered.map(u => (
                      <tr key={u.id} className="group transition hover:bg-white/[0.02]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} />
                            <div>
                              <p className="font-semibold text-white">{u.name}</p>
                              <p className="text-[11px] text-slate-500">ID: #{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400">{u.email}</td>
                        <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                        <td className="px-5 py-4"><AuthBadge method={u.authMethod} /></td>
                        <td className="px-5 py-4 text-slate-400">{formatDate(u.joinedAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <RoleDropdown
                            user={u}
                            currentUsername={currentUser.id}
                            onChangeRole={handleRoleChange}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
                <p className="text-xs text-slate-500">
                  Showing {filtered.length} of {users.length} users
                </p>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {tab === 'roles' && <RolesTab />}
        {tab === 'activity' && <ActivityTab />}
      </div>
    </div>
  )
}

import { useRef, useState } from 'react'
import {
  Camera,
  Check,
  Mail,
  Pencil,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppDataContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'TO') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
        <ShieldCheck className="h-3 w-3" />
        Tournament Organizer
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/25 bg-slate-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
      <User className="h-3 w-3" />
      Viewer
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl px-5 py-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

// ── Inline editable field ──────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  onSave,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onSave: (v: string) => void
  placeholder?: string
  type?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const start = () => {
    setDraft(value)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }
  const cancel = () => setEditing(false)
  const save = () => {
    if (draft.trim()) onSave(draft.trim())
    setEditing(false)
  }

  return (
    <div className="group flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type={type}
            value={draft}
            placeholder={placeholder}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') cancel()
            }}
            className="flex-1 rounded-xl border border-indigo-500/40 bg-indigo-500/5 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none ring-0 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30"
          />
          <button
            type="button"
            onClick={save}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/80 text-white transition-colors hover:bg-indigo-600"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={cancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-200">{value || <span className="text-slate-600">—</span>}</p>
          <button
            type="button"
            onClick={start}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/0 text-slate-600 opacity-0 transition-all group-hover:border-white/10 group-hover:bg-white/5 group-hover:text-slate-400 group-hover:opacity-100"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user, updateUserProfile } = useAuth()
  const { tournaments, participants } = useAppData()

  const [saved, setSaved] = useState(false)
  const [photoUrlDraft, setPhotoUrlDraft] = useState(user?.photoUrl ?? '')
  const [editingPhoto, setEditingPhoto] = useState(false)

  if (!user) return null

  // ── Stats derived from real data ──────────────────────────────────────────
  const myTournaments = user.role === 'TO'
    ? tournaments.filter(t => t.organizerId === user.id || t.organizerName === user.name)
    : []
  const myParticipations = participants.filter(p => p.email === user.email)
  const activeTournamentCount = tournaments.filter(t => t.status === 'ACTIVE').length

  const flash = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleNameSave = (name: string) => {
    updateUserProfile({ name })
    flash()
  }

  const handlePhotoSave = () => {
    updateUserProfile({ photoUrl: photoUrlDraft || undefined })
    setEditingPhoto(false)
    flash()
  }

  const avatarBg = 'from-indigo-500 to-violet-600'

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal information and account details.</p>
      </div>

      {/* ── Hero card ───────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)' }}
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="group relative shrink-0 self-center sm:self-start">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/10"
              />
            ) : (
              <div className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarBg} ring-4 ring-white/10`}>
                <span className="text-3xl font-bold text-white">{initials(user.name)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setEditingPhoto(v => !v)}
              className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-slate-400 shadow-lg transition-colors hover:bg-slate-800 hover:text-white"
              title="Change photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Name + email + role */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <RoleBadge role={user.role} />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.id && (
              <p className="font-mono text-[10px] text-slate-600">UID: {user.id}</p>
            )}
          </div>
        </div>

        {/* Photo URL editor */}
        <AnimatePresence>
          {editingPhoto && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div
                className="flex flex-col gap-2 rounded-2xl p-4"
                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-indigo-400">Photo URL</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={photoUrlDraft}
                    onChange={e => setPhotoUrlDraft(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 rounded-xl border border-indigo-500/30 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={handlePhotoSave}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-[11px] text-slate-600">Paste a direct image URL. Changes are saved locally.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {user.role === 'TO' ? (
          <>
            <StatCard label="Tournaments Organized" value={myTournaments.length} />
            <StatCard label="Active Events" value={activeTournamentCount} />
            <StatCard label="Role" value="Organizer" sub="Tournament Organizer" />
          </>
        ) : (
          <>
            <StatCard label="Tournaments Joined" value={myParticipations.length} />
            <StatCard label="Active Events" value={activeTournamentCount} />
            <StatCard label="Role" value="Viewer" sub="Participant / Spectator" />
          </>
        )}
      </div>

      {/* ── Edit info ───────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Account Information</h3>
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400"
              >
                <Check className="h-3 w-3" />
                Saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="divide-y divide-white/[0.05]">
          <div className="py-4 first:pt-0 last:pb-0">
            <EditableField
              label="Display Name"
              value={user.name}
              onSave={handleNameSave}
              placeholder="Your full name"
            />
          </div>
          <div className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Email</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">{user.email}</p>
                <span className="rounded-full border border-slate-700 bg-slate-800/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Read-only
                </span>
              </div>
            </div>
          </div>
          <div className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Role</p>
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger zone ─────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.15)',
        }}
      >
        <h3 className="mb-1 text-sm font-semibold text-red-400">Danger Zone</h3>
        <p className="mb-4 text-xs text-slate-500">
          These actions are irreversible. Please be certain before proceeding.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
            onClick={() => alert('Contact an administrator to delete your account.')}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

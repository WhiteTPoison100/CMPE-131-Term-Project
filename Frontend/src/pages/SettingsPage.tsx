import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Camera,
  Check,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  User,
  UserX,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { uploadProfilePhoto, firebaseAuth } from '../lib/firebase'
import { updateProfile, deleteUser } from 'firebase/auth'

// ── helpers ───────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'tournament_os_token'

function authHeaders() {
  const t = localStorage.getItem(TOKEN_KEY)
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function patchProfile(body: { displayName?: string; photoUrl?: string }) {
  const res = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to save profile')
  return res.json()
}

async function deactivateAccount() {
  const res = await fetch('/api/users/me/deactivate', {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to deactivate account')
}

async function deleteAccount() {
  const res = await fetch('/api/users/me', {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete account')
}

// ── ConfirmDialog ─────────────────────────────────────────────────────────────

type DialogVariant = 'deactivate' | 'delete'

interface ConfirmDialogProps {
  variant: DialogVariant
  onConfirm: () => Promise<void>
  onClose: () => void
}

const DIALOG_CONFIG = {
  deactivate: {
    icon: UserX,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    glow: 'rgba(245,158,11,0.15)',
    title: 'Deactivate Account',
    body: 'Your profile and tournaments will be hidden from the platform. You can reactivate your account at any time by signing back in.',
    confirmLabel: 'Yes, Deactivate',
    confirmClass: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/30 hover:text-amber-200',
    requireTyped: false,
    typedValue: '',
  },
  delete: {
    icon: Trash2,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    glow: 'rgba(239,68,68,0.15)',
    title: 'Delete Account Permanently',
    body: 'This will erase all your data — profile, tournaments, match history — and cannot be undone. To confirm, type DELETE below.',
    confirmLabel: 'Permanently Delete',
    confirmClass: 'bg-red-600 text-white hover:bg-red-500 disabled:opacity-40',
    requireTyped: true,
    typedValue: 'DELETE',
  },
} as const

function ConfirmDialog({ variant, onConfirm, onClose }: ConfirmDialogProps) {
  const cfg = DIALOG_CONFIG[variant]
  const Icon = cfg.icon
  const [typed, setTyped] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canConfirm = !cfg.requireTyped || typed === cfg.typedValue

  const handleConfirm = async () => {
    if (!canConfirm) return
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  // Close on ESC
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter' && canConfirm && !loading) void handleConfirm()
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onKeyDown={handleKey}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Panel */}
        <motion.div
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.08]"
          style={{
            backgroundColor: 'rgba(8, 13, 28, 0.98)',
            backdropFilter: 'blur(32px)',
            boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 60px ${cfg.glow}`,
          }}
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top accent line */}
          <div className={`h-px w-full ${variant === 'delete' ? 'bg-gradient-to-r from-transparent via-red-500/50 to-transparent' : 'bg-gradient-to-r from-transparent via-amber-500/40 to-transparent'}`} />

          <div className="px-6 pb-6 pt-5">
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon + title */}
            <div className="mb-4 flex items-center gap-3.5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${cfg.iconBg} ring-1 ${variant === 'delete' ? 'ring-red-500/25' : 'ring-amber-500/25'}`}>
                <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white" style={{ letterSpacing: '-0.01em' }}>
                  {cfg.title}
                </h3>
                <p className="text-xs text-slate-500">This action requires confirmation</p>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-4 h-px bg-white/[0.05]" />

            {/* Body text */}
            <p className="mb-5 text-sm leading-relaxed text-slate-400">{cfg.body}</p>

            {/* Typed confirmation input for delete */}
            {cfg.requireTyped && (
              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500" style={{ letterSpacing: '0.08em' }}>
                  Type <span className="font-mono text-red-400">{cfg.typedValue}</span> to confirm
                </label>
                <input
                  type="text"
                  value={typed}
                  onChange={e => setTyped(e.target.value)}
                  autoFocus
                  placeholder={cfg.typedValue}
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-2.5 px-3.5 font-mono text-sm text-red-300 outline-none placeholder:text-slate-700 transition focus:border-red-500/40 focus:ring-2 focus:ring-red-500/15"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-semibold text-slate-400 transition hover:border-white/15 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm || loading}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${cfg.confirmClass}`}
              >
                {loading
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…</>
                  : cfg.confirmLabel
                }
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

// ── sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  accent = 'indigo',
  children,
}: {
  icon: React.ElementType
  title: string
  accent?: 'indigo' | 'red'
  children: React.ReactNode
}) {
  const border = accent === 'red'
    ? 'border-red-500/20'
    : 'border-white/[0.06]'
  const glow = accent === 'red'
    ? 'rgba(239,68,68,0.06)'
    : 'transparent'
  const iconStyle = accent === 'red'
    ? 'text-red-400'
    : 'text-indigo-400'

  return (
    <div
      className={`overflow-hidden rounded-3xl border ${border} backdrop-blur-xl`}
      style={{ backgroundColor: `rgba(15,23,42,0.55)`, boxShadow: `0 0 60px ${glow}` }}
    >
      <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-6 py-4">
        <Icon className={`h-4.5 w-4.5 ${iconStyle}`} />
        <h2 className="text-base font-bold text-white" style={{ letterSpacing: '-0.01em' }}>
          {title}
        </h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500"
      style={{ letterSpacing: '0.08em' }}>
      {children}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  locked,
}: {
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  locked?: boolean
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || locked}
        className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-2.5 pl-3.5 pr-9 text-sm text-slate-200 outline-none placeholder:text-slate-600 transition focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60"
      />
      {locked && (
        <Lock className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
      )}
    </div>
  )
}

function SelectInput({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none rounded-xl border border-white/[0.07] bg-white/[0.04] py-2.5 pl-3.5 pr-9 text-sm text-slate-200 outline-none transition focus:border-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: 'rgba(15,23,42,0.8)' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ backgroundColor: '#0f172a' }}>
            {o.label}
          </option>
        ))}
      </select>
      <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
    </div>
  )
}

// ── Avatar uploader ────────────────────────────────────────────────────────────

function AvatarUploader({
  name,
  photoUrl,
  username,
  onUpload,
}: {
  name: string
  photoUrl?: string
  username: string
  onUpload: (url: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(photoUrl ?? null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadProfilePhoto(username, file, pct => setProgress(pct))
      onUpload(url)
    } catch {
      setPreview(photoUrl ?? null)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Circle */}
      <div className="relative">
        <div
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 ring-4 ring-white/10"
          style={{ boxShadow: '0 0 30px rgba(99,102,241,0.35)' }}
        >
          {preview ? (
            <img src={preview} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">{name?.charAt(0)?.toUpperCase() ?? '?'}</span>
          )}
        </div>

        {/* Upload overlay */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {uploading
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Camera className="h-3 w-3" />
          }
        </button>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="flex w-24 flex-col items-center gap-1">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500">{progress}%</span>
        </div>
      )}

      <p className="text-[11px] text-slate-600">JPG, PNG · max 5 MB</p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}

// ── Danger zone row ───────────────────────────────────────────────────────────

function DangerRow({
  title,
  description,
  buttonLabel,
  buttonStyle = 'outline',
  disabled,
  onClick,
}: {
  title: string
  description: string
  buttonLabel: string
  buttonStyle?: 'outline' | 'filled'
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
          buttonStyle === 'filled'
            ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30 hover:bg-red-500/30 hover:text-red-200'
            : 'border border-white/10 text-slate-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300'
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

// ── Auth method badge ─────────────────────────────────────────────────────────

function AuthMethodBadge({ provider, method }: { provider?: string; method: string }) {
  if (method === 'FIREBASE' && provider === 'GOOGLE') {
    return (
      <div className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3.5 py-2.5">
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span className="text-sm text-slate-300">Connected via Google</span>
      </div>
    )
  }
  if (method === 'FIREBASE') {
    return (
      <div className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3.5 py-2.5">
        <Mail className="h-4 w-4 text-sky-400" />
        <span className="text-sm text-slate-300">Email / Password</span>
      </div>
    )
  }
  return (
    <div className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3.5 py-2.5">
      <KeyRound className="h-4 w-4 text-amber-400" />
      <span className="text-sm text-slate-300">Demo account</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function SettingsPage({ insidePanel = false }: { insidePanel?: boolean }) {
  const { user, updateUserProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.name ?? '')
  const [photoUrl, setPhotoUrl]       = useState(user?.photoUrl ?? '')
  const [landing, setLanding]         = useState('dashboard')

  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // dialog state: null = closed, 'deactivate' | 'delete' = open
  const [dialog, setDialog] = useState<DialogVariant | null>(null)

  if (!user) return null

  const isDemoAccount = !user.firebaseProvider

  // ── Deactivate handler ────────────────────────────────────────
  const handleDeactivate = async () => {
    await deactivateAccount()
    logout()
    navigate('/login')
  }

  // ── Delete handler ────────────────────────────────────────────
  const handleDelete = async () => {
    await deleteAccount()
    // Also delete Firebase Auth user if applicable
    if (firebaseAuth?.currentUser) {
      await deleteUser(firebaseAuth.currentUser)
    }
    logout()
    navigate('/login')
  }

  const handlePhotoUploaded = (url: string) => {
    setPhotoUrl(url)
    // Immediately persist the URL so the avatar shows across the app
    void patchProfile({ photoUrl: url }).then(() => {
      updateUserProfile({ photoUrl: url })
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      await patchProfile({
        displayName: displayName || undefined,
        photoUrl: photoUrl || undefined,
      })
      // Sync Firebase Auth profile too (only for Firebase users)
      if (firebaseAuth?.currentUser) {
        await updateProfile(firebaseAuth.currentUser, {
          displayName: displayName || null,
          photoURL: photoUrl || null,
        })
      }
      updateUserProfile({ name: displayName, photoUrl: photoUrl || undefined })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setSaveError('Failed to save — please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`relative space-y-6 pb-8 ${insidePanel ? '' : 'mx-auto max-w-3xl pb-12'}`}>
      {/* Ambient glow — only shown on standalone page */}
      {!insidePanel && (
        <>
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full blur-[120px] opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute -right-16 top-60 h-60 w-60 rounded-full blur-[100px] opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
        </>
      )}

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your account, preferences, and privacy.
          </p>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] transition hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(99,102,241,0.45)] active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check className="h-4 w-4" /> Saved!</>
          ) : (
            <><Save className="h-4 w-4" /> Save Changes</>
          )}
        </button>
      </div>

      {saveError && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {saveError}
        </div>
      )}

      {/* ── Profile ──────────────────────────────────────────────────── */}
      <SectionCard icon={User} title="Profile">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <AvatarUploader
              name={user.name}
              photoUrl={photoUrl || undefined}
              username={user.id}
              onUpload={handlePhotoUploaded}
            />
            {/* Role badge under avatar */}
            {user.role === 'TO' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300">
                <ShieldCheck className="h-3 w-3" /> Organizer
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
                Viewer
              </span>
            )}
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-4">
            <div>
              <FieldLabel>Full Name</FieldLabel>
              <TextInput
                value={displayName}
                onChange={setDisplayName}
                placeholder="Your display name"
              />
            </div>
            <div>
              <FieldLabel>Email Address</FieldLabel>
              <TextInput
                value={user.email ?? ''}
                locked
                placeholder="—"
              />
            </div>
            <div>
              <FieldLabel>Authentication</FieldLabel>
              <AuthMethodBadge
                method={user.firebaseProvider ? 'FIREBASE' : 'DEMO'}
                provider={user.firebaseProvider === 'GOOGLE' ? 'GOOGLE' : undefined}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Preferences ──────────────────────────────────────────────── */}
      <SectionCard icon={SlidersHorizontal} title="Preferences">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Theme</FieldLabel>
            <SelectInput
              value="dark"
              onChange={() => {}}
              disabled
              options={[{ value: 'dark', label: 'Dark Mode (Deep Space)' }]}
            />
          </div>
          <div>
            <FieldLabel>Default Landing Page</FieldLabel>
            <SelectInput
              value={landing}
              onChange={setLanding}
              options={[
                { value: 'dashboard',    label: 'Dashboard' },
                { value: 'tournaments',  label: 'Tournaments' },
                { value: 'matches',      label: 'Matches' },
                { value: 'participants', label: 'Participants' },
              ]}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Danger Zone ──────────────────────────────────────────────── */}
      <SectionCard icon={AlertTriangle} title="Danger Zone" accent="red">
        <p className="mb-4 text-sm text-slate-500">
          Irreversible actions regarding your account and data. Proceed with extreme caution.
        </p>
        <div className="space-y-3">
          <DangerRow
            title="Deactivate Account"
            description="Temporarily hide your profile and tournaments. You can reactivate by signing back in."
            buttonLabel="Deactivate"
            buttonStyle="outline"
            onClick={() => setDialog('deactivate')}
          />
          <DangerRow
            title={isDemoAccount ? 'Cannot Delete Demo Account' : 'Delete Account Permanently'}
            description={
              isDemoAccount
                ? 'Demo accounts cannot be deleted from this panel.'
                : 'Erase all personal data and remove access. This cannot be undone.'
            }
            buttonLabel={isDemoAccount ? 'Protected' : 'Delete Account'}
            buttonStyle="filled"
            disabled={isDemoAccount}
            onClick={() => { if (!isDemoAccount) setDialog('delete') }}
          />
        </div>
      </SectionCard>

      {/* ── Confirm dialogs ───────────────────────────────────────────── */}
      {dialog === 'deactivate' && (
        <ConfirmDialog
          variant="deactivate"
          onConfirm={handleDeactivate}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'delete' && (
        <ConfirmDialog
          variant="delete"
          onConfirm={handleDelete}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}

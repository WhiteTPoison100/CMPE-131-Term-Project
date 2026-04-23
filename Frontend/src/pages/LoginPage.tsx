import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Shield, Sparkles, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { TextInput } from '../components/forms/TextInput'
import { MOCK_CREDENTIALS } from '../data/mockUsers'
import { firebaseEnabled } from '../lib/firebase'

type Tab = 'signin' | 'signup' | 'demo'

// ── Google "G" logo ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-800" />
      <span className="text-xs text-slate-600">or</span>
      <div className="h-px flex-1 bg-slate-800" />
    </div>
  )
}

// ── Google button ─────────────────────────────────────────────────────────────
function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  )
}

// ── Error message ─────────────────────────────────────────────────────────────
function ErrorMsg({ msg }: { msg: string | null }) {
  if (!msg) return null
  return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{msg}</p>
}

export function LoginPage() {
  const { user, loading, login, signIn, signUp, signInWithGoogle } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const defaultTab: Tab = firebaseEnabled ? 'signin' : 'demo'
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [error, setError] = useState<string | null>(null)

  // Sign-in state
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  // Sign-up state
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suConfirm, setSuConfirm] = useState('')

  // Demo state
  const [demoUsername, setDemoUsername] = useState('')
  const [demoPassword, setDemoPassword] = useState('')

  if (user) {
    return <Navigate to={from === '/login' ? '/dashboard' : from} replace />
  }

  const switchTab = (t: Tab) => { setTab(t); setError(null) }

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await signIn(siEmail, siPassword)
    if (!res.ok) setError(res.message ?? 'Sign-in failed.')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (suPassword !== suConfirm) {
      setError('Passwords do not match.')
      return
    }
    if (suPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    const res = await signUp(suEmail, suPassword, suName)
    if (!res.ok) setError(res.message ?? 'Sign-up failed.')
  }

  const handleGoogle = async () => {
    setError(null)
    const res = await signInWithGoogle()
    if (!res.ok) setError(res.message ?? 'Google sign-in failed.')
  }

  const handleDemo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await login(demoUsername, demoPassword)
    if (!res.ok) setError(res.message ?? 'Login failed.')
  }

  const fillDemo = (role: 'organizer' | 'viewer') => {
    const c = MOCK_CREDENTIALS[role]
    setDemoUsername(c.username)
    setDemoPassword(c.password)
  }

  // ── tabs config ──────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string }[] = firebaseEnabled
    ? [{ id: 'signin', label: 'Sign in' }, { id: 'signup', label: 'Sign up' }, { id: 'demo', label: 'Demo' }]
    : [{ id: 'demo', label: 'Demo' }]

  return (
    <div className="relative min-h-svh overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />
      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-10">

        {/* Left: hero */}
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-500/25">
            <Sparkles className="h-3.5 w-3.5" />
            CMPE-131 · Tournament Management
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Run brackets like a production platform.
          </h1>
          <p className="text-base text-slate-400">
            Tournament OS connects to your Spring Boot backend. Organizers can create tournaments,
            seed participants, generate brackets, and submit scores.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Shield className="h-4 w-4 text-indigo-300" />
                Organizer mode
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Full controls: tournaments, participants, bracket generation, score entry.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Users className="h-4 w-4 text-violet-300" />
                Viewer mode
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Read-only access to tournaments, rosters, and live bracket progress.
              </p>
            </div>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="w-full max-w-md rounded-3xl border border-slate-800/90 bg-slate-900/70 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur">

          {/* Tab bar */}
          <div className="flex gap-1 rounded-xl bg-slate-950/60 p-1">
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  tab === t.id
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Sign in ──────────────────────────────────────────────────────── */}
          {tab === 'signin' && (
            <div className="mt-6 space-y-4">
              <form className="space-y-4" onSubmit={handleSignIn}>
                <TextInput
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={siEmail}
                  onChange={e => setSiEmail(e.target.value)}
                  required
                />
                <TextInput
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={siPassword}
                  onChange={e => setSiPassword(e.target.value)}
                  required
                />
                <ErrorMsg msg={error} />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Continue with Firebase'}
                </button>
              </form>
              <Divider />
              <GoogleButton onClick={handleGoogle} loading={loading} />
            </div>
          )}

          {/* ── Sign up ──────────────────────────────────────────────────────── */}
          {tab === 'signup' && (
            <div className="mt-6 space-y-4">
              <form className="space-y-4" onSubmit={handleSignUp}>
                <TextInput
                  label="Full name"
                  name="fullname"
                  type="text"
                  autoComplete="name"
                  value={suName}
                  onChange={e => setSuName(e.target.value)}
                  required
                />
                <TextInput
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={suEmail}
                  onChange={e => setSuEmail(e.target.value)}
                  required
                />
                <TextInput
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={suPassword}
                  onChange={e => setSuPassword(e.target.value)}
                  required
                />
                <TextInput
                  label="Confirm password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={suConfirm}
                  onChange={e => setSuConfirm(e.target.value)}
                  required
                />
                <ErrorMsg msg={error} />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>
              <Divider />
              <GoogleButton onClick={handleGoogle} loading={loading} />
              <p className="text-center text-xs text-slate-500">
                New Firebase accounts are assigned{' '}
                <span className="text-slate-400">Viewer</span> role by default.
              </p>
            </div>
          )}

          {/* ── Demo ─────────────────────────────────────────────────────────── */}
          {tab === 'demo' && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-slate-400">
                Use a demo account to explore the app without a Firebase account.
              </p>

              {/* Quick-fill cards */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-700 px-3 py-3 text-left text-xs text-slate-200 transition hover:border-indigo-500/50 hover:bg-slate-900"
                  onClick={() => fillDemo('organizer')}
                >
                  <span className="font-semibold text-indigo-200">Tournament Organizer</span>
                  <br />
                  <span className="text-slate-500">username: {MOCK_CREDENTIALS.organizer.username}</span>
                  <br />
                  <span className="font-mono text-slate-400">{MOCK_CREDENTIALS.organizer.password}</span>
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-700 px-3 py-3 text-left text-xs text-slate-200 transition hover:border-violet-500/50 hover:bg-slate-900"
                  onClick={() => fillDemo('viewer')}
                >
                  <span className="font-semibold text-violet-200">Viewer</span>
                  <br />
                  <span className="text-slate-500">username: {MOCK_CREDENTIALS.viewer.username}</span>
                  <br />
                  <span className="font-mono text-slate-400">{MOCK_CREDENTIALS.viewer.password}</span>
                </button>
              </div>

              <form className="space-y-3" onSubmit={handleDemo}>
                <TextInput
                  label="Username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={demoUsername}
                  onChange={e => setDemoUsername(e.target.value)}
                  required
                />
                <TextInput
                  label="Password"
                  name="demo-password"
                  type="password"
                  autoComplete="current-password"
                  value={demoPassword}
                  onChange={e => setDemoPassword(e.target.value)}
                  required
                />
                <ErrorMsg msg={error} />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-700 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Sign in with demo account'}
                </button>
              </form>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            Connected to Spring Boot at{' '}
            <span className="font-mono">localhost:8080</span>
          </p>
        </div>
      </div>
    </div>
  )
}

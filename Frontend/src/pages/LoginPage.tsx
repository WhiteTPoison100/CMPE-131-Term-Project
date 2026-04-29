import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { usePageTransition } from '../context/TransitionContext'
import { Radio, ShieldCheck, Swords, Trophy, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { MOCK_CREDENTIALS } from '../data/mockUsers'
import { firebaseEnabled } from '../lib/firebase'

type Tab = 'signin' | 'signup' | 'demo'

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

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[11px] font-medium uppercase text-slate-400"
      style={{ letterSpacing: '0.08em' }}
    >
      {children}
    </label>
  )
}

function Field({
  id, label, type = 'text', value, onChange, autoComplete, required, placeholder,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div className="w-full">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-slate-950/80 focus:ring-2 focus:ring-indigo-500/30"
      />
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <span
        className="text-[10px] font-medium uppercase text-slate-500"
        style={{ letterSpacing: '0.2em' }}
      >
        or
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-slate-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  )
}

function ErrorMsg({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <p className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-300">
      <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
      {msg}
    </p>
  )
}

export function LoginPage() {
  const { user, loading, login, signIn, signUp, signInWithGoogle } = useAuth()
  const location = useLocation()
  const { flashLogin } = usePageTransition()
  const savedLanding = '/' + (localStorage.getItem('tournament_os_landing') ?? 'dashboard')

  const defaultTab: Tab = firebaseEnabled ? 'signin' : 'demo'
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [error, setError] = useState<string | null>(null)

  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suConfirm, setSuConfirm] = useState('')

  const [demoUsername, setDemoUsername] = useState('')
  const [demoPassword, setDemoPassword] = useState('')

  if (user) {
    return <Navigate to={savedLanding} replace />
  }

  const switchTab = (t: Tab) => { setTab(t); setError(null) }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await signIn(siEmail, siPassword)
    if (res.ok) flashLogin(siEmail.split('@')[0])
    else setError(res.message ?? 'Sign-in failed.')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (suPassword !== suConfirm) { setError('Passwords do not match.'); return }
    if (suPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    const res = await signUp(suEmail, suPassword, suName)
    if (res.ok) flashLogin(suName)
    else setError(res.message ?? 'Sign-up failed.')
  }

  const handleGoogle = async () => {
    setError(null)
    const res = await signInWithGoogle()
    if (res.ok) flashLogin(user?.name)
    else setError(res.message ?? 'Google sign-in failed.')
  }

  const handleDemo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await login(demoUsername, demoPassword)
    if (res.ok) flashLogin(demoUsername)
    else setError(res.message ?? 'Login failed.')
  }

  const fillDemo = (role: 'organizer' | 'viewer') => {
    const c = MOCK_CREDENTIALS[role]
    setDemoUsername(c.username)
    setDemoPassword(c.password)
  }

  const tabs: { id: Tab; label: string }[] = firebaseEnabled
    ? [{ id: 'signin', label: 'Sign in' }, { id: 'signup', label: 'Sign up' }, { id: 'demo', label: 'Demo' }]
    : [{ id: 'demo', label: 'Demo' }]

  const primaryBtn =
    'relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(99,102,241,0.6),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_40px_-12px_rgba(99,102,241,0.7),inset_0_1px_0_0_rgba(255,255,255,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <div
      className="relative min-h-svh overflow-hidden"
      style={{ backgroundColor: '#020617' }}
    >
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full opacity-70 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0) 70%)' }}
      />
      <div
        className="pointer-events-none absolute -right-40 top-1/3 h-[480px] w-[480px] rounded-full opacity-60 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(141,84,255,0.35) 0%, rgba(141,84,255,0) 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-1/3 h-[520px] w-[520px] rounded-full opacity-50 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(249,156,0,0.18) 0%, rgba(249,156,0,0) 70%)' }}
      />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        {/* Left: hero */}
        <div className="max-w-xl space-y-7">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/[0.08] px-3.5 py-1.5 text-[11px] font-medium uppercase text-indigo-200 backdrop-blur-sm"
            style={{ letterSpacing: '0.12em' }}
          >
            <Radio className="h-3.5 w-3.5" />
            Tournament OS · Live
          </div>

          <h1
            className="text-[44px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[56px]"
            style={{ letterSpacing: '-0.02em' }}
          >
            Run brackets like a{' '}
            <span
              className="bg-gradient-to-r from-indigo-300 via-violet-300 to-amber-200 bg-clip-text text-transparent"
            >
              broadcast studio
            </span>
            .
          </h1>

          <p className="max-w-lg text-[15px] leading-relaxed text-slate-400">
            Premium esports management for organizers and viewers. Seed rosters, generate brackets,
            and submit scores — wired to a Spring Boot backend with Firebase auth.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="group rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/20">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-white">Organizer</span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
                Full control: tournaments, participants, bracket generation, score entry.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
                  <Swords className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-white">Viewer</span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
                Read-only access to tournaments, rosters, and live bracket progress.
              </p>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center gap-4 pt-2 text-[11px] font-medium uppercase text-slate-500"
            style={{ letterSpacing: '0.12em' }}
          >
            <span className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-400" /> Live brackets
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-400" /> Real-time scoring
            </span>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="w-full max-w-md">
          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 p-8 shadow-[0_30px_80px_-20px_rgba(2,6,23,0.8),0_0_0_1px_rgba(99,102,241,0.08)] backdrop-blur-xl"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)' }}
          >
            {/* Top gradient accent line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />

            <div className="mb-7 space-y-1.5">
              <h2
                className="text-2xl font-semibold text-white"
                style={{ letterSpacing: '-0.01em' }}
              >
                Welcome back
              </h2>
              <p className="text-sm text-slate-400">
                Sign in to your Tournament OS console.
              </p>
            </div>

            {/* Tab bar */}
            <div
              className="flex gap-1 rounded-xl border border-white/5 bg-slate-950/60 p-1"
            >
              {tabs.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchTab(t.id)}
                  className={`flex-1 rounded-lg py-2 text-[11px] font-semibold uppercase transition-all duration-200 ${
                    tab === t.id
                      ? 'bg-gradient-to-b from-indigo-500/30 to-indigo-600/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_2px_rgba(99,102,241,0.2)] ring-1 ring-indigo-400/30'
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                  style={{ letterSpacing: '0.1em' }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sign in */}
            {tab === 'signin' && (
              <div className="mt-6 space-y-4">
                <form className="space-y-4" onSubmit={handleSignIn}>
                  <Field id="si-email" label="Email" type="email" autoComplete="email"
                    value={siEmail} onChange={setSiEmail} required placeholder="you@studio.gg" />
                  <Field id="si-password" label="Password" type="password" autoComplete="current-password"
                    value={siPassword} onChange={setSiPassword} required placeholder="••••••••" />
                  <ErrorMsg msg={error} />
                  <button type="submit" disabled={loading} className={primaryBtn}>
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>
                <Divider />
                <GoogleButton onClick={handleGoogle} loading={loading} />
              </div>
            )}

            {/* Sign up */}
            {tab === 'signup' && (
              <div className="mt-6 space-y-4">
                <form className="space-y-4" onSubmit={handleSignUp}>
                  <Field id="su-name" label="Full name" autoComplete="name"
                    value={suName} onChange={setSuName} required placeholder="Ada Lovelace" />
                  <Field id="su-email" label="Email" type="email" autoComplete="email"
                    value={suEmail} onChange={setSuEmail} required placeholder="you@studio.gg" />
                  <Field id="su-password" label="Password" type="password" autoComplete="new-password"
                    value={suPassword} onChange={setSuPassword} required placeholder="At least 6 characters" />
                  <Field id="su-confirm" label="Confirm password" type="password" autoComplete="new-password"
                    value={suConfirm} onChange={setSuConfirm} required placeholder="Repeat password" />
                  <ErrorMsg msg={error} />
                  <button type="submit" disabled={loading} className={primaryBtn}>
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                </form>
                <Divider />
                <GoogleButton onClick={handleGoogle} loading={loading} />
                <p className="text-center text-xs text-slate-500">
                  New accounts are assigned{' '}
                  <span className="text-violet-300">Viewer</span> role by default.
                </p>
              </div>
            )}

            {/* Demo */}
            {tab === 'demo' && (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-slate-400">
                  Explore Tournament OS with a demo account — no Firebase needed.
                </p>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => fillDemo('organizer')}
                    className="group flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:border-indigo-400/40 hover:bg-indigo-500/[0.06] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
                      <span
                        className="text-[10px] font-semibold uppercase text-indigo-200"
                        style={{ letterSpacing: '0.12em' }}
                      >
                        Organizer
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-[11px] text-slate-400">
                      {MOCK_CREDENTIALS.organizer.username}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">
                      {MOCK_CREDENTIALS.organizer.password}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('viewer')}
                    className="group flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:border-violet-400/40 hover:bg-violet-500/[0.06] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2">
                      <Swords className="h-3.5 w-3.5 text-violet-300" />
                      <span
                        className="text-[10px] font-semibold uppercase text-violet-200"
                        style={{ letterSpacing: '0.12em' }}
                      >
                        Viewer
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-[11px] text-slate-400">
                      {MOCK_CREDENTIALS.viewer.username}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">
                      {MOCK_CREDENTIALS.viewer.password}
                    </div>
                  </button>
                </div>

                <form className="space-y-3" onSubmit={handleDemo}>
                  <Field id="demo-username" label="Username" autoComplete="username"
                    value={demoUsername} onChange={setDemoUsername} required />
                  <Field id="demo-password" label="Password" type="password" autoComplete="current-password"
                    value={demoPassword} onChange={setDemoPassword} required />
                  <ErrorMsg msg={error} />
                  <button type="submit" disabled={loading} className={primaryBtn}>
                    {loading ? 'Signing in…' : 'Enter demo console'}
                  </button>
                </form>
              </div>
            )}

            <p
              className="mt-7 text-center text-[10px] font-medium uppercase text-slate-600"
              style={{ letterSpacing: '0.15em' }}
            >
              Secured by Firebase · <span className="font-mono normal-case tracking-normal text-slate-500">localhost:8080</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

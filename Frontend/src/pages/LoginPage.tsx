import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Flame, Shield, Sparkles, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { TextInput } from '../components/forms/TextInput'
import { MOCK_CREDENTIALS } from '../data/mockUsers'
import { firebaseEnabled } from '../lib/firebase'

type AuthMode = 'demo' | 'firebase'

export function LoginPage() {
  const { user, login, loginWithFirebase } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [mode, setMode] = useState<AuthMode>(firebaseEnabled ? 'firebase' : 'demo')

  // Demo login state
  const [username, setUsername] = useState('')
  const [demoPassword, setDemoPassword] = useState('')

  // Firebase login state
  const [email, setEmail] = useState('')
  const [firebasePassword, setFirebasePassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to={from === '/login' ? '/dashboard' : from} replace />
  }

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await login(username, demoPassword)
    setLoading(false)
    if (!res.ok) setError(res.message ?? 'Login failed.')
  }

  const handleFirebaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await loginWithFirebase(email, firebasePassword)
    setLoading(false)
    if (!res.ok) setError(res.message ?? 'Sign-in failed.')
  }

  const fillDemo = (role: 'organizer' | 'viewer') => {
    const c = MOCK_CREDENTIALS[role]
    setUsername(c.username)
    setDemoPassword(c.password)
    setMode('demo')
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />
      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        {/* Left: hero copy */}
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

        {/* Right: sign-in card */}
        <div className="w-full max-w-md rounded-3xl border border-slate-800/90 bg-slate-900/70 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Sign in</h2>

          {/* Mode tabs — only show Firebase tab when configured */}
          {firebaseEnabled && (
            <div className="mt-4 flex gap-1 rounded-xl bg-slate-950/60 p-1">
              <button
                type="button"
                onClick={() => { setMode('firebase'); setError(null) }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                  mode === 'firebase'
                    ? 'bg-orange-500/20 text-orange-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                Firebase
              </button>
              <button
                type="button"
                onClick={() => { setMode('demo'); setError(null) }}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  mode === 'demo'
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Demo
              </button>
            </div>
          )}

          {/* Firebase form */}
          {mode === 'firebase' && firebaseEnabled && (
            <form className="mt-6 space-y-4" onSubmit={handleFirebaseSubmit}>
              <TextInput
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextInput
                label="Password"
                name="firebase-password"
                type="password"
                autoComplete="current-password"
                value={firebasePassword}
                onChange={(e) => setFirebasePassword(e.target.value)}
                required
              />
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Continue with Firebase'}
              </button>
            </form>
          )}

          {/* Demo form */}
          {mode === 'demo' && (
            <>
              <p className="mt-2 text-sm text-slate-400">
                {firebaseEnabled ? 'Or use a demo account.' : 'Use the demo accounts below.'}
              </p>
              <form className="mt-4 space-y-4" onSubmit={handleDemoSubmit}>
                <TextInput
                  label="Username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <TextInput
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={demoPassword}
                  onChange={(e) => setDemoPassword(e.target.value)}
                  required
                />
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Continue'}
                </button>
              </form>

              <div className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Demo credentials
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-slate-700 px-3 py-2 text-left text-xs text-slate-200 transition hover:border-indigo-500/50 hover:bg-slate-900"
                    onClick={() => fillDemo('organizer')}
                  >
                    <span className="font-semibold text-indigo-200">Tournament organizer</span>
                    <br />
                    <span className="text-slate-500">
                      username: {MOCK_CREDENTIALS.organizer.username}
                    </span>
                    <br />
                    <span className="font-mono text-slate-400">
                      {MOCK_CREDENTIALS.organizer.password}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-slate-700 px-3 py-2 text-left text-xs text-slate-200 transition hover:border-violet-500/50 hover:bg-slate-900"
                    onClick={() => fillDemo('viewer')}
                  >
                    <span className="font-semibold text-violet-200">Viewer</span>
                    <br />
                    <span className="text-slate-500">
                      username: {MOCK_CREDENTIALS.viewer.username}
                    </span>
                    <br />
                    <span className="font-mono text-slate-400">
                      {MOCK_CREDENTIALS.viewer.password}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            Connected to Spring Boot at <span className="font-mono">localhost:8080</span>
          </p>
        </div>
      </div>
    </div>
  )
}

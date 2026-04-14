import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Shield, Sparkles, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { TextInput } from '../components/forms/TextInput'
import { MOCK_CREDENTIALS } from '../data/mockUsers'

export function LoginPage() {
  const { user, login } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to={from === '/login' ? '/dashboard' : from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (!res.ok) setError(res.message ?? 'Login failed.')
  }

  const fill = (role: 'organizer' | 'viewer') => {
    const c =
      role === 'organizer' ? MOCK_CREDENTIALS.organizer : MOCK_CREDENTIALS.viewer
    setEmail(c.email)
    setPassword(c.password)
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />
      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-500/25">
            <Sparkles className="h-3.5 w-3.5" />
            CMPE-131 · Tournament Management (frontend draft)
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Run brackets like a production platform.
          </h1>
          <p className="text-base text-slate-400">
            Tournament OS is a presentation-ready UI shell for organizers and viewers. Wire your
            Spring Boot APIs when the backend is ready—Axios clients are already scaffolded.
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

        <div className="w-full max-w-md rounded-3xl border border-slate-800/90 bg-slate-900/70 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Sign in</h2>
          <p className="mt-1 text-sm text-slate-400">Use the demo accounts below.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <TextInput
              label="Email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextInput
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                onClick={() => fill('organizer')}
              >
                <span className="font-semibold text-indigo-200">Tournament organizer</span>
                <br />
                <span className="text-slate-500">{MOCK_CREDENTIALS.organizer.email}</span>
                <br />
                <span className="font-mono text-slate-400">{MOCK_CREDENTIALS.organizer.password}</span>
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-700 px-3 py-2 text-left text-xs text-slate-200 transition hover:border-violet-500/50 hover:bg-slate-900"
                onClick={() => fill('viewer')}
              >
                <span className="font-semibold text-violet-200">Viewer</span>
                <br />
                <span className="text-slate-500">{MOCK_CREDENTIALS.viewer.email}</span>
                <br />
                <span className="font-mono text-slate-400">{MOCK_CREDENTIALS.viewer.password}</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Looking for the API? Configure <span className="font-mono">VITE_API_BASE_URL</span> later.
          </p>
        </div>
      </div>
    </div>
  )
}

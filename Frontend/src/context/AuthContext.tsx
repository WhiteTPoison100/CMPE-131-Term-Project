/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from '../types'
import { loginApi, syncWithBackend, mapFirebaseError } from '../services/authService'
import {
  signInEmailPassword,
  signUpEmailPassword,
  signInGoogle,
  signOutFirebase,
  getEmailSignInMethods,
} from '../lib/firebase'

const STORAGE_KEY = 'tournament_os_user'
const TOKEN_KEY = 'tournament_os_token'

type AuthResult = { ok: boolean; message?: string }

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  /** Update display name and/or photoUrl in local state + localStorage */
  updateUserProfile: (patch: Partial<Pick<AuthUser, 'name' | 'photoUrl'>>) => void
  /** Demo login (username + password against backend directly) */
  login: (username: string, password: string) => Promise<AuthResult>
  /** Firebase email/password sign-in */
  signIn: (email: string, password: string) => Promise<AuthResult>
  /** Firebase email/password sign-up */
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>
  /** Firebase Google popup sign-in / sign-up */
  signInWithGoogle: () => Promise<AuthResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Decode a JWT payload and check if it has expired.
 * Does NOT verify the signature — that is the backend's job.
 */
function isTokenExpired(token: string): boolean {
  try {
    // JWT payload is the second segment, base64url-encoded
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(b64)) as { exp?: number }
    if (typeof payload.exp !== 'number') return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true // can't parse → treat as expired
  }
}

/** Load user from localStorage, but only if the accompanying JWT is still valid. */
function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const token = localStorage.getItem(TOKEN_KEY)
    if (!raw || !token) return null
    // Clear and reject stale sessions so the user goes back to login
    if (isTokenExpired(token)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(TOKEN_KEY)
      return null
    }
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function storeSession(authUser: AuthUser, token: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
  localStorage.setItem(TOKEN_KEY, token)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser())
  const [loading, setLoading] = useState(false)

  const finish = useCallback((authUser: AuthUser, token: string) => {
    setUser(authUser)
    storeSession(authUser, token)
  }, [])

  // ── Session-expired event (fired by apiClient interceptor) ─────────────────
  useEffect(() => {
    const handle = () => {
      setUser(null)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(TOKEN_KEY)
      // RequireAuth will see user=null and redirect to /login automatically
    }
    window.addEventListener('auth:session-expired', handle)
    return () => window.removeEventListener('auth:session-expired', handle)
  }, [])

  // ── Demo login ─────────────────────────────────────────────────────────────
  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    setLoading(true)
    try {
      const { authUser, token } = await loginApi(username, password)
      finish(authUser, token)
      return { ok: true }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid credentials.'
      return { ok: false, message: msg }
    } finally {
      setLoading(false)
    }
  }, [finish])

  // ── Firebase email/password sign-in ────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true)
    try {
      // Pre-check: if email is Google-only, tell user before they type password
      const methods = await getEmailSignInMethods(email)
      if (methods.length > 0 && methods.includes('google.com') && !methods.includes('password')) {
        return { ok: false, message: 'This email is registered with Google. Please use Continue with Google.' }
      }

      const cred = await signInEmailPassword(email, password)
      const idToken = await cred.user.getIdToken()
      const { authUser, token } = await syncWithBackend(idToken, cred.user.displayName ?? null)
      finish(authUser, token)
      return { ok: true }
    } catch (err: unknown) {
      return { ok: false, message: mapFirebaseError(err) }
    } finally {
      setLoading(false)
    }
  }, [finish])

  // ── Firebase email/password sign-up ────────────────────────────────────────
  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<AuthResult> => {
    setLoading(true)
    try {
      // Pre-check: email already registered?
      const methods = await getEmailSignInMethods(email)
      if (methods.length > 0) {
        if (methods.includes('google.com')) {
          return {
            ok: false,
            message: 'This email is already registered with Google. Please sign in using Continue with Google.',
          }
        }
        return { ok: false, message: 'This email is already registered. Please sign in instead.' }
      }

      const cred = await signUpEmailPassword(email, password, fullName)
      const idToken = await cred.user.getIdToken()
      const { authUser, token } = await syncWithBackend(idToken, fullName)
      finish(authUser, token)
      return { ok: true }
    } catch (err: unknown) {
      return { ok: false, message: mapFirebaseError(err) }
    } finally {
      setLoading(false)
    }
  }, [finish])

  // ── Google popup ───────────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    setLoading(true)
    try {
      const cred = await signInGoogle()
      const email = cred.user.email ?? ''

      // Post-popup conflict check: did email already exist with password?
      const methods = await getEmailSignInMethods(email)
      if (methods.includes('password') && !methods.includes('google.com')) {
        await signOutFirebase()
        return {
          ok: false,
          message:
            'This email is already registered with email and password. Please sign in using that method.',
        }
      }

      const idToken = await cred.user.getIdToken()
      const { authUser, token } = await syncWithBackend(idToken, cred.user.displayName ?? null)
      finish(authUser, token)
      return { ok: true }
    } catch (err: unknown) {
      return { ok: false, message: mapFirebaseError(err) }
    } finally {
      setLoading(false)
    }
  }, [finish])

  // ── Update profile (local state only) ─────────────────────────────────────
  const updateUserProfile = useCallback((patch: Partial<Pick<AuthUser, 'name' | 'photoUrl'>>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
    void signOutFirebase()
  }, [])

  const value = useMemo(
    () => ({ user, loading, updateUserProfile, login, signIn, signUp, signInWithGoogle, logout }),
    [user, loading, updateUserProfile, login, signIn, signUp, signInWithGoogle, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

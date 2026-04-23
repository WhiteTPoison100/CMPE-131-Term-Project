/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from '../types'
import { loginApi, firebaseLoginApi } from '../services/authService'
import { signInWithFirebase } from '../lib/firebase'

const STORAGE_KEY = 'tournament_os_user'
const TOKEN_KEY = 'tournament_os_token'

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>
  loginWithFirebase: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
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

  const login = useCallback(async (username: string, password: string) => {
    try {
      const { authUser, token } = await loginApi(username, password)
      setUser(authUser)
      storeSession(authUser, token)
      return { ok: true }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid credentials.'
      return { ok: false, message: msg }
    }
  }, [])

  const loginWithFirebase = useCallback(async (email: string, password: string) => {
    try {
      const idToken = await signInWithFirebase(email, password)
      const { authUser, token } = await firebaseLoginApi(idToken)
      setUser(authUser)
      storeSession(authUser, token)
      return { ok: true }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ??
        (err as { message?: string })?.message ??
        'Firebase sign-in failed.'
      return { ok: false, message: msg }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }, [])

  const value = useMemo(
    () => ({ user, login, loginWithFirebase, logout }),
    [user, login, loginWithFirebase, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

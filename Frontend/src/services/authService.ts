import { apiClient } from './apiClient'
import type { AuthUser } from '../types'

interface BackendLoginResponse {
  token: string
  username: string
  role: string
}

interface BackendSyncResponse {
  token: string
  username: string
  role: string
  email: string | null
  displayName: string | null
  firebaseProvider: string | null
}

export async function loginApi(
  username: string,
  password: string,
): Promise<{ authUser: AuthUser; token: string }> {
  const { data } = await apiClient.post<BackendLoginResponse>('/auth/login', {
    username,
    password,
  })
  return {
    authUser: {
      id: data.username,
      email: data.username,
      name: data.username,
      role: data.role as AuthUser['role'],
    },
    token: data.token,
  }
}

export async function syncWithBackend(
  idToken: string,
  displayName: string | null,
  isSignUp: boolean = false,
): Promise<{ authUser: AuthUser; token: string }> {
  const { data } = await apiClient.post<BackendSyncResponse>('/auth/sync', {
    idToken,
    displayName,
    isSignUp,
  })
  return {
    authUser: {
      id: data.username,
      email: data.email ?? data.username,
      name: data.displayName ?? data.username,
      role: data.role as AuthUser['role'],
      firebaseProvider: (data.firebaseProvider as AuthUser['firebaseProvider']) ?? undefined,
    },
    token: data.token,
  }
}

export function mapFirebaseError(err: unknown): string {
  const serverMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  if (serverMsg) return serverMsg

  const code = (err as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password. Please try again.'
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was canceled.'
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Please allow pop-ups and try again.'
    case 'auth/account-exists-with-different-credential':
      return 'This email is already registered with another sign-in method. Please use your original login method.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    default:
      return 'Authentication failed. Please try again.'
  }
}

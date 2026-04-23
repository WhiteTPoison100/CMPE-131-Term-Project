import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
)

const app = firebaseEnabled && getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const firebaseAuth = firebaseEnabled ? getAuth(app) : null

export async function signInWithFirebase(email: string, password: string): Promise<string> {
  if (!firebaseAuth) throw new Error('Firebase is not configured.')
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
  return credential.user.getIdToken()
}

import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

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

const app =
  firebaseEnabled && getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0]

export const firebaseAuth = firebaseEnabled ? getAuth(app) : null
export const firebaseStorage = firebaseEnabled ? getStorage(app) : null

/**
 * Upload a profile photo to Firebase Storage.
 * Path: profile-photos/{username}/avatar.{ext}
 * Returns the public CDN download URL.
 */
export async function uploadProfilePhoto(
  username: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!firebaseStorage) throw new Error('Firebase Storage is not configured.')
  const ext = file.name.split('.').pop() ?? 'jpg'
  const storageRef = ref(firebaseStorage, `profile-photos/${username}/avatar.${ext}`)
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type })
    task.on(
      'state_changed',
      snap => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject),
    )
  })
}

// ── sign-in methods ────────────────────────────────────────────────────────

export async function getEmailSignInMethods(email: string): Promise<string[]> {
  if (!firebaseAuth) return []
  try {
    return await fetchSignInMethodsForEmail(firebaseAuth, email)
  } catch {
    return []
  }
}

export async function signInEmailPassword(email: string, password: string) {
  if (!firebaseAuth) throw new Error('Firebase is not configured.')
  return signInWithEmailAndPassword(firebaseAuth, email, password)
}

export async function signUpEmailPassword(
  email: string,
  password: string,
  displayName: string,
) {
  if (!firebaseAuth) throw new Error('Firebase is not configured.')
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password)
  await updateProfile(cred.user, { displayName })
  return cred
}

export async function signInGoogle() {
  if (!firebaseAuth) throw new Error('Firebase is not configured.')
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(firebaseAuth, provider)
}

export async function signOutFirebase() {
  if (firebaseAuth) await firebaseSignOut(firebaseAuth)
}

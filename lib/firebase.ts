import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDgxio51xCHaAg_qNyu-zUqBuuNFLF5aF8",
  authDomain: "challengers-c3h.firebaseapp.com",
  projectId: "challengers-c3h",
  storageBucket: "challengers-c3h.firebasestorage.app",
  messagingSenderId: "657617486979",
  appId: "1:657617486979:web:e1894700c5ca1c13b0c7b6"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// Firebase Anonymous Auth — populates request.auth in Firestore
// rules so reads/writes pass auth-required checks. We use NextAuth
// (Google OAuth) for app-level identity / UI gating, but Firestore
// rules need a Firebase auth principal regardless. Anonymous auth
// is sufficient because the real access control happens at the
// React UI layer.
//
// Pages that fire one-shot getDocs reads on mount MUST await
// `firebaseAuthReady` before querying — otherwise the read can race
// the async sign-in and fail with a permission-denied error, leaving
// the page rendering empty data.

let _firebaseAuthReady: Promise<void> | null = null;

export function firebaseAuthReady(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (_firebaseAuthReady) return _firebaseAuthReady;
  _firebaseAuthReady = new Promise<void>((resolve) => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve();
        return;
      }
      // Not signed in — kick off anonymous sign-in. The next
      // onAuthStateChanged tick will resolve when it completes.
      signInAnonymously(auth).catch((err) => {
        console.error('Firebase anonymous auth failed:', err);
        unsubscribe();
        resolve(); // Resolve anyway so app doesn't hang on auth failure
      });
    });
  });
  return _firebaseAuthReady;
}

// Kick off auth as soon as this module loads in the browser.
if (typeof window !== 'undefined') {
  firebaseAuthReady();
}

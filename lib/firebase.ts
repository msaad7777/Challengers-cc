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
// rules so writes can pass auth-required checks. We use NextAuth
// (Google OAuth) for app-level identity / UI gating, but Firestore
// rules need a Firebase auth principal regardless. Anonymous auth
// is sufficient because the real access control happens at the
// React UI layer (isC3HBoard / isC3HCaptain / isC3HAdmin).
//
// Runs only in the browser. Firebase persists the anonymous UID
// across sessions in localStorage, so this is a no-op after first
// sign-in.
if (typeof window !== 'undefined') {
  const auth = getAuth(app);
  // Sign in if not already signed in
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      signInAnonymously(auth).catch((err) => {
        console.error('Firebase anonymous auth failed:', err);
      });
    }
  });
}

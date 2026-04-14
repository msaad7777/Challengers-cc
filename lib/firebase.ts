import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

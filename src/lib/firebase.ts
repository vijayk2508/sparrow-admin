import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  type User,
} from "firebase/auth";

// ============================================================
// FIREBASE — AUTHENTICATION ONLY (Google Sign-In)
// No Firestore. No Firebase Storage. Those live in Supabase.
// ============================================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

/** Opens the Google Sign-In popup and returns the Firebase user. */
export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  return credential.user;
}

/** Clears the Firebase session. */
export async function logOut(): Promise<void> {
  await signOut(firebaseAuth);
}

/** Current Firebase user (or null). */
export function getCurrentUser(): User | null {
  return firebaseAuth.currentUser;
}

/**
 * Firebase ID token for calling our backend.
 * Backend verifies it with firebase-admin — never trust a bare UID.
 */
export async function getIdToken(): Promise<string | null> {
  const user = firebaseAuth.currentUser;
  return user ? await user.getIdToken() : null;
}

/** Subscribe to Firebase auth state changes. Returns unsubscribe fn. */
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return fbOnAuthStateChanged(firebaseAuth, callback);
}

// Fast client-side pre-check only — the backend + `admins` table are the
// source of truth for authorization (role is never trusted from client).
const DEFAULT_ADMIN_EMAILS = ["sparrowclubkotdwar@gmail.com", "official.vijay.2508@gmail.com"];

export const ADMIN_EMAILS: string[] = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)
  .concat(DEFAULT_ADMIN_EMAILS);

export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
  console.log("[isAdminUser] check:", { email, normalizedEmail, ADMIN_EMAILS, isAdmin });
  return isAdmin;
}
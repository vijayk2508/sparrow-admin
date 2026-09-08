import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

// ============================================================
// FIREBASE ADMIN SDK — SERVER ONLY
// Verifies Firebase ID tokens from the admin panel.
// ============================================================

function privateKey(): string {
  const raw = process.env.FIREBASE_PRIVATE_KEY || "";
  // Handle both escaped \n and actual newlines
  if (raw.includes("\\n")) return raw.replace(/\\n/g, "\n");
  return raw;
}

function credentialsConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

let _auth: Auth | null = null;
let _initAttempted = false;

function getAdminAuth(): Auth | null {
  if (_auth) return _auth;
  if (_initAttempted) return null;
  _initAttempted = true;

  if (!credentialsConfigured()) {
    console.warn(
      "[firebase-admin] FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY not set — admin auth APIs will return 401."
    );
    return null;
  }

  try {
    const app: App = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey(),
          }),
        });
    _auth = getAuth(app);
    return _auth;
  } catch (e: any) {
    console.error("[firebase-admin] initialization failed:", e?.message);
    return null;
  }
}

export function firebaseAdminAuth(): Auth | null {
  return getAdminAuth();
}

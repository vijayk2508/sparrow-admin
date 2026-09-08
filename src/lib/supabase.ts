import type { BookingData, ContactQueryData } from "../types";

// ============================================================
// ADMIN DATA LAYER — all writes/reads go through the backend API
// (`/api/admin/db`), which verifies the Firebase ID token and uses
// the Supabase service-role key server-side. No direct anon writes.
// ============================================================

import { getIdToken } from "./firebase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function adminApi<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const token = await getIdToken();
  if (!token) throw new Error("Not authenticated — sign in first.");
  const res = await fetch(`${API_BASE}/api/admin/db`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...payload }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json.data as T;
}

/** Notifies all admin hooks to refetch after a mutation. */
function notifyDataChanged() {
  window.dispatchEvent(new Event("admin:data-changed"));
}

// ---- path → Postgres table mapping ------------------------------
const TABLES: Record<string, string> = {
  membershipPlans: "membership_plans",
  contactQueries: "contact_queries",
  siteSettings: "site_settings",
};
const tableFor = (path: string) => TABLES[path] ?? path;

// DB stores display order in `sort_order`; app code uses `order`.
function rowToDoc<T>(row: any): T {
  if (row && Object.prototype.hasOwnProperty.call(row, "sort_order")) {
    const { sort_order, created_at, ...rest } = row;
    return { ...rest, order: sort_order ?? undefined } as T;
  }
  return row as T;
}

function docToRow(doc: Record<string, any>): Record<string, any> {
  const { order, ...rest } = doc || {};
  const row: Record<string, any> = { ...rest };
  if (order !== undefined && order !== null) row.sort_order = order;
  for (const k of Object.keys(row)) {
    if (row[k] === undefined) delete row[k];
  }
  return row;
}

// ---- Admin table reads (via backend API) ---------------------------

export async function fetchCollection<T extends { id?: string } = any>(path: string): Promise<T[]> {
  const rows = await adminApi<any[]>("list", { path });
  return (rows || []).map((r) => rowToDoc<T>(r));
}

/** Upsert an item; generates a `doc-…` id when missing. Returns the id. */
export async function saveDocument(
  path: string,
  data: Record<string, any> & { id?: string }
): Promise<string> {
  const result = await adminApi<{ id: string }>("save", { path, data });
  notifyDataChanged();
  return result.id;
}

export async function updateDocument(path: string, id: string, patch: Record<string, any>): Promise<void> {
  await adminApi("update", { path, id, data: patch });
  notifyDataChanged();
}

export async function deleteDocument(path: string, id: string): Promise<void> {
  await adminApi("delete", { path, id });
  notifyDataChanged();
}

// ---- Site settings (single row, id = 'settings') -------------------

export async function fetchSiteSettings(): Promise<any | null> {
  const rows = await adminApi<any[]>("list", { path: "siteSettings" });
  return rows?.[0] ?? null;
}

export async function saveSiteSettings(next: Record<string, any>): Promise<void> {
  await adminApi("save", { path: "siteSettings", data: { id: "settings", ...next } });
  notifyDataChanged();
}

// ---- Image uploads (backend API — the server derives the uid) ------

export async function uploadImage(file: File, folder: string): Promise<string> {
  const token = await getIdToken();
  if (!token) throw new Error("Not authenticated — sign in first.");

  const dataBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, dataBase64, folder }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || "Upload failed");
  return json.data.publicUrl as string;
}

// ---- Auth helpers (Firebase — see ./firebase.ts) ---------------------
// signInWithGoogle / logOut / onAuthStateChanged / ADMIN_EMAILS /
// isAdminUser now live in ./firebase.ts (Firebase Auth only).

/**
 * Verifies the Firebase ID token with the backend and returns the
 * application user (with DB-derived role). Call this after Firebase
 * sign-in to confirm authorization — never trust a client-side role.
 */
export async function syncCurrentUser(): Promise<{
  id: string;
  firebaseUid: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
} | null> {
  const token = await getIdToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/api/auth/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) return null;
  return json.data;
}

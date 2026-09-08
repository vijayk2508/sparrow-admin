import { firebaseAdminAuth } from "./firebase-admin";
import { supabaseAdmin } from "./supabase";

// ============================================================
// AUTH HELPERS — verify Firebase ID token, sync Supabase user
// The Firebase ID token is the ONLY source of identity.
// ============================================================

export interface VerifiedIdentity {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

export interface AppUser {
  id: string;
  firebaseUid: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
}

export async function verifyFirebaseToken(req: any): Promise<VerifiedIdentity | null> {
  const adminAuth = firebaseAdminAuth();
  if (!adminAuth) {
    console.warn("[auth] Firebase Admin not configured — cannot verify token");
    return null;
  }
  const header = req.headers?.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null,
      picture: decoded.picture || null,
    };
  } catch (e) {
    console.error("[auth] Firebase token verification failed");
    return null;
  }
}

export async function syncUser(identity: VerifiedIdentity): Promise<AppUser> {
  const { uid, email, name, picture } = identity;
  const safeEmail = email || `${uid}@users.noreply.sparrow.local`;

  console.log(`[syncUser] Starting sync for uid=${uid}, email=${email}`);

  let role: "user" | "admin" = "user";
  if (email) {
    console.log(`[syncUser] Checking admins table for email=${email}`);
    try {
      const { data: adminRow, error: adminError } = await supabaseAdmin
        .from("admins")
        .select("email")
        .ilike("email", email)
        .maybeSingle();
      if (adminError) {
        console.error(`[syncUser] Admins query ERROR:`, adminError);
        throw new Error(`Admins query failed: ${adminError.message}`);
      }
      console.log(`[syncUser] Admins query result:`, adminRow);
      if (adminRow) role = "admin";
    } catch (e: any) {
      console.error(`[syncUser] Admins query EXCEPTION:`, e?.message, e?.stack);
      throw e;
    }
  }

  console.log(`[syncUser] Checking users table for firebase_uid=${uid}`);
  try {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("firebase_uid", uid)
      .maybeSingle();
    if (existingError) {
      console.error(`[syncUser] Users query ERROR:`, existingError);
      throw new Error(`Users query failed: ${existingError.message}`);
    }
    console.log(`[syncUser] Existing user:`, existing);

    if (!existing) {
      console.log(`[syncUser] Creating new user...`);
      const { data: created, error } = await supabaseAdmin
        .from("users")
        .insert({
          firebase_uid: uid,
          email: safeEmail,
          full_name: name,
          avatar_url: picture,
          role,
        })
        .select("*")
        .single();
      if (error) {
        console.error(`[syncUser] Insert ERROR:`, error);
        throw new Error(`User sync failed: ${error.message}`);
      }
      console.log(`[syncUser] User created:`, created?.id);
      // If insert returns null (204 No Content), fetch the user we just created
      if (!created) {
        const { data: fetched } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("firebase_uid", uid)
          .single();
        return toAppUser(fetched);
      }
      return toAppUser(created);
    }

    const patch: Record<string, any> = { role, updated_at: new Date().toISOString() };
    if (name && name !== existing.full_name) patch.full_name = name;
    if (picture && picture !== existing.avatar_url) patch.avatar_url = picture;
    if (email && email !== existing.email) patch.email = email;

    console.log(`[syncUser] Updating user with patch:`, patch);
    const { data: updated, error } = await supabaseAdmin
      .from("users")
      .update(patch)
      .eq("firebase_uid", uid)
      .select("*")
      .single();
    if (error) {
      console.error(`[syncUser] Update ERROR:`, error);
      throw new Error(`User sync failed: ${error.message}`);
    }
    console.log(`[syncUser] User updated:`, updated?.id);
    // If update returns null (204 No Content), use existing data with patch applied
    return toAppUser(updated || { ...existing, ...patch });
  } catch (e: any) {
    console.error(`[syncUser] EXCEPTION:`, e?.message, e?.stack);
    throw e;
  }
}

function toAppUser(row: any): AppUser {
  return {
    id: row.id,
    firebaseUid: row.firebase_uid,
    email: row.email,
    fullName: row.full_name ?? null,
    avatarUrl: row.avatar_url ?? null,
    role: row.role === "admin" ? "admin" : "user",
  };
}

export function unauthorized(res: any, message = "Authentication required") {
  return res.status(401).json({ success: false, message });
}

export function forbidden(res: any, message = "Admin access required") {
  return res.status(403).json({ success: false, message });
}

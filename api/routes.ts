import { verifyFirebaseToken, syncUser, unauthorized, forbidden, type AppUser } from "./auth";
import { supabaseAdmin, tableFor, rowToDoc, docToRow, ALLOWED_TABLES } from "./supabase";
import { seedInitialData } from "./seed";

// ============================================================
// API ROUTE HANDLERS — self-contained in the admin panel.
// Every handler verifies the Firebase ID token itself.
// ============================================================

const json = (res: any, status: number, body: any) => res.status(status).json(body);

// ---- POST /api/auth/sync --------------------------------------------
export async function handleSync(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed" });
  const identity = await verifyFirebaseToken(req);
  if (!identity) {
    console.warn("[sync] token verification failed - invalid or expired token");
    return unauthorized(res);
  }
  try {
    const user = await syncUser(identity);
    return json(res, 200, { success: true, data: user });
  } catch (e: any) {
    console.error("[sync] failed:", e?.message, e?.stack);
    return json(res, 500, { success: false, message: e?.message || "User sync failed" });
  }
}

// ---- GET/PATCH /api/me ------------------------------------------------
export async function handleMe(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "PATCH") {
    return json(res, 405, { success: false, message: "Method not allowed" });
  }
  const identity = await verifyFirebaseToken(req);
  if (!identity) return unauthorized(res);
  try {
    const user = await syncUser(identity);
    if (req.method === "GET") return json(res, 200, { success: true, data: user });
    const body = req.body || {};
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (typeof body.full_name === "string") patch.full_name = body.full_name.slice(0, 200);
    if (typeof body.avatar_url === "string") patch.avatar_url = body.avatar_url.slice(0, 1000);
    const { data, error } = await supabaseAdmin
      .from("users").update(patch).eq("firebase_uid", identity.uid).select("*").single();
    if (error) return json(res, 500, { success: false, message: "Profile update failed" });
    return json(res, 200, {
      success: true,
      data: {
        id: data.id, firebaseUid: data.firebase_uid, email: data.email,
        fullName: data.full_name ?? null, avatarUrl: data.avatar_url ?? null,
        role: data.role === "admin" ? "admin" : "user",
      } as AppUser,
    });
  } catch (e: any) {
    console.error("[me] failed:", e?.message);
    return json(res, 500, { success: false, message: "Request failed" });
  }
}

// ---- POST /api/upload ---------------------------------------------------
export async function handleUpload(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed" });
  const identity = await verifyFirebaseToken(req);
  if (!identity) return unauthorized(res);

  try {
    const { fileName, contentType, dataBase64, folder } = req.body || {};
    if (!dataBase64 || !fileName) {
      return json(res, 400, { success: false, message: "fileName and dataBase64 are required" });
    }
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `uploads/users/${identity.uid}/${folder || "misc"}/${Date.now()}-${safeName}`;
    const buffer = Buffer.from(dataBase64, "base64");
    const { error: uploadErr } = await supabaseAdmin.storage
      .from("uploads").upload(path, buffer, { contentType: contentType || "application/octet-stream", upsert: true });
    if (uploadErr) {
      console.error("[upload] storage error:", uploadErr.message);
      return json(res, 500, { success: false, message: "Upload failed" });
    }
    const { data } = supabaseAdmin.storage.from("uploads").getPublicUrl(path);
    return json(res, 200, { success: true, data: { path, publicUrl: data.publicUrl } });
  } catch (e: any) {
    console.error("[upload] failed:", e?.message);
    return json(res, 500, { success: false, message: "Upload failed" });
  }
}

// ---- POST /api/admin/db ------------------------------------------------
export async function handleAdminDb(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed" });
  const identity = await verifyFirebaseToken(req);
  if (!identity) {
    console.warn("[admin-db] token verification failed - invalid or expired token");
    return unauthorized(res);
  }
  let admin: AppUser;
  try {
    const user = await syncUser(identity);
    if (user.role !== "admin") {
      console.warn(`[admin-db] forbidden - user ${user.email} is not an admin`);
      return forbidden(res);
    }
    admin = user;
  } catch (e: any) {
    console.error("[admin-db] auth failed:", e?.message, e?.stack);
    return json(res, 500, { success: false, message: e?.message || "Authentication check failed" });
  }
  void admin;

  try {
    const body = req.body || {};
    const action = body.action;
    switch (action) {
      case "list": {
        const table = tableFor(body.path);
        const { data, error } = await supabaseAdmin
          .from(table).select("*").order("sort_order", { ascending: true, nullsFirst: false });
        if (error) {
          // Fallback for tables without sort_order column
          const { data: data2, error: error2 } = await supabaseAdmin
            .from(table).select("*").order("created_at", { ascending: true });
          if (error2) {
            // Final fallback: no ordering (for tables like site_settings)
            const { data: data3, error: error3 } = await supabaseAdmin
              .from(table).select("*");
            if (error3) throw new Error(error3.message);
            return json(res, 200, { success: true, data: (data3 || []).map((r) => rowToDoc(r)) });
          }
          return json(res, 200, { success: true, data: (data2 || []).map((r) => rowToDoc(r)) });
        }
        return json(res, 200, { success: true, data: (data || []).map((r) => rowToDoc(r)) });
      }
      case "save": {
        const table = tableFor(body.path);
        const data = body.data || {};
        const id = data.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { error } = await supabaseAdmin.from(table).upsert({ ...docToRow(data), id });
        if (error) throw new Error(error.message);
        return json(res, 200, { success: true, data: { id } });
      }
      case "update": {
        const table = tableFor(body.path);
        const { error } = await supabaseAdmin.from(table).update(docToRow(body.data || {})).eq("id", body.id);
        if (error) throw new Error(error.message);
        return json(res, 200, { success: true });
      }
      case "delete": {
        const table = tableFor(body.path);
        const { error } = await supabaseAdmin.from(table).delete().eq("id", body.id);
        if (error) throw new Error(error.message);
        return json(res, 200, { success: true });
      }
      case "seed": {
        const result = await seedInitialData({ force: body.force === true });
        return json(res, 200, { success: result.ok, data: result.counts, message: result.message });
      }
      default:
        return json(res, 400, { success: false, message: `Unknown action: ${action}` });
    }
  } catch (e: any) {
    console.error("[admin-db] failed:", e?.message);
    return json(res, 500, { success: false, message: e?.message || "Server error" });
  }
}
void ALLOWED_TABLES;

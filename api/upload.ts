// Self-contained Vercel serverless handler (NO cross-file deps).
// Mirrors the sparrow-training-club success pattern: fetch-only Supabase REST.
import { createSign } from "crypto";
function cors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
}
function sb() {
  var base = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
  var key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
  if (!base) throw new Error("Supabase URL is not configured");
  if (!key) throw new Error("Supabase key is not configured (SERVICE_ROLE_KEY / ANON_KEY missing)");
  return { base: base, key: key };
}
function pk() {
  var raw = process.env.FIREBASE_PRIVATE_KEY || "";
  if (raw.indexOf("\\n") !== -1) raw = raw.split("\\n").join("\n");
  return raw;
}
function b64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function signJwt(payload, privateKeyPem) {
  var header = { alg: "RS256", typ: "JWT" };
  var h = b64url(JSON.stringify(header));
  var p = b64url(JSON.stringify(payload));
  var signer = createSign("RSA-SHA256");
  signer.update(h + "." + p);
  var sig = signer.sign(privateKeyPem, "base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return h + "." + p + "." + sig;
}
var _googleToken: { token: string; exp: number } | null = null;
async function googleAccessToken() {
  if (_googleToken && _googleToken.exp > Date.now() + 60000) return _googleToken.token;
  var email = (process.env.FIREBASE_CLIENT_EMAIL || "").trim();
  var key = pk();
  if (!email || !key) throw new Error("Firebase Admin not configured (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY missing)");
  var now = Math.floor(Date.now() / 1000);
  var jwt = signJwt({ iss: email, scope: "https://www.googleapis.com/auth/identitytoolkit", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }, key);
  var r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }).toString() });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok || !j.access_token) throw new Error("Google OAuth failed: " + (j.error_description || j.error || r.status));
  _googleToken = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return _googleToken.token;
}
async function verifyFirebaseToken(req: any): Promise<{ uid: string; email: string | null; name: string | null; picture: string | null } | null> {
  var header = (req.headers && req.headers.authorization) || "";
  var token = header.indexOf("Bearer ") === 0 ? header.slice(7).trim() : "";
  if (!token) return null;
  var projectId = (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "").trim();
  if (!projectId) return null;
  try {
    var accessToken = await googleAccessToken();
    var url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=";
    var r = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken }, body: JSON.stringify({ idToken: token }) });
    var j = await r.json().catch(function () { return {}; });
    void url;
    if (!r.ok || !j.users || !j.users[0]) return null;
    var u = j.users[0];
    return { uid: u.localId, email: (u.email || null), name: (u.displayName || null), picture: (u.photoUrl || null) };
  } catch (e) { return null; }
}
async function sbRest(path: string, opts?: { method?: string; prefer?: string; body?: any }): Promise<any> {
  var c = sb();
  var o: { method?: string; prefer?: string; body?: any } = opts || {};
  var url = c.base + "/rest/v1/" + path;
  var headers: Record<string, string> = { apikey: c.key, Authorization: "Bearer " + c.key, "Content-Type": "application/json" };
  if (o.prefer) headers.Prefer = o.prefer;
  var r = await fetch(url, { method: o.method || "GET", headers: headers, body: o.body ? JSON.stringify(o.body) : undefined });
  var text = await r.text().catch(function () { return ""; });
  var json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
  if (!r.ok) throw new Error("Supabase error " + r.status + ": " + String(text).slice(0, 300));
  return json;
}

var TABLES = { membershipPlans: "membership_plans", contactQueries: "contact_queries", siteSettings: "site_settings" };
var ALLOWED_TABLES = ["coaches","programs","schedule","membershipPlans","testimonials","gallery","events","siteSettings","bookings","payments","memberships","contactQueries"];
function tableFor(path) {
  if (ALLOWED_TABLES.indexOf(path) === -1) throw new Error("Table not allowed: " + path);
  return TABLES[path] || path;
}
function rowToDoc(row) {
  if (row && Object.prototype.hasOwnProperty.call(row, "sort_order")) {
    var r = Object.assign({}, row); var s = r.sort_order; delete r.sort_order; delete r.created_at;
    r.order = (s === null || s === undefined) ? undefined : s; return r;
  }
  return row;
}
function docToRow(doc) {
  var d = Object.assign({}, (doc || {})); var order = d.order; delete d.order;
  var row = Object.assign({}, d);
  if (order !== undefined && order !== null) row.sort_order = order;
  for (var k of Object.keys(row)) { if (row[k] === undefined) delete row[k]; }
  return row;
}
async function syncUser(identity: { uid: string; email: string | null; name: string | null; picture: string | null }): Promise<{ id: string; firebaseUid: string; email: string; fullName: string | null; avatarUrl: string | null; role: string }> {
  var uid = identity.uid;
  var email = identity.email;
  var name = identity.name;
  var picture = identity.picture;
  var safeEmail = email || (uid + "@users.noreply.sparrow.local");
  var role = "user";
  if (email) {
    var a = await sbRest("admins?" + new URLSearchParams({ select: "email", email: "ilike." + email }).toString());
    if (a && a[0]) role = "admin";
  }
  var ex = await sbRest("users?" + new URLSearchParams({ select: "*", firebase_uid: "eq." + uid }).toString());
  var existing = (ex && ex[0]) || null;
  if (!existing) {
    var created = await sbRest("users", { method: "POST", prefer: "return=representation", body: { firebase_uid: uid, email: safeEmail, full_name: name, avatar_url: picture, role: role } });
    var row = (created && created[0]) || null;
    if (!row) {
      var f = await sbRest("users?" + new URLSearchParams({ select: "*", firebase_uid: "eq." + uid }).toString());
      row = (f && f[0]) || null;
    }
    return { id: row.id, firebaseUid: row.firebase_uid, email: row.email, fullName: (row.full_name === undefined ? null : row.full_name), avatarUrl: (row.avatar_url === undefined ? null : row.avatar_url), role: (row.role === "admin" ? "admin" : "user") };
  }
  var patch: { role: string; updated_at: string; full_name?: string; avatar_url?: string; email?: string } = { role: role, updated_at: new Date().toISOString() };
  if (name && name !== existing.full_name) patch.full_name = name;
  if (picture && picture !== existing.avatar_url) patch.avatar_url = picture;
  if (email && email !== existing.email) patch.email = email;
  var up = await sbRest("users?" + new URLSearchParams({ firebase_uid: "eq." + uid }).toString(), { method: "PATCH", prefer: "return=representation", body: patch });
  var fin = (up && up[0]) || Object.assign({}, existing, patch);
  return { id: fin.id, firebaseUid: fin.firebase_uid, email: fin.email, fullName: (fin.full_name === undefined ? null : fin.full_name), avatarUrl: (fin.avatar_url === undefined ? null : fin.avatar_url), role: (fin.role === "admin" ? "admin" : "user") };
}

export default async function handler(req: any, res: any) {
  cors(req, res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ success: false, message: "Method not allowed" }); return; }
  var identity = await verifyFirebaseToken(req);
  if (!identity) { res.status(401).json({ success: false, message: "Authentication required" }); return; }
  try {
    var body = req.body || {};
    var fileName = body.fileName; var contentType = body.contentType; var dataBase64 = body.dataBase64; var folder = body.folder;
    if (!dataBase64 || !fileName) { res.status(400).json({ success: false, message: "fileName and dataBase64 are required" }); return; }
    var safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    var objectPath = "users/" + identity.uid + "/" + (folder || "misc") + "/" + Date.now() + "-" + safeName;
    var c = sb();
    var buf = Buffer.from(dataBase64, "base64");
    var upUrl = c.base + "/storage/v1/object/uploads/" + objectPath.split("/").map(function (s: string) { return encodeURIComponent(s); }).join("/");
    var up = await fetch(upUrl, { method: "POST", headers: { apikey: c.key, Authorization: "Bearer " + c.key, "Content-Type": (contentType || "application/octet-stream"), "x-upsert": "true" }, body: buf as any });
    if (!up.ok) { var t = await up.text().catch(function () { return ""; }); throw new Error("Storage upload failed " + up.status + ": " + String(t).slice(0, 200)); }
    var publicUrl = c.base + "/storage/v1/object/public/uploads/" + objectPath.split("/").map(function (s: string) { return encodeURIComponent(s); }).join("/");
    res.status(200).json({ success: true, data: { path: objectPath, publicUrl: publicUrl } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: "Upload failed" });
  }
}

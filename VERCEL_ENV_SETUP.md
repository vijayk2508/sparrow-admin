# Vercel Environment Variables Setup

This document contains all the environment variables needed for the sparrow-admin project on Vercel.
(Mirrors sparrow-training-club — same Supabase + Firebase project, plus the admin's own Vercel project.)

## Project: sparrow-admin

Standalone admin panel for **Sparrow Training Club** — lives in its own app next to the public site (`../sparrow-training-club`). Manages the same **Supabase** project, so every edit here appears on the live site instantly (realtime).

## Backend on Vercel (new — same pattern as sparrow-training-club)

`api/` holds **self-contained** serverless functions (no cross-file imports, fetch-only Supabase REST):

| Route | File | Purpose |
|---|---|---|
| `GET /api/health` | `api/health.ts` | health check |
| `POST /api/auth/sync` | `api/auth-sync.ts` | verify Firebase ID token → sync `users` row |
| `GET/PATCH /api/me` | `api/me.ts` | current user profile (same verify + sync pattern) |
| `POST /api/upload` | `api/upload.ts` | verified image upload → Supabase Storage `uploads` bucket |
| `POST /api/admin/db` | `api/admin-db.ts` | verified admin CRUD (`list/save/update/delete`) + `seed` (embedded `gymData.ts` snapshot) |

`vercel.json` maps each `/api/*` route explicitly to its file (same explicit-routes success pattern as sparrow-training-club). The old Express server was moved to `server-local/` for local dev only (`npm run dev:api`).

Token verification **must stay server-side**: each function decodes the Firebase JWT (checks `aud` = `FIREBASE_PROJECT_ID`, `exp`), then revocation-checks it via `accounts:lookup` using the **`VITE_FIREBASE_API_KEY`** (public key, safe server-side). Supabase access uses `SUPABASE_SERVICE_ROLE_KEY` (falls back to anon key) — never `VITE_`-expose the service-role key.

## How to Add Environment Variables

### Option 1: Using Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select the "sparrow-admin" project
3. Go to Settings → Environment Variables
4. Add each variable below (Production, Preview, Development)

### Option 2: Using Vercel CLI
Run these commands from the project directory (values redacted here — copy real values from your local `.env`, same project as sparrow-training-club):

```bash
cd /Users/vijay/Downloads/sparrow-training-club/sparrow-admin

# Frontend Variables (VITE_ — exposed to the browser)
vc env add VITE_SUPABASE_URL --yes
vc env add VITE_SUPABASE_ANON_KEY --yes
vc env add VITE_FIREBASE_API_KEY --yes
vc env add VITE_FIREBASE_AUTH_DOMAIN --yes
vc env add VITE_FIREBASE_PROJECT_ID --yes
vc env add VITE_FIREBASE_STORAGE_BUCKET --yes
vc env add VITE_FIREBASE_MESSAGING_SENDER_ID --yes
vc env add VITE_FIREBASE_APP_ID --yes

# Admin allowlist (optional extra emails, comma-separated)
vc env add VITE_ADMIN_EMAILS --yes

# Backend Variables (server-side only — NOT prefixed with VITE_ except the public API key lookup)
vc env add SUPABASE_SERVICE_ROLE_KEY --yes
vc env add FIREBASE_PROJECT_ID --yes
vc env add FIREBASE_CLIENT_EMAIL --yes
vc env add FIREBASE_PRIVATE_KEY --yes
```

> The functions only *require* `VITE_FIREBASE_API_KEY` + `FIREBASE_PROJECT_ID` for auth, and `SUPABASE_URL`/`VITE_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` for data. `FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY` are kept for parity/future use.

## Environment Variables List

### Frontend Variables (VITE_ - exposed to client-side)

| Variable | Environment |
|----------|-------------|
| VITE_SUPABASE_URL | Production, Preview, Development |
| VITE_SUPABASE_ANON_KEY | Production, Preview, Development |
| VITE_FIREBASE_API_KEY | Production, Preview, Development |
| VITE_FIREBASE_AUTH_DOMAIN | Production, Preview, Development |
| VITE_FIREBASE_PROJECT_ID | Production, Preview, Development |
| VITE_FIREBASE_STORAGE_BUCKET | Production, Preview, Development |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Production, Preview, Development |
| VITE_FIREBASE_APP_ID | Production, Preview, Development |
| VITE_ADMIN_EMAILS | Production, Preview, Development |
| VITE_API_BASE_URL | Production, Preview, Development (empty = same origin) |

### Backend Variables (Server-side only - NOT prefixed with VITE_)

| Variable | Environment |
|----------|-------------|
| SUPABASE_SERVICE_ROLE_KEY | Production, Preview, Development |
| FIREBASE_PROJECT_ID | Production, Preview, Development |
| FIREBASE_CLIENT_EMAIL | Production, Preview, Development |
| FIREBASE_PRIVATE_KEY | Production, Preview, Development |

## Important Notes

1. **VITE_ prefix**: Variables with VITE_ prefix are exposed to the browser. Do NOT put sensitive keys here.
2. **SUPABASE_SERVICE_ROLE_KEY**: This is a powerful key with admin access. Never expose it to the client-side.
3. **FIREBASE_PRIVATE_KEY**: This is your Firebase Admin SDK private key. Keep it secure and only on the server.
4. After adding environment variables, you may need to redeploy for them to take effect.
# Sparrow Admin

Standalone admin panel for **Sparrow Training Club** — lives in its own app next to the public site (`../sparrow-training-club`). Manages the same **Supabase** project, so every edit here appears on the live site instantly (realtime).

## Run

```bash
npm install
npm run dev     # http://localhost:3001 (public site runs on 3000)
```

Other scripts: `npm run build` (production bundle in `dist/`), `npm run lint` (tsc), `npm run preview`, `npm run dev:api` (local Express API on :3002 via `server-local/server.ts`).

## Deploy (Vercel — same success pattern as sparrow-training-club)

**Live:** https://sparrow-admin.vercel.app (Vercel project `sparrow-admin`, branch `master`).

Vercel-ready (`vercel.json` builds with `vite build`, serves `dist/`). The backend is **serverless** — each `/api/*` route maps explicitly to a self-contained file in `api/` (no cross-file imports, fetch-only Supabase REST, same pattern that fixed sparrow-training-club):

| Route | File |
|---|---|
| `GET /api/health` | `api/health.ts` |
| `POST /api/auth/sync` | `api/auth-sync.ts` |
| `GET/PATCH /api/me` | `api/me.ts` |
| `POST /api/upload` | `api/upload.ts` |
| `POST /api/admin/db` | `api/admin-db.ts` |

Env vars on Vercel: see `VERCEL_ENV_SETUP.md` (same Supabase + Firebase project as the public site) — all 15 vars are set for production/preview/development, and the flow is verified end-to-end. Remember to redeploy (`vercel --prod`) after any env change.

> Pitfall: `vercel env add NAME --yes` **without `--value`** creates an empty variable; the build passes but the app 401s. Always pass `--value` and check with `vercel env ls` / `vercel env pull`.

## One-time Supabase setup

1. Create a project at https://supabase.com (or reuse the site's — they share one).
2. SQL Editor → paste `../sparrow-training-club/supabase/schema.sql` → Run. This creates all tables, RLS policies, the `admins` table, the `uploads` storage bucket and realtime publications.
3. Add admin emails to the `admins` table (that is the server-side source of truth).
4. Firebase Console → Authentication → Settings → Authorized domains → add `localhost` and `sparrow-admin.vercel.app` (Google Sign-In popup is blocked otherwise).
5. Copy Project URL + anon key + service-role key into `.env` (see `.env.example`).

## What's inside

- **Login** — Google Sign-In via **Firebase Auth** (`src/lib/firebase.ts`), gated by an email whitelist; server-side truth is the Supabase `admins` table
- **Dashboard** — content stats + one-click **Seed Initial Data** (calls `POST /api/admin/db {action:"seed"}`, which migrates the embedded `src/data/gymData.ts` snapshot into Supabase; idempotent, with a Force toggle)
- **CRUD managers** — Site Settings (hero, stats, why-choose-us), Coaches, Programs, Schedule, Membership Plans, Testimonials, Gallery, Events — with Supabase Storage image uploads
- **Read-only viewers** — Bookings, Payments, Contact Queries

## Admin access

- **Server-side:** the `admins` table + RLS policies (`is_admin()`) — add emails via SQL editor.
- **Client-side:** `src/lib/supabase.ts` → `DEFAULT_ADMIN_EMAILS` + `VITE_ADMIN_EMAILS` env var.

Defaults: `sparrowclubkotdwar@gmail.com`, `official.vijay.2508@gmail.com`.

## Notes

- Image uploads go to the public `uploads` bucket (server-enforced path `users/{firebase_uid}/...`); only admins can write (storage RLS).
- Deploy as its own Vercel/Netlify project (build: `npm run build`, output: `dist/`, SPA). `index.html` already has `robots: noindex`.

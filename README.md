# Sparrow Admin

Standalone admin panel for **Sparrow Training Club** — lives in its own app next to the public site (`../sparrow-training-club`). Manages the same **Supabase** project, so every edit here appears on the live site instantly (realtime).

## Run

```bash
npm install
npm run dev     # http://localhost:3001 (public site runs on 3000)
```

Other scripts: `npm run build` (production bundle in `dist/`), `npm run lint` (tsc), `npm run preview`, `npm run dev:api` (local Express API on :3002 via `server-local/server.ts`).

## Deploy (Vercel — same success pattern as sparrow-training-club)

Vercel-ready (`vercel.json` builds with `vite build`, serves `dist/`). The backend is **serverless** — each `/api/*` route maps explicitly to a self-contained file in `api/` (no cross-file imports, fetch-only Supabase REST, same pattern that fixed sparrow-training-club):

| Route | File |
|---|---|
| `GET /api/health` | `api/health.ts` |
| `POST /api/auth/sync` | `api/auth-sync.ts` |
| `GET/PATCH /api/me` | `api/me.ts` |
| `POST /api/upload` | `api/upload.ts` |
| `POST /api/admin/db` | `api/admin-db.ts` |

Env vars on Vercel: see `VERCEL_ENV_SETUP.md` (same Supabase + Firebase project as the public site).

## One-time Supabase setup

1. Create a project at https://supabase.com (if you don't have one).
2. SQL Editor → paste `../sparrow-training-club/supabase/schema.sql` → Run. This creates all tables, RLS policies, the `admins` table, the `uploads` storage bucket and realtime publications.
3. Authentication → Providers → enable **Google**; add your dev (`http://localhost:3001`) and deployed URLs under Authentication → URL Configuration → Redirect URLs.
4. Copy Project URL + anon key into `.env` (see `.env.example`).

## What's inside

- **Login** — Google OAuth via Supabase, gated by an email whitelist
- **Dashboard** — content stats + one-click **Seed Initial Data** (migrates `src/data/gymData.ts` into Supabase)
- **CRUD managers** — Site Settings (hero, stats, why-choose-us), Coaches, Programs, Schedule, Membership Plans, Testimonials, Gallery, Events — with Supabase Storage image uploads
- **Read-only viewers** — Bookings, Payments, Contact Queries

## Admin access

- **Server-side:** the `admins` table + RLS policies (`is_admin()`) — add emails via SQL editor.
- **Client-side:** `src/lib/supabase.ts` → `DEFAULT_ADMIN_EMAILS` + `VITE_ADMIN_EMAILS` env var.

Defaults: `sparrowclubkotdwar@gmail.com`, `official.vijay.2508@gmail.com`.

## Notes

- Image uploads go to the public `uploads` bucket (server-enforced path `users/{firebase_uid}/...`); only admins can write (storage RLS).
- Deploy as its own Vercel/Netlify project (build: `npm run build`, output: `dist/`, SPA). `index.html` already has `robots: noindex`.

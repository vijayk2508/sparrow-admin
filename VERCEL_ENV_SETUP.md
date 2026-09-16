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

## Deployed project (live)

| | |
|---|---|
| Vercel project | `sparrow-admin` (team `vijayk2508s-projects`) |
| Production URL | https://sparrow-admin.vercel.app |
| Repo / branch | `github.com/vijayk2508/sparrow-admin` → `master` |
| Root directory | repo root (this repo is admin-only) |
| Build | `vite build` → `dist` |

### Verified end-to-end (production)

| Check | Result |
|---|---|
| `GET /api/health` | `200 {"status":"ok","app":"Sparrow Admin API"}` |
| `POST /api/auth/sync` (real Firebase ID token) | `200 success:true`, `role:"admin"` |
| `GET /api/me` | `200 success:true` |
| `POST /api/admin/db {action:"list",path:"coaches"}` | `200`, 4 rows |
| `POST /api/admin/db {action:"seed"}` | `200`, idempotent → `"Nothing seeded — all tables already have data."` |
| `POST /api/upload` (PNG) | `200`, uploaded to `uploads/users/{uid}/...`, public URL returns `200 image/png` |
| Protected routes without a token | `401` (auth is enforced) |

## How to Add Environment Variables

### Option 1: Using Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select the "sparrow-admin" project
3. Go to Settings → Environment Variables
4. Add each variable below (Production, Preview, Development)

### Option 2: Using Vercel CLI

⚠️ **Two pitfalls (both hit once already):**

1. `vercel env add NAME --yes` **without** `--value` creates the variable with an **empty value** — the build
   still succeeds, but the deployed bundle ends up with `apiKey:""` and every `/api/*` call 401s.
   Always pass `--value` (or pipe the value on stdin).
2. This CLI version accepts **one environment per command**
   (`vercel env add <name> <production|preview|development> [gitbranch]`). Passing
   `production preview development` fails with *"Invalid number of arguments"*, and omitting the
   environment entirely stops on an interactive prompt. Loop over the three targets instead.

```bash
cd /Users/vijay/Downloads/sparrow-training-club/sparrow-admin

set -a; . ./.env; set +a          # load real values from your local .env

add() {                            # add <NAME> <VALUE> [extra flags...]
  NAME="$1"; VAL="$2"; shift 2
  for ENV in production preview development; do
    vercel env add "$NAME" "$ENV" --value "$VAL" --yes "$@" >/dev/null \
      && echo "OK   $NAME -> $ENV" || echo "FAIL $NAME -> $ENV"
  done
}

# Frontend (VITE_ — exposed to the browser)
add VITE_SUPABASE_URL              "$VITE_SUPABASE_URL"
add VITE_SUPABASE_ANON_KEY         "$VITE_SUPABASE_ANON_KEY"
add VITE_FIREBASE_API_KEY          "$VITE_FIREBASE_API_KEY"
add VITE_FIREBASE_AUTH_DOMAIN      "$VITE_FIREBASE_AUTH_DOMAIN"
add VITE_FIREBASE_PROJECT_ID       "$VITE_FIREBASE_PROJECT_ID"
add VITE_FIREBASE_STORAGE_BUCKET   "$VITE_FIREBASE_STORAGE_BUCKET"
add VITE_FIREBASE_MESSAGING_SENDER_ID "$VITE_FIREBASE_MESSAGING_SENDER_ID"
add VITE_FIREBASE_APP_ID           "$VITE_FIREBASE_APP_ID"
add VITE_ADMIN_EMAILS              "sparrowclubkotdwar@gmail.com,official.vijay.2508@gmail.com"
add VITE_API_BASE_URL              ""          # empty = same origin
add APP_URL                        "https://sparrow-admin.vercel.app"

# Backend (server-only). Production/Preview are sensitive by default.
add SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY"
add FIREBASE_PROJECT_ID       "$FIREBASE_PROJECT_ID"
add FIREBASE_CLIENT_EMAIL     "$FIREBASE_CLIENT_EMAIL"
add FIREBASE_PRIVATE_KEY      "$(printf '%s' "$FIREBASE_PRIVATE_KEY" | sed 's/\\n/\n/g')"
```

Notes:

- `--sensitive` is the **default** for Production and Preview, so secrets are hidden without extra flags;
  passing it explicitly **only applies to a single target** and *fails server-side* when the target is
  `development`. Add secrets per-environment with `--sensitive` where you want it, or use `--no-sensitive`
  if you need to read the value back.
- The PEM must contain **real newlines** — the `sed 's/\\n/\n/g'` above converts the single-line `\n`
  form used in `.env` files. A corrupted key makes `/api/auth/sync` fail (it falls back to a JWT-only
  check and returns 401).
- `printf '%s' "..." | vercel env add FIREBASE_PRIVATE_KEY production --sensitive` also works
  (stdin piping, one environment per call).

Verify what actually landed before deploying:

```bash
vercel env ls                                            # names + targets + type
vercel env pull /tmp/prod.env --environment=production    # decrypts and writes values
grep -E '^VITE_FIREBASE_API_KEY=' /tmp/prod.env           # must be non-empty
rm -f /tmp/prod.env
```

> The functions only *require* `VITE_FIREBASE_API_KEY` + `FIREBASE_PROJECT_ID` for auth, and
> `SUPABASE_URL`/`VITE_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` for data.
> `FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY` are kept for parity.
> Env changes need a **redeploy** to be baked into the bundle: `vercel --prod`.

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
4. **Firebase authorized domains**: add `sparrow-admin.vercel.app` (and any custom domain) in
   Firebase Console → Authentication → Settings → Authorized domains, otherwise the Google Sign-In
   popup is blocked. Preview URLs can be added too (or use one stable preview domain).
5. After adding environment variables you must **redeploy** for them to take effect
   (`vercel --prod`); `VITE_*` values are inlined at build time, server values at runtime.
6. `.vercel/` is git-ignored — never commit it (it holds the project/org id).

## Deploy checklist (what was done)

1. Vercel → New Project → import `vijayk2508/sparrow-admin` (root directory = repo root).
2. Confirm framework/build (`vite build` → `dist`) — already pinned in `vercel.json`.
3. Add **all** env vars above for production + preview + development, **with values**
   (`vercel env ls` must show no empty ones; confirm via `vercel env pull`).
4. Add `sparrow-admin.vercel.app` to Firebase authorized domains.
5. `vercel --prod` and re-verify the table in *Verified end-to-end* above.
6. Toggle **Seed Initial Data** once in the admin dashboard if Supabase tables are empty
   (idempotent afterwards; use the Force option only to overwrite existing rows).
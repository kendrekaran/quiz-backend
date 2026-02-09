# Ai-Quiz Backend (Node + Express)

Express API for QuizLab. Handles teacher authentication via Supabase.

## Setup

1. **Install dependencies**

   ```bash
   cd backend && npm install
   ```

2. **Environment**

   Copy the example env file and fill in your Supabase keys:

   ```bash
   cp env.example .env
   ```

   Then edit `backend/.env`:

   | Variable | Where to get it | Description |
   |----------|-----------------|-------------|
   | `SUPABASE_URL` | Dashboard → **Settings** → **API** → Project URL | e.g. `https://abcdefgh.supabase.co` |
   | `SUPABASE_ANON_KEY` | Same page → **Project API keys** → `anon` **public** | Public key; used for sign-in from the backend. |
   | `SUPABASE_SERVICE_ROLE_KEY` | Same page → **service_role** **secret** | Secret key; only use on the server, never in the frontend. Use for admin APIs if needed. |

   Teacher login uses `SUPABASE_URL` + `SUPABASE_ANON_KEY` only. Add `SUPABASE_SERVICE_ROLE_KEY` if you add admin-only routes later.

3. **Run**

   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:3001`.

## API

- `GET /health` — Health check.
- `POST /api/auth/teacher/login` — Teacher login.
  - Body: `{ "email": "...", "password": "..." }`
  - Success: `200` with `{ access_token, refresh_token, expires_at, user }`.
  - Error: `401` with `{ error, message }` or `503` if Supabase is not configured.

Frontend should set `VITE_API_URL=http://localhost:3001` in its `.env` when using this backend (or rely on the default).

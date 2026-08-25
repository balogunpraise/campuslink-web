# CampusLink

Lets students on the same campus, or different ones, share study resources
(physical or digital) and pair up as study buddies. This is the frontend for
the [CampusLink API](../CampusLink) — a separate ASP.NET Core backend.

## Getting started

1. Start the CampusLink API (see that repo's README) on `http://localhost:5197`
   — the `http` launch profile, not `https` (see `.env.example` for why).
2. Copy the env file: `cp .env.example .env.local` and adjust `BACKEND_API_URL`
   if your API runs elsewhere.
3. `npm install`
4. `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## Architecture: the backend is never called from the browser

Every request to the CampusLink API goes through this app's own `/api/*`
Route Handlers (`src/app/api/**`), which run server-side and use axios
(`src/lib/server/backend-client.ts`) to reach the real API at
`BACKEND_API_URL`. The browser only ever calls same-origin `/api/*` — never
the backend directly.

The reason: the API issues a JWT access token + refresh token
(`AuthController`). Instead of storing those in `localStorage` or a
client-readable cookie (both reachable by any XSS in the app), they're set as
**httpOnly** cookies (`src/lib/server/session.ts`) that client-side JS can
never read. `src/lib/server/auth-proxy.ts` attaches the access token to each
proxied request server-side and transparently refreshes it once on a 401,
rotating the cookies on the response.

Client components talk to `/api/*` through `src/lib/http/api-client.ts`, a
second axios instance scoped to same-origin calls.

Both axios instances are configured deliberately, not just installed at
whatever version: pinned to a current, non-vulnerable release, a bounded
`timeout` so a slow backend can't hang a request indefinitely, and
`maxRedirects: 0` server-side (no legitimate reason our own API host should
redirect us anywhere — axios has had CVEs precisely around silently following
redirects).

## Backend gaps

This frontend is built against the CampusLink domain model, but two pieces
of it aren't exposed by the API yet:

- **Resources** (`/api/resources/**` in this app) — the `Resource` and
  `ResourceShareRequest` entities and repository exist in
  `CampusLink.Core`/`CampusLink.Infrastructure`, but there's no
  `ResourcesController` yet. The proxy routes and UI here
  (`src/app/(app)/resources/**`) are written against the shape those entities
  imply, including the two-party handover/return confirmation
  (`ResourceShareRequest.ConfirmHandover` / `ConfirmReturn`) — they'll work as
  soon as that controller lands with a matching contract. Until then these
  pages render an empty/error state rather than crash.
- **Study groups** — the `StudyGroup` entity and DB schema exist, but there's
  no service or controller either. Only 1:1 study-buddy pairing
  (`StudyBuddiesController`) is wired up on the backend today, so that's all
  this frontend implements; group pairing isn't in the UI yet.

Everything else — auth, institution search/resolve, subjects,
1:1 study-buddy matching — calls real, working endpoints.

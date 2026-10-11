# Next.js and Postgres on Vercel, not Laravel/MySQL

The project folder lives in XAMPP's `htdocs`, which suggests PHP and MySQL, but we chose **Next.js (App Router, TypeScript) with Postgres, deployed on Vercel**. Prodi, Kampus and Jurusan pages need server rendering for search engines ("ulasan informatika UGM") and fast loads on phones. The team chose the React/TypeScript ecosystem, and a Vercel account is already connected. XAMPP is not part of the runtime.

Supporting choices: Neon Postgres (through the Vercel Marketplace), Drizzle ORM, Auth.js (Google login and email magic link), Postgres full-text search with `pg_trgm` for typo-tolerant search, Tailwind with shadcn/ui, and Screening via Next.js `after()` calling Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), with a cron retry (see ADR 0002). The xlsx import is a Node script using SheetJS.

## Database driver (decided 2026-10-02)

We use Drizzle's **`neon-serverless`** driver, a WebSocket `Pool` from `@neondatabase/serverless`, not `neon-http`. `neon-http` only runs non-interactive transactions: a fixed batch of statements sent together. Publishing an Ulasan needs an interactive transaction: insert the revision, then move `ulasan.revisi_terbit_id`, deciding in between based on the Screening result. `Pool` and `Client` support that.

Rules that follow from the Neon driver docs:
- A `Pool` must be created, used and closed inside a single request handler. `src/db/index.ts` has no module-level pool: `withDb()` creates one and always ends it.
- The driver needs a global `WebSocket`, which Node.js has from version 22. `package.json` declares `engines.node >= 22`, so no `ws` package is needed.
- Migrations (`drizzle-kit`) use the direct `DATABASE_URL_UNPOOLED` connection.
- Local development and `db:smoke` run against a Neon **dev branch**, never the production branch.

**Exception for Auth.js (decided 2026-10-03).** The Auth.js Drizzle adapter is configured once, outside any request handler, so it cannot use a per-request `Pool`. Sessions and accounts need only single statements, so the adapter gets its own **`neon-http`** Drizzle instance (stateless HTTP, nothing to close). All other app queries keep using `withDb()`.

## Hosting moved to Railway (amended 2026-10-11)

The site now runs on a **Railway service** as a plain `next start` Node server. Vercel was the original host.
- **Plan and region.** Hobby plan, always on, in the Singapore region next to Neon.
- **Configuration.** Build and deploy settings live in `railway.json`. Variables are set in the Railway dashboard.

Render was tried first and dropped, because its card verification rejected the user's card. What changed:
- **Cron.** `vercel.json` crons are gone. A GitHub Actions schedule (`.github/workflows/cron-screening.yml`) calls `/api/cron/screening` daily with `CRON_SECRET`.
- **Auth.js.** Two variables are needed off Vercel:
  - `AUTH_TRUST_HOST=true`, because Auth.js trusts the request host by default only on Vercel.
  - `AUTH_URL`, holding the public origin (`https://${{RAILWAY_PUBLIC_DOMAIN}}`). Behind `next start`, `request.url` reports `localhost:<port>`, and Auth.js builds OAuth callbacks and magic links from it.
- **ISR cache.** Pages are cached on the instance's local disk. There is no ISR write quota, but the cache is empty after every deploy or restart.
- **Client IP.** Railway's edge overwrites `x-forwarded-for` with the client IP first, as Vercel does, so `src/lib/ip.ts` is unchanged.
- **Neon** stays where it is, in the Vercel-managed organisation the Marketplace created. Neon cannot transfer projects out of a Vercel-managed organisation, so the Vercel account and the Neon integration stay installed. Uninstalling the integration deletes the Neon organisation and its database. To retire the Vercel project, first disconnect the database from it (that only removes Vercel's env vars). Moving to a Neon-owned project would mean copying the data (`pg_dump`/`pg_restore`) into a new project.

## Considered Options

- Laravel + MySQL + Filament: the admin panel comes almost free and it runs on XAMPP, but the team chose Next.js on Vercel.
- Supabase (Postgres and auth in one): fewer pieces, but more tied to one vendor.
- A separate search engine (Meilisearch/Algolia): unnecessary for about 5,000 Prodi.

## Consequences

- The moderation and admin UI is built by hand inside the app. There is no Filament equivalent.

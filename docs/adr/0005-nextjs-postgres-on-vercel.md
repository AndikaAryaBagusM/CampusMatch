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

## Considered Options

- Laravel + MySQL + Filament: the admin panel comes almost free and it runs on XAMPP, but the team chose Next.js on Vercel.
- Supabase (Postgres and auth in one): fewer pieces, but more tied to one vendor.
- A separate search engine (Meilisearch/Algolia): unnecessary for about 5,000 Prodi.

## Consequences

- The moderation and admin UI is built by hand inside the app. There is no Filament equivalent.

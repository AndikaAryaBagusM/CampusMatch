# Next.js and Postgres on Vercel, not Laravel/MySQL

The project folder lives in XAMPP's `htdocs`, which suggests PHP and MySQL, but we chose **Next.js (App Router, TypeScript) with Postgres, deployed on Vercel**. Prodi, Kampus and Jurusan pages need server rendering for search engines ("ulasan informatika UGM") and fast loads on phones. The team chose the React/TypeScript ecosystem, and a Vercel account is already connected. XAMPP is not part of the runtime.

Supporting choices: Neon Postgres (through the Vercel Marketplace), Drizzle ORM, Auth.js (Google login and email magic link), Postgres full-text search with `pg_trgm` for typo-tolerant search, Tailwind with shadcn/ui, and Screening via Next.js `after()` calling Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), with a cron retry (see ADR 0002). The xlsx import is a Node script using SheetJS.

## Considered Options

- Laravel + MySQL + Filament: the admin panel comes almost free and it runs on XAMPP, but the team chose Next.js on Vercel.
- Supabase (Postgres and auth in one): fewer pieces, but more tied to one vendor.
- A separate search engine (Meilisearch/Algolia): unnecessary for about 5,000 Prodi.

## Consequences

- The moderation and admin UI is built by hand inside the app. There is no Filament equivalent.

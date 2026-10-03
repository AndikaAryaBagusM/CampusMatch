# CampusMatch

Helps Indonesian students choose a Jurusan and a Kampus, through checked Ulasan from students and alumni and a RIASEC-based Tes Minat.

- [CONTEXT.md](./CONTEXT.md): domain glossary
- [docs/decisions.md](./docs/decisions.md): MVP decisions
- [docs/roadmap.md](./docs/roadmap.md): build order
- [docs/legal-todo.md](./docs/legal-todo.md): outstanding legal work
- [docs/adr/](./docs/adr/): architecture decision records

## Development

Requires Node.js 22 or later.

1. `npm install`
2. In Neon, create a `dev` branch from `main`. Copy `.env.example` to `.env.local` and fill it in with the **dev branch's** connection strings. Never point `.env.local` at `main` (production).
3. `npm run db:migrate` applies the migrations in `drizzle/`.
4. `npm run db:smoke` checks the schema's constraints against the dev branch. It runs only when `DB_ENV=development`, and removes its test rows.
5. `npm run dev`

| Script | What it does |
|---|---|
| `npm run db:generate` | Writes a new SQL migration from changes in `src/db/schema/` |
| `npm run db:migrate` | Applies pending migrations |
| `npm run db:studio` | Opens Drizzle Studio |
| `npm test` | Unit and database tests (vitest; an in-memory PGlite database, never Neon) |
| `npm run typecheck` / `lint` / `build` | Checks |

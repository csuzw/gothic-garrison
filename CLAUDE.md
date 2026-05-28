# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Gothic Garrison is a list builder and (eventually) campaign manager for the tabletop wargame **The Silver Bayonet**. Design pillars worth keeping in mind on every change:

- **Phone-first PWA.** The builder gets used at the table on a phone. Mobile layout is the default; desktop is the wide variant.
- **Account-optional.** Anonymous users can build warbands stored in IndexedDB. Signing in unlocks server-side persistence and (later) campaign tools. The *same JSON shape* is used both places so the UI never forks on auth state.
- **Free + self-hostable.** Everything must run via `docker compose` with no third-party account required at dev time. Hosting providers are deferred.
- **No manual testing if avoidable.** Playwright e2e tests are expected to capture screenshot artefacts (see `tests/e2e/home.spec.ts`) so changes can be reviewed visually without a local run.

## Layout

```
apps/
  gothic-garrison/   SvelteKit web app (the PWA)
  petite-poste/      Local Resend-API-compatible mock mailer (dev only)
packages/
  db/                Drizzle schema, migrations, seed — shared across apps
docker-compose.yml   Postgres + petite-poste
```

`apps/gothic-garrison` imports the DB schema via `$db/*` (see `svelte.config.js` alias → `../../packages/db/src`). The db package exports `.ts` files directly; there is no build step — Vite handles the workspace import.

## Commands

```bash
# install (pnpm workspaces, Node ≥ 22)
pnpm install

# infrastructure
docker compose up -d                # postgres + petite-poste
docker compose down                 # stop
docker compose logs -f petite-poste # tail mock-mailer logs

# database (from repo root)
pnpm db:generate                    # regenerate migrations after schema edits
pnpm db:migrate                     # apply migrations
pnpm db:seed                        # seed reference sources
pnpm db:studio                      # Drizzle Studio at https://local.drizzle.studio

# app
pnpm dev                            # gothic-garrison at http://localhost:5173
pnpm dev:mailer                     # petite-poste inbox at http://localhost:8025

# checks
pnpm -r check                       # svelte-check / tsc across the workspace
pnpm test                           # vitest unit tests
pnpm test:e2e                       # playwright (first run: pnpm exec playwright install)
pnpm --filter gothic-garrison build # production build
```

A single unit test or e2e test:
```bash
pnpm --filter gothic-garrison test budget          # vitest --t / filename match
pnpm --filter gothic-garrison test:e2e home.spec   # playwright by file
```

## Domain model (Silver Bayonet)

Encoded in `packages/db/src/schema.ts`. The shape exists because of rules from the rulebooks the user owns — when adding fields, check `memory/silver_bayonet_domain.md` for the confirmed-by-user facts, and **do not invent rules** that aren't already there.

Key invariants the schema/UI must respect:

- A warband has **one Officer (free, "Leader") plus up to 7 soldiers**. Default budget 100 pts; +5 if the Officer's Command Style is `+5 Recruitment`.
- The Officer picks **exactly 2 attributes** from a **single global pool** (`officer_attributes`) — there is no nation-specific attribute list.
- The Officer has **6 equipment slots / max 2 Special** (3 Special if they have the *Supernatural Veteran* attribute). Muskets/rifles/volley guns cost 2 slots each.
- Soldier **equipment** runs in one of three modes (`soldier_types.equipment_mode`):
  - `fixed` — one predetermined loadout
  - `choice` — pick one of N predetermined loadouts
  - `pool` — build from a pool with per-type `equipment_slots` + `special_slots` (the Veteran Hunter pattern)
- Soldier **attributes** are either fixed (`soldier_type_fixed_attributes`) or "pick N from the global Officer pool" (`soldier_types.attribute_picks`).
- Nations restrict the soldier catalog via `nation_soldier_types`. The optional rule "take 1 soldier from outside your nation for +8 pts" is modelled in `optional_rules` and enforced by the builder when the user opts in.

### Expansion tagging + filtering

Every reference row has a `source_id`. The builder's "filter expansions" UI is just "which sources are enabled?" All-on is the default. There is no other expansion-tracking machinery.

### Reference data lifecycle

Reference rows are **mutable but never deleted** (delete behaviour is `restrict` everywhere intentionally). To not silently invalidate existing warbands when rules change, we **snapshot on save**:

- A warband stores its full denormalised member data inside `warbands.data` (jsonb). Name, stats, cost, loadout — everything needed to render the warband independently of current reference data.
- On load, if any snapshotted item has a newer reference version, the UI surfaces a "rules updated for X" notice with a per-item refresh action (not built yet, but the data is in place — `warbands.reference_snapshot_at`).
- Anonymous warbands live in IndexedDB with the same JSON shape. There is no `warband` row format that depends on the server.

This is intentional. **Do not** change warbands to reference reference-data rows by ID alone — it breaks the immutability guarantee.

## Auth + email

- `src/lib/server/auth.ts` stands up a **stubbed** better-auth instance. Email/password is enabled but no UI/flow exists yet. `hooks.server.ts` mounts the handler at `/api/auth/*`.
- `src/lib/server/mailer.ts` is a thin `Mailer` interface implemented by Resend's SDK. The `Resend` client is constructed with a configurable `baseUrl` (`RESEND_API_URL`). In dev, that points at petite-poste (`http://localhost:8025`), so dev and prod code are identical — only env changes.
- **petite-poste** (`apps/petite-poste`) accepts `POST /emails` Resend-shaped, validates any non-empty `Bearer` token, and stores up to 500 emails in-memory. Open `http://localhost:8025` to view the inbox.

## Conventions

- **TypeScript strict, runes mode on.** SvelteKit projects use Svelte 5 runes (`$state`, `$derived`, `$props`); don't reach for `export let`.
- **Tailwind v4 + daisyUI v5.** Theme tokens come from daisyUI; prefer semantic classes (`bg-base-200`, `card`, `btn`) over arbitrary colours. The PWA uses `night` as the default theme.
- **Paths.** Inside `apps/gothic-garrison`, server-only code lives under `src/lib/server/` (SvelteKit refuses to bundle it client-side). DB-touching code must live there.
- **Cross-package imports.** Use the `$db/*` alias for the db package, not relative `../../`.
- **`.ts` extensions in imports** are required — the SvelteKit tsconfig sets `rewriteRelativeImportExtensions`.

## Not done yet (so future you knows)

- No auth UI, sign-in pages, or session checks on routes.
- No actual seed data for nations / soldiers / equipment / attributes — only the six known sources are seeded. Filling reference data is a later task (rulebooks → SQL seed or admin UI).
- PWA is registered but the offline strategy is the default Workbox preset — no IndexedDB sync for warbands yet.
- No production Dockerfile for `apps/gothic-garrison` (hosting decision deferred per user). `petite-poste` has one because it ships in `docker-compose.yml`.

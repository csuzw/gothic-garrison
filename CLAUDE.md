# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Gothic Garrison is a list builder and (eventually) campaign manager for the tabletop wargame **The Silver Bayonet**. Design pillars worth keeping in mind on every change:

- **Phone-first PWA.** The builder gets used at the table on a phone. Mobile layout is the default; desktop is the wide variant.
- **Account-optional.** Anonymous users can build units stored in IndexedDB. Signing in unlocks server-side persistence and (later) campaign tools. The *same JSON shape* is used both places so the UI never forks on auth state.
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
pnpm db:seed                        # seed reference data from seed-data.ts (idempotent)
pnpm db:export-seed                 # regenerate seed-data.ts from the DB (Codex "save to repo")
pnpm db:studio                      # Drizzle Studio at https://local.drizzle.studio

# app
pnpm dev                            # gothic-garrison at http://localhost:5173
pnpm dev:mailer                     # petite-poste inbox at http://localhost:8025

# checks
pnpm -r check                       # svelte-check / tsc across the workspace
pnpm test                           # vitest unit tests
pnpm test:e2e                       # playwright (first run: pnpm exec playwright install)
pnpm --filter gothic-garrison test:e2e:codex  # Codex UI tests only (dev server; needs Postgres)
pnpm --filter gothic-garrison build # production build
```

Playwright runs two surfaces (`playwright.config.ts`): the **production build** (`pnpm preview`, :4173) for everything incl. the Codex prod-gate checks, and the **dev server** (`pnpm dev`, :5173) for the dev-only Codex UI (the `codex-dev` project, `codex-ui.spec.ts`). The Codex UI tests need Postgres (`docker compose up -d` + `pnpm db:seed`) and skip themselves if the dev API isn't reachable.

A single unit test or e2e test:
```bash
pnpm --filter gothic-garrison test budget          # vitest --t / filename match
pnpm --filter gothic-garrison test:e2e home.spec   # playwright by file
```

## Domain model (Silver Bayonet)

Encoded in `packages/db/src/schema.ts`. The shape exists because of rules from the rulebooks the user owns — when adding fields, check `memory/silver_bayonet_domain.md` for the confirmed-by-user facts, and **do not invent rules** that aren't already there.

Key invariants the schema/UI must respect:

- A unit has **one Officer (free, "Leader") plus up to 7 soldiers**. Default budget 100 pts; +5 if the Officer's Command Style is `+5 Recruitment`.
- All attributes live in one `attributes` table with an `is_officer` flag. The Officer (and any soldier with an "officer attribute pick") chooses from the **officer-flagged** subset — a single global pool, no nation-specific list. Non-officer attributes (Miracles, Spells, Skinshift, Damage Reduction, monster traits, …) are standard attributes baked onto soldier types.
- The Officer has **6 equipment slots / max 2 Special** (3 Special if they have the *Supernatural Veteran* attribute). Muskets/rifles/volley guns cost 2 slots each.
- Soldier **equipment** runs in one of three modes (`soldier_types.equipment_mode`):
  - `fixed` — one predetermined loadout
  - `choice` — pick one of N predetermined loadouts
  - `pool` — build from a pool with per-type `equipment_slots` + `special_slots` (the Veteran Hunter pattern)
- Soldier **attributes** are either fixed (`soldier_type_fixed_attributes` → any `attributes` row) or "pick N from the officer-flagged pool" (`soldier_types.attribute_picks`).
- Nations restrict the soldier catalog via `nation_soldier_types`. The optional rule "take 1 soldier from outside your nation for +8 pts" is modelled in `optional_rules` and enforced by the builder when the user opts in.

### Expansion tagging + filtering

Every reference row has a `source_id`. The builder's "filter expansions" UI is just "which sources are enabled?" All-on is the default. There is no other expansion-tracking machinery.

### Reference data lifecycle

Reference rows are **mutable but never deleted** (delete behaviour is `restrict` everywhere intentionally). To not silently invalidate existing units when rules change, we **snapshot on save**:

- A unit stores its full denormalised member data inside `units.data` (jsonb). Name, stats, cost, loadout — everything needed to render the unit independently of current reference data.
- On load, if any snapshotted item has a newer reference version, the UI surfaces a "rules updated for X" notice with a per-item refresh action (not built yet, but the data is in place — `units.reference_snapshot_at`).
- Anonymous units live in IndexedDB with the same JSON shape. There is no `unit` row format that depends on the server.

This is intentional. **Do not** change units to reference reference-data rows by ID alone — it breaks the immutability guarantee.

## Auth + email

- `src/lib/server/auth.ts` stands up a better-auth instance backed by the shared Drizzle/Postgres connection (`drizzleAdapter`, `provider: 'pg'`). Email/password is enabled. `baseURL` is intentionally **not** set — better-auth infers it (and its CSRF trusted origin) from each request, so sign-in works on whatever port dev/preview uses; set it from `PUBLIC_APP_URL` when email/callback URLs are wired. The auth tables (`user`/`session`/`account`/`verification`) live in `packages/db/src/auth-schema.ts`; better-auth uses **text/string IDs**, so `units.userId` is `text` and FKs to `user.id` (cascade on delete). When upgrading better-auth, re-check the schema against `npx @better-auth/cli generate`.
- `hooks.server.ts` mounts the handler at `/api/auth/*` and resolves the session once per request into `event.locals.user` / `event.locals.session` (typed in `app.d.ts`). The root `+layout.server.ts` exposes `user` to every page. Client-side, `src/lib/auth-client.ts` (`better-auth/svelte`) provides `signIn` / `signUp` / `signOut` / `useSession`; the sign-in/up pages are `src/routes/sign-{in,up}/`, password reset is `src/routes/{forgot,reset}-password/`, and the navbar `UserMenu` reflects auth state. `VerifyEmailBanner` shows a resend prompt to unverified users. After a sign-in/out, call `invalidateAll()` so the layout's `user` refreshes.
- `src/lib/server/mailer.ts` is a thin `Mailer` interface implemented by Resend's SDK. The SDK has **no constructor option** for its base URL — it only reads `RESEND_BASE_URL` from `process.env`, *once at import time*. Our config is `RESEND_API_URL` in `.env` (read via `$env/dynamic/private`), which SvelteKit does **not** mirror into `process.env`. So `getMailer()` bridges the value into `process.env.RESEND_BASE_URL` and then **dynamically imports** `resend` so its import-time read picks it up. Because of the dynamic import, `getMailer()` is **async** (`await getMailer()`). In dev it points at petite-poste (`http://localhost:8025`); in prod leave `RESEND_API_URL` unset → SDK defaults to `https://api.resend.com`. Dev and prod share one code path — only env changes.
- **petite-poste** (`apps/petite-poste`) accepts `POST /emails` Resend-shaped, validates any non-empty `Bearer` token, and stores up to 500 emails in-memory. Open `http://localhost:8025` to view the inbox.

## Conventions

- **TypeScript strict, runes mode on.** SvelteKit projects use Svelte 5 runes (`$state`, `$derived`, `$props`); don't reach for `export let`.
- **Tailwind v4 + daisyUI v5.** Theme tokens come from daisyUI; prefer semantic classes (`bg-base-200`, `card`, `btn`) over arbitrary colours. Two custom themes are defined in `app.css`: `garrison` (dark gothic, default) and `garrison-light` (parchment); `ThemeToggle` flips `data-theme` and persists to `localStorage`.
- **Paths.** Inside `apps/gothic-garrison`, server-only code lives under `src/lib/server/` (SvelteKit refuses to bundle it client-side). DB-touching code must live there.
- **Cross-package imports.** Use the `$db/*` alias for the db package, not relative `../../`.
- **`.ts` extensions in imports** are required — the SvelteKit tsconfig sets `rewriteRelativeImportExtensions`.

## Not done yet (so future you knows)

- Auth UI exists: email/password sign-in/up, sign-out, session in `locals`, password reset (`/forgot-password` → `/reset-password`), and email verification (sent on sign-up via `emailVerification.sendOnSignUp`, with a resend banner for unverified users). `requireEmailVerification` is **off** — verification is encouraged, not enforced. Still missing: protected/guarded routes.
- **Top-level nav** (`src/routes/+layout.svelte`, responsive — page links collapse to a hamburger on phones): **Units** (`/`, the home page) · **Bestiary** (`/bestiary`, stub) · **Scenarios** & **Campaigns** (shown but disabled — not built) · **About** (`/about`, holds the Sources panel + an about blurb). Note: "unit" is the rulebook term for a player's force — the old "warband" naming was renamed everywhere (routes, `UnitDoc`, `/api/units`, the `units` table). Decided-but-not-built top-level pages: **Codex** (a **local-development-only** reference-data editor — *not* admin-gated; there are no admin users or roles. The `/codex` subtree is gated by `dev` from `$app/environment` in `src/routes/codex/+layout.server.ts` and 404s in any production build, so prod has no write path to reference data. Edits are made against the local DB and exported back to `packages/db/src/seed-data.ts` — the git-committed source of truth applied everywhere via `pnpm db:seed` — with a per-session changelog note surfaced on the About page. Deletes are allowed only when no `units.data` snapshot references the item. **Status:** route gate + skeleton (Slice 1) and the write backend (Slice 2) are built. Backend: `src/lib/server/codex-validation.ts` (pure, unit-tested validators) + `src/lib/server/codex.ts` (DB CRUD for all reference entities incl. soldier-type join tables, the snapshot delete-guard, Postgres-error→HTTP mapping, and `runCodex()` which re-asserts the `dev` gate) behind `/api/codex/[entity]` (GET list, POST create) and `/api/codex/[entity]/[id]` (PATCH update, DELETE). Entity slugs: `sources`, `nations`, `attributes`, `equipment`, `optional-rules`, `soldier-types`. The snapshot delete-guard refuses deletion when a UUID appears anywhere in any `units.data` jsonb (substring match — UUIDs never collide). Mutations call `resetReferenceCache()`. Slice 3 (export): `pnpm db:export-seed` regenerates `seed-data.ts` from the DB deterministically (see the reference-data bullet below). Slice 4 (changelog): the same export diffs the DB against the committed `seed-data.ts` and, when anything changed, prepends an entry to `packages/db/src/reference-changelog.ts` (`{ date, note, changes[] }`, newest-first, auto-generated) — note from `--note "…"` (e.g. `pnpm db:export-seed --note "…"`) or a derived summary like "1 updated". No changes → no entry (re-export stays a no-op). The About page (`/about`) renders the changelog from that static module (no DB; works offline). Slice 5 (editing UI): the Codex (`/codex`) is a tabbed editor — overview with live counts, then `/codex/[entity]` per entity. Flat entities (sources, nations, attributes, equipment, optional-rules) have full create/edit/delete forms driven by a field config (`src/lib/codex/entities.ts`, client-safe) talking to the Slice-2 `/api/codex` endpoints; soldier-types are **read-only** (their nested loadout/attribute editor is the remaining work). An **Export to repo** button (in `codex/+layout.svelte`) prompts for a note and POSTs `/api/codex/export` (dev-only, static segment so it beats `[entity]`), which calls the shared `exportSeedData()` — the export script was refactored into that reusable function (`export-seed-data.ts`) + a thin CLI (`export-seed-cli.ts`); it reads the previous committed data from disk via `fs` (not dynamic `import()`, which the Vite dev server caches). The Codex UI has durable e2e coverage via the `codex-dev` Playwright project (`codex-ui.spec.ts`, against `pnpm dev`); those tests don't trigger a real export (which would rewrite committed files) and clean up their throwaway rows. Codex is built; remaining: the soldier-type editor) and **Bestiary** content (read-only monster list; a monster = the soldier stat line + an Experience-Points value `0+` / sometimes "0 or 1" + attributes/equipment; data entered via the Codex).
- **Unit** persistence + builder: home `/` is the units list; `/units/[id]` is the builder. `src/lib/unit/`: `types.ts` is the denormalised `UnitDoc`; `store.ts` exposes a `UnitStore` with two backends — IndexedDB (anonymous) + the `/api/units` endpoints (signed-in, scoped to `locals.user`) — via `getUnitStore(signedIn)`, identical shape both ways. DB table is `units`. **Note:** pass plain objects to IndexedDB — Svelte `$state` proxies fail structured clone, so `store.ts` JSON-clones before `put`. Builder covers: nation picker, soldier roster (nation-filtered, 7-soldier cap, per-type `maxPerUnit`, live budget), attribute pickers (officer picks 2 from the `is_officer` pool; `attribute_picks` soldiers pick N; fixed attributes shown), and equipment — officer (6 slots / 2 Special, 3 with Supernatural Veteran) + per-soldier by mode (`fixed` read-only, `choice` loadout select, `pool` slot builder). Reusable `AttributePicker`/`EquipmentBuilder`; reference data via `src/lib/server/reference.ts` (cached) → `units/[id]/+page.server.ts`. Anonymous units **migrate to the account on sign-in/up** via `migrateAnonymousUnits()`. Still missing: the "+8 pts outside-nation soldier" optional rule, and per-attribute cost deltas (e.g. Fey-Touched +4 — not applied yet).
- Reference data **is** seeded now (13 nations, 44 soldier types with stats/cost/loadouts, 37 attributes incl. non-officer, 19 equipment, plus nation/attribute/loadout joins). `pnpm db:seed` reads `packages/db/src/seed-data.ts`, the canonical typed module, and is idempotent (upsert on natural keys; loadouts cleared + re-inserted). `seed-data.ts` was *originally* one-time-generated from the cotalink reference by `packages/db/scripts/extract-seed-data.mjs` (`reference/`, gitignored — kept for provenance only). It is now **regenerated from the database** by `pnpm db:export-seed` (`packages/db/src/export-seed-data.ts`): edit reference rows in the local-only Codex, then export so the change is a reviewable git diff. The export is **deterministic** (every collection sorted by a stable natural key, fixed object-key order) so `db:seed` → `db:export-seed` round-trips byte-identically; `seed.ts` and `export-seed-data.ts` are kept as faithful inverses. The seed shape is **lossless** for everything the Codex edits — `sources` and `optionalRules` arrays plus `nation.notes`, `equipment.allowedFor`/`sourceCode`, and `soldier.notes` (added in Slice 3; sources are no longer hardcoded in `seed.ts`). **Do not hand-edit `seed-data.ts`** — it is auto-generated (edits would be overwritten on next export). Pool soldiers were seeded at the Officer's 6/2 slot caps — verify against the books.
- PWA is registered but the offline strategy is the default Workbox preset — no IndexedDB sync for units yet.
- No production Dockerfile for `apps/gothic-garrison` (hosting decision deferred per user). `petite-poste` has one because it ships in `docker-compose.yml`.

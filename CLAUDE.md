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
pnpm db:export-seed                 # regenerate seed-data.ts from the DB (Reference editor "save to repo")
pnpm db:studio                      # Drizzle Studio at https://local.drizzle.studio

# app
pnpm dev                            # gothic-garrison at http://localhost:5173
pnpm dev:mailer                     # petite-poste inbox at http://localhost:8025

# checks
pnpm -r check                       # svelte-check / tsc across the workspace
pnpm test                           # vitest unit tests
pnpm test:e2e                       # playwright (first run: pnpm exec playwright install)
pnpm --filter gothic-garrison test:e2e:codex  # Reference editor UI tests only (dev server; needs Postgres)
pnpm --filter gothic-garrison build # production build
```

Playwright runs two surfaces (`playwright.config.ts`): the **production build** (`pnpm preview`, :4173) for everything incl. the Reference editor readonly-gate checks, and the **dev server** (`pnpm dev`, :5173) for the dev-only Reference editor write UI (the `codex-dev` project, `codex-ui.spec.ts` — script names kept for historical reasons). The Reference editor UI tests need Postgres (`docker compose up -d` + `pnpm db:seed`) and skip themselves if the dev API isn't reachable.

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

### Auth
Email/password sign-in/up, sign-out, session in `locals`, password reset, email verification (sent on sign-up; resend banner for unverified users) are all built. `requireEmailVerification` is **off** — encouraged, not enforced. Still missing: protected/guarded routes.

### Navigation
`src/routes/+layout.svelte` — responsive nav collapses to a hamburger on phones. Active pages: **Units** (`/`) · **Cheat Sheet** (`/cheat-sheet`) · **Reference** (`/reference`) · **About** (`/about`). Disabled/stub: **Campaigns** (not built). "Warband" was renamed to "unit" everywhere.

### Reference editor (`/reference`)
Accessible in production as a **read-only** reference browser; full editor (writes enabled) in dev only — controlled by `{ readonly: !dev }` from `src/routes/reference/+layout.server.ts`. Write API endpoints enforce the same gate server-side via `runCodex()` in `src/lib/server/codex.ts`. Full CRUD for flat entities (sources, nations, attributes, equipment) and structured entities (soldier-types, monster-types — both include nested loadout/attribute editors) is built. `optional-rules` entity is **not yet implemented** in the editor or displayed anywhere in the app. Export-to-repo (`pnpm db:export-seed`) regenerates `seed-data.ts` deterministically; a changelog entry is prepended to `reference-changelog.ts` when anything changed. The About page renders that changelog statically.

### Unit builder (`/units/[id]`)
**Built:** Nation is set from the home page nation picker when creating a unit (read-only in the builder). Soldier picker is a tile list (browse all nation soldiers, +/− inline stepper, disabled when over budget or at per-type cap, collapsible with tag summary when collapsed). Equipment uses `EquipmentBrowser` (catalog-style browser with +/− steppers, collapsible) for the officer and pool-mode soldiers; fixed/choice soldiers show read-only badges or a loadout button group. Officer/soldier stat info cards (`SoldierStatPopover`, `RulesPopover`). Save-time validation blocks saving when special equipment exceeds the allowed max (e.g. after removing Supernatural Veteran). Unsaved-changes detection gates the Print navigation.

**Still missing:** the "+8 pts outside-nation soldier" optional rule; per-attribute cost deltas (e.g. Fey-Touched +4 — not applied yet).

### Units list (`/`)
Shows unit cards with nation flag, last-updated time, soldier type tags (grouped with counts), printer icon (navigates to print view), trash icon with inline delete confirmation (pendingDeleteId — no browser `confirm()`).

### Print view (`/units/[id]/print`)
Renders unit cards in a table layout matching the physical Silver Bayonet card format (Name / Type / Tier / XP header row + stat row + Attributes + Equipment rows). Responsive columns on screen (1→2→3), single column on print. Optional rules-reference tables (attributes + equipment) on a separate page break, toggleable via a checkbox. The builder's Print button checks for unsaved changes and shows a Save / Discard / Cancel modal before navigating.

### Reference data
Seeded: 13 nations, 44 soldier types, 37 attributes (incl. non-officer), 19 equipment items. `pnpm db:seed` is idempotent; `pnpm db:export-seed` round-trips byte-identically. **Do not hand-edit `seed-data.ts`** — it is regenerated from the DB.

### PWA offline strategy
The app works offline after first visit. Key mechanics:

- **Reference data** is served by `/api/reference/snapshot` (GET, public, `stale-while-revalidate`). Both page loaders (`src/routes/+page.ts` and `src/routes/units/[id]/+page.ts`) are **universal loaders** that `fetch('/api/reference/snapshot')` — SvelteKit intercepts this server-side for SSR, and the service worker serves it from cache offline. Workbox `runtimeCaching` handles the snapshot with `StaleWhileRevalidate` and unit API responses (`/api/units`, `/api/units/[id]`) with `NetworkFirst`.
- **Offline banner** in `+layout.svelte` listens to `window.online`/`offline` events and shows a notice. The cache is also warmed proactively on first mount.
- **New units while signed in + offline** go to `indexedDbStore` (same as anonymous). On reconnect the layout calls `migrateAnonymousUnits()` automatically, syncing them to the server.
- **Existing server units offline** are read-only (the builder's Save button is disabled with an "Offline" indicator when `unitSource === 'server' && !isOnline`). Workbox's `NetworkFirst` unit cache means previously loaded units are still readable.
- `getUnitById(id, signedIn)` in `store.ts` tries the server first, falls back to IndexedDB — covers offline-created pending-sync units.

### Still not done
- Campaign tools (Tier, XP tracking, campaign manager) — auth-gated routes will be needed when this lands
- "+8 pts outside-nation soldier" optional rule in the builder
- Per-attribute cost deltas
- `optional-rules` editor and display (entity exists in DB/seed but has no UI)
- Production Dockerfile for `apps/gothic-garrison` (hosting deferred)

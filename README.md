# Gothic Garrison

List builder and (eventually) campaign manager for the tabletop wargame **The Silver Bayonet**. Phone-first PWA, account-optional, free, self-hostable.

## Quickstart

```bash
# install
pnpm install

# bring up Postgres + the local Resend-compatible mailer (petite-poste)
docker compose up -d

# migrate + seed the reference data sources
pnpm db:migrate
pnpm db:seed

# run the app
pnpm dev               # gothic-garrison at http://localhost:5173
pnpm dev:mailer        # petite-poste inbox at http://localhost:8025
```

## Layout

```
apps/
  gothic-garrison/   # SvelteKit web app (the PWA)
  petite-poste/      # local Resend-shaped mock mailer (dev only)
packages/
  db/                # Drizzle schema, migrations, seed
```

See [`CLAUDE.md`](./CLAUDE.md) for architecture and conventions.

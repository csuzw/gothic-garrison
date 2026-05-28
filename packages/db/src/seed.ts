import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { sources } from './schema.ts';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client, { casing: 'snake_case' });

const MCCULLOUGH = 'Joseph A. McCullough';

// Only the known book list is seeded here. Nations / soldier types /
// equipment / attributes are intentionally left empty — they come from
// the rulebooks and will be populated by hand or via an admin UI.
const knownSources = [
  { code: 'core',        name: 'The Silver Bayonet',             kind: 'core',       publishedDate: '2021-11-11', author: MCCULLOUGH },
  { code: 'carpathians', name: 'The Carpathians — Castle Fier',  kind: 'supplement', publishedDate: '2023-05-25', author: MCCULLOUGH },
  { code: 'canada',      name: 'Canada',                          kind: 'supplement', publishedDate: '2023-11-23', author: 'Ash Barker' },
  { code: 'egypt',       name: 'Egypt — Shadow of the Sphinx',    kind: 'supplement', publishedDate: '2024-05-23', author: MCCULLOUGH },
  { code: 'italy',       name: 'Italy — The Shades of Calabria',  kind: 'supplement', publishedDate: '2024-11-28', author: 'T.C. Stephen' },
  { code: 'britain',     name: 'Britain — Bones of Albion',       kind: 'supplement', publishedDate: '2025-09-25', author: MCCULLOUGH },
] as const;

await db
  .insert(sources)
  .values(knownSources.map((s) => ({ ...s, kind: s.kind as 'core' | 'supplement' })))
  .onConflictDoUpdate({
    target: sources.code,
    set: {
      name: sql`excluded.name`,
      kind: sql`excluded.kind`,
      publishedDate: sql`excluded.published_date`,
      author: sql`excluded.author`,
    },
  });

console.log(`seeded ${knownSources.length} sources`);
await client.end();

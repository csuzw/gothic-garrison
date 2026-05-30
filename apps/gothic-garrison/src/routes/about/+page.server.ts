import { getDb } from '$lib/server/db';
import { sources } from '$db/schema';
import { referenceChangelog } from '$db/reference-changelog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // The changelog is static, committed data (no DB), so it renders even when
  // Postgres is down — return it regardless of the sources query outcome.
  try {
    const db = getDb();
    const rows = await db.select().from(sources).orderBy(sources.publishedDate);
    return { sources: rows, changelog: referenceChangelog, dbAvailable: true as const };
  } catch (err) {
    console.warn('[gothic-garrison] DB unavailable on about page load:', err);
    return { sources: [], changelog: referenceChangelog, dbAvailable: false as const };
  }
};

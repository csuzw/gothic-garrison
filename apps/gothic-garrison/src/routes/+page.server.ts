import { getDb } from '$lib/server/db';
import { sources } from '$db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const db = getDb();
    const rows = await db.select().from(sources).orderBy(sources.publishedDate);
    return { sources: rows, dbAvailable: true as const };
  } catch (err) {
    console.warn('[gothic-garrison] DB unavailable on landing page load:', err);
    return { sources: [], dbAvailable: false as const };
  }
};

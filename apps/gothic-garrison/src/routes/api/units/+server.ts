import { json, type RequestHandler } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { units } from '$db/schema';
import type { UnitSummary } from '$lib/unit/types';

// List the signed-in user's units (summaries only).
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ message: 'Sign in required' }, { status: 401 });

  const rows = await getDb()
    .select({ id: units.id, name: units.name, updatedAt: units.updatedAt })
    .from(units)
    .where(eq(units.userId, locals.user.id))
    .orderBy(desc(units.updatedAt));

  const summaries: UnitSummary[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    updatedAt: r.updatedAt.toISOString(),
  }));
  return json({ units: summaries });
};

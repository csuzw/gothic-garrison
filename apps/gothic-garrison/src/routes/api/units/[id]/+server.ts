import { json, type RequestHandler } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { units } from '$db/schema';
import type { UnitDoc } from '$lib/unit/types';

export const GET: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) return json({ message: 'Sign in required' }, { status: 401 });

  const row = (
    await getDb()
      .select({ data: units.data })
      .from(units)
      .where(and(eq(units.id, params.id!), eq(units.userId, locals.user.id)))
      .limit(1)
  )[0];

  if (!row) return json({ message: 'Not found' }, { status: 404 });
  return json({ unit: row.data as UnitDoc });
};

export const PUT: RequestHandler = async ({ locals, params, request }) => {
  if (!locals.user) return json({ message: 'Sign in required' }, { status: 401 });

  const id = params.id!;
  const doc = (await request.json()) as UnitDoc;
  if (doc.id !== id) return json({ message: 'Unit ID mismatch' }, { status: 400 });

  const db = getDb();

  // Guard against clobbering another user's row that happens to share this id.
  const existing = (
    await db.select({ userId: units.userId }).from(units).where(eq(units.id, id)).limit(1)
  )[0];
  if (existing && existing.userId !== locals.user.id) {
    return json({ message: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  await db
    .insert(units)
    .values({ id, userId: locals.user.id, name: doc.name, nationId: doc.nationId, data: doc, updatedAt: now })
    .onConflictDoUpdate({
      target: units.id,
      set: { name: doc.name, nationId: doc.nationId, data: doc, updatedAt: now },
    });

  return json({ unit: doc });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) return json({ message: 'Sign in required' }, { status: 401 });

  await getDb()
    .delete(units)
    .where(and(eq(units.id, params.id!), eq(units.userId, locals.user.id)));

  return json({ ok: true });
};

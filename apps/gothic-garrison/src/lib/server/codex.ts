// Codex write service — the local-development-only backend behind /api/codex.
// It mutates the shared reference tables in the local DB; a later slice exports
// the result back to packages/db/src/seed-data.ts (the committed source of
// truth). Every mutation resets the reference cache so the builder reflects
// edits immediately.
//
// All access is gated to `dev` in runCodex(); production never reaches the DB
// writes here (the page subtree is separately gated in src/routes/codex).
import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { asc, eq, sql } from 'drizzle-orm';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';
import {
  sources,
  nations,
  attributes,
  equipmentItems,
  optionalRules,
  soldierTypes,
  nationSoldierTypes,
  soldierTypeFixedAttributes,
  soldierLoadouts,
  soldierLoadoutItems,
  monsterTypes,
  monsterTypeFixedAttributes,
  monsterLoadouts,
  monsterLoadoutItems,
  units,
} from '$db/schema';
import { getDb } from './db';
import { resetReferenceCache } from './reference';
import {
  CodexError,
  assertUuid,
  validateSource,
  validateNation,
  validateAttribute,
  validateEquipment,
  validateOptionalRule,
  validateSoldierType,
  validateMonsterType,
  type SoldierTypeInput,
  type MonsterTypeInput,
} from './codex-validation';

export { CodexError };

interface EntityHandlers {
  list(): Promise<unknown[]>;
  create(body: unknown): Promise<unknown>;
  update(id: string, body: unknown): Promise<unknown>;
  remove(id: string): Promise<void>;
}

type Db = ReturnType<typeof getDb>;
// The first arg drizzle hands the transaction callback — a scoped DB handle that
// lacks `$client`, so it isn't assignable to Db. Capture it for join writers.
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
type IdTable = PgTable & { id: AnyPgColumn };

// ── shared helpers ────────────────────────────────────────────────────────────

/** Map a Postgres driver error onto a CodexError with the right HTTP status. */
function mapPgError(e: unknown, op: 'create' | 'update' | 'delete'): never {
  if (e instanceof CodexError) throw e;
  const code = (e as { code?: string }).code;
  if (code === '23505') throw new CodexError('A row with that unique value already exists', 409);
  if (code === '23503') {
    throw op === 'delete'
      ? new CodexError('Cannot delete: other reference data depends on this item', 409)
      : new CodexError('References a row that does not exist', 400);
  }
  if (code === '22P02' || code === '23502' || code === '23514') {
    throw new CodexError('Invalid value for one or more fields', 400);
  }
  throw e;
}

/**
 * True if any saved unit's denormalised snapshot mentions this reference id.
 * Snapshots store reference ids in several differently-named jsonb fields
 * (`nationId`, member `soldierTypeId`/`loadoutId`, attribute `id`, equipment
 * `itemId`); since ids are UUIDs they never collide with other content, so a
 * substring match over the whole snapshot text reliably catches every shape
 * without enumerating each json path. This is the "don't delete reference data
 * a unit still depends on" guard (see CLAUDE.md).
 */
async function isReferencedBySnapshot(db: Db, id: string): Promise<boolean> {
  const rows = await db.execute(
    sql`select 1 from ${units} where ${units.data}::text like ${'%' + id + '%'} limit 1`,
  );
  return rows.length > 0;
}

/** Delete by id, refusing when a saved unit references it or FKs restrict it. */
async function deleteGuarded(table: IdTable, id: string): Promise<void> {
  const db = getDb();
  if (await isReferencedBySnapshot(db, id)) {
    throw new CodexError('Cannot delete: a saved unit references this item', 409);
  }
  try {
    const deleted = await db.delete(table).where(eq(table.id, id)).returning({ id: table.id });
    if (deleted.length === 0) throw new CodexError('Not found', 404);
  } catch (e) {
    mapPgError(e, 'delete');
  }
  resetReferenceCache();
}

// ── flat entities (no join tables) ────────────────────────────────────────────

/**
 * CRUD for a reference table whose columns map 1:1 onto a validated input
 * object. The single `as never` casts bridge our hand-rolled validators to
 * drizzle's per-table insert/update types — values are already validated above.
 */
function flatEntity<I>(opts: {
  table: IdTable;
  orderBy: AnyPgColumn;
  validate: (body: unknown) => I;
}): EntityHandlers {
  const { table, orderBy, validate } = opts;
  return {
    list: () => getDb().select().from(table).orderBy(asc(orderBy)),
    async create(body) {
      const values = validate(body);
      try {
        const [row] = await getDb()
          .insert(table)
          .values(values as never)
          .returning();
        resetReferenceCache();
        return row;
      } catch (e) {
        mapPgError(e, 'create');
      }
    },
    async update(id, body) {
      assertUuid(id);
      const values = validate(body);
      try {
        const [row] = await getDb()
          .update(table)
          .set(values as never)
          .where(eq(table.id, id))
          .returning();
        if (!row) throw new CodexError('Not found', 404);
        resetReferenceCache();
        return row;
      } catch (e) {
        mapPgError(e, 'update');
      }
    },
    remove: (id) => deleteGuarded(table, assertUuid(id)),
  };
}

// ── soldier types (with join tables) ──────────────────────────────────────────

function soldierTypeRow(v: SoldierTypeInput) {
  return {
    name: v.name,
    sourceId: v.sourceId,
    recruitmentCost: v.recruitmentCost,
    stats: v.stats,
    maxPerUnit: v.maxPerUnit,
    equipmentMode: v.equipmentMode,
    equipmentSlots: v.equipmentSlots,
    specialSlots: v.specialSlots,
    attributePicks: v.attributePicks,
    notes: v.notes,
  };
}

/** Insert the nation / fixed-attribute / loadout join rows for one soldier type. */
async function writeSoldierJoins(tx: Tx, soldierTypeId: string, v: SoldierTypeInput) {
  if (v.nationIds.length) {
    await tx.insert(nationSoldierTypes).values(v.nationIds.map((nationId) => ({ nationId, soldierTypeId })));
  }
  if (v.fixedAttributeIds.length) {
    await tx
      .insert(soldierTypeFixedAttributes)
      .values(v.fixedAttributeIds.map((attributeId) => ({ soldierTypeId, attributeId })));
  }
  for (const lo of v.loadouts) {
    const [row] = await tx
      .insert(soldierLoadouts)
      .values({ soldierTypeId, label: lo.label, displayOrder: lo.displayOrder })
      .returning({ id: soldierLoadouts.id });
    if (lo.items.length) {
      await tx.insert(soldierLoadoutItems).values(
        lo.items.map((it) => ({
          loadoutId: row.id,
          equipmentItemId: it.equipmentItemId,
          quantity: it.quantity,
          displayOrder: it.displayOrder,
        })),
      );
    }
  }
}

async function listSoldierTypes() {
  const db = getDb();
  const [types, nats, fixed, loadouts, items] = await Promise.all([
    db.select().from(soldierTypes).orderBy(asc(soldierTypes.name)),
    db.select().from(nationSoldierTypes),
    db.select().from(soldierTypeFixedAttributes),
    db.select().from(soldierLoadouts).orderBy(asc(soldierLoadouts.displayOrder)),
    db.select().from(soldierLoadoutItems).orderBy(asc(soldierLoadoutItems.displayOrder)),
  ]);

  function push<V>(map: Map<string, V[]>, key: string, value: V) {
    const list = map.get(key);
    if (list) list.push(value);
    else map.set(key, [value]);
  }

  const nationIds = new Map<string, string[]>();
  for (const r of nats) push(nationIds, r.soldierTypeId, r.nationId);
  const fixedAttrIds = new Map<string, string[]>();
  for (const r of fixed) push(fixedAttrIds, r.soldierTypeId, r.attributeId);

  const itemsByLoadout = new Map<string, (typeof items)[number][]>();
  for (const it of items) push(itemsByLoadout, it.loadoutId, it);
  const loadoutsByType = new Map<string, unknown[]>();
  for (const lo of loadouts)
    push(loadoutsByType, lo.soldierTypeId, { ...lo, items: itemsByLoadout.get(lo.id) ?? [] });

  return types.map((t) => ({
    ...t,
    nationIds: nationIds.get(t.id) ?? [],
    fixedAttributeIds: fixedAttrIds.get(t.id) ?? [],
    loadouts: loadoutsByType.get(t.id) ?? [],
  }));
}

const soldierTypeHandlers: EntityHandlers = {
  list: listSoldierTypes,
  async create(body) {
    const v = validateSoldierType(body);
    try {
      const id = await getDb().transaction(async (tx) => {
        const [row] = await tx.insert(soldierTypes).values(soldierTypeRow(v)).returning({ id: soldierTypes.id });
        await writeSoldierJoins(tx, row.id, v);
        return row.id;
      });
      resetReferenceCache();
      return { id, ...soldierTypeRow(v), nationIds: v.nationIds, fixedAttributeIds: v.fixedAttributeIds };
    } catch (e) {
      mapPgError(e, 'create');
    }
  },
  async update(id, body) {
    assertUuid(id);
    const v = validateSoldierType(body);
    try {
      const updated = await getDb().transaction(async (tx) => {
        const [row] = await tx
          .update(soldierTypes)
          .set(soldierTypeRow(v))
          .where(eq(soldierTypes.id, id))
          .returning({ id: soldierTypes.id });
        if (!row) return false;
        // Replace joins wholesale (loadout items cascade off soldier_loadouts).
        await tx.delete(nationSoldierTypes).where(eq(nationSoldierTypes.soldierTypeId, id));
        await tx.delete(soldierTypeFixedAttributes).where(eq(soldierTypeFixedAttributes.soldierTypeId, id));
        await tx.delete(soldierLoadouts).where(eq(soldierLoadouts.soldierTypeId, id));
        await writeSoldierJoins(tx, id, v);
        return true;
      });
      if (!updated) throw new CodexError('Not found', 404);
      resetReferenceCache();
      return { id, ...soldierTypeRow(v), nationIds: v.nationIds, fixedAttributeIds: v.fixedAttributeIds };
    } catch (e) {
      mapPgError(e, 'update');
    }
  },
  remove: (id) => deleteGuarded(soldierTypes, assertUuid(id)),
};

// ── monster types (with join tables) ──────────────────────────────────────────

function monsterTypeRow(v: MonsterTypeInput) {
  return {
    name: v.name,
    sourceId: v.sourceId,
    experience: v.experience,
    stats: v.stats,
    equipmentMode: v.equipmentMode,
    notes: v.notes,
  };
}

async function writeMonsterJoins(tx: Tx, monsterTypeId: string, v: MonsterTypeInput) {
  if (v.fixedAttributeIds.length) {
    await tx
      .insert(monsterTypeFixedAttributes)
      .values(v.fixedAttributeIds.map((attributeId) => ({ monsterTypeId, attributeId })));
  }
  for (const lo of v.loadouts) {
    const [row] = await tx
      .insert(monsterLoadouts)
      .values({ monsterTypeId, label: lo.label, displayOrder: lo.displayOrder })
      .returning({ id: monsterLoadouts.id });
    if (lo.items.length) {
      await tx.insert(monsterLoadoutItems).values(
        lo.items.map((it) => ({
          loadoutId: row.id,
          equipmentItemId: it.equipmentItemId,
          quantity: it.quantity,
          displayOrder: it.displayOrder,
        })),
      );
    }
  }
}

async function listMonsterTypes() {
  const db = getDb();
  const [types, fixed, loadouts, items] = await Promise.all([
    db.select().from(monsterTypes).orderBy(asc(monsterTypes.name)),
    db.select().from(monsterTypeFixedAttributes),
    db.select().from(monsterLoadouts).orderBy(asc(monsterLoadouts.displayOrder)),
    db.select().from(monsterLoadoutItems).orderBy(asc(monsterLoadoutItems.displayOrder)),
  ]);

  function push<V>(map: Map<string, V[]>, key: string, value: V) {
    const list = map.get(key);
    if (list) list.push(value);
    else map.set(key, [value]);
  }

  const fixedAttrIds = new Map<string, string[]>();
  for (const r of fixed) push(fixedAttrIds, r.monsterTypeId, r.attributeId);

  const itemsByLoadout = new Map<string, (typeof items)[number][]>();
  for (const it of items) push(itemsByLoadout, it.loadoutId, it);
  const loadoutsByType = new Map<string, unknown[]>();
  for (const lo of loadouts)
    push(loadoutsByType, lo.monsterTypeId, { ...lo, items: itemsByLoadout.get(lo.id) ?? [] });

  return types.map((t) => ({
    ...t,
    fixedAttributeIds: fixedAttrIds.get(t.id) ?? [],
    loadouts: loadoutsByType.get(t.id) ?? [],
  }));
}

const monsterTypeHandlers: EntityHandlers = {
  list: listMonsterTypes,
  async create(body) {
    const v = validateMonsterType(body);
    try {
      const id = await getDb().transaction(async (tx) => {
        const [row] = await tx.insert(monsterTypes).values(monsterTypeRow(v)).returning({ id: monsterTypes.id });
        await writeMonsterJoins(tx, row.id, v);
        return row.id;
      });
      resetReferenceCache();
      return { id, ...monsterTypeRow(v), fixedAttributeIds: v.fixedAttributeIds };
    } catch (e) {
      mapPgError(e, 'create');
    }
  },
  async update(id, body) {
    assertUuid(id);
    const v = validateMonsterType(body);
    try {
      const updated = await getDb().transaction(async (tx) => {
        const [row] = await tx
          .update(monsterTypes)
          .set(monsterTypeRow(v))
          .where(eq(monsterTypes.id, id))
          .returning({ id: monsterTypes.id });
        if (!row) return false;
        await tx.delete(monsterTypeFixedAttributes).where(eq(monsterTypeFixedAttributes.monsterTypeId, id));
        await tx.delete(monsterLoadouts).where(eq(monsterLoadouts.monsterTypeId, id));
        await writeMonsterJoins(tx, id, v);
        return true;
      });
      if (!updated) throw new CodexError('Not found', 404);
      resetReferenceCache();
      return { id, ...monsterTypeRow(v), fixedAttributeIds: v.fixedAttributeIds };
    } catch (e) {
      mapPgError(e, 'update');
    }
  },
  remove: (id) => deleteGuarded(monsterTypes, assertUuid(id)),
};

// ── registry + dispatcher ─────────────────────────────────────────────────────

const registry: Record<string, EntityHandlers> = {
  sources: flatEntity({ table: sources, orderBy: sources.publishedDate, validate: validateSource }),
  nations: flatEntity({ table: nations, orderBy: nations.name, validate: validateNation }),
  attributes: flatEntity({ table: attributes, orderBy: attributes.name, validate: validateAttribute }),
  equipment: flatEntity({ table: equipmentItems, orderBy: equipmentItems.name, validate: validateEquipment }),
  'optional-rules': flatEntity({ table: optionalRules, orderBy: optionalRules.code, validate: validateOptionalRule }),
  'soldier-types': soldierTypeHandlers,
  'monster-types': monsterTypeHandlers,
};

export const ENTITY_SLUGS = Object.keys(registry);

/**
 * Run a Codex API operation: enforce the dev-only gate, resolve the entity, and
 * translate CodexError / unexpected failures into JSON responses. Keeps the
 * route handlers in src/routes/api/codex thin.
 */
export async function runCodex(
  slug: string | undefined,
  fn: (handlers: EntityHandlers) => Promise<Response>,
): Promise<Response> {
  if (!dev) return new Response('Not Found', { status: 404 });
  const handlers = slug ? registry[slug] : undefined;
  if (!handlers) return json({ message: `Unknown Codex entity: ${slug ?? ''}` }, { status: 404 });
  try {
    return await fn(handlers);
  } catch (e) {
    if (e instanceof CodexError) return json({ message: e.message }, { status: e.status });
    console.error('[codex] unexpected error:', e);
    return json({ message: 'Internal error' }, { status: 500 });
  }
}

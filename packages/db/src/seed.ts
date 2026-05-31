import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import * as t from './schema.ts';
import {
  sources as sourceData,
  nations as nationData,
  attributes as attributeData,
  equipment as equipmentData,
  optionalRules as optionalRuleData,
  soldiers as soldierData,
  monsters as monsterData,
} from './seed-data.ts';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client, { casing: 'snake_case' });

// ── sources (the published books) ────────────────────────────────────────────
await db
  .insert(t.sources)
  .values(sourceData.map((s) => ({ code: s.code, name: s.name, kind: s.kind, publishedDate: s.publishedDate, author: s.author })))
  .onConflictDoUpdate({
    target: t.sources.code,
    set: { name: sql`excluded.name`, kind: sql`excluded.kind`, publishedDate: sql`excluded.published_date`, author: sql`excluded.author` },
  });

const sourceByCode = new Map((await db.select({ id: t.sources.id, code: t.sources.code }).from(t.sources)).map((r) => [r.code, r.id]));
const srcId = (code: string) => {
  const id = sourceByCode.get(code);
  if (!id) throw new Error(`unknown source code: ${code}`);
  return id;
};

// ── nations ───────────────────────────────────────────────────────────────────
await db
  .insert(t.nations)
  .values(nationData.map((n) => ({ name: n.name, sourceId: srcId(n.sourceCode), description: n.description, flag: n.flag })))
  .onConflictDoUpdate({ target: t.nations.name, set: { sourceId: sql`excluded.source_id`, description: sql`excluded.description`, flag: sql`excluded.flag` } });
const nationByName = new Map((await db.select({ id: t.nations.id, name: t.nations.name }).from(t.nations)).map((r) => [r.name, r.id]));

// ── attributes (officer-flagged + extras) ──────────────────────────────────────
await db
  .insert(t.attributes)
  .values(attributeData.map((a) => ({ name: a.name, rules: a.rules || a.name, isOfficer: a.isOfficer, sourceId: srcId(a.sourceCode) })))
  .onConflictDoUpdate({
    target: t.attributes.name,
    set: { rules: sql`excluded.rules`, isOfficer: sql`excluded.is_officer`, sourceId: sql`excluded.source_id` },
  });
const attrByName = new Map((await db.select({ id: t.attributes.id, name: t.attributes.name }).from(t.attributes)).map((r) => [r.name, r.id]));

// ── equipment (all from the core rulebook) ──────────────────────────────────────
await db
  .insert(t.equipmentItems)
  .values(equipmentData.map((e) => ({ name: e.name, category: e.category, slotCost: e.slotCost, isSpecial: e.isSpecial, sourceId: srcId(e.sourceCode), rules: e.rules || null })))
  .onConflictDoUpdate({
    target: t.equipmentItems.name,
    set: { category: sql`excluded.category`, slotCost: sql`excluded.slot_cost`, isSpecial: sql`excluded.is_special`, sourceId: sql`excluded.source_id`, rules: sql`excluded.rules` },
  });
const equipByName = new Map((await db.select({ id: t.equipmentItems.id, name: t.equipmentItems.name }).from(t.equipmentItems)).map((r) => [r.name, r.id]));

// ── soldier types ───────────────────────────────────────────────────────────────
await db
  .insert(t.soldierTypes)
  .values(
    soldierData.map((s) => ({
      name: s.name,
      sourceId: srcId(s.sourceCode),
      recruitmentCost: s.recruitmentCost,
      stats: s.stats,
      maxPerUnit: s.maxPerUnit,
      equipmentMode: s.equipmentMode,
      equipmentSlots: s.equipmentSlots,
      specialSlots: s.specialSlots,
      attributePicks: s.attributePicks,
      description: s.description,
    })),
  )
  .onConflictDoUpdate({
    target: t.soldierTypes.name,
    set: {
      sourceId: sql`excluded.source_id`, recruitmentCost: sql`excluded.recruitment_cost`, stats: sql`excluded.stats`,
      maxPerUnit: sql`excluded.max_per_unit`, equipmentMode: sql`excluded.equipment_mode`,
      equipmentSlots: sql`excluded.equipment_slots`, specialSlots: sql`excluded.special_slots`, attributePicks: sql`excluded.attribute_picks`,
      description: sql`excluded.description`,
    },
  });
const soldierByName = new Map((await db.select({ id: t.soldierTypes.id, name: t.soldierTypes.name }).from(t.soldierTypes)).map((r) => [r.name, r.id]));

// ── nation → soldier availability ───────────────────────────────────────────────
const nstRows = nationData.flatMap((n) =>
  n.soldiers
    .map((name) => {
      const soldierTypeId = soldierByName.get(name);
      if (!soldierTypeId) {
        console.warn(`nation ${n.name}: unknown soldier "${name}"`);
        return null;
      }
      return { nationId: nationByName.get(n.name)!, soldierTypeId };
    })
    .filter((r): r is { nationId: string; soldierTypeId: string } => r !== null),
);
await db.insert(t.nationSoldierTypes).values(nstRows).onConflictDoNothing();

// ── soldier → fixed attributes ──────────────────────────────────────────────────
const fixedRows = soldierData.flatMap((s) =>
  s.fixedAttributes.map((name) => ({ soldierTypeId: soldierByName.get(s.name)!, attributeId: attrByName.get(name)! })),
);
await db.insert(t.soldierTypeFixedAttributes).values(fixedRows).onConflictDoNothing();

// ── soldier loadouts (+ items) — surrogate keys, so clear and re-insert ──────────
await db.delete(t.soldierLoadoutItems);
await db.delete(t.soldierLoadouts);
let loadoutCount = 0;
let itemCount = 0;
for (const s of soldierData) {
  for (const lo of s.loadouts) {
    const inserted = await db
      .insert(t.soldierLoadouts)
      .values({ soldierTypeId: soldierByName.get(s.name)!, label: lo.label, displayOrder: lo.order })
      .returning({ id: t.soldierLoadouts.id });
    const loadoutId = inserted[0]!.id;
    loadoutCount++;
    if (lo.items.length) {
      await db.insert(t.soldierLoadoutItems).values(
        lo.items.map((it, i) => ({
          loadoutId,
          equipmentItemId: equipByName.get(it.name)!,
          quantity: it.qty,
          displayOrder: i,
        })),
      );
      itemCount += lo.items.length;
    }
  }
}

// ── monster types ───────────────────────────────────────────────────────────────
if (monsterData.length) {
  await db
    .insert(t.monsterTypes)
    .values(
      monsterData.map((m) => ({
        name: m.name,
        sourceId: srcId(m.sourceCode),
        experience: m.experience,
        stats: m.stats,
        equipmentMode: m.equipmentMode,
        description: m.description,
      })),
    )
    .onConflictDoUpdate({
      target: t.monsterTypes.name,
      set: {
        sourceId: sql`excluded.source_id`,
        experience: sql`excluded.experience`,
        stats: sql`excluded.stats`,
        equipmentMode: sql`excluded.equipment_mode`,
        description: sql`excluded.description`,
      },
    });
}
const monsterByName = new Map(
  (await db.select({ id: t.monsterTypes.id, name: t.monsterTypes.name }).from(t.monsterTypes)).map((r) => [r.name, r.id]),
);

// ── monster → fixed attributes ──────────────────────────────────────────────────
const monsterFixedRows = monsterData.flatMap((m) =>
  m.fixedAttributes
    .map((name) => {
      const attrId = attrByName.get(name);
      if (!attrId) { console.warn(`monster ${m.name}: unknown attribute "${name}"`); return null; }
      const monsterTypeId = monsterByName.get(m.name)!;
      return { monsterTypeId, attributeId: attrId };
    })
    .filter((r): r is { monsterTypeId: string; attributeId: string } => r !== null),
);
if (monsterFixedRows.length) {
  await db.insert(t.monsterTypeFixedAttributes).values(monsterFixedRows).onConflictDoNothing();
}

// ── monster loadouts (+ items) — surrogate keys, so clear and re-insert ─────────
await db.delete(t.monsterLoadoutItems);
await db.delete(t.monsterLoadouts);
let monsterLoadoutCount = 0;
let monsterEquipCount = 0;
for (const m of monsterData) {
  const monsterTypeId = monsterByName.get(m.name);
  if (!monsterTypeId) continue;
  for (const lo of m.loadouts) {
    const inserted = await db
      .insert(t.monsterLoadouts)
      .values({ monsterTypeId, label: lo.label, displayOrder: lo.order })
      .returning({ id: t.monsterLoadouts.id });
    const loadoutId = inserted[0]!.id;
    monsterLoadoutCount++;
    if (lo.items.length) {
      await db.insert(t.monsterLoadoutItems).values(
        lo.items.map((it, i) => ({
          loadoutId,
          equipmentItemId: equipByName.get(it.name)!,
          quantity: it.qty,
          displayOrder: i,
        })),
      );
      monsterEquipCount += lo.items.length;
    }
  }
}

// ── optional rules ──────────────────────────────────────────────────────────────
if (optionalRuleData.length) {
  await db
    .insert(t.optionalRules)
    .values(optionalRuleData.map((r) => ({ code: r.code, name: r.name, description: r.description, sourceId: srcId(r.sourceCode) })))
    .onConflictDoUpdate({
      target: t.optionalRules.code,
      set: { name: sql`excluded.name`, description: sql`excluded.description`, sourceId: sql`excluded.source_id` },
    });
}

console.log(
  `seeded: ${sourceData.length} sources, ${nationData.length} nations, ${attributeData.length} attributes, ` +
    `${equipmentData.length} equipment, ${optionalRuleData.length} optional rules, ${soldierData.length} soldier types, ` +
    `${nstRows.length} nation-soldier links, ${fixedRows.length} fixed attributes, ${loadoutCount} loadouts (${itemCount} items), ` +
    `${monsterData.length} monster types (${monsterFixedRows.length} attributes, ${monsterLoadoutCount} loadouts, ${monsterEquipCount} items)`,
);
await client.end();

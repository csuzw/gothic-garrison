import { asc, eq } from 'drizzle-orm';
import {
  monsterTypes,
  monsterTypeFixedAttributes,
  monsterLoadouts,
  monsterLoadoutItems,
  attributes,
  equipmentItems,
  sources,
} from '$db/schema';
import type { SoldierStats } from '$lib/unit/types';
import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export interface BestiaryLoadout {
  label: string;
  items: { name: string; quantity: number }[];
}

export interface BestiaryMonster {
  id: string;
  name: string;
  sourceCode: string;
  stats: SoldierStats;
  equipmentMode: 'fixed' | 'choice';
  notes: string | null;
  attributes: string[];
  loadouts: BestiaryLoadout[];
}

export const load: PageServerLoad = async () => {
  try {
    const db = getDb();
    const [monsters, fixedRows, loadoutRows, loadoutItemRows] = await Promise.all([
      db
        .select({
          id: monsterTypes.id,
          name: monsterTypes.name,
          sourceCode: sources.code,
          stats: monsterTypes.stats,
          equipmentMode: monsterTypes.equipmentMode,
          notes: monsterTypes.notes,
        })
        .from(monsterTypes)
        .innerJoin(sources, eq(sources.id, monsterTypes.sourceId))
        .orderBy(asc(monsterTypes.name)),
      db
        .select({ monsterTypeId: monsterTypeFixedAttributes.monsterTypeId, name: attributes.name })
        .from(monsterTypeFixedAttributes)
        .innerJoin(attributes, eq(attributes.id, monsterTypeFixedAttributes.attributeId)),
      db
        .select({
          id: monsterLoadouts.id,
          monsterTypeId: monsterLoadouts.monsterTypeId,
          label: monsterLoadouts.label,
          displayOrder: monsterLoadouts.displayOrder,
        })
        .from(monsterLoadouts)
        .orderBy(asc(monsterLoadouts.displayOrder)),
      db
        .select({
          loadoutId: monsterLoadoutItems.loadoutId,
          name: equipmentItems.name,
          quantity: monsterLoadoutItems.quantity,
        })
        .from(monsterLoadoutItems)
        .innerJoin(equipmentItems, eq(equipmentItems.id, monsterLoadoutItems.equipmentItemId))
        .orderBy(asc(monsterLoadoutItems.displayOrder)),
    ]);

    const attrsByMonster = new Map<string, string[]>();
    for (const r of fixedRows) {
      const list = attrsByMonster.get(r.monsterTypeId);
      if (list) list.push(r.name);
      else attrsByMonster.set(r.monsterTypeId, [r.name]);
    }

    const itemsByLoadout = new Map<string, { name: string; quantity: number }[]>();
    for (const r of loadoutItemRows) {
      const list = itemsByLoadout.get(r.loadoutId);
      const entry = { name: r.name, quantity: r.quantity };
      if (list) list.push(entry);
      else itemsByLoadout.set(r.loadoutId, [entry]);
    }

    const loadoutsByMonster = new Map<string, BestiaryLoadout[]>();
    for (const lo of loadoutRows) {
      const entry: BestiaryLoadout = { label: lo.label, items: itemsByLoadout.get(lo.id) ?? [] };
      const list = loadoutsByMonster.get(lo.monsterTypeId);
      if (list) list.push(entry);
      else loadoutsByMonster.set(lo.monsterTypeId, [entry]);
    }

    const bestiary: BestiaryMonster[] = monsters.map((m) => ({
      id: m.id,
      name: m.name,
      sourceCode: m.sourceCode,
      stats: m.stats as SoldierStats,
      equipmentMode: m.equipmentMode as 'fixed' | 'choice',
      notes: m.notes,
      attributes: (attrsByMonster.get(m.id) ?? []).sort((a, b) => a.localeCompare(b)),
      loadouts: loadoutsByMonster.get(m.id) ?? [],
    }));

    return { bestiary };
  } catch (err) {
    console.warn('[gothic-garrison] bestiary unavailable:', err);
    return { bestiary: [] as BestiaryMonster[] };
  }
};

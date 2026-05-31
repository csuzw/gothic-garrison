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
  items: { name: string; quantity: number; rules: string | null }[];
}

export interface BestiaryMonster {
  id: string;
  name: string;
  sourceCode: string;
  stats: SoldierStats;
  equipmentMode: 'fixed' | 'choice';
  description: string | null;
  attributes: { name: string; rules: string | null }[];
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
          description: monsterTypes.description,
        })
        .from(monsterTypes)
        .innerJoin(sources, eq(sources.id, monsterTypes.sourceId))
        .orderBy(asc(monsterTypes.name)),
      db
        .select({ monsterTypeId: monsterTypeFixedAttributes.monsterTypeId, name: attributes.name, rules: attributes.rules })
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
          rules: equipmentItems.rules,
        })
        .from(monsterLoadoutItems)
        .innerJoin(equipmentItems, eq(equipmentItems.id, monsterLoadoutItems.equipmentItemId))
        .orderBy(asc(monsterLoadoutItems.displayOrder)),
    ]);

    const attrsByMonster = new Map<string, { name: string; rules: string | null }[]>();
    for (const r of fixedRows) {
      const list = attrsByMonster.get(r.monsterTypeId);
      const entry = { name: r.name, rules: r.rules };
      if (list) list.push(entry);
      else attrsByMonster.set(r.monsterTypeId, [entry]);
    }

    const itemsByLoadout = new Map<string, { name: string; quantity: number; rules: string | null }[]>();
    for (const r of loadoutItemRows) {
      const list = itemsByLoadout.get(r.loadoutId);
      const entry = { name: r.name, quantity: r.quantity, rules: r.rules };
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
      description: m.description,
      attributes: (attrsByMonster.get(m.id) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
      loadouts: loadoutsByMonster.get(m.id) ?? [],
    }));

    return { bestiary };
  } catch (err) {
    console.warn('[gothic-garrison] bestiary unavailable:', err);
    return { bestiary: [] as BestiaryMonster[] };
  }
};

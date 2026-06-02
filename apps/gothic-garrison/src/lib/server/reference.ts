import { asc, eq } from 'drizzle-orm';
import {
  nations,
  sources,
  soldierTypes,
  nationSoldierTypes,
  attributes,
  equipmentItems,
  soldierTypeFixedAttributes,
  soldierLoadouts,
  soldierLoadoutItems,
} from '$db/schema';
import type { SoldierStats } from '$lib/unit/types';
import { getDb } from './db';

export interface RefNation {
  id: string;
  name: string;
  flag: string | null;
  description: string | null;
  sourceCode: string;
}

export interface RefAttribute {
  id: string;
  name: string;
  isOfficer: boolean;
  rules: string | null;
  sourceCode: string;
}

export interface RefEquipment {
  id: string;
  name: string;
  slotCost: number;
  isSpecial: boolean;
  category: string;
  rules: string | null;
  sourceCode: string;
}

export interface RefLoadoutItem {
  itemId: string;
  name: string;
  slotCost: number;
  isSpecial: boolean;
  quantity: number;
}

export interface RefLoadout {
  id: string;
  label: string;
  items: RefLoadoutItem[];
}

export interface RefSoldier {
  id: string;
  name: string;
  recruitmentCost: number;
  stats: SoldierStats;
  maxPerUnit: number | null;
  equipmentMode: 'fixed' | 'choice' | 'pool';
  equipmentSlots: number | null;
  specialSlots: number | null;
  attributePicks: number;
  fixedAttributes: { name: string; rules: string | null }[];
  nationIds: string[];
  loadouts: RefLoadout[];
  sourceCode: string;
}

export interface RefSource {
  id: string;
  code: string;
  name: string;
  kind: 'core' | 'supplement';
}

export interface ReferenceData {
  nations: RefNation[];
  attributes: RefAttribute[];
  equipment: RefEquipment[];
  soldiers: RefSoldier[];
  sources: RefSource[];
}

// Reference data is effectively static at runtime, so resolve it once.
let cached: ReferenceData | undefined;

// The Codex (local-dev-only) mutates reference rows; it calls this after every
// write so the next builder load re-reads the DB instead of stale cache.
export function resetReferenceCache(): void {
  cached = undefined;
}

export async function getReferenceData(): Promise<ReferenceData> {
  if (cached) return cached;

  const db = getDb();
  const [nats, attrs, equip, sols, links, fixed, loadouts, loadoutItems, srcs] = await Promise.all([
    db
      .select({ id: nations.id, name: nations.name, flag: nations.flag, description: nations.description, sourceCode: sources.code })
      .from(nations)
      .innerJoin(sources, eq(nations.sourceId, sources.id))
      .orderBy(asc(nations.name)),
    db
      .select({ id: attributes.id, name: attributes.name, isOfficer: attributes.isOfficer, rules: attributes.rules, sourceCode: sources.code })
      .from(attributes)
      .innerJoin(sources, eq(attributes.sourceId, sources.id))
      .orderBy(asc(attributes.name)),
    db
      .select({
        id: equipmentItems.id,
        name: equipmentItems.name,
        slotCost: equipmentItems.slotCost,
        isSpecial: equipmentItems.isSpecial,
        category: equipmentItems.category,
        rules: equipmentItems.rules,
        sourceCode: sources.code,
      })
      .from(equipmentItems)
      .innerJoin(sources, eq(equipmentItems.sourceId, sources.id))
      .orderBy(asc(equipmentItems.name)),
    db
      .select({
        id: soldierTypes.id,
        name: soldierTypes.name,
        recruitmentCost: soldierTypes.recruitmentCost,
        stats: soldierTypes.stats,
        maxPerUnit: soldierTypes.maxPerUnit,
        equipmentMode: soldierTypes.equipmentMode,
        equipmentSlots: soldierTypes.equipmentSlots,
        specialSlots: soldierTypes.specialSlots,
        attributePicks: soldierTypes.attributePicks,
        sourceCode: sources.code,
      })
      .from(soldierTypes)
      .innerJoin(sources, eq(soldierTypes.sourceId, sources.id))
      .orderBy(asc(soldierTypes.name)),
    db
      .select({ nationId: nationSoldierTypes.nationId, soldierTypeId: nationSoldierTypes.soldierTypeId })
      .from(nationSoldierTypes),
    db
      .select({ soldierTypeId: soldierTypeFixedAttributes.soldierTypeId, name: attributes.name, rules: attributes.rules })
      .from(soldierTypeFixedAttributes)
      .innerJoin(attributes, eq(attributes.id, soldierTypeFixedAttributes.attributeId)),
    db.select().from(soldierLoadouts).orderBy(asc(soldierLoadouts.displayOrder)),
    db
      .select({
        loadoutId: soldierLoadoutItems.loadoutId,
        quantity: soldierLoadoutItems.quantity,
        displayOrder: soldierLoadoutItems.displayOrder,
        itemId: equipmentItems.id,
        name: equipmentItems.name,
        slotCost: equipmentItems.slotCost,
        isSpecial: equipmentItems.isSpecial,
      })
      .from(soldierLoadoutItems)
      .innerJoin(equipmentItems, eq(equipmentItems.id, soldierLoadoutItems.equipmentItemId))
      .orderBy(asc(soldierLoadoutItems.displayOrder)),
    db
      .select({ id: sources.id, code: sources.code, name: sources.name, kind: sources.kind })
      .from(sources)
      .orderBy(asc(sources.name)),
  ]);

  const nationsBySoldier = new Map<string, string[]>();
  for (const l of links) (nationsBySoldier.get(l.soldierTypeId) ?? nationsBySoldier.set(l.soldierTypeId, []).get(l.soldierTypeId)!).push(l.nationId);

  const fixedBySoldier = new Map<string, { name: string; rules: string | null }[]>();
  for (const f of fixed) (fixedBySoldier.get(f.soldierTypeId) ?? fixedBySoldier.set(f.soldierTypeId, []).get(f.soldierTypeId)!).push({ name: f.name, rules: f.rules });

  const itemsByLoadout = new Map<string, RefLoadoutItem[]>();
  for (const it of loadoutItems)
    (itemsByLoadout.get(it.loadoutId) ?? itemsByLoadout.set(it.loadoutId, []).get(it.loadoutId)!).push({
      itemId: it.itemId,
      name: it.name,
      slotCost: it.slotCost,
      isSpecial: it.isSpecial,
      quantity: it.quantity,
    });

  const loadoutsBySoldier = new Map<string, RefLoadout[]>();
  for (const lo of loadouts)
    (loadoutsBySoldier.get(lo.soldierTypeId) ?? loadoutsBySoldier.set(lo.soldierTypeId, []).get(lo.soldierTypeId)!).push({
      id: lo.id,
      label: lo.label,
      items: itemsByLoadout.get(lo.id) ?? [],
    });

  cached = {
    nations: nats,
    attributes: attrs,
    equipment: equip,
    soldiers: sols.map((s) => ({
      id: s.id,
      name: s.name,
      recruitmentCost: s.recruitmentCost,
      stats: s.stats as SoldierStats,
      maxPerUnit: s.maxPerUnit,
      equipmentMode: s.equipmentMode,
      equipmentSlots: s.equipmentSlots,
      specialSlots: s.specialSlots,
      attributePicks: s.attributePicks,
      fixedAttributes: fixedBySoldier.get(s.id) ?? [],
      nationIds: nationsBySoldier.get(s.id) ?? [],
      loadouts: loadoutsBySoldier.get(s.id) ?? [],
      sourceCode: s.sourceCode,
    })),
    sources: srcs as RefSource[],
  };
  return cached;
}

import {
  BASE_RECRUITMENT_BUDGET,
  recruitmentBudget,
  spentPoints,
  type CommandStyle,
} from './budget.ts';

export { BASE_RECRUITMENT_BUDGET };

// The denormalised unit document. This is the single source of truth, stored
// verbatim in `units.data` (jsonb) for signed-in users and in IndexedDB for
// anonymous ones — the *same shape* in both places (see CLAUDE.md). Snapshotted
// fields (member name/cost/stats) make a unit renderable without current
// reference data.

export const UNIT_SCHEMA_VERSION = 1;

// Officer's three confirmed binary choices (one per row).
export type CombatTraining = 'melee' | 'accuracy';
export type PhysicalEdge = 'health' | 'speed';
export type { CommandStyle };

export interface AttributeSnapshot {
  id: string;
  name: string;
  /** Only set for soldier-purchased attributes (pickScope 'soldier'|'any'). */
  costDelta?: number;
}

export interface EquipmentSnapshot {
  itemId: string;
  name: string;
  slotCost: number;
  isSpecial: boolean;
  quantity: number;
}

export interface OfficerSnapshot {
  name: string;
  bio?: string;
  combatTraining: CombatTraining;
  physicalEdge: PhysicalEdge;
  commandStyle: CommandStyle;
  /** Pick exactly 2 from the officer-flagged pool. */
  attributes: AttributeSnapshot[];
  equipment: EquipmentSnapshot[];
}

export interface SoldierStats {
  speed: number;
  melee: number;
  accuracy: number;
  defence: number;
  courage: number;
  health: number;
}

/** Display metadata for each stat, in rulebook column order. */
export const STAT_META: Array<{
  key: keyof SoldierStats;
  label: string;
  short: string;
  /** True for dice-modifier stats shown as +N / -N (Melee, Accuracy, Courage). */
  mod: boolean;
}> = [
  { key: 'speed',    label: 'Speed',    short: 'Spd', mod: false },
  { key: 'melee',    label: 'Melee',    short: 'Mel', mod: true  },
  { key: 'accuracy', label: 'Accuracy', short: 'Acc', mod: true  },
  { key: 'defence',  label: 'Defence',  short: 'Def', mod: false },
  { key: 'courage',  label: 'Courage',  short: 'Cou', mod: true  },
  { key: 'health',   label: 'Health',   short: 'Hp',  mod: false },
];

export interface MemberSnapshot {
  id: string;
  soldierTypeId: string | null;
  /** Snapshotted soldier type name (e.g. "Artillerist"). Read-only after creation. */
  name: string;
  /** Optional player-assigned character name (e.g. "Hans"). */
  customName?: string;
  bio?: string;
  cost: number;
  stats: SoldierStats | null;
  /** Attributes picked from the officer pool (for soldiers with attribute_picks). */
  attributes: AttributeSnapshot[];
  /** Optionally purchased attributes (e.g. Fey-Touched +4 pts). Snapshotted with costDelta. */
  purchasedAttributes: AttributeSnapshot[];
  /** Carried equipment: the fixed/chosen loadout's items, or pool-built items. */
  equipment: EquipmentSnapshot[];
  /** Special Armoury picks for fixed/choice-mode soldiers (1 normally, 2 with Supernatural Veteran). Pool soldiers manage special via EquipmentBuilder. */
  specialEquipment: EquipmentSnapshot[];
  /** For `choice`-mode soldiers: which predetermined loadout is selected. */
  loadoutId: string | null;
  /** True when this soldier was recruited via the outside-nation optional rule (+8 pts). */
  isOutsideNationPick?: boolean;
}

export const OUTSIDE_NATION_RULE_CODE = 'outside-nation-soldier';
export const OUTSIDE_NATION_SOLDIER_COST = 8;

export const MAX_SOLDIERS = 7;
export const OFFICER_EQUIPMENT_SLOTS = 6;
export const OFFICER_ATTRIBUTE_PICKS = 2;
export const SUPERNATURAL_VETERAN = 'Supernatural Veteran';

export const OFFICER_BASE_STATS: SoldierStats = {
  speed: 6,
  melee: 1,
  accuracy: 1,
  defence: 14,
  courage: 2,
  health: 12,
};

export function officerStats(officer: OfficerSnapshot): SoldierStats {
  return {
    speed: OFFICER_BASE_STATS.speed + (officer.physicalEdge === 'speed' ? 1 : 0),
    melee: OFFICER_BASE_STATS.melee + (officer.combatTraining === 'melee' ? 1 : 0),
    accuracy: OFFICER_BASE_STATS.accuracy + (officer.combatTraining === 'accuracy' ? 1 : 0),
    defence: OFFICER_BASE_STATS.defence,
    courage: OFFICER_BASE_STATS.courage + (officer.commandStyle === 'courage' ? 1 : 0),
    health: OFFICER_BASE_STATS.health + (officer.physicalEdge === 'health' ? 1 : 0),
  };
}

export function slotsUsed(items: EquipmentSnapshot[]): number {
  return items.reduce((n, it) => n + it.slotCost * it.quantity, 0);
}

export function specialUsed(items: EquipmentSnapshot[]): number {
  return items.reduce((n, it) => n + (it.isSpecial ? it.quantity : 0), 0);
}

/** Officer gets 2 Special Armoury slots, or 3 with the Supernatural Veteran attribute. */
export function officerSpecialMax(officer: OfficerSnapshot): number {
  return officer.attributes.some((a) => a.name === SUPERNATURAL_VETERAN) ? 3 : 2;
}

function hasSV(picked: AttributeSnapshot[], fixed: { name: string }[]): boolean {
  return picked.some((a) => a.name === SUPERNATURAL_VETERAN) ||
    fixed.some((a) => a.name === SUPERNATURAL_VETERAN);
}

/** Pool soldier gets their type's base special slots, +1 with the Supernatural Veteran attribute. */
export function soldierSpecialMax(
  member: MemberSnapshot,
  baseSpecialSlots: number,
  fixedAttributes: { name: string }[] = [],
): number {
  return hasSV(member.attributes, fixedAttributes) ? baseSpecialSlots + 1 : baseSpecialSlots;
}

/** Fixed/choice soldier gets 1 Special Armoury pick, or 2 with the Supernatural Veteran attribute. */
export function memberSpecialPicks(
  member: MemberSnapshot,
  fixedAttributes: { name: string }[] = [],
): number {
  return hasSV(member.attributes, fixedAttributes) ? 2 : 1;
}

/** Normalize a raw stored UnitDoc to the current schema. Handles migrations from older shapes. */
export function normalizeUnitDoc(raw: any): UnitDoc {
  return {
    ...raw,
    enabledSourceCodes: raw.enabledSourceCodes ?? null,
    optionalRules: raw.optionalRules ?? [],
    members: (raw.members ?? []).map((m: any) => ({
      ...m,
      specialEquipment: Array.isArray(m.specialEquipment)
        ? m.specialEquipment
        : m.specialEquipment
        ? [m.specialEquipment]
        : [],
      purchasedAttributes: Array.isArray(m.purchasedAttributes) ? m.purchasedAttributes : [],
    })),
  };
}

export interface UnitDoc {
  id: string;
  schemaVersion: number;
  name: string;
  nationId: string | null;
  nationName: string | null;
  officer: OfficerSnapshot;
  members: MemberSnapshot[];
  /** Opted-in optional-rule codes, e.g. the "+8 pts outside-nation soldier". */
  optionalRules: string[];
  /** Source codes enabled for this unit. null = all sources. Core is always included. Set at creation, read-only after. */
  enabledSourceCodes: string[] | null;
  /** House-rule starting recruitment budget. Defaults to BASE_RECRUITMENT_BUDGET (100) when absent. Min 50. */
  baseBudget?: number;
  updatedAt: string; // ISO timestamp
}

export interface UnitSummary {
  id: string;
  name: string;
  nationId: string | null;
  updatedAt: string;
  members: { soldierTypeId: string | null; name: string }[];
}

export function createUnitDoc(name = 'New unit'): UnitDoc {
  return {
    id: crypto.randomUUID(),
    schemaVersion: UNIT_SCHEMA_VERSION,
    name,
    nationId: null,
    nationName: null,
    officer: {
      name: '',
      combatTraining: 'melee',
      physicalEdge: 'health',
      commandStyle: 'courage',
      attributes: [],
      equipment: [],
    },
    members: [],
    optionalRules: [],
    enabledSourceCodes: null,
    updatedAt: new Date().toISOString(),
  };
}

export function unitBudget(doc: UnitDoc): number {
  return recruitmentBudget(doc.baseBudget ?? BASE_RECRUITMENT_BUDGET, doc.officer.commandStyle);
}

export function memberPurchasedCost(m: MemberSnapshot): number {
  return (m.purchasedAttributes ?? []).reduce((s, a) => s + (a.costDelta ?? 0), 0);
}

export function unitSpent(doc: UnitDoc): number {
  return spentPoints(doc.members.map((m) => m.cost + memberPurchasedCost(m)));
}

export function toSummary(doc: UnitDoc): UnitSummary {
  return {
    id: doc.id,
    name: doc.name,
    nationId: doc.nationId,
    updatedAt: doc.updatedAt,
    members: doc.members.map((m) => ({ soldierTypeId: m.soldierTypeId, name: m.name })),
  };
}

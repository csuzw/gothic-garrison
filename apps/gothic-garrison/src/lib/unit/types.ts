import {
  BASE_RECRUITMENT_BUDGET,
  recruitmentBudget,
  spentPoints,
  type CommandStyle,
} from './budget.ts';

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
  /** Carried equipment: the fixed/chosen loadout's items, or pool-built items. */
  equipment: EquipmentSnapshot[];
  /** One special armoury item pick for fixed/choice-mode soldiers (pool soldiers manage special via EquipmentBuilder). */
  specialEquipment?: EquipmentSnapshot | null;
  /** For `choice`-mode soldiers: which predetermined loadout is selected. */
  loadoutId: string | null;
}

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
  updatedAt: string; // ISO timestamp
}

export interface UnitSummary {
  id: string;
  name: string;
  nationId: string | null;
  updatedAt: string;
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
    updatedAt: new Date().toISOString(),
  };
}

export function unitBudget(doc: UnitDoc): number {
  return recruitmentBudget(BASE_RECRUITMENT_BUDGET, doc.officer.commandStyle);
}

export function unitSpent(doc: UnitDoc): number {
  return spentPoints(doc.members.map((m) => m.cost));
}

export function toSummary(doc: UnitDoc): UnitSummary {
  return { id: doc.id, name: doc.name, nationId: doc.nationId, updatedAt: doc.updatedAt };
}

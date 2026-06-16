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

export const UNIT_SCHEMA_VERSION = 2;

// ── Campaign types ───────────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'retired' | 'dead' | 'permanently_insane';

export type TierUpgradeType =
  | 'stat_courage' | 'stat_health' | 'stat_melee' | 'stat_accuracy'
  | 'new_attribute' | 'budget_5' | 'budget_10'; // budget_* are officer-only

export interface TierUpgrade {
  tier: number;
  type: TierUpgradeType;
  attributeId?: string;
  attributeName?: string;
}

export interface CampaignEffect {
  id: string;
  label: string;
  /** Absent for label-only effects (most madness results). */
  statDelta?: Partial<SoldierStats>;
}

// XP thresholds for tiers 1–9
export const XP_TIER_THRESHOLDS = [5, 10, 18, 30, 45, 65, 100, 150, 200] as const;

// Upgrade options available per tier; budget_* excluded for non-officers
export const TIER_UPGRADE_OPTIONS: Record<number, TierUpgradeType[]> = {
  1: ['stat_courage'],
  2: ['stat_health', 'new_attribute', 'budget_5'],
  3: ['stat_melee', 'stat_accuracy', 'budget_10'],
  4: ['stat_courage'],
  5: ['stat_health', 'new_attribute', 'budget_5'],
  6: ['stat_courage', 'stat_health', 'new_attribute', 'budget_5'],
  7: ['stat_courage', 'stat_health', 'new_attribute', 'budget_5'],
  8: ['stat_courage', 'stat_health', 'new_attribute', 'budget_5'],
  9: ['stat_courage', 'stat_health', 'new_attribute', 'budget_5'],
};

export const TIER_UPGRADE_LABELS: Record<TierUpgradeType, string> = {
  stat_courage: '+1 Courage',
  stat_health: '+1 Health',
  stat_melee: '+1 Melee',
  stat_accuracy: '+1 Shoot',
  new_attribute: 'New Attribute',
  budget_5: '+5 Recruit',
  budget_10: '+10 Recruit',
};

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
  // Campaign fields — absent on non-campaign units
  xp?: number;
  tierUpgrades?: TierUpgrade[];
  campaignEffects?: CampaignEffect[];
  /** Set only when archived in removedOfficers. */
  status?: Exclude<MemberStatus, 'active'>;
  removalReason?: string;
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
  // Campaign fields — absent on non-campaign units
  xp?: number;
  tierUpgrades?: TierUpgrade[];
  campaignEffects?: CampaignEffect[];
  status?: MemberStatus;
  removalReason?: string;
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
    campaignMode: raw.campaignMode ?? false,
    removedOfficers: raw.removedOfficers ?? [],
    members: (raw.members ?? []).map((m: any) => ({
      ...m,
      specialEquipment: Array.isArray(m.specialEquipment)
        ? m.specialEquipment
        : m.specialEquipment
        ? [m.specialEquipment]
        : [],
      purchasedAttributes: Array.isArray(m.purchasedAttributes) ? m.purchasedAttributes : [],
      tierUpgrades: m.tierUpgrades ?? [],
      campaignEffects: m.campaignEffects ?? [],
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
  // Campaign fields
  campaignMode?: boolean;
  /** Officers archived due to death, insanity, or retirement. doc.officer is always the current active one. */
  removedOfficers?: OfficerSnapshot[];
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

export function xpToTier(xp: number): number {
  let tier = 0;
  for (let i = 0; i < XP_TIER_THRESHOLDS.length; i++) {
    if (xp >= XP_TIER_THRESHOLDS[i]) tier = i + 1;
    else break;
  }
  return tier;
}

export function pendingUpgradeCount(xp: number, tierUpgrades: TierUpgrade[]): number {
  return xpToTier(xp) - tierUpgrades.length;
}

export function officerCampaignBudgetBonus(officer: OfficerSnapshot): number {
  return (officer.tierUpgrades ?? []).reduce((sum, u) => {
    if (u.type === 'budget_5') return sum + 5;
    if (u.type === 'budget_10') return sum + 10;
    return sum;
  }, 0);
}

/** Compute effective stats from base stats plus tier upgrade bonuses and campaign effect penalties. */
export function effectiveStats(
  base: SoldierStats,
  tierUpgrades: TierUpgrade[] = [],
  campaignEffects: CampaignEffect[] = [],
): SoldierStats {
  const result = { ...base };
  for (const u of tierUpgrades) {
    if (u.type === 'stat_courage') result.courage += 1;
    else if (u.type === 'stat_health') result.health += 1;
    else if (u.type === 'stat_melee') result.melee += 1;
    else if (u.type === 'stat_accuracy') result.accuracy += 1;
  }
  for (const e of campaignEffects) {
    if (e.statDelta) {
      for (const [k, delta] of Object.entries(e.statDelta) as [keyof SoldierStats, number][]) {
        result[k] += delta;
      }
    }
  }
  return result;
}

export function unitPowerRanking(doc: UnitDoc): number {
  if (!doc.campaignMode) return 0;
  const officerTier = xpToTier(doc.officer.xp ?? 0);
  const memberTiers = doc.members
    .filter((m) => (m.status ?? 'active') === 'active')
    .reduce((sum, m) => sum + xpToTier(m.xp ?? 0), 0);
  return officerTier + memberTiers;
}

export function unitBudget(doc: UnitDoc): number {
  const base = recruitmentBudget(doc.baseBudget ?? BASE_RECRUITMENT_BUDGET, doc.officer.commandStyle);
  if (doc.campaignMode) return base + officerCampaignBudgetBonus(doc.officer);
  return base;
}

export function memberPurchasedCost(m: MemberSnapshot): number {
  return (m.purchasedAttributes ?? []).reduce((s, a) => s + (a.costDelta ?? 0), 0);
}

export function unitSpent(doc: UnitDoc): number {
  const activeMembers = doc.members.filter((m) => (m.status ?? 'active') === 'active');
  return spentPoints(activeMembers.map((m) => m.cost + memberPurchasedCost(m)));
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

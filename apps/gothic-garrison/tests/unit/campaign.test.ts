import { describe, expect, it } from 'vitest';
import {
  xpToTier,
  pendingUpgradeCount,
  officerCampaignBudgetBonus,
  effectiveStats,
  unitPowerRanking,
  unitBudget,
  unitSpent,
  normalizeUnitDoc,
  createUnitDoc,
  XP_TIER_THRESHOLDS,
  TIER_UPGRADE_OPTIONS,
  type TierUpgrade,
  type CampaignEffect,
  type SoldierStats,
  type OfficerSnapshot,
  type MemberSnapshot,
} from '../../src/lib/unit/types';

// ── helpers ──────────────────────────────────────────────────────────────────

const baseStats: SoldierStats = { speed: 5, melee: 0, accuracy: 0, defence: 12, courage: 1, health: 10 };

function makeMember(overrides: Partial<MemberSnapshot> = {}): MemberSnapshot {
  return {
    id: 'x',
    soldierTypeId: 'st',
    name: 'Rifleman',
    cost: 10,
    stats: baseStats,
    attributes: [],
    purchasedAttributes: [],
    equipment: [],
    specialEquipment: [],
    loadoutId: null,
    ...overrides,
  };
}

function upgrade(tier: number, type: TierUpgrade['type'], extra?: Partial<TierUpgrade>): TierUpgrade {
  return { tier, type, ...extra };
}

function effect(label: string, statDelta?: Partial<SoldierStats>): CampaignEffect {
  return { id: 'e1', label, ...(statDelta ? { statDelta } : {}) };
}

// ── xpToTier ─────────────────────────────────────────────────────────────────

describe('xpToTier', () => {
  it('returns 0 for 0 XP', () => {
    expect(xpToTier(0)).toBe(0);
  });

  it('returns 0 for XP below the first threshold', () => {
    expect(xpToTier(4)).toBe(0);
  });

  it('returns the correct tier at each threshold', () => {
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    XP_TIER_THRESHOLDS.forEach((xp, i) => {
      expect(xpToTier(xp)).toBe(expected[i]);
    });
  });

  it('returns the lower tier for XP between two thresholds', () => {
    expect(xpToTier(6)).toBe(1);   // 5 → T1, 10 → T2
    expect(xpToTier(15)).toBe(2);  // 10 → T2, 18 → T3
    expect(xpToTier(64)).toBe(5);  // 45 → T5, 65 → T6
  });

  it('caps at Tier 9 for XP above the highest threshold', () => {
    expect(xpToTier(200)).toBe(9);
    expect(xpToTier(999)).toBe(9);
  });
});

// ── pendingUpgradeCount ───────────────────────────────────────────────────────

describe('pendingUpgradeCount', () => {
  it('returns 0 when XP is below the first threshold', () => {
    expect(pendingUpgradeCount(0, [])).toBe(0);
    expect(pendingUpgradeCount(4, [])).toBe(0);
  });

  it('returns 1 when a new tier is reached and no upgrade chosen yet', () => {
    expect(pendingUpgradeCount(5, [])).toBe(1);
    expect(pendingUpgradeCount(10, [upgrade(1, 'stat_courage')])).toBe(1);
  });

  it('returns 0 when all tier upgrades have been chosen', () => {
    expect(pendingUpgradeCount(5, [upgrade(1, 'stat_courage')])).toBe(0);
    expect(pendingUpgradeCount(10, [upgrade(1, 'stat_courage'), upgrade(2, 'stat_health')])).toBe(0);
  });

  it('returns the count of un-acknowledged tiers when multiple are pending', () => {
    // Reached Tier 3 with no upgrades chosen
    expect(pendingUpgradeCount(18, [])).toBe(3);
    // Reached Tier 3 with one upgrade chosen
    expect(pendingUpgradeCount(18, [upgrade(1, 'stat_courage')])).toBe(2);
  });
});

// ── TIER_UPGRADE_OPTIONS ─────────────────────────────────────────────────────

describe('TIER_UPGRADE_OPTIONS', () => {
  it('covers all 9 tiers', () => {
    for (let t = 1; t <= 9; t++) {
      expect(TIER_UPGRADE_OPTIONS[t]).toBeDefined();
      expect(TIER_UPGRADE_OPTIONS[t].length).toBeGreaterThan(0);
    }
  });

  it('Tier 1 offers only +1 Courage', () => {
    expect(TIER_UPGRADE_OPTIONS[1]).toEqual(['stat_courage']);
  });

  it('Tier 4 offers only +1 Courage', () => {
    expect(TIER_UPGRADE_OPTIONS[4]).toEqual(['stat_courage']);
  });

  it('Tier 3 offers melee, shoot, and +10 recruit but not +5 recruit', () => {
    expect(TIER_UPGRADE_OPTIONS[3]).toContain('stat_melee');
    expect(TIER_UPGRADE_OPTIONS[3]).toContain('stat_accuracy');
    expect(TIER_UPGRADE_OPTIONS[3]).toContain('budget_10');
    expect(TIER_UPGRADE_OPTIONS[3]).not.toContain('budget_5');
  });

  it('Tiers 6–9 all offer courage, health, attribute, and +5 recruit', () => {
    for (const t of [6, 7, 8, 9]) {
      const opts = TIER_UPGRADE_OPTIONS[t];
      expect(opts).toContain('stat_courage');
      expect(opts).toContain('stat_health');
      expect(opts).toContain('new_attribute');
      expect(opts).toContain('budget_5');
    }
  });
});

// ── officerCampaignBudgetBonus ────────────────────────────────────────────────

describe('officerCampaignBudgetBonus', () => {
  const officer = (upgrades: TierUpgrade[]): OfficerSnapshot => ({
    name: '',
    combatTraining: 'melee',
    physicalEdge: 'health',
    commandStyle: 'courage',
    attributes: [],
    equipment: [],
    tierUpgrades: upgrades,
  });

  it('returns 0 when there are no tier upgrades', () => {
    expect(officerCampaignBudgetBonus(officer([]))).toBe(0);
  });

  it('returns 0 when tier upgrades are not budget upgrades', () => {
    expect(officerCampaignBudgetBonus(officer([upgrade(1, 'stat_courage')]))).toBe(0);
  });

  it('adds 5 for a budget_5 upgrade', () => {
    expect(officerCampaignBudgetBonus(officer([upgrade(2, 'budget_5')]))).toBe(5);
  });

  it('adds 10 for a budget_10 upgrade', () => {
    expect(officerCampaignBudgetBonus(officer([upgrade(3, 'budget_10')]))).toBe(10);
  });

  it('stacks multiple budget upgrades', () => {
    expect(officerCampaignBudgetBonus(officer([
      upgrade(2, 'budget_5'),
      upgrade(5, 'budget_5'),
      upgrade(3, 'budget_10'),
    ]))).toBe(20);
  });

  it('returns 0 when tierUpgrades is absent (non-campaign officer)', () => {
    const o = officer([]);
    delete (o as any).tierUpgrades;
    expect(officerCampaignBudgetBonus(o)).toBe(0);
  });
});

// ── effectiveStats ────────────────────────────────────────────────────────────

describe('effectiveStats', () => {
  it('returns base stats unchanged when no upgrades or effects', () => {
    expect(effectiveStats(baseStats)).toEqual(baseStats);
  });

  it('applies +1 Courage tier upgrade', () => {
    const result = effectiveStats(baseStats, [upgrade(1, 'stat_courage')]);
    expect(result.courage).toBe(baseStats.courage + 1);
    expect(result.health).toBe(baseStats.health); // unchanged
  });

  it('applies +1 Health tier upgrade', () => {
    const result = effectiveStats(baseStats, [upgrade(2, 'stat_health')]);
    expect(result.health).toBe(baseStats.health + 1);
  });

  it('applies +1 Melee tier upgrade', () => {
    const result = effectiveStats(baseStats, [upgrade(3, 'stat_melee')]);
    expect(result.melee).toBe(baseStats.melee + 1);
  });

  it('applies +1 Accuracy tier upgrade', () => {
    const result = effectiveStats(baseStats, [upgrade(3, 'stat_accuracy')]);
    expect(result.accuracy).toBe(baseStats.accuracy + 1);
  });

  it('ignores non-stat tier upgrade types (new_attribute, budget_*)', () => {
    const result = effectiveStats(baseStats, [upgrade(2, 'new_attribute'), upgrade(2, 'budget_5'), upgrade(3, 'budget_10')]);
    expect(result).toEqual(baseStats);
  });

  it('applies permanent injury stat delta from a campaign effect', () => {
    const result = effectiveStats(baseStats, [], [effect('Leg wound', { speed: -1 })]);
    expect(result.speed).toBe(baseStats.speed - 1);
    expect(result.melee).toBe(baseStats.melee); // unchanged
  });

  it('applies negative health from Nagging Doubt madness effect', () => {
    const result = effectiveStats(baseStats, [], [effect('Nagging Doubt', { health: -1 })]);
    expect(result.health).toBe(baseStats.health - 1);
  });

  it('does not change stats for label-only campaign effects (no statDelta)', () => {
    const result = effectiveStats(baseStats, [], [effect('Episode of Madness')]);
    expect(result).toEqual(baseStats);
  });

  it('stacks multiple tier upgrades and campaign effects', () => {
    const result = effectiveStats(
      baseStats,
      [upgrade(1, 'stat_courage'), upgrade(2, 'stat_health'), upgrade(5, 'stat_health')],
      [effect('Leg wound', { speed: -1 }), effect('Jitters', { courage: -1 })],
    );
    expect(result.courage).toBe(baseStats.courage + 1 - 1); // upgrade +1, jitters -1
    expect(result.health).toBe(baseStats.health + 2);       // two health upgrades
    expect(result.speed).toBe(baseStats.speed - 1);          // leg wound
    expect(result.melee).toBe(baseStats.melee);              // unchanged
  });

  it('does not mutate the base stats object', () => {
    const frozen = { ...baseStats };
    effectiveStats(frozen, [upgrade(1, 'stat_courage')], [effect('Leg wound', { speed: -1 })]);
    expect(frozen).toEqual(baseStats);
  });
});

// ── unitPowerRanking ──────────────────────────────────────────────────────────

describe('unitPowerRanking', () => {
  it('returns 0 when campaign mode is off', () => {
    const doc = createUnitDoc();
    doc.members = [makeMember({ xp: 100 })];
    expect(unitPowerRanking(doc)).toBe(0);
  });

  it('returns 0 when campaign mode is on but no XP earned', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.officer.xp = 0;
    expect(unitPowerRanking(doc)).toBe(0);
  });

  it('includes the officer tier', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.officer.xp = 10; // Tier 2
    expect(unitPowerRanking(doc)).toBe(2);
  });

  it('sums officer and active member tiers', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.officer.xp = 10;  // T2
    doc.members = [
      makeMember({ xp: 5 }),   // T1
      makeMember({ id: 'b', xp: 18 }), // T3
    ];
    expect(unitPowerRanking(doc)).toBe(2 + 1 + 3);
  });

  it('does not count removed members toward the ranking', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.officer.xp = 5; // T1
    doc.members = [
      makeMember({ xp: 18 }),                            // T3 active
      makeMember({ id: 'b', xp: 65, status: 'dead' }), // T6 removed — excluded
    ];
    expect(unitPowerRanking(doc)).toBe(1 + 3);
  });
});

// ── unitBudget with campaign bonuses ─────────────────────────────────────────

describe('unitBudget — campaign tier bonuses', () => {
  it('does not add campaign bonus when campaign mode is off', () => {
    const doc = createUnitDoc();
    doc.officer.tierUpgrades = [upgrade(2, 'budget_5')];
    expect(unitBudget(doc)).toBe(100);
  });

  it('adds budget_5 bonus in campaign mode', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.officer.tierUpgrades = [upgrade(2, 'budget_5')];
    expect(unitBudget(doc)).toBe(105);
  });

  it('adds budget_10 bonus in campaign mode', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.officer.tierUpgrades = [upgrade(3, 'budget_10')];
    expect(unitBudget(doc)).toBe(110);
  });

  it('stacks campaign bonuses with command style recruitment bonus', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.officer.commandStyle = 'recruitment';
    doc.officer.tierUpgrades = [upgrade(2, 'budget_5'), upgrade(5, 'budget_5')];
    expect(unitBudget(doc)).toBe(100 + 5 + 5 + 5); // base + command + 2× tier
  });

  it('stacks multiple tier budget upgrades', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.officer.tierUpgrades = [upgrade(2, 'budget_5'), upgrade(3, 'budget_10'), upgrade(5, 'budget_5')];
    expect(unitBudget(doc)).toBe(100 + 5 + 10 + 5);
  });
});

// ── unitSpent — removed members excluded ─────────────────────────────────────

describe('unitSpent — campaign mode excludes removed members', () => {
  it('counts active members normally', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.members = [
      makeMember({ cost: 10 }),
      makeMember({ id: 'b', cost: 15 }),
    ];
    expect(unitSpent(doc)).toBe(25);
  });

  it('excludes retired members from the budget total', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.members = [
      makeMember({ cost: 10 }),
      makeMember({ id: 'b', cost: 15, status: 'retired' }),
    ];
    expect(unitSpent(doc)).toBe(10);
  });

  it('excludes dead members from the budget total', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.members = [
      makeMember({ cost: 10 }),
      makeMember({ id: 'b', cost: 15, status: 'dead' }),
    ];
    expect(unitSpent(doc)).toBe(10);
  });

  it('excludes permanently insane members from the budget total', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.members = [
      makeMember({ cost: 10 }),
      makeMember({ id: 'b', cost: 20, status: 'permanently_insane' }),
    ];
    expect(unitSpent(doc)).toBe(10);
  });

  it('returns 0 when all members have been removed', () => {
    const doc = createUnitDoc();
    doc.campaignMode = true;
    doc.members = [
      makeMember({ cost: 10, status: 'dead' }),
      makeMember({ id: 'b', cost: 15, status: 'retired' }),
    ];
    expect(unitSpent(doc)).toBe(0);
  });

  it('still works correctly for non-campaign units (no status field)', () => {
    const doc = createUnitDoc();
    doc.members = [makeMember({ cost: 10 }), makeMember({ id: 'b', cost: 15 })];
    expect(unitSpent(doc)).toBe(25);
  });
});

// ── normalizeUnitDoc — campaign migration ─────────────────────────────────────

describe('normalizeUnitDoc — campaign field migration', () => {
  const legacyDoc = (overrides: object = {}) => ({
    id: '1',
    schemaVersion: 1,
    name: 'Old',
    nationId: null,
    nationName: null,
    officer: { name: '', combatTraining: 'melee', physicalEdge: 'health', commandStyle: 'courage', attributes: [], equipment: [] },
    members: [],
    optionalRules: [],
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  });

  it('defaults campaignMode to false when absent', () => {
    expect(normalizeUnitDoc(legacyDoc()).campaignMode).toBe(false);
  });

  it('preserves campaignMode: true', () => {
    expect(normalizeUnitDoc(legacyDoc({ campaignMode: true })).campaignMode).toBe(true);
  });

  it('defaults removedOfficers to [] when absent', () => {
    expect(normalizeUnitDoc(legacyDoc()).removedOfficers).toEqual([]);
  });

  it('preserves existing removedOfficers', () => {
    const archived = [{ name: 'Old Officer', combatTraining: 'melee', physicalEdge: 'health', commandStyle: 'courage', attributes: [], equipment: [], status: 'dead', removalReason: 'Killed in battle' }];
    expect(normalizeUnitDoc(legacyDoc({ removedOfficers: archived })).removedOfficers).toEqual(archived);
  });

  it('defaults tierUpgrades to [] on members that predate the field', () => {
    const doc = normalizeUnitDoc(legacyDoc({
      members: [{ id: 'a', name: 'Rifleman', cost: 10, stats: null, attributes: [], purchasedAttributes: [], equipment: [], specialEquipment: [], loadoutId: null }],
    }));
    expect(doc.members[0].tierUpgrades).toEqual([]);
  });

  it('defaults campaignEffects to [] on members that predate the field', () => {
    const doc = normalizeUnitDoc(legacyDoc({
      members: [{ id: 'a', name: 'Rifleman', cost: 10, stats: null, attributes: [], purchasedAttributes: [], equipment: [], specialEquipment: [], loadoutId: null }],
    }));
    expect(doc.members[0].campaignEffects).toEqual([]);
  });

  it('preserves existing tierUpgrades on members', () => {
    const existing = [{ tier: 1, type: 'stat_courage' }];
    const doc = normalizeUnitDoc(legacyDoc({
      members: [{ id: 'a', name: 'Rifleman', cost: 10, stats: null, attributes: [], purchasedAttributes: [], equipment: [], specialEquipment: [], loadoutId: null, tierUpgrades: existing }],
    }));
    expect(doc.members[0].tierUpgrades).toEqual(existing);
  });

  it('preserves existing campaignEffects on members', () => {
    const existing = [{ id: 'e1', label: 'Leg wound', statDelta: { speed: -1 } }];
    const doc = normalizeUnitDoc(legacyDoc({
      members: [{ id: 'a', name: 'Rifleman', cost: 10, stats: null, attributes: [], purchasedAttributes: [], equipment: [], specialEquipment: [], loadoutId: null, campaignEffects: existing }],
    }));
    expect(doc.members[0].campaignEffects).toEqual(existing);
  });
});

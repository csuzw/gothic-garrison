import { describe, expect, it } from 'vitest';
import {
  CREATION_CHOICES,
  creationChoiceDefs,
  creationChoiceLabel,
  memberBaseStats,
  memberStats,
  missingCreationChoices,
  normalizeUnitDoc,
  toCreationChoice,
  type MemberSnapshot,
  type SoldierStats,
} from '../../src/lib/unit/types.ts';

const BASE: SoldierStats = { speed: 6, melee: 1, accuracy: 1, defence: 14, courage: 1, health: 12 };

function member(overrides: Partial<MemberSnapshot> = {}): MemberSnapshot {
  return {
    id: 'm1',
    soldierTypeId: 'st1',
    name: 'Velite',
    cost: 21,
    stats: { ...BASE },
    attributes: [],
    purchasedAttributes: [],
    equipment: [],
    specialEquipment: [],
    loadoutId: null,
    ...overrides,
  };
}

const def = (name: string) => CREATION_CHOICES.find((d) => d.attributeName === name)!;
const opt = (name: string, id: string) => def(name).options.find((o) => o.id === id)!;

describe('creation choices', () => {
  it('offers choices only for attributes that have them', () => {
    expect(creationChoiceDefs(['Elite Guard']).map((d) => d.attributeName)).toEqual(['Elite Guard']);
    expect(creationChoiceDefs(['Mercenary', 'Self-Preservation']).map((d) => d.attributeName)).toEqual(['Mercenary']);
    expect(creationChoiceDefs(['Strong', 'Tactician'])).toEqual([]);
  });

  it('Mercenary offers +1 to exactly Melee, Accuracy, Defence, Courage or Health', () => {
    const ids = def('Mercenary').options.map((o) => o.id);
    expect(ids).toEqual(['melee', 'accuracy', 'defence', 'courage', 'health']);
    for (const o of def('Mercenary').options) {
      expect(Object.values(o.statDelta ?? {})).toEqual([1]);
    }
  });

  it('reports missing choices until one is made', () => {
    const m = member();
    expect(missingCreationChoices(m, ['Elite Guard'])).toEqual(['Elite Guard']);
    m.creationChoices = [toCreationChoice(def('Elite Guard'), opt('Elite Guard', 'grenadier'))];
    expect(missingCreationChoices(m, ['Elite Guard'])).toEqual([]);
  });

  it('Grenadier adds +1 Health and +1 Courage to base stats', () => {
    const m = member({ creationChoices: [toCreationChoice(def('Elite Guard'), opt('Elite Guard', 'grenadier'))] });
    expect(memberBaseStats(m)).toEqual({ ...BASE, health: 13, courage: 2 });
    // The snapshotted reference stats are untouched.
    expect(m.stats).toEqual(BASE);
  });

  it('Chasseur grants Light Infantry Training and no stat change', () => {
    const c = toCreationChoice(def('Elite Guard'), opt('Elite Guard', 'chasseur'), 'lit-id');
    expect(c.grantedAttribute).toEqual({ id: 'lit-id', name: 'Light Infantry Training' });
    expect(c.statDelta).toBeUndefined();
    expect(memberBaseStats(member({ creationChoices: [c] }))).toEqual(BASE);
    expect(creationChoiceLabel(c)).toBe('Elite Guard: Chasseur (Light Infantry Training)');
  });

  it('Mercenary stat bonus stacks with tier upgrades and campaign effects', () => {
    const m = member({
      name: 'Mercenary',
      creationChoices: [toCreationChoice(def('Mercenary'), opt('Mercenary', 'defence'))],
      tierUpgrades: [{ tier: 1, type: 'stat_courage' }],
      campaignEffects: [{ id: 'e1', label: 'Internal Injuries', statDelta: { health: -1 } }],
    });
    expect(memberStats(m)).toEqual({ ...BASE, defence: 15, courage: 2, health: 11 });
    expect(creationChoiceLabel(m.creationChoices![0])).toBe('Mercenary: +1 Defence');
  });

  it('snapshots the delta so later edits to the definition do not mutate saved units', () => {
    const c = toCreationChoice(def('Mercenary'), opt('Mercenary', 'melee'));
    c.statDelta!.melee = 99;
    expect(opt('Mercenary', 'melee').statDelta).toEqual({ melee: 1 });
  });

  it('older units without the field load and compute stats unchanged', () => {
    const doc = normalizeUnitDoc({ id: 'u', members: [member()] });
    expect(doc.members[0].creationChoices).toBeUndefined();
    expect(memberStats(doc.members[0])).toEqual(BASE);
  });

  it('returns null stats for members without a stat snapshot', () => {
    expect(memberStats(member({ stats: null }))).toBeNull();
  });
});

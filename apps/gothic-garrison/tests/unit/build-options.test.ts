import { describe, expect, it } from 'vitest';
import {
  OUTSIDE_NATION_RULE_CODE,
  OUTSIDE_NATION_SOLDIER_COST,
  createUnitDoc,
  normalizeUnitDoc,
  unitSpent,
  memberPurchasedCost,
} from '../../src/lib/unit/types';

describe('build option constants', () => {
  it('OUTSIDE_NATION_RULE_CODE is the stable code used in UnitDoc.optionalRules', () => {
    expect(OUTSIDE_NATION_RULE_CODE).toBe('outside-nation-soldier');
  });

  it('OUTSIDE_NATION_SOLDIER_COST is 8', () => {
    expect(OUTSIDE_NATION_SOLDIER_COST).toBe(8);
  });
});

describe('createUnitDoc defaults', () => {
  it('enabledSourceCodes is null (all supplements on)', () => {
    expect(createUnitDoc().enabledSourceCodes).toBeNull();
  });

  it('optionalRules is empty (no optional rules active)', () => {
    expect(createUnitDoc().optionalRules).toEqual([]);
  });
});

describe('normalizeUnitDoc — migration of old docs', () => {
  const minimal = (overrides: object) => ({
    id: '1',
    schemaVersion: 1,
    name: 'Old',
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
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  });

  it('defaults enabledSourceCodes to null when missing', () => {
    expect(normalizeUnitDoc(minimal({ optionalRules: [] })).enabledSourceCodes).toBeNull();
  });

  it('defaults optionalRules to [] when missing', () => {
    expect(normalizeUnitDoc(minimal({})).optionalRules).toEqual([]);
  });

  it('preserves an explicit enabledSourceCodes list', () => {
    const doc = normalizeUnitDoc(minimal({ optionalRules: [], enabledSourceCodes: ['core', 'egypt'] }));
    expect(doc.enabledSourceCodes).toEqual(['core', 'egypt']);
  });

  it('preserves explicit optionalRules', () => {
    const doc = normalizeUnitDoc(minimal({ optionalRules: [OUTSIDE_NATION_RULE_CODE] }));
    expect(doc.optionalRules).toEqual([OUTSIDE_NATION_RULE_CODE]);
  });
});

const baseMember = (overrides: object) => ({
  id: 'x',
  soldierTypeId: 'st',
  name: 'Test',
  cost: 10,
  stats: null,
  attributes: [],
  purchasedAttributes: [],
  equipment: [],
  specialEquipment: [],
  loadoutId: null,
  ...overrides,
});

describe('memberPurchasedCost', () => {
  it('returns 0 when purchasedAttributes is empty', () => {
    expect(memberPurchasedCost(baseMember({}) as any)).toBe(0);
  });

  it('sums costDelta values of purchased attributes', () => {
    const m = baseMember({
      purchasedAttributes: [
        { id: 'a1', name: 'Fey-Touched', costDelta: 4 },
      ],
    });
    expect(memberPurchasedCost(m as any)).toBe(4);
  });

  it('handles multiple purchased attributes', () => {
    const m = baseMember({
      purchasedAttributes: [
        { id: 'a1', name: 'Fey-Touched', costDelta: 4 },
        { id: 'a2', name: 'Other', costDelta: 2 },
      ],
    });
    expect(memberPurchasedCost(m as any)).toBe(6);
  });

  it('treats missing costDelta as 0', () => {
    const m = baseMember({
      purchasedAttributes: [{ id: 'a1', name: 'Free' }],
    });
    expect(memberPurchasedCost(m as any)).toBe(0);
  });
});

describe('unitSpent with purchased attributes', () => {
  it('includes purchased attribute costs in total', () => {
    const doc = createUnitDoc();
    doc.members = [
      baseMember({ cost: 10, purchasedAttributes: [{ id: 'a1', name: 'Fey-Touched', costDelta: 4 }] }) as any,
      baseMember({ id: 'y', cost: 12 }) as any,
    ];
    expect(unitSpent(doc)).toBe(10 + 4 + 12);
  });

  it('unitSpent is unaffected when no attributes are purchased', () => {
    const doc = createUnitDoc();
    doc.members = [
      baseMember({ cost: 10 }) as any,
      baseMember({ id: 'y', cost: 15 }) as any,
    ];
    expect(unitSpent(doc)).toBe(25);
  });
});

describe('normalizeUnitDoc — purchasedAttributes migration', () => {
  const minimal = (members: object[]) => ({
    id: '1',
    schemaVersion: 1,
    name: 'Old',
    nationId: null,
    nationName: null,
    officer: { name: '', combatTraining: 'melee', physicalEdge: 'health', commandStyle: 'courage', attributes: [], equipment: [] },
    members,
    optionalRules: [],
    updatedAt: '2024-01-01T00:00:00.000Z',
  });

  it('backfills purchasedAttributes on members that predate the field', () => {
    const doc = normalizeUnitDoc(minimal([
      { id: 'a', name: 'Rifleman', cost: 10, stats: null, attributes: [], equipment: [], specialEquipment: [], loadoutId: null },
    ]));
    expect(doc.members[0].purchasedAttributes).toEqual([]);
  });

  it('preserves existing purchasedAttributes', () => {
    const doc = normalizeUnitDoc(minimal([
      { id: 'a', name: 'Rifleman', cost: 10, stats: null, attributes: [], purchasedAttributes: [{ id: 'x', name: 'Fey-Touched', costDelta: 4 }], equipment: [], specialEquipment: [], loadoutId: null },
    ]));
    expect(doc.members[0].purchasedAttributes).toEqual([{ id: 'x', name: 'Fey-Touched', costDelta: 4 }]);
  });
});

describe('outside-nation soldier cost', () => {
  it('unitSpent includes the baked-in +8 for an outside-nation member', () => {
    const doc = createUnitDoc();
    doc.members = [
      {
        id: 'a',
        soldierTypeId: 'st1',
        name: 'Infantryman',
        cost: 10,
        stats: null,
        attributes: [],
        purchasedAttributes: [],
        equipment: [],
        specialEquipment: [],
        loadoutId: null,
      },
      {
        id: 'b',
        soldierTypeId: 'st2',
        name: 'Highlander',
        cost: 12 + OUTSIDE_NATION_SOLDIER_COST, // cost baked in at add time
        isOutsideNationPick: true,
        stats: null,
        attributes: [],
        purchasedAttributes: [],
        equipment: [],
        specialEquipment: [],
        loadoutId: null,
      },
    ];
    expect(unitSpent(doc)).toBe(10 + 12 + OUTSIDE_NATION_SOLDIER_COST);
  });

  it('unitSpent is unaffected when there are no outside-nation members', () => {
    const doc = createUnitDoc();
    doc.members = [
      { id: 'a', soldierTypeId: 'st1', name: 'Infantryman', cost: 10, stats: null, attributes: [], purchasedAttributes: [], equipment: [], specialEquipment: [], loadoutId: null },
      { id: 'b', soldierTypeId: 'st2', name: 'Grenadier', cost: 15, stats: null, attributes: [], purchasedAttributes: [], equipment: [], specialEquipment: [], loadoutId: null },
    ];
    expect(unitSpent(doc)).toBe(25);
  });
});

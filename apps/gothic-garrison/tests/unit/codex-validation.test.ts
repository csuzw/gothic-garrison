import { describe, expect, it } from 'vitest';
import {
  CodexError,
  assertUuid,
  validateAttribute,
  validateEquipment,
  validateNation,
  validateSoldierType,
  validateSource,
} from '../../src/lib/server/codex-validation';

const SRC = '11111111-1111-1111-1111-111111111111';
const NATION = '22222222-2222-2222-2222-222222222222';
const ATTR = '33333333-3333-3333-3333-333333333333';
const ITEM = '44444444-4444-4444-4444-444444444444';

const STATS = { speed: 6, melee: 1, accuracy: 1, defence: 10, courage: 4, health: 10 };

describe('assertUuid', () => {
  it('accepts a valid UUID', () => {
    expect(assertUuid(SRC)).toBe(SRC);
  });
  it('rejects a non-UUID with a 400', () => {
    expect(() => assertUuid('nope')).toThrowError(CodexError);
    try {
      assertUuid('nope');
    } catch (e) {
      expect((e as CodexError).status).toBe(400);
    }
  });
});

describe('validateSource', () => {
  it('parses a well-formed source', () => {
    expect(
      validateSource({ code: 'core', name: 'The Silver Bayonet', kind: 'core', publishedDate: '2021-11-11', author: 'JM' }),
    ).toEqual({ code: 'core', name: 'The Silver Bayonet', kind: 'core', publishedDate: '2021-11-11', author: 'JM', ospreyCoverUrl: null, coverImageUrl: null });
  });
  it('trims whitespace on strings', () => {
    expect(validateSource({ code: ' core ', name: ' x ', kind: 'supplement', publishedDate: '2023-01-01', author: ' a ' }).code).toBe('core');
  });
  it('rejects an unknown kind', () => {
    expect(() => validateSource({ code: 'c', name: 'n', kind: 'expansion', publishedDate: '2023-01-01', author: 'a' })).toThrow(/kind/);
  });
  it('rejects a malformed date', () => {
    expect(() => validateSource({ code: 'c', name: 'n', kind: 'core', publishedDate: '2023', author: 'a' })).toThrow(/publishedDate/);
  });
  it('rejects an empty required string', () => {
    expect(() => validateSource({ code: '', name: 'n', kind: 'core', publishedDate: '2023-01-01', author: 'a' })).toThrow(/code/);
  });
});

describe('validateNation', () => {
  it('parses name + sourceId and nulls absent description', () => {
    expect(validateNation({ name: 'Britain', sourceId: SRC })).toEqual({ name: 'Britain', sourceId: SRC, description: null, flag: null });
  });
  it('rejects a non-UUID sourceId', () => {
    expect(() => validateNation({ name: 'Britain', sourceId: 'x' })).toThrow(/sourceId/);
  });
});

describe('validateAttribute', () => {
  it('requires a boolean isOfficer', () => {
    expect(() => validateAttribute({ name: 'Tough', rules: 'd', isOfficer: 'yes', sourceId: SRC })).toThrow(/isOfficer/);
  });
  it('parses a valid attribute', () => {
    expect(validateAttribute({ name: 'Tough', rules: 'd', isOfficer: true, sourceId: SRC }).isOfficer).toBe(true);
  });
});

describe('validateEquipment', () => {
  it('parses a valid item', () => {
    const v = validateEquipment({ name: 'Musket', category: 'weapon', slotCost: 2, isSpecial: false, sourceId: SRC });
    expect(v.slotCost).toBe(2);
    expect(v.rules).toBeNull();
  });
  it('rejects a negative slot cost', () => {
    expect(() => validateEquipment({ name: 'Musket', category: 'weapon', slotCost: -1, isSpecial: false, sourceId: SRC })).toThrow(/slotCost/);
  });
});

describe('validateSoldierType', () => {
  const base = {
    name: 'Infantryman',
    sourceId: SRC,
    recruitmentCost: 12,
    stats: STATS,
    maxPerUnit: null,
    attributePicks: 0,
    nationIds: [NATION],
    fixedAttributeIds: [ATTR],
  };

  it('parses a fixed-mode soldier with one loadout', () => {
    const v = validateSoldierType({
      ...base,
      equipmentMode: 'fixed',
      loadouts: [{ label: 'Standard', items: [{ equipmentItemId: ITEM, quantity: 1 }] }],
    });
    expect(v.equipmentMode).toBe('fixed');
    expect(v.equipmentSlots).toBeNull();
    expect(v.loadouts[0].items[0].quantity).toBe(1);
    expect(v.loadouts[0].displayOrder).toBe(0);
  });

  it('rejects a fixed-mode soldier with two loadouts', () => {
    expect(() =>
      validateSoldierType({
        ...base,
        equipmentMode: 'fixed',
        loadouts: [
          { label: 'A', items: [] },
          { label: 'B', items: [] },
        ],
      }),
    ).toThrow(/exactly one loadout/);
  });

  it('parses a pool-mode soldier and requires slot counts', () => {
    const v = validateSoldierType({ ...base, equipmentMode: 'pool', equipmentSlots: 6, specialSlots: 2, loadouts: [] });
    expect(v.equipmentSlots).toBe(6);
    expect(v.specialSlots).toBe(2);
  });

  it('rejects a pool-mode soldier carrying loadouts', () => {
    expect(() =>
      validateSoldierType({ ...base, equipmentMode: 'pool', equipmentSlots: 6, specialSlots: 2, loadouts: [{ label: 'X', items: [] }] }),
    ).toThrow(/must not have predetermined loadouts/);
  });

  it('rejects a pool-mode soldier missing slot counts', () => {
    expect(() => validateSoldierType({ ...base, equipmentMode: 'pool', loadouts: [] })).toThrow(/equipmentSlots/);
  });

  it('parses a choice-mode soldier with multiple loadouts', () => {
    const v = validateSoldierType({
      ...base,
      equipmentMode: 'choice',
      loadouts: [
        { label: 'Option A', items: [{ equipmentItemId: ITEM, quantity: 1 }] },
        { label: 'Option B', items: [{ equipmentItemId: ITEM, quantity: 2 }] },
      ],
    });
    expect(v.equipmentMode).toBe('choice');
    expect(v.loadouts).toHaveLength(2);
    expect(v.equipmentSlots).toBeNull();
    expect(v.specialSlots).toBeNull();
  });

  it('rejects a choice-mode soldier with only one loadout', () => {
    expect(() =>
      validateSoldierType({ ...base, equipmentMode: 'choice', loadouts: [{ label: 'Only', items: [] }] }),
    ).toThrow(/at least two loadouts/);
  });

  it('rejects a choice-mode soldier with no loadouts', () => {
    expect(() =>
      validateSoldierType({ ...base, equipmentMode: 'choice', loadouts: [] }),
    ).toThrow(/at least two loadouts/);
  });

  it('dedupes nationIds', () => {
    const v = validateSoldierType({
      ...base,
      nationIds: [NATION, NATION],
      equipmentMode: 'fixed',
      loadouts: [{ label: 'Standard', items: [] }],
    });
    expect(v.nationIds).toEqual([NATION]);
  });

  it('rejects an out-of-range stat', () => {
    expect(() =>
      validateSoldierType({ ...base, stats: { ...STATS, speed: -1 }, equipmentMode: 'fixed', loadouts: [{ label: 'S', items: [] }] }),
    ).toThrow(/speed/);
  });
});

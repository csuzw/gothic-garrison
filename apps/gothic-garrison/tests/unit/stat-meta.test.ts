import { describe, expect, it } from 'vitest';
import { STAT_META } from '../../src/lib/unit/types';

describe('STAT_META', () => {
  it('covers all six stats in rulebook column order', () => {
    expect(STAT_META.map((m) => m.key)).toEqual([
      'speed', 'melee', 'accuracy', 'defence', 'courage', 'health',
    ]);
  });

  it('marks dice-modifier stats as mod:true', () => {
    const modKeys = STAT_META.filter((m) => m.mod).map((m) => m.key);
    expect(modKeys).toEqual(['melee', 'accuracy', 'courage']);
  });

  it('marks absolute-value stats as mod:false', () => {
    const absKeys = STAT_META.filter((m) => !m.mod).map((m) => m.key);
    expect(absKeys).toEqual(['speed', 'defence', 'health']);
  });

  it('every entry has a non-empty short label and full label', () => {
    for (const m of STAT_META) {
      expect(m.short.length).toBeGreaterThan(0);
      expect(m.label.length).toBeGreaterThan(0);
    }
  });
});

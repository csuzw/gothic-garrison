import { describe, expect, it } from 'vitest';
import {
  BASE_RECRUITMENT_BUDGET,
  isOverBudget,
  recruitmentBudget,
  spentPoints,
} from '../../src/lib/unit/budget';

describe('recruitmentBudget', () => {
  it('returns the base pool when the officer takes +1 Courage', () => {
    expect(recruitmentBudget(BASE_RECRUITMENT_BUDGET, 'courage')).toBe(100);
  });

  it('adds 5 to the pool when the officer takes +5 Recruitment', () => {
    expect(recruitmentBudget(BASE_RECRUITMENT_BUDGET, 'recruitment')).toBe(105);
  });

  it('respects a custom base pool', () => {
    expect(recruitmentBudget(150, 'recruitment')).toBe(155);
  });
});

describe('spentPoints', () => {
  it('sums member costs', () => {
    expect(spentPoints([20, 15, 30])).toBe(65);
  });

  it('returns 0 for an empty roster', () => {
    expect(spentPoints([])).toBe(0);
  });
});

describe('isOverBudget', () => {
  it('is false when spent equals budget', () => {
    expect(isOverBudget([50, 50], 100)).toBe(false);
  });

  it('is true when spent exceeds budget', () => {
    expect(isOverBudget([50, 51], 100)).toBe(true);
  });
});

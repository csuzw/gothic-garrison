// Pure helpers around the recruitment-budget rules. Kept tiny on purpose —
// they exist mainly so the unit-test infrastructure has something real to bite on.

export type CommandStyle = 'courage' | 'recruitment';

export const BASE_RECRUITMENT_BUDGET = 100;
export const RECRUITMENT_COMMAND_BONUS = 5;

export function recruitmentBudget(basePool: number, commandStyle: CommandStyle): number {
  const bonus = commandStyle === 'recruitment' ? RECRUITMENT_COMMAND_BONUS : 0;
  return basePool + bonus;
}

export function spentPoints(memberCosts: readonly number[]): number {
  return memberCosts.reduce((sum, cost) => sum + cost, 0);
}

export function isOverBudget(memberCosts: readonly number[], budget: number): boolean {
  return spentPoints(memberCosts) > budget;
}

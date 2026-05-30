// Pure input validation for the Codex write API. Deliberately free of any DB /
// SvelteKit / alias imports so it can be unit-tested in isolation (see
// tests/unit/codex-validation.test.ts). The service layer (codex.ts) calls
// these to parse untrusted request bodies before touching the database;
// referential integrity (FKs, uniqueness) is left to the DB and mapped to HTTP
// status codes there.

/** A validation/conflict error carrying the HTTP status the route should return. */
export class CodexError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = 'CodexError';
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── primitive field helpers ───────────────────────────────────────────────────

function obj(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new CodexError('Request body must be a JSON object');
  }
  return body as Record<string, unknown>;
}

function reqStr(o: Record<string, unknown>, key: string): string {
  const v = o[key];
  if (typeof v !== 'string' || v.trim() === '') {
    throw new CodexError(`"${key}" is required and must be a non-empty string`);
  }
  return v.trim();
}

function optStr(o: Record<string, unknown>, key: string): string | null {
  const v = o[key];
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string') throw new CodexError(`"${key}" must be a string`);
  return v.trim();
}

function bool(o: Record<string, unknown>, key: string): boolean {
  const v = o[key];
  if (typeof v !== 'boolean') throw new CodexError(`"${key}" must be a boolean`);
  return v;
}

function int(
  o: Record<string, unknown>,
  key: string,
  { min = -Infinity, max = Infinity }: { min?: number; max?: number } = {},
): number {
  const v = o[key];
  if (typeof v !== 'number' || !Number.isInteger(v)) {
    throw new CodexError(`"${key}" must be an integer`);
  }
  if (v < min || v > max) throw new CodexError(`"${key}" must be between ${min} and ${max}`);
  return v;
}

function nullableInt(
  o: Record<string, unknown>,
  key: string,
  opts?: { min?: number; max?: number },
): number | null {
  if (o[key] === undefined || o[key] === null) return null;
  return int(o, key, opts);
}

function enumOf<T extends string>(o: Record<string, unknown>, key: string, values: readonly T[]): T {
  const v = o[key];
  if (typeof v !== 'string' || !values.includes(v as T)) {
    throw new CodexError(`"${key}" must be one of: ${values.join(', ')}`);
  }
  return v as T;
}

function uuid(o: Record<string, unknown>, key: string): string {
  const v = o[key];
  if (typeof v !== 'string' || !UUID_RE.test(v)) {
    throw new CodexError(`"${key}" must be a valid UUID`);
  }
  return v;
}

function strArray(o: Record<string, unknown>, key: string): string[] {
  const v = o[key];
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) {
    throw new CodexError(`"${key}" must be an array of strings`);
  }
  return v as string[];
}

function uuidArray(o: Record<string, unknown>, key: string): string[] {
  const v = o[key];
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string' || !UUID_RE.test(x))) {
    throw new CodexError(`"${key}" must be an array of UUIDs`);
  }
  // Dedupe — join tables have composite PKs, so duplicates would error anyway.
  return [...new Set(v as string[])];
}

/** Validate that a string is a UUID (used for route :id params). */
export function assertUuid(value: string, label = 'id'): string {
  if (!UUID_RE.test(value)) throw new CodexError(`Invalid ${label}`, 400);
  return value;
}

// ── entity input shapes ───────────────────────────────────────────────────────

export const SOURCE_KINDS = ['core', 'supplement'] as const;
export const EQUIPMENT_MODES = ['fixed', 'choice', 'pool'] as const;
const STAT_KEYS = ['speed', 'melee', 'accuracy', 'defence', 'courage', 'health'] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface SourceInput {
  code: string;
  name: string;
  kind: (typeof SOURCE_KINDS)[number];
  publishedDate: string;
  author: string;
}

export interface NationInput {
  name: string;
  sourceId: string;
  notes: string | null;
  flag: string | null;
}

export interface AttributeInput {
  name: string;
  description: string;
  isOfficer: boolean;
  sourceId: string;
}

export interface EquipmentInput {
  name: string;
  category: string;
  slotCost: number;
  isSpecial: boolean;
  sourceId: string;
  notes: string | null;
}

export interface OptionalRuleInput {
  code: string;
  name: string;
  description: string;
  sourceId: string;
}

export type SoldierStatsInput = Record<(typeof STAT_KEYS)[number], number>;

export interface LoadoutItemInput {
  equipmentItemId: string;
  quantity: number;
  displayOrder: number;
}

export interface LoadoutInput {
  label: string;
  displayOrder: number;
  items: LoadoutItemInput[];
}

export const MONSTER_EQUIPMENT_MODES = ['fixed', 'choice'] as const;

export interface MonsterTypeInput {
  name: string;
  sourceId: string;
  experience: number;
  stats: SoldierStatsInput;
  equipmentMode: (typeof MONSTER_EQUIPMENT_MODES)[number];
  notes: string | null;
  fixedAttributeIds: string[];
  loadouts: LoadoutInput[];
}

export interface SoldierTypeInput {
  name: string;
  sourceId: string;
  recruitmentCost: number;
  stats: SoldierStatsInput;
  maxPerUnit: number | null;
  equipmentMode: (typeof EQUIPMENT_MODES)[number];
  equipmentSlots: number | null;
  specialSlots: number | null;
  attributePicks: number;
  notes: string | null;
  nationIds: string[];
  fixedAttributeIds: string[];
  loadouts: LoadoutInput[];
}

// ── validators ────────────────────────────────────────────────────────────────

export function validateSource(body: unknown): SourceInput {
  const o = obj(body);
  const publishedDate = reqStr(o, 'publishedDate');
  if (!DATE_RE.test(publishedDate)) {
    throw new CodexError('"publishedDate" must be an ISO date (YYYY-MM-DD)');
  }
  return {
    code: reqStr(o, 'code'),
    name: reqStr(o, 'name'),
    kind: enumOf(o, 'kind', SOURCE_KINDS),
    publishedDate,
    author: reqStr(o, 'author'),
  };
}

export function validateNation(body: unknown): NationInput {
  const o = obj(body);
  return { name: reqStr(o, 'name'), sourceId: uuid(o, 'sourceId'), notes: optStr(o, 'notes'), flag: optStr(o, 'flag') };
}

export function validateAttribute(body: unknown): AttributeInput {
  const o = obj(body);
  return {
    name: reqStr(o, 'name'),
    description: reqStr(o, 'description'),
    isOfficer: bool(o, 'isOfficer'),
    sourceId: uuid(o, 'sourceId'),
  };
}

export function validateEquipment(body: unknown): EquipmentInput {
  const o = obj(body);
  return {
    name: reqStr(o, 'name'),
    category: reqStr(o, 'category'),
    slotCost: int(o, 'slotCost', { min: 0, max: 10 }),
    isSpecial: bool(o, 'isSpecial'),
    sourceId: uuid(o, 'sourceId'),
    notes: optStr(o, 'notes'),
  };
}

export function validateOptionalRule(body: unknown): OptionalRuleInput {
  const o = obj(body);
  return {
    code: reqStr(o, 'code'),
    name: reqStr(o, 'name'),
    description: reqStr(o, 'description'),
    sourceId: uuid(o, 'sourceId'),
  };
}

export function validateMonsterType(body: unknown): MonsterTypeInput {
  const o = obj(body);
  const experience = int(o, 'experience', { min: 0, max: 999 });
  const equipmentMode = enumOf(o, 'equipmentMode', MONSTER_EQUIPMENT_MODES);

  const loadoutsRaw = o.loadouts;
  const loadouts =
    loadoutsRaw === undefined || loadoutsRaw === null
      ? []
      : Array.isArray(loadoutsRaw)
        ? loadoutsRaw.map(validateLoadout)
        : (() => { throw new CodexError('"loadouts" must be an array'); })();

  if (equipmentMode === 'fixed' && loadouts.length !== 1) {
    throw new CodexError('fixed-mode monsters must have exactly one loadout');
  }
  if (equipmentMode === 'choice' && loadouts.length < 2) {
    throw new CodexError('choice-mode monsters must have at least two loadouts');
  }

  return {
    name: reqStr(o, 'name'),
    sourceId: uuid(o, 'sourceId'),
    experience,
    stats: validateStats(o.stats),
    equipmentMode,
    notes: optStr(o, 'notes'),
    fixedAttributeIds: uuidArray(o, 'fixedAttributeIds'),
    loadouts,
  };
}

function validateStats(body: unknown): SoldierStatsInput {
  const o = obj(body);
  const stats = {} as SoldierStatsInput;
  for (const key of STAT_KEYS) stats[key] = int(o, key, { min: 0, max: 99 });
  return stats;
}

function validateLoadout(body: unknown, index: number): LoadoutInput {
  const o = obj(body);
  const itemsRaw = o.items;
  if (!Array.isArray(itemsRaw)) {
    throw new CodexError(`loadout #${index + 1}: "items" must be an array`);
  }
  const items = itemsRaw.map((it): LoadoutItemInput => {
    const io = obj(it);
    return {
      equipmentItemId: uuid(io, 'equipmentItemId'),
      quantity: int(io, 'quantity', { min: 1, max: 99 }),
      displayOrder: nullableInt(io, 'displayOrder', { min: 0 }) ?? 0,
    };
  });
  return {
    label: reqStr(o, 'label'),
    displayOrder: nullableInt(o, 'displayOrder', { min: 0 }) ?? index,
    items,
  };
}

export function validateSoldierType(body: unknown): SoldierTypeInput {
  const o = obj(body);
  const equipmentMode = enumOf(o, 'equipmentMode', EQUIPMENT_MODES);

  const loadoutsRaw = o.loadouts;
  const loadouts =
    loadoutsRaw === undefined || loadoutsRaw === null
      ? []
      : Array.isArray(loadoutsRaw)
        ? loadoutsRaw.map(validateLoadout)
        : (() => {
            throw new CodexError('"loadouts" must be an array');
          })();

  // Equipment-mode coherence (mirrors the schema's documented invariants):
  //   fixed  → exactly one predetermined loadout, no pool slots
  //   choice → two or more predetermined loadouts, no pool slots
  //   pool   → no loadouts, build from equipmentSlots/specialSlots
  let equipmentSlots: number | null = null;
  let specialSlots: number | null = null;
  if (equipmentMode === 'pool') {
    if (loadouts.length > 0) {
      throw new CodexError('pool-mode soldiers must not have predetermined loadouts');
    }
    equipmentSlots = int(o, 'equipmentSlots', { min: 0, max: 20 });
    specialSlots = int(o, 'specialSlots', { min: 0, max: 20 });
  } else {
    if (equipmentMode === 'fixed' && loadouts.length !== 1) {
      throw new CodexError('fixed-mode soldiers must have exactly one loadout');
    }
    if (equipmentMode === 'choice' && loadouts.length < 2) {
      throw new CodexError('choice-mode soldiers must have at least two loadouts');
    }
  }

  return {
    name: reqStr(o, 'name'),
    sourceId: uuid(o, 'sourceId'),
    recruitmentCost: int(o, 'recruitmentCost', { min: 0, max: 999 }),
    stats: validateStats(o.stats),
    maxPerUnit: nullableInt(o, 'maxPerUnit', { min: 1, max: 99 }),
    equipmentMode,
    equipmentSlots,
    specialSlots,
    attributePicks: nullableInt(o, 'attributePicks', { min: 0, max: 10 }) ?? 0,
    notes: optStr(o, 'notes'),
    nationIds: uuidArray(o, 'nationIds'),
    fixedAttributeIds: uuidArray(o, 'fixedAttributeIds'),
    loadouts,
  };
}

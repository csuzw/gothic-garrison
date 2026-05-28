import { sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  date,
  primaryKey,
  foreignKey,
  index,
} from 'drizzle-orm/pg-core';

// ── enums ────────────────────────────────────────────────────────────────────

export const sourceKindEnum = pgEnum('source_kind', ['core', 'supplement']);

export const equipmentModeEnum = pgEnum('equipment_mode', ['fixed', 'choice', 'pool']);

export const equipmentAllowedForEnum = pgEnum('equipment_allowed_for', [
  'officer',
  'soldier',
  'both',
]);

// ── reference data ──────────────────────────────────────────────────────────
//
// Reference data is mutable but warbands snapshot what they need on save,
// so edits here never silently invalidate an existing warband (see CLAUDE.md).

export const sources = pgTable('sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  kind: sourceKindEnum('kind').notNull(),
  publishedDate: date('published_date').notNull(),
  author: text('author').notNull(),
});

export const nations = pgTable('nations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id, { onDelete: 'restrict' }),
  notes: text('notes'),
});

export const officerAttributes = pgTable('officer_attributes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id, { onDelete: 'restrict' }),
});

export const equipmentItems = pgTable('equipment_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  category: text('category').notNull(), // e.g. weapon, armour, gear, special-armoury
  slotCost: integer('slot_cost').notNull().default(1),
  isSpecial: boolean('is_special').notNull().default(false),
  allowedFor: equipmentAllowedForEnum('allowed_for').notNull().default('both'),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id, { onDelete: 'restrict' }),
  notes: text('notes'),
});

export const soldierTypes = pgTable(
  'soldier_types',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => sources.id, { onDelete: 'restrict' }),
    recruitmentCost: integer('recruitment_cost').notNull(),
    stats: jsonb('stats').notNull(), // { melee, accuracy, courage, health, speed, ... }
    maxPerUnit: integer('max_per_unit'), // null = unlimited
    isJuniorOfficer: boolean('is_junior_officer').notNull().default(false),

    // Equipment policy
    equipmentMode: equipmentModeEnum('equipment_mode').notNull().default('fixed'),
    equipmentSlots: integer('equipment_slots'), // only for mode = 'pool'
    specialSlots: integer('special_slots'), // only for mode = 'pool'

    // Attribute policy
    attributePicks: integer('attribute_picks').notNull().default(0),

    // Inherent abilities, free-form so we don't over-normalise upfront
    abilities: jsonb('abilities').notNull().default(sql`'[]'::jsonb`),

    notes: text('notes'),
  },
  (t) => ({
    sourceIdx: index('soldier_types_source_idx').on(t.sourceId),
  }),
);

// nation → allowed soldier types (many-to-many)
export const nationSoldierTypes = pgTable(
  'nation_soldier_types',
  {
    nationId: uuid('nation_id')
      .notNull()
      .references(() => nations.id, { onDelete: 'cascade' }),
    soldierTypeId: uuid('soldier_type_id')
      .notNull()
      .references(() => soldierTypes.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.nationId, t.soldierTypeId] }),
  }),
);

// soldier type → fixed officer attributes baked in (many-to-many).
// FK constraints are explicitly named (with shorter labels) so Postgres
// doesn't truncate the auto-generated names at its 63-char identifier limit.
export const soldierTypeFixedAttributes = pgTable(
  'soldier_type_fixed_attributes',
  {
    soldierTypeId: uuid('soldier_type_id').notNull(),
    officerAttributeId: uuid('officer_attribute_id').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.soldierTypeId, t.officerAttributeId] }),
    soldierTypeFk: foreignKey({
      columns: [t.soldierTypeId],
      foreignColumns: [soldierTypes.id],
      name: 'soldier_type_fixed_attrs_type_fk',
    }).onDelete('cascade'),
    attributeFk: foreignKey({
      columns: [t.officerAttributeId],
      foreignColumns: [officerAttributes.id],
      name: 'soldier_type_fixed_attrs_attr_fk',
    }).onDelete('restrict'),
  }),
);

// Predetermined loadouts (one for mode='fixed', N for mode='choice', none for mode='pool')
export const soldierLoadouts = pgTable(
  'soldier_loadouts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    soldierTypeId: uuid('soldier_type_id')
      .notNull()
      .references(() => soldierTypes.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    displayOrder: integer('display_order').notNull().default(0),
  },
  (t) => ({
    typeIdx: index('soldier_loadouts_type_idx').on(t.soldierTypeId),
  }),
);

export const soldierLoadoutItems = pgTable(
  'soldier_loadout_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    loadoutId: uuid('loadout_id')
      .notNull()
      .references(() => soldierLoadouts.id, { onDelete: 'cascade' }),
    equipmentItemId: uuid('equipment_item_id')
      .notNull()
      .references(() => equipmentItems.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull().default(1),
    displayOrder: integer('display_order').notNull().default(0),
  },
  (t) => ({
    loadoutIdx: index('soldier_loadout_items_loadout_idx').on(t.loadoutId),
  }),
);

// Book-level opt-in rules, e.g. "take 1 soldier from outside your nation for +8 pts"
export const optionalRules = pgTable('optional_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id, { onDelete: 'restrict' }),
});

// ── user data ────────────────────────────────────────────────────────────────
//
// `userId` will FK to better-auth's user table once auth is wired; left as a
// plain uuid for now so this package stays independent of auth choices.

export const warbands = pgTable(
  'warbands',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id'),
    name: text('name').notNull(),
    nationId: uuid('nation_id')
      .notNull()
      .references(() => nations.id, { onDelete: 'restrict' }),
    data: jsonb('data').notNull(), // officer choices + snapshotted members
    referenceSnapshotAt: timestamp('reference_snapshot_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('warbands_user_idx').on(t.userId),
  }),
);

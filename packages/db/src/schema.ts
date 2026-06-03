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
import { user } from './auth-schema.ts';

// better-auth tables (user/session/account/verification) live in a sibling file
// but are re-exported here so drizzle-kit (which reads only this entrypoint)
// picks them up and the createDb schema object includes them.
export * from './auth-schema.ts';

// ── enums ────────────────────────────────────────────────────────────────────

export const sourceKindEnum = pgEnum('source_kind', ['core', 'supplement']);

export const equipmentModeEnum = pgEnum('equipment_mode', ['fixed', 'choice', 'pool']);

// Governs who may pick an attribute during unit building:
//   none    — baked-on fixed attribute (not player-selectable)
//   officer — free pick from the officer/attribute-pick pool
//   soldier — any soldier may purchase it for costDelta pts
//   any     — officer pool AND any soldier may purchase (e.g. Fey-Touched)
export const pickScopeEnum = pgEnum('pick_scope', ['none', 'officer', 'soldier', 'any']);


// ── reference data ──────────────────────────────────────────────────────────
//
// Reference data is mutable but units snapshot what they need on save,
// so edits here never silently invalidate an existing unit (see CLAUDE.md).

export const sources = pgTable('sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  kind: sourceKindEnum('kind').notNull(),
  publishedDate: date('published_date').notNull(),
  author: text('author').notNull(),
  ospreyCoverUrl: text('osprey_cover_url'),
  coverImageUrl: text('cover_image_url'),
});

export const nations = pgTable('nations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id, { onDelete: 'restrict' }),
  description: text('description'),
  flag: text('flag'),
});

export const attributes = pgTable('attributes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  rules: text('rules').notNull(),
  pickScope: pickScopeEnum('pick_scope').notNull().default('none'),
  costDelta: integer('cost_delta').notNull().default(0),
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
  sourceId: uuid('source_id')
    .notNull()
    .references(() => sources.id, { onDelete: 'restrict' }),
  rules: text('rules'),
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
    maxPerUnit: integer('max_per_unit'), // null = unlimited; 1 = at most one per unit

    // Equipment policy
    equipmentMode: equipmentModeEnum('equipment_mode').notNull().default('fixed'),
    equipmentSlots: integer('equipment_slots'), // only for mode = 'pool'
    specialSlots: integer('special_slots'), // only for mode = 'pool'

    // Attribute policy
    attributePicks: integer('attribute_picks').notNull().default(0),

    // Set when the soldier type's rules are reprinted in a second supplement
    // (e.g. Woodsman appears in both Carpathians and Canada). The source filter
    // shows the soldier if either sourceId OR alsoInSourceId is enabled.
    alsoInSourceId: uuid('also_in_source_id').references(() => sources.id, { onDelete: 'set null' }),

    description: text('description'),
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

// soldier type → fixed attributes baked in (many-to-many). Any attribute,
// officer-selectable or not (e.g. Miracles, Skinshift), not just officer ones.
// FK constraints are explicitly named (with shorter labels) so Postgres
// doesn't truncate the auto-generated names at its 63-char identifier limit.
export const soldierTypeFixedAttributes = pgTable(
  'soldier_type_fixed_attributes',
  {
    soldierTypeId: uuid('soldier_type_id').notNull(),
    attributeId: uuid('attribute_id').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.soldierTypeId, t.attributeId] }),
    soldierTypeFk: foreignKey({
      columns: [t.soldierTypeId],
      foreignColumns: [soldierTypes.id],
      name: 'soldier_type_fixed_attrs_type_fk',
    }).onDelete('cascade'),
    attributeFk: foreignKey({
      columns: [t.attributeId],
      foreignColumns: [attributes.id],
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

// Monster types (Bestiary entries). Fixed attributes; fixed or choice equipment.
export const monsterTypes = pgTable(
  'monster_types',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => sources.id, { onDelete: 'restrict' }),
    experience: integer('experience').notNull(),
    stats: jsonb('stats').notNull(),
    equipmentMode: equipmentModeEnum('equipment_mode').notNull().default('fixed'),
    description: text('description'),
  },
  (t) => ({
    sourceIdx: index('monster_types_source_idx').on(t.sourceId),
  }),
);

export const monsterTypeFixedAttributes = pgTable(
  'monster_type_fixed_attributes',
  {
    monsterTypeId: uuid('monster_type_id').notNull(),
    attributeId: uuid('attribute_id').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.monsterTypeId, t.attributeId] }),
    monsterTypeFk: foreignKey({
      columns: [t.monsterTypeId],
      foreignColumns: [monsterTypes.id],
      name: 'monster_type_fixed_attrs_type_fk',
    }).onDelete('cascade'),
    attributeFk: foreignKey({
      columns: [t.attributeId],
      foreignColumns: [attributes.id],
      name: 'monster_type_fixed_attrs_attr_fk',
    }).onDelete('restrict'),
  }),
);

// Predetermined loadouts for a monster (one for fixed, two+ for choice).
export const monsterLoadouts = pgTable(
  'monster_loadouts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    monsterTypeId: uuid('monster_type_id')
      .notNull()
      .references(() => monsterTypes.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    displayOrder: integer('display_order').notNull().default(0),
  },
  (t) => ({
    typeIdx: index('monster_loadouts_type_idx').on(t.monsterTypeId),
  }),
);

export const monsterLoadoutItems = pgTable(
  'monster_loadout_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    loadoutId: uuid('loadout_id')
      .notNull()
      .references(() => monsterLoadouts.id, { onDelete: 'cascade' }),
    equipmentItemId: uuid('equipment_item_id')
      .notNull()
      .references(() => equipmentItems.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull().default(1),
    displayOrder: integer('display_order').notNull().default(0),
  },
  (t) => ({
    loadoutIdx: index('monster_loadout_items_loadout_idx').on(t.loadoutId),
  }),
);

// ── user data ────────────────────────────────────────────────────────────────
//
// `userId` is null for anonymous (IndexedDB) units and FKs to better-auth's
// `user` table for signed-in users. Deleting a user removes their units.
// ("unit" is the rulebook term for a player's force.)

export const units = pgTable(
  'units',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // Nullable: the denormalised `data` jsonb is the source of truth, and a
    // draft unit may not have a nation yet (and nations aren't seeded). The
    // FK still guards against dangling references once nations exist.
    nationId: uuid('nation_id').references(() => nations.id, { onDelete: 'restrict' }),
    data: jsonb('data').notNull(), // officer choices + snapshotted members
    referenceSnapshotAt: timestamp('reference_snapshot_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('units_user_idx').on(t.userId),
  }),
);

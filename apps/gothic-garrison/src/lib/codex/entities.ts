// Field/column config driving the Codex flat-entity editor (src/routes/codex).
// Client-safe — no DB or server imports — so it can be shared by the nav, the
// list tables, and the create/edit forms. Soldier types are intentionally not
// here: their nested editor (loadouts, multi-selects) is a later slice; the
// Codex shows them read-only via SOLDIER_TYPES_SLUG.

export type CodexFieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'enum' | 'date' | 'source' | 'flag';

export interface CodexField {
  key: string;
  label: string;
  type: CodexFieldType;
  required?: boolean;
  options?: readonly string[];
  min?: number;
  max?: number;
  placeholder?: string;
  help?: string;
  /** Render a source-code badge inline with this cell's value. */
  sourceBadge?: boolean;
  /** Override the default widget for this field type (e.g. 'tag-group' for enums). */
  widget?: 'tag-group';
  /** Capitalize the first letter when displaying the value in the table and form. */
  capitalize?: boolean;
}

export interface CodexEntity {
  slug: string;
  /** Plural label, for nav + headings. */
  label: string;
  /** Singular, for buttons ("New attribute"). */
  singular: string;
  /** Field keys shown as table columns. */
  columns: string[];
  fields: CodexField[];
}

export const CODEX_ENTITIES: CodexEntity[] = [
  {
    slug: 'sources',
    label: 'Sources',
    singular: 'source',
    columns: ['code', 'name', 'kind', 'publishedDate', 'author'],
    fields: [
      { key: 'code', label: 'Code', type: 'text', required: true, placeholder: 'core', help: 'Unique short slug.' },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'kind', label: 'Kind', type: 'enum', options: ['core', 'supplement'], required: true },
      { key: 'publishedDate', label: 'Published', type: 'date', required: true },
      { key: 'author', label: 'Author', type: 'text', required: true },
      { key: 'ospreyCoverUrl', label: 'Osprey URL', type: 'text', placeholder: 'https://ospreypublishing.com/store/…' },
      { key: 'coverImageUrl', label: 'Cover image URL', type: 'text', placeholder: 'https://…/cover.jpg' },
    ],
  },
  {
    slug: 'nations',
    label: 'Nations',
    singular: 'nation',
    columns: ['flag', 'name', 'description'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, sourceBadge: true },
      { key: 'sourceId', label: 'Source', type: 'source', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'flag', label: 'Flag', type: 'flag' },
    ],
  },
  {
    slug: 'attributes',
    label: 'Attributes',
    singular: 'attribute',
    columns: ['name', 'isOfficer', 'rules'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, sourceBadge: true },
      { key: 'sourceId', label: 'Source', type: 'source', required: true },
      { key: 'isOfficer', label: 'Officer-selectable', type: 'boolean', help: 'In the officer attribute pool.' },
      { key: 'rules', label: 'Rules', type: 'textarea', required: true },
    ],
  },
  {
    slug: 'equipment',
    label: 'Equipment',
    singular: 'equipment item',
    columns: ['name', 'category', 'slotCost', 'isSpecial', 'rules'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, sourceBadge: true },
      { key: 'sourceId', label: 'Source', type: 'source', required: true },
      { key: 'category', label: 'Category', type: 'enum', options: ['weapon', 'armour', 'gear', 'upgrade'], required: true, widget: 'tag-group', capitalize: true },
      { key: 'slotCost', label: 'Slots', type: 'number', min: 0, max: 10, required: true },
      { key: 'isSpecial', label: 'Special armoury', type: 'boolean' },
      { key: 'rules', label: 'Rules', type: 'textarea' },
    ],
  },
];

export const SOLDIER_TYPES_SLUG = 'soldier-types';
export const MONSTER_TYPES_SLUG = 'monster-types';

/** Nav entries: editable flat entities + the nested-editor types, in display order. */
export const CODEX_NAV: { slug: string; label: string }[] = [
  { slug: 'sources', label: 'Sources' },
  { slug: 'nations', label: 'Nations' },
  { slug: SOLDIER_TYPES_SLUG, label: 'Soldiers' },
  { slug: MONSTER_TYPES_SLUG, label: 'Monsters' },
  { slug: 'attributes', label: 'Attributes' },
  { slug: 'equipment', label: 'Equipment' },
];

export function codexEntity(slug: string | undefined): CodexEntity | undefined {
  return CODEX_ENTITIES.find((e) => e.slug === slug);
}

/** A blank working row built from an entity's field defaults. */
export function blankRow(entity: CodexEntity): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const f of entity.fields) {
    row[f.key] =
      f.type === 'boolean' ? false : f.type === 'number' ? (f.min ?? 0) : f.type === 'enum' ? (f.options?.[0] ?? '') : '';
  }
  return row;
}

/** Pick just an entity's field values out of an existing API row (for editing). */
export function pickFields(entity: CodexEntity, row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of entity.fields) out[f.key] = row[f.key] ?? (f.type === 'boolean' ? false : f.type === 'number' ? (f.min ?? 0) : '');
  return out;
}

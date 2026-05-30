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
    ],
  },
  {
    slug: 'nations',
    label: 'Nations',
    singular: 'nation',
    columns: ['flag', 'name', 'sourceId', 'notes'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'sourceId', label: 'Source', type: 'source', required: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      { key: 'flag', label: 'Flag', type: 'flag' },
    ],
  },
  {
    slug: 'attributes',
    label: 'Attributes',
    singular: 'attribute',
    columns: ['name', 'isOfficer', 'sourceId'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'isOfficer', label: 'Officer-selectable', type: 'boolean', help: 'In the officer attribute pool.' },
      { key: 'sourceId', label: 'Source', type: 'source', required: true },
    ],
  },
  {
    slug: 'equipment',
    label: 'Equipment',
    singular: 'equipment item',
    columns: ['name', 'category', 'slotCost', 'isSpecial', 'sourceId'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true, placeholder: 'weapon' },
      { key: 'slotCost', label: 'Slot cost', type: 'number', min: 0, max: 10, required: true },
      { key: 'isSpecial', label: 'Special armoury', type: 'boolean' },
      { key: 'sourceId', label: 'Source', type: 'source', required: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    slug: 'optional-rules',
    label: 'Optional rules',
    singular: 'optional rule',
    columns: ['code', 'name', 'sourceId'],
    fields: [
      { key: 'code', label: 'Code', type: 'text', required: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'sourceId', label: 'Source', type: 'source', required: true },
    ],
  },
];

export const SOLDIER_TYPES_SLUG = 'soldier-types';

/** Nav entries: editable flat entities + the read-only soldier-types list. */
export const CODEX_NAV: { slug: string; label: string }[] = [
  ...CODEX_ENTITIES.map((e) => ({ slug: e.slug, label: e.label })),
  { slug: SOLDIER_TYPES_SLUG, label: 'Soldier types' },
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

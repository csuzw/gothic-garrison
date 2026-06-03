// Export the current reference tables back to src/seed-data.ts — the canonical,
// git-committed source of truth that every environment is seeded from. This is
// the "save to repo" side of the local-development-only Codex: edits are made
// against the local DB, then exported here so the change is a reviewable git
// diff + changelog entry rather than a live production write.
//
//   pnpm db:export-seed [--note "…"]   (CLI: src/export-seed-cli.ts)
//   exportSeedData({ note })           (in-app: /api/codex/export endpoint)
//
// Output is deterministic — every collection is sorted by a stable natural key
// and object keys are emitted in a fixed order — so re-exporting an unchanged DB
// produces a byte-identical file and diffs stay clean.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { asc } from 'drizzle-orm';
import * as t from './schema.ts';
import type { ReferenceChange, ReferenceChangelogEntry } from './reference-changelog.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(here, 'seed-data.ts');
const CHANGELOG_PATH = path.join(here, 'reference-changelog.ts');

export interface ExportResult {
  counts: { sources: number; nations: number; attributes: number; equipment: number; soldiers: number; monsters: number };
  changes: ReferenceChange[];
  /** The changelog note used (explicit or derived); null when nothing changed. */
  note: string | null;
}

/** Parse an optional `--note "…"` / `--note=…` from CLI argv. */
export function parseNote(argv: string[]): string | undefined {
  const eq = argv.find((a) => a.startsWith('--note='));
  if (eq) return eq.slice('--note='.length);
  const i = argv.indexOf('--note');
  return i >= 0 ? argv[i + 1] : undefined;
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
const byCode = (a: { code: string }, b: { code: string }) => a.code.localeCompare(b.code);

// Read a `export const NAME: T[] = [ … ];` array back out of a generated module
// by extracting the JSON literal (the values are JSON.stringify output). Done via
// fs rather than dynamic import() so it is robust under the Vite dev server,
// which would otherwise serve a cached copy of the module after we overwrite it.
function readExportedArray<T>(file: string, exportName: string): T[] {
  let text: string;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  const m = text.match(new RegExp(`export const ${exportName}\\s*:[^=]*=\\s*`));
  if (!m || m.index === undefined) return [];
  const start = m.index + m[0].length;
  if (text[start] !== '[') return [];
  let depth = 0;
  let str: string | null = null;
  let esc = false;
  let i = start;
  for (; i < text.length; i++) {
    const c = text[i];
    if (str) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === str) str = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') str = c;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  try {
    return JSON.parse(text.slice(start, i)) as T[];
  } catch {
    return [];
  }
}

function diffCollection<T>(
  entity: string,
  oldArr: readonly T[],
  nextArr: readonly T[],
  key: (x: T) => string,
  name: (x: T) => string,
): ReferenceChange[] {
  const oldMap = new Map(oldArr.map((x) => [key(x), x] as const));
  const nextMap = new Map(nextArr.map((x) => [key(x), x] as const));
  const local: ReferenceChange[] = [];
  for (const [k, v] of nextMap) {
    const o = oldMap.get(k);
    if (!o) local.push({ kind: 'added', entity, name: name(v) });
    else if (JSON.stringify(o) !== JSON.stringify(v)) local.push({ kind: 'updated', entity, name: name(v) });
  }
  for (const [k, v] of oldMap) if (!nextMap.has(k)) local.push({ kind: 'removed', entity, name: name(v) });
  return local.sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
}

function summarize(cs: ReferenceChange[]): string {
  const n = (k: ReferenceChange['kind']) => cs.filter((c) => c.kind === k).length;
  return [n('added') && `${n('added')} added`, n('updated') && `${n('updated')} updated`, n('removed') && `${n('removed')} removed`]
    .filter(Boolean)
    .join(', ');
}

const SEED_HEADER = `// AUTO-GENERATED — do not edit by hand.
// Exported from the database by \`pnpm db:export-seed\` (src/export-seed-data.ts).
// This is the canonical, git-committed reference data seeded into every
// environment via \`pnpm db:seed\`. To change it, edit reference rows in the
// local-only Codex and re-export, so each change is a reviewable diff.
/* eslint-disable */

export type EquipmentMode = 'fixed' | 'choice' | 'pool';
export type SourceKind = 'core' | 'supplement';

export interface SeedSource { code: string; name: string; kind: SourceKind; publishedDate: string; author: string; ospreyCoverUrl: string | null; coverImageUrl: string | null; }
export interface SeedNation { name: string; sourceCode: string; description: string | null; flag: string | null; soldiers: string[]; }
export interface SeedAttribute { name: string; pickScope: 'none' | 'officer' | 'soldier' | 'any'; costDelta: number; sourceCode: string; rules: string; }
export interface SeedEquipment { name: string; category: string; slotCost: number; isSpecial: boolean; sourceCode: string; rules: string; }
export interface SeedLoadoutItem { name: string; qty: number; }
export interface SeedLoadout { label: string; order: number; items: SeedLoadoutItem[]; }
export interface SeedSoldier {
  name: string;
  sourceCode: string;
  alsoInSourceCode: string | null;
  recruitmentCost: number;
  stats: { speed: number; melee: number; accuracy: number; defence: number; courage: number; health: number };
  maxPerUnit: number | null;
  equipmentMode: EquipmentMode;
  equipmentSlots: number | null;
  specialSlots: number | null;
  attributePicks: number;
  description: string | null;
  fixedAttributes: string[];
  loadouts: SeedLoadout[];
}
export interface SeedMonster {
  name: string;
  sourceCode: string;
  experience: number;
  stats: { speed: number; melee: number; accuracy: number; defence: number; courage: number; health: number };
  equipmentMode: 'fixed' | 'choice';
  description: string | null;
  fixedAttributes: string[];
  loadouts: SeedLoadout[];
}
`;

const CHANGELOG_HEADER = `// AUTO-GENERATED — do not edit by hand.
// Appended to by \`pnpm db:export-seed\` (src/export-seed-data.ts) whenever an
// export detects reference-data changes vs the committed seed-data.ts. Each
// entry pairs a human note (from \`--note\`, or a derived summary) with the
// structured diff. Newest first. The About page renders this directly — it is a
// plain data module with no DB dependency, so it works offline.
/* eslint-disable */

export type ReferenceChangeKind = 'added' | 'updated' | 'removed';

export interface ReferenceChange {
  kind: ReferenceChangeKind;
  /** Singular entity label, e.g. "soldier type", "equipment", "nation". */
  entity: string;
  /** Human-readable name of the affected row. */
  name: string;
}

export interface ReferenceChangelogEntry {
  /** ISO timestamp of the export that produced this entry. */
  date: string;
  /** One-line summary of the editing session. */
  note: string;
  changes: ReferenceChange[];
}
`;

/**
 * Regenerate seed-data.ts from the current DB and, when anything changed vs the
 * committed file, prepend a changelog entry. Returns the counts + structured
 * diff so callers (CLI / export endpoint) can report what happened.
 */
export async function exportSeedData(opts: { note?: string; databaseUrl?: string } = {}): Promise<ExportResult> {
  const url = opts.databaseUrl ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { casing: 'snake_case' });

  try {
    const [
      sourceRows,
      nationRows,
      attributeRows,
      equipmentRows,
      soldierRows,
      nstRows,
      fixedRows,
      loadoutRows,
      loadoutItemRows,
      monsterRows,
      monsterFixedRows,
      monsterLoadoutRows,
      monsterLoadoutItemRows,
    ] = await Promise.all([
      db.select().from(t.sources),
      db.select().from(t.nations),
      db.select().from(t.attributes),
      db.select().from(t.equipmentItems),
      db.select().from(t.soldierTypes),
      db.select().from(t.nationSoldierTypes),
      db.select().from(t.soldierTypeFixedAttributes),
      db.select().from(t.soldierLoadouts).orderBy(asc(t.soldierLoadouts.displayOrder)),
      db.select().from(t.soldierLoadoutItems).orderBy(asc(t.soldierLoadoutItems.displayOrder)),
      db.select().from(t.monsterTypes),
      db.select().from(t.monsterTypeFixedAttributes),
      db.select().from(t.monsterLoadouts).orderBy(asc(t.monsterLoadouts.displayOrder)),
      db.select().from(t.monsterLoadoutItems).orderBy(asc(t.monsterLoadoutItems.displayOrder)),
    ]);

    // id → natural-key lookups
    const codeBySource = new Map(sourceRows.map((s) => [s.id, s.code]));
    const nameBySoldier = new Map(soldierRows.map((s) => [s.id, s.name]));
    const nameByAttr = new Map(attributeRows.map((a) => [a.id, a.name]));
    const nameByEquip = new Map(equipmentRows.map((e) => [e.id, e.name]));
    const srcCode = (id: string) => codeBySource.get(id) ?? 'core';

    const soldiersByNation = new Map<string, string[]>();
    for (const r of nstRows) {
      const name = nameBySoldier.get(r.soldierTypeId);
      if (!name) continue;
      const list = soldiersByNation.get(r.nationId);
      if (list) list.push(name);
      else soldiersByNation.set(r.nationId, [name]);
    }

    const fixedAttrsBySoldier = new Map<string, string[]>();
    for (const r of fixedRows) {
      const name = nameByAttr.get(r.attributeId);
      if (!name) continue;
      const list = fixedAttrsBySoldier.get(r.soldierTypeId);
      if (list) list.push(name);
      else fixedAttrsBySoldier.set(r.soldierTypeId, [name]);
    }

    const itemsByLoadout = new Map<string, { name: string; qty: number }[]>();
    for (const it of loadoutItemRows) {
      const name = nameByEquip.get(it.equipmentItemId);
      if (!name) continue;
      const list = itemsByLoadout.get(it.loadoutId);
      const entry = { name, qty: it.quantity };
      if (list) list.push(entry);
      else itemsByLoadout.set(it.loadoutId, [entry]);
    }

    const loadoutsBySoldier = new Map<string, { label: string; order: number; items: { name: string; qty: number }[] }[]>();
    for (const lo of loadoutRows) {
      const entry = { label: lo.label, order: lo.displayOrder, items: itemsByLoadout.get(lo.id) ?? [] };
      const list = loadoutsBySoldier.get(lo.soldierTypeId);
      if (list) list.push(entry);
      else loadoutsBySoldier.set(lo.soldierTypeId, [entry]);
    }

    // build the seed collections (fixed key order, stable sort)
    const sources = sourceRows
      .map((s) => ({ code: s.code, name: s.name, kind: s.kind, publishedDate: s.publishedDate, author: s.author, ospreyCoverUrl: s.ospreyCoverUrl ?? null, coverImageUrl: s.coverImageUrl ?? null }))
      .sort(byCode);

    const nations = nationRows
      .map((n) => ({
        name: n.name,
        sourceCode: srcCode(n.sourceId),
        description: n.description,
        flag: n.flag,
        soldiers: (soldiersByNation.get(n.id) ?? []).slice().sort((a, b) => a.localeCompare(b)),
      }))
      .sort(byName);

    const attributes = attributeRows
      .map((a) => ({ name: a.name, pickScope: a.pickScope, costDelta: a.costDelta, sourceCode: srcCode(a.sourceId), rules: a.rules }))
      .sort(byName);

    const equipment = equipmentRows
      .map((e) => ({
        name: e.name,
        category: e.category,
        slotCost: e.slotCost,
        isSpecial: e.isSpecial,
        sourceCode: srcCode(e.sourceId),
        rules: e.rules ?? '',
      }))
      .sort(byName);

    const soldiers = soldierRows
      .map((s) => {
        const st = s.stats as Record<string, number>;
        return {
          name: s.name,
          sourceCode: srcCode(s.sourceId),
          alsoInSourceCode: s.alsoInSourceId ? srcCode(s.alsoInSourceId) : null,
          recruitmentCost: s.recruitmentCost,
          stats: { speed: st.speed, melee: st.melee, accuracy: st.accuracy, defence: st.defence, courage: st.courage, health: st.health },
          maxPerUnit: s.maxPerUnit,
          equipmentMode: s.equipmentMode,
          equipmentSlots: s.equipmentSlots,
          specialSlots: s.specialSlots,
          attributePicks: s.attributePicks,
          description: s.description,
          fixedAttributes: (fixedAttrsBySoldier.get(s.id) ?? []).slice().sort((a, b) => a.localeCompare(b)),
          loadouts: (loadoutsBySoldier.get(s.id) ?? []).slice().sort((a, b) => a.order - b.order || a.label.localeCompare(b.label)),
        };
      })
      .sort(byName);

    // monster types
    const fixedAttrsByMonster = new Map<string, string[]>();
    for (const r of monsterFixedRows) {
      const name = nameByAttr.get(r.attributeId);
      if (!name) continue;
      const list = fixedAttrsByMonster.get(r.monsterTypeId);
      if (list) list.push(name);
      else fixedAttrsByMonster.set(r.monsterTypeId, [name]);
    }

    const mItemsByLoadout = new Map<string, { name: string; qty: number }[]>();
    for (const it of monsterLoadoutItemRows) {
      const name = nameByEquip.get(it.equipmentItemId);
      if (!name) continue;
      const list = mItemsByLoadout.get(it.loadoutId);
      const entry = { name, qty: it.quantity };
      if (list) list.push(entry);
      else mItemsByLoadout.set(it.loadoutId, [entry]);
    }

    const mLoadoutsByMonster = new Map<string, { label: string; order: number; items: { name: string; qty: number }[] }[]>();
    for (const lo of monsterLoadoutRows) {
      const entry = { label: lo.label, order: lo.displayOrder, items: mItemsByLoadout.get(lo.id) ?? [] };
      const list = mLoadoutsByMonster.get(lo.monsterTypeId);
      if (list) list.push(entry);
      else mLoadoutsByMonster.set(lo.monsterTypeId, [entry]);
    }

    const monsters = monsterRows
      .map((m) => {
        const st = m.stats as Record<string, number>;
        return {
          name: m.name,
          sourceCode: srcCode(m.sourceId),
          experience: m.experience,
          stats: { speed: st.speed, melee: st.melee, accuracy: st.accuracy, defence: st.defence, courage: st.courage, health: st.health },
          equipmentMode: m.equipmentMode as 'fixed' | 'choice',
          description: m.description,
          fixedAttributes: (fixedAttrsByMonster.get(m.id) ?? []).slice().sort((a, b) => a.localeCompare(b)),
          loadouts: (mLoadoutsByMonster.get(m.id) ?? []).slice().sort((a, b) => a.order - b.order || a.label.localeCompare(b.label)),
        };
      })
      .sort(byName);

    // diff against the *previous* committed seed-data.ts (read before writing)
    const changes = [
      diffCollection('source', readExportedArray<(typeof sources)[number]>(SEED_PATH, 'sources'), sources, (x) => x.code, (x) => x.name),
      diffCollection('nation', readExportedArray<(typeof nations)[number]>(SEED_PATH, 'nations'), nations, (x) => x.name, (x) => x.name),
      diffCollection('attribute', readExportedArray<(typeof attributes)[number]>(SEED_PATH, 'attributes'), attributes, (x) => x.name, (x) => x.name),
      diffCollection('equipment', readExportedArray<(typeof equipment)[number]>(SEED_PATH, 'equipment'), equipment, (x) => x.name, (x) => x.name),
      diffCollection('soldier type', readExportedArray<(typeof soldiers)[number]>(SEED_PATH, 'soldiers'), soldiers, (x) => x.name, (x) => x.name),
      diffCollection('monster type', readExportedArray<(typeof monsters)[number]>(SEED_PATH, 'monsters'), monsters, (x) => x.name, (x) => x.name),
    ].flat();

    const body =
      `\nexport const sources: SeedSource[] = ${JSON.stringify(sources, null, 2)};\n` +
      `\nexport const nations: SeedNation[] = ${JSON.stringify(nations, null, 2)};\n` +
      `\nexport const attributes: SeedAttribute[] = ${JSON.stringify(attributes, null, 2)};\n` +
      `\nexport const equipment: SeedEquipment[] = ${JSON.stringify(equipment, null, 2)};\n` +
      `\nexport const soldiers: SeedSoldier[] = ${JSON.stringify(soldiers, null, 2)};\n` +
      `\nexport const monsters: SeedMonster[] = ${JSON.stringify(monsters, null, 2)};\n`;
    fs.writeFileSync(SEED_PATH, SEED_HEADER + body);

    // Temporarily disabled while base data is being entered.
    // Re-enable WRITE_CHANGELOG when the reference data is stable.
    const WRITE_CHANGELOG = true;
    let note: string | null = null;
    if (WRITE_CHANGELOG && changes.length > 0) {
      note = opts.note?.trim() || summarize(changes);
      const prevLog = readExportedArray<ReferenceChangelogEntry>(CHANGELOG_PATH, 'referenceChangelog');
      const entries = [{ date: new Date().toISOString(), note, changes }, ...prevLog];
      fs.writeFileSync(
        CHANGELOG_PATH,
        `${CHANGELOG_HEADER}\nexport const referenceChangelog: ReferenceChangelogEntry[] = ${JSON.stringify(entries, null, 2)};\n`,
      );
    }

    return {
      counts: {
        sources: sources.length,
        nations: nations.length,
        attributes: attributes.length,
        equipment: equipment.length,
        soldiers: soldiers.length,
        monsters: monsters.length,
      },
      changes,
      note,
    };
  } finally {
    await client.end();
  }
}

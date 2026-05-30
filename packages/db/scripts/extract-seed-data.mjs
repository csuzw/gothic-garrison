// One-time transform: reads the cached cotalink reference JS and emits
// src/seed-data.ts in our own shape. Run once for the initial import:
//   node scripts/extract-seed-data.mjs
// (Requires reference/silver_bayonet.cotalink.js at the repo root — gitignored.)
// Future rule changes are entered by hand in seed-data.ts, not re-scraped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const refPath = path.join(repoRoot, 'reference/silver_bayonet.cotalink.js');
const code = fs.readFileSync(refPath, 'utf8');

// Extract a single top-level object/array literal `const NAME = {…}` without
// executing any of the file's browser logic (string-aware bracket matcher).
function extractLiteral(name) {
  const m = code.match(new RegExp(`const\\s+${name}\\s*=\\s*`));
  if (!m) throw new Error(`literal not found: ${name}`);
  let i = m.index + m[0].length;
  const start = i;
  let depth = 0;
  let str = null;
  let esc = false;
  for (; i < code.length; i++) {
    const c = code[i];
    if (str) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === str) str = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') str = c;
    else if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  return eval(`(${code.slice(start, i)})`);
}

const NATIONS = extractLiteral('NATIONS');
const SOLDIERS = extractLiteral('SOLDIERS');
const OFFICER_ATTRIBUTES = extractLiteral('OFFICER_ATTRIBUTES');
const OFFICER_ATTR_BOOK = extractLiteral('OFFICER_ATTR_BOOK_BUILTIN');
const EXTRA_ATTR = extractLiteral('EXTRA_ATTRIBUTE_RULEBOOK');
const GENERAL_EQUIPMENT = extractLiteral('GENERAL_EQUIPMENT');
const SPECIAL_EQUIPMENT = extractLiteral('SPECIAL_EQUIPMENT');

// ── source mapping (book name → our source code) ─────────────────────────────
const BOOK_TO_CODE = {
  'Shades of Calabria': 'italy',
  Canada: 'canada',
  'Shadow of the Sphinx': 'egypt',
  'Castle Fier': 'carpathians',
  'Bones of Albion': 'britain',
  'Canada / Castle Fier': 'canada',
};
const bookCode = (s) => (s ? BOOK_TO_CODE[s] ?? 'core' : 'core');

// Short note: first sentence, capped — we deliberately don't store full prose.
function shortNote(text) {
  if (!text) return '';
  const oneLine = text.replace(/\s+/g, ' ').trim();
  const firstSentence = oneLine.split(/(?<=\.)\s/)[0];
  const note = firstSentence.length > 160 ? oneLine.slice(0, 157).trimEnd() + '…' : firstSentence;
  return note;
}

// ── nations ──────────────────────────────────────────────────────────────────
const nations = Object.values(NATIONS).map((n) => ({
  name: n.name,
  sourceCode: bookCode(n.source),
  soldiers: n.soldiers,
}));

// ── attributes (officer-flagged + extras) ────────────────────────────────────
const EXTRA_SOURCE = {
  'Blessed of Britain': 'britain',
  'Scourge of Britain': 'britain',
  'Quick to Run': 'italy',
  'Skinshift (Werewolf)': 'italy',
  'Skinshift (Wolf)': 'canada',
  'Allergy (Silver and Fire)': 'canada',
  'Quick Heal': 'canada',
  'Ancient Spells': 'egypt',
  'Experience in the Desert': 'egypt',
};
const attributes = [
  ...OFFICER_ATTRIBUTES.map((name) => ({
    name,
    isOfficer: true,
    sourceCode: 'core',
    note: shortNote(OFFICER_ATTR_BOOK[name]),
  })),
  ...Object.keys(EXTRA_ATTR).map((name) => ({
    name,
    isOfficer: false,
    sourceCode: EXTRA_SOURCE[name] ?? 'core',
    note: shortNote(EXTRA_ATTR[name]),
  })),
];
const attrNames = new Set(attributes.map((a) => a.name));

// ── equipment ────────────────────────────────────────────────────────────────
const GEARKIND_TO_CATEGORY = {
  ranged: 'weapon',
  melee: 'weapon',
  armour: 'armour',
  support: 'gear',
  special_gear: 'special-armoury',
  upgrade: 'special-armoury',
};
const equipment = [...GENERAL_EQUIPMENT, ...SPECIAL_EQUIPMENT].map((e) => ({
  name: e.name,
  slotCost: e.slots,
  isSpecial: !!e.special,
  category: GEARKIND_TO_CATEGORY[e.gearKind] ?? 'gear',
  note: e.notes ?? '',
}));
const equipNames = new Set(equipment.map((e) => e.name));

// ── loadout parsing ──────────────────────────────────────────────────────────
const unknownTokens = new Set();
function parseTokens(str) {
  if (!str) return [];
  return str
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((tok) => {
      let qty = 1;
      let name = tok;
      const m = tok.match(/^(\d+)\s+(.*)$/);
      if (m) {
        qty = Number(m[1]);
        name = m[2];
      }
      if (equipNames.has(name)) return { name, qty };
      if (name.endsWith('s') && equipNames.has(name.slice(0, -1)))
        return { name: name.slice(0, -1), qty };
      unknownTokens.add(tok);
      return null;
    })
    .filter(Boolean);
}

function buildLoadouts(s) {
  if (s.officerSlots) return []; // pool — built from slots, no predetermined loadout
  if (s.equipOptions)
    return s.equipOptions.map((opt, i) => ({ label: opt, order: i, items: parseTokens(opt) }));
  if (s.equipGroups) {
    let combos = [[]];
    for (const g of s.equipGroups) {
      const next = [];
      for (const combo of combos) for (const opt of g.options) next.push([...combo, opt]);
      combos = next;
    }
    return combos.map((combo, i) => ({
      label: combo.join(', '),
      order: i,
      items: combo.flatMap(parseTokens),
    }));
  }
  return [{ label: 'Standard', order: 0, items: parseTokens(s.equip) }];
}

// ── soldiers ─────────────────────────────────────────────────────────────────
const soldiers = Object.entries(SOLDIERS).map(([name, s]) => {
  const abilities = (s.attrs ?? []).filter((a) => a && a !== '—' && !/^\(Select/i.test(a));
  return {
    name,
    sourceCode: bookCode(s.source),
    recruitmentCost: s.recruitment,
    stats: {
      speed: s.speed,
      melee: s.melee,
      accuracy: s.accuracy,
      defence: s.defence,
      courage: s.courage,
      health: s.health,
    },
    maxPerUnit: s.maxOne ? 1 : null,
    equipmentMode: s.officerSlots ? 'pool' : s.equipOptions || s.equipGroups ? 'choice' : 'fixed',
    equipmentSlots: s.officerSlots ? 6 : null, // pool soldiers mirror the Officer's caps (verify vs book)
    specialSlots: s.officerSlots ? 2 : null,
    attributePicks: s.officerAttrPick ? 1 : 0,
    abilities,
    fixedAttributes: abilities.filter((a) => attrNames.has(a)),
    loadouts: buildLoadouts(s),
  };
});

// ── emit src/seed-data.ts ────────────────────────────────────────────────────
const header = `// AUTO-GENERATED by scripts/extract-seed-data.mjs from the cotalink reference
// (one-time import). Edit by hand for future rule changes / new supplements.
/* eslint-disable */

export type EquipmentMode = 'fixed' | 'choice' | 'pool';

export interface SeedNation { name: string; sourceCode: string; soldiers: string[]; }
export interface SeedAttribute { name: string; isOfficer: boolean; sourceCode: string; note: string; }
export interface SeedEquipment { name: string; slotCost: number; isSpecial: boolean; category: string; note: string; }
export interface SeedLoadoutItem { name: string; qty: number; }
export interface SeedLoadout { label: string; order: number; items: SeedLoadoutItem[]; }
export interface SeedSoldier {
  name: string;
  sourceCode: string;
  recruitmentCost: number;
  stats: { speed: number; melee: number; accuracy: number; defence: number; courage: number; health: number };
  maxPerUnit: number | null;
  equipmentMode: EquipmentMode;
  equipmentSlots: number | null;
  specialSlots: number | null;
  attributePicks: number;
  abilities: string[];
  fixedAttributes: string[];
  loadouts: SeedLoadout[];
}
`;

const body =
  `\nexport const nations: SeedNation[] = ${JSON.stringify(nations, null, 2)};\n` +
  `\nexport const attributes: SeedAttribute[] = ${JSON.stringify(attributes, null, 2)};\n` +
  `\nexport const equipment: SeedEquipment[] = ${JSON.stringify(equipment, null, 2)};\n` +
  `\nexport const soldiers: SeedSoldier[] = ${JSON.stringify(soldiers, null, 2)};\n`;

const outPath = path.join(here, '../src/seed-data.ts');
fs.writeFileSync(outPath, header + body);

console.log(
  `wrote seed-data.ts: ${nations.length} nations, ${attributes.length} attributes ` +
    `(${attributes.filter((a) => a.isOfficer).length} officer), ${equipment.length} equipment, ` +
    `${soldiers.length} soldiers`,
);
if (unknownTokens.size) {
  console.warn('UNMATCHED equipment tokens (check parsing):', [...unknownTokens]);
} else {
  console.log('all loadout tokens matched known equipment ✓');
}

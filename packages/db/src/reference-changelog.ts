// AUTO-GENERATED — do not edit by hand.
// Appended to by `pnpm db:export-seed` (src/export-seed-data.ts) whenever an
// export detects reference-data changes vs the committed seed-data.ts. Each
// entry pairs a human note (from `--note`, or a derived summary) with the
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

export const referenceChangelog: ReferenceChangelogEntry[] = [];

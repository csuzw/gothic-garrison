// CLI entry for the seed-data exporter: `pnpm db:export-seed [--note "…"]`.
// The actual work lives in exportSeedData() (export-seed-data.ts) so the same
// logic backs the in-app Codex "export" endpoint.
import { exportSeedData, parseNote } from './export-seed-data.ts';

const result = await exportSeedData({ note: parseNote(process.argv.slice(2)) });
const c = result.counts;
console.log(
  `exported seed-data.ts: ${c.sources} sources, ${c.nations} nations, ${c.attributes} attributes, ` +
    `${c.equipment} equipment, ${c.soldiers} soldier types`,
);
if (result.changes.length > 0) {
  console.log(`changelog: +1 entry "${result.note}" (${result.changes.length} change${result.changes.length === 1 ? '' : 's'})`);
} else {
  console.log('changelog: no changes detected');
}

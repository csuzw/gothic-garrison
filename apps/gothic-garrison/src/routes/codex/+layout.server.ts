import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// The Codex is a local-development-only editor for the shared reference data
// (nations, soldier types, attributes, equipment). Edits are made against the
// local DB and exported back to packages/db/src/seed-data.ts, which is the
// canonical, git-committed source applied to every environment via `db:seed`.
//
// Production has no write path to reference data at all: this guard 404s the
// whole /codex subtree (pages *and* future /api/codex endpoints must each
// re-assert it) in any non-dev build, so there is no admin role to manage and
// nothing for a compromised account to tamper with.
export const load: LayoutServerLoad = () => {
  if (!dev) throw error(404, 'Not Found');
  return {};
};

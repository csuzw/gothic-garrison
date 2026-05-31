import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';

// The Codex is readable in production (reference data browser) but all writes
// are dev-only. readonly:true is passed to the layout so the UI hides write
// controls and the Export button; the write API endpoints enforce the same gate
// server-side via runCodex() in src/lib/server/codex.ts.
export const load: LayoutServerLoad = () => {
  return { readonly: !dev };
};

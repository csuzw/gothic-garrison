import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';

// Expose the signed-in user to every page for SSR-consistent rendering (e.g.
// the navbar). Null for anonymous visitors. `dev` gates the local-only Codex
// nav link (see src/routes/codex) — false in any production build.
export const load: LayoutServerLoad = async ({ locals }) => {
  return { user: locals.user, dev };
};

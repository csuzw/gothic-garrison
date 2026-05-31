import type { LayoutServerLoad } from './$types';

// Expose the signed-in user to every page for SSR-consistent rendering (e.g.
// the navbar). Null for anonymous visitors.
export const load: LayoutServerLoad = async ({ locals }) => {
  return { user: locals.user };
};

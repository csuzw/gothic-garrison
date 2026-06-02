import type { PageLoad } from './$types';
import type { ReferenceData } from '$lib/server/reference';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const res = await fetch('/api/reference/snapshot');
    if (res.ok) {
      return { reference: (await res.json()) as ReferenceData };
    }
  } catch {}
  const empty: ReferenceData = { nations: [], attributes: [], equipment: [], soldiers: [], sources: [] };
  return { reference: empty };
};

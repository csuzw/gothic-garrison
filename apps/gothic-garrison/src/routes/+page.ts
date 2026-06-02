import type { PageLoad } from './$types';
import type { ReferenceData } from '$lib/server/reference';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const res = await fetch('/api/reference/snapshot');
    if (res.ok) {
      const ref = (await res.json()) as ReferenceData;
      return { nations: ref.nations, sources: ref.sources };
    }
  } catch {}
  return { nations: [] as ReferenceData['nations'], sources: [] as ReferenceData['sources'] };
};

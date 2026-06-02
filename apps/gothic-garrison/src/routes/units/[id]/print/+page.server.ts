import { getReferenceData, type ReferenceData } from '$lib/server/reference';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    return { reference: await getReferenceData() };
  } catch (err) {
    console.warn('[gothic-garrison] reference data unavailable:', err);
    const empty: ReferenceData = { nations: [], attributes: [], equipment: [], soldiers: [], sources: [] };
    return { reference: empty };
  }
};

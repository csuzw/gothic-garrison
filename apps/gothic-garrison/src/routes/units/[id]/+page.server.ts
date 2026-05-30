import { getReferenceData, type ReferenceData } from '$lib/server/reference';
import type { PageServerLoad } from './$types';

// Reference catalogue (nations + soldier types) for the builder. Public read —
// anonymous users build too. The unit doc itself loads client-side from the
// active store (IndexedDB or server), so it's not loaded here.
export const load: PageServerLoad = async () => {
  try {
    return { reference: await getReferenceData() };
  } catch (err) {
    console.warn('[gothic-garrison] reference data unavailable:', err);
    const empty: ReferenceData = { nations: [], attributes: [], equipment: [], soldiers: [] };
    return { reference: empty };
  }
};

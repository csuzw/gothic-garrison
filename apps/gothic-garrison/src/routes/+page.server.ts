import { getReferenceData } from '$lib/server/reference';

export const load = async () => {
  try {
    const { nations } = await getReferenceData();
    return { nations: nations.map((n) => ({ id: n.id, flag: n.flag })) };
  } catch {
    return { nations: [] as { id: string; flag: string | null }[] };
  }
};

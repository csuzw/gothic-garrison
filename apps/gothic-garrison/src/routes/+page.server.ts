import { getReferenceData } from '$lib/server/reference';

export const load = async () => {
  try {
    const { nations } = await getReferenceData();
    return {
      nations: nations.map((n) => ({
        id: n.id,
        name: n.name,
        flag: n.flag,
        sourceCode: n.sourceCode,
        description: n.description,
      })),
    };
  } catch {
    return { nations: [] as { id: string; name: string; flag: string | null; sourceCode: string; description: string | null }[] };
  }
};

import { json } from '@sveltejs/kit';
import { getReferenceData } from '$lib/server/reference';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const data = await getReferenceData();
  return json(data, {
    headers: { 'cache-control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
};

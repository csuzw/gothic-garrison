import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';
import { exportSeedData } from '$db/export-seed-data';
import { serverEnv } from '$lib/server/env';

// POST /api/codex/export — regenerate seed-data.ts from the local DB and append
// a changelog entry (the Codex "save to repo" action). Dev-only, like the rest
// of /api/codex. A static route segment, so it takes priority over [entity].
export const POST: RequestHandler = async ({ request }) => {
  if (!dev) return new Response('Not Found', { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { note?: unknown };
  const note = typeof body.note === 'string' ? body.note : undefined;

  try {
    const result = await exportSeedData({ note, databaseUrl: serverEnv.databaseUrl() });
    return json(result);
  } catch (e) {
    console.error('[codex] export failed:', e);
    return json({ message: 'Export failed — see server logs' }, { status: 500 });
  }
};

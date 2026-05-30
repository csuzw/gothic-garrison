import { json, type RequestHandler } from '@sveltejs/kit';
import { runCodex } from '$lib/server/codex';

// Collection endpoints for one reference entity. Gated to dev inside runCodex —
// production returns 404 here just as the /codex pages do.

// GET /api/codex/:entity — list all rows.
export const GET: RequestHandler = ({ params }) =>
  runCodex(params.entity, async (h) => json({ items: await h.list() }));

// POST /api/codex/:entity — create a row from the JSON body.
export const POST: RequestHandler = ({ params, request }) =>
  runCodex(params.entity, async (h) => json({ item: await h.create(await request.json()) }, { status: 201 }));

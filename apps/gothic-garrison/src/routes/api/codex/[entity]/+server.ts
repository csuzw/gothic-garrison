import { json, type RequestHandler } from '@sveltejs/kit';
import { runCodex, runCodexRead } from '$lib/server/codex';

// GET /api/codex/:entity — list all rows (read-only, available in production).
export const GET: RequestHandler = ({ params }) =>
  runCodexRead(params.entity, async (h) => json({ items: await h.list() }));

// POST /api/codex/:entity — create a row from the JSON body.
export const POST: RequestHandler = ({ params, request }) =>
  runCodex(params.entity, async (h) => json({ item: await h.create(await request.json()) }, { status: 201 }));

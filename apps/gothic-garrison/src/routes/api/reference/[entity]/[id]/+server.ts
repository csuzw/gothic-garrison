import { json, type RequestHandler } from '@sveltejs/kit';
import { runCodex } from '$lib/server/codex';

// Item endpoints for one reference row. Gated to dev inside runCodex.

// PATCH /api/codex/:entity/:id — replace a row from the JSON body.
export const PATCH: RequestHandler = ({ params, request }) =>
  runCodex(params.entity, async (h) => json({ item: await h.update(params.id!, await request.json()) }));

// DELETE /api/codex/:entity/:id — delete a row (refused if a saved unit
// snapshots it, or other reference data depends on it).
export const DELETE: RequestHandler = ({ params }) =>
  runCodex(params.entity, async (h) => {
    await h.remove(params.id!);
    return json({ ok: true });
  });

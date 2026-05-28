import { json, type RequestHandler } from '@sveltejs/kit';
import { captureEmail, type IncomingEmail } from '$lib/server/store';

// POST /emails — Resend-compatible send endpoint.
// Accepts any non-empty Bearer token (this is a dev mock; don't use in prod).
export const POST: RequestHandler = async ({ request }) => {
  const auth = request.headers.get('authorization') ?? '';
  if (!auth.toLowerCase().startsWith('bearer ') || auth.length <= 'bearer '.length) {
    return json({ name: 'unauthorized', message: 'Missing bearer token' }, { status: 401 });
  }

  let body: IncomingEmail;
  try {
    body = (await request.json()) as IncomingEmail;
  } catch {
    return json({ name: 'invalid_body', message: 'Body must be JSON' }, { status: 400 });
  }

  if (!body.from || !body.to || !body.subject) {
    return json(
      { name: 'validation_error', message: 'from, to, and subject are required' },
      { status: 422 },
    );
  }

  const stored = captureEmail(body);
  // Resend's actual response shape on success.
  return json({ id: stored.id }, { status: 200 });
};

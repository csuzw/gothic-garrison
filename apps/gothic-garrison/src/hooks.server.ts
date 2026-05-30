import type { Handle } from '@sveltejs/kit';
import { getAuth } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const url = event.url;

  // Mount better-auth's request handler at /api/auth/*
  if (url.pathname.startsWith('/api/auth')) {
    try {
      const auth = getAuth();
      return auth.handler(event.request);
    } catch (err) {
      console.warn('[gothic-garrison] auth handler failed:', err);
      return new Response('auth unavailable', { status: 503 });
    }
  }

  // Resolve the session once per request so load functions and pages can read
  // event.locals.user without each hitting better-auth. Failures degrade to
  // anonymous rather than 500ing the page.
  try {
    const session = await getAuth().api.getSession({ headers: event.request.headers });
    event.locals.user = session?.user ?? null;
    event.locals.session = session?.session ?? null;
  } catch (err) {
    console.warn('[gothic-garrison] session lookup failed:', err);
    event.locals.user = null;
    event.locals.session = null;
  }

  return resolve(event);
};

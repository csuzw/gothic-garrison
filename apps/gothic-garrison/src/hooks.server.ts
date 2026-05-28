import type { Handle } from '@sveltejs/kit';
import { getAuth } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  // Mount better-auth's request handler at /api/auth/*
  const url = event.url;
  if (url.pathname.startsWith('/api/auth')) {
    try {
      const auth = getAuth();
      return auth.handler(event.request);
    } catch (err) {
      console.warn('[gothic-garrison] auth handler failed:', err);
      return new Response('auth unavailable', { status: 503 });
    }
  }
  return resolve(event);
};

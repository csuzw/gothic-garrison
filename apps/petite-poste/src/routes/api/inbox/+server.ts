import { json, type RequestHandler } from '@sveltejs/kit';
import { clearInbox, listEmails } from '$lib/server/store';

export const GET: RequestHandler = () => json({ emails: listEmails() });

export const DELETE: RequestHandler = () => {
  const cleared = clearInbox();
  return json({ cleared });
};

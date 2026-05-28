import { randomUUID } from 'node:crypto';

// Resend's POST /emails request body (the bits we care about).
export interface IncomingEmail {
  from: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  reply_to?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
  tags?: Array<{ name: string; value: string }>;
}

export interface StoredEmail extends IncomingEmail {
  id: string;
  receivedAt: string; // ISO timestamp
}

const inbox: StoredEmail[] = [];
const MAX_ENTRIES = 500;

export function captureEmail(input: IncomingEmail): StoredEmail {
  const stored: StoredEmail = {
    ...input,
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
  };
  inbox.unshift(stored);
  if (inbox.length > MAX_ENTRIES) inbox.length = MAX_ENTRIES;
  return stored;
}

export function listEmails(): StoredEmail[] {
  return inbox.slice();
}

export function getEmail(id: string): StoredEmail | undefined {
  return inbox.find((e) => e.id === id);
}

export function clearInbox(): number {
  const n = inbox.length;
  inbox.length = 0;
  return n;
}

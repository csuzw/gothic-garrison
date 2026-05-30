import type { Resend } from 'resend';
import { serverEnv } from './env';

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export interface Mailer {
  send(input: SendEmailInput): Promise<{ id: string }>;
}

// Resend-compatible Mailer.
//
// The Resend SDK has no constructor option for its base URL — it only reads the
// RESEND_BASE_URL env var, *once* at import time. Our config lives in .env as
// RESEND_API_URL (read via $env/dynamic/private), which SvelteKit does NOT mirror
// into process.env. So we bridge the value across to process.env and then
// dynamically import the SDK, so its import-time read picks it up. In dev this
// points at petite-poste; in prod RESEND_API_URL is unset and the SDK defaults
// to https://api.resend.com — dev and prod share one code path, only env changes.
class ResendMailer implements Mailer {
  constructor(private client: Resend) {}

  async send(input: SendEmailInput): Promise<{ id: string }> {
    const { data, error } = await this.client.emails.send({
      from: serverEnv.emailFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html ?? '',
      text: input.text,
    });
    if (error || !data) throw new Error(`Mailer failed: ${error?.message ?? 'unknown'}`);
    return { id: data.id };
  }
}

let cached: Mailer | undefined;

export async function getMailer(): Promise<Mailer> {
  if (!cached) {
    // Must be set before the SDK is imported (see note above).
    process.env.RESEND_BASE_URL = serverEnv.resendApiUrl();
    const { Resend } = await import('resend');
    cached = new ResendMailer(new Resend(serverEnv.resendApiKey()));
  }
  return cached;
}

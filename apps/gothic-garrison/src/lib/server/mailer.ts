import { Resend } from 'resend';
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

// Resend-compatible Mailer. In dev, point RESEND_API_URL at the local
// petite-poste service; in prod, leave it unset to hit api.resend.com.
class ResendMailer implements Mailer {
  private client: Resend;

  constructor(apiKey: string, baseUrl: string) {
    this.client = new Resend(apiKey, { baseUrl } as ConstructorParameters<typeof Resend>[1]);
  }

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

export function getMailer(): Mailer {
  if (!cached) {
    cached = new ResendMailer(serverEnv.resendApiKey(), serverEnv.resendApiUrl());
  }
  return cached;
}

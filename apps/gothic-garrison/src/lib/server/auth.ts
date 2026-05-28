import { betterAuth } from 'better-auth';
import postgres from 'postgres';
import { serverEnv } from './env';
import { getMailer } from './mailer';

// Minimal better-auth setup. Auth UI / flows are not wired yet — this just
// stands up the instance so the SvelteKit hook can mount it. Add providers
// (email/password, magic link, etc.) when the auth UX is designed.

let cached: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (!cached) {
    cached = betterAuth({
      database: postgres(serverEnv.databaseUrl()),
      secret: serverEnv.authSecret(),
      baseURL: serverEnv.publicAppUrl(),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
      emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
          await getMailer().send({
            to: user.email,
            subject: 'Verify your Gothic Garrison account',
            html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
          });
        },
      },
    });
  }
  return cached;
}

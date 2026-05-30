import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { user, session, account, verification } from '$db/schema';
import { getDb } from './db';
import { serverEnv } from './env';
import { getMailer } from './mailer';

// Minimal better-auth setup backed by the shared Drizzle/Postgres connection.
// Email/password is enabled; the auth UI / flows are not built yet — this just
// stands up the instance so the SvelteKit hook can mount it at /api/auth/*.

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: 'pg',
      // Map better-auth's model names to our Drizzle tables (snake_case columns,
      // camelCase keys). Passing them explicitly avoids the adapter guessing
      // from the full schema, which also holds the domain tables.
      schema: { user, session, account, verification },
    }),
    secret: serverEnv.authSecret(),
    // baseURL is intentionally omitted: better-auth infers it (and the trusted
    // origin for its CSRF check) from each request's host, so sign-in works on
    // whatever port dev/preview lands on. Set this explicitly from
    // PUBLIC_APP_URL once email/callback URLs (which need an absolute base) are
    // wired up alongside the mailer.
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        const mailer = await getMailer();
        await mailer.send({
          to: user.email,
          subject: 'Reset your Gothic Garrison password',
          html: `<p>Click <a href="${url}">here</a> to choose a new password.</p>
                 <p>If you didn't request this, you can safely ignore this email.</p>`,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const mailer = await getMailer();
        await mailer.send({
          to: user.email,
          subject: 'Verify your Gothic Garrison account',
          html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
        });
      },
    },
  });
}

// Capture the *specific* inferred Auth type from createAuth (not the generic
// ReturnType<typeof betterAuth>, whose invariant $context won't accept it).
let cached: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  cached ??= createAuth();
  return cached;
}

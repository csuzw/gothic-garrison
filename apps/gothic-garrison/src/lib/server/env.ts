import { env } from '$env/dynamic/private';

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const serverEnv = {
  databaseUrl: () => required('DATABASE_URL', env.DATABASE_URL),
  authSecret: () => required('AUTH_SECRET', env.AUTH_SECRET),
  resendApiKey: () => required('RESEND_API_KEY', env.RESEND_API_KEY),
  resendApiUrl: () => env.RESEND_API_URL ?? 'https://api.resend.com',
  emailFrom: () => env.EMAIL_FROM ?? 'Gothic Garrison <noreply@gothic-garrison.local>',
  publicAppUrl: () => env.PUBLIC_APP_URL ?? 'http://localhost:5173',
};

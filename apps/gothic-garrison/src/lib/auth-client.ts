import { createAuthClient } from 'better-auth/svelte';

// Client-side auth. With no baseURL it talks to /api/auth on the current
// origin, which is where hooks.server.ts mounts the better-auth handler.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

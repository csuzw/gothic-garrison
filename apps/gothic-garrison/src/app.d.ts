// See https://svelte.dev/docs/kit/types#app.d.ts
import type { getAuth } from '$lib/server/auth';

type SessionData = ReturnType<typeof getAuth>['$Infer']['Session'];

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: SessionData['user'] | null;
      session: SessionData['session'] | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};

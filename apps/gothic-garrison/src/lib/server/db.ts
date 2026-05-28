import { createDb, type Database } from '$db/client';
import { serverEnv } from './env';

let cached: Database | undefined;

export function getDb(): Database {
  if (!cached) {
    cached = createDb(serverEnv.databaseUrl());
  }
  return cached;
}

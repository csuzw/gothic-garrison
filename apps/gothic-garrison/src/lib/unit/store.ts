import { toSummary, type UnitDoc, type UnitSummary } from './types.ts';

// A unit persistence backend. Two implementations share this interface so the
// UI never forks on auth state: anonymous users persist to IndexedDB on the
// device, signed-in users persist to the server. Same UnitDoc shape both ways.
export interface UnitStore {
  list(): Promise<UnitSummary[]>;
  get(id: string): Promise<UnitDoc | null>;
  save(doc: UnitDoc): Promise<UnitDoc>;
  remove(id: string): Promise<void>;
}

// ── IndexedDB (anonymous) ─────────────────────────────────────────────────────

const DB_NAME = 'gothic-garrison';
// v2: the object store was renamed 'warbands' → 'units'. Bumping the version
// runs onupgradeneeded on existing databases so the 'units' store is created
// (and the now-dead 'warbands' store is dropped).
const DB_VERSION = 2;
const STORE = 'units';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      if (db.objectStoreNames.contains('warbands')) db.deleteObjectStore('warbands');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function reqAsync<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

const indexedDbStore: UnitStore = {
  async list() {
    const db = await openDb();
    const docs = await reqAsync(
      db.transaction(STORE).objectStore(STORE).getAll() as IDBRequest<UnitDoc[]>,
    );
    db.close();
    return docs.map(toSummary).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async get(id) {
    const db = await openDb();
    const doc = await reqAsync(
      db.transaction(STORE).objectStore(STORE).get(id) as IDBRequest<UnitDoc | undefined>,
    );
    db.close();
    return doc ?? null;
  },
  async save(doc) {
    // Deep-clone to a plain object: callers pass a Svelte $state proxy, which
    // IndexedDB's structured clone can't serialise.
    const next: UnitDoc = JSON.parse(JSON.stringify({ ...doc, updatedAt: new Date().toISOString() }));
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(next);
    await txDone(tx);
    db.close();
    return next;
  },
  async remove(id) {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    await txDone(tx);
    db.close();
  },
};

// ── Server (signed-in) ────────────────────────────────────────────────────────

const serverStore: UnitStore = {
  async list() {
    const res = await fetch('/api/units');
    if (!res.ok) throw new Error('Could not load your units.');
    return (await res.json()).units as UnitSummary[];
  },
  async get(id) {
    const res = await fetch(`/api/units/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Could not load this unit.');
    return (await res.json()).unit as UnitDoc;
  },
  async save(doc) {
    const next: UnitDoc = { ...doc, updatedAt: new Date().toISOString() };
    const res = await fetch(`/api/units/${doc.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(next),
    });
    if (!res.ok) throw new Error('Could not save this unit.');
    return (await res.json()).unit as UnitDoc;
  },
  async remove(id) {
    const res = await fetch(`/api/units/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Could not delete this unit.');
  },
};

/** Pick the backend for the current auth state. */
export function getUnitStore(signedIn: boolean): UnitStore {
  return signedIn ? serverStore : indexedDbStore;
}

/**
 * Move any anonymous (IndexedDB) units onto the now-signed-in user's account,
 * clearing each local copy once it's safely on the server. Call right after a
 * successful sign-in/up. Returns how many were migrated. Per-item save→remove
 * order means a mid-way failure leaves the unmigrated ones intact locally.
 */
export async function migrateAnonymousUnits(): Promise<number> {
  const summaries = await indexedDbStore.list();
  let migrated = 0;
  for (const s of summaries) {
    const doc = await indexedDbStore.get(s.id);
    if (!doc) continue;
    await serverStore.save(doc);
    await indexedDbStore.remove(s.id);
    migrated += 1;
  }
  return migrated;
}

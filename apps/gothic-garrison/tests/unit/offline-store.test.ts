// Uses fake-indexeddb to provide a real IDB implementation in Node so we can
// exercise the full getUnitById fallback path without a browser.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUnitDoc } from '../../src/lib/unit/types.ts';
import { getUnitById, indexedDbStore } from '../../src/lib/unit/store.ts';

// Reset IDB to a blank slate before each test so state cannot leak.
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

// Build a minimal mock Response that serverStore.get() can consume.
function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('getUnitById', () => {
  it('returns the doc from the server when signed in and the unit exists there', async () => {
    const doc = createUnitDoc('Test unit');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(mockResponse(200, { unit: doc })));

    const result = await getUnitById(doc.id, true);

    expect(result.source).toBe('server');
    expect(result.doc).toMatchObject({ id: doc.id, name: 'Test unit' });
  });

  it('falls back to IndexedDB when server returns 404 (unit not on server yet)', async () => {
    const doc = createUnitDoc('Offline unit');
    await indexedDbStore.save(doc);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(mockResponse(404, null)));

    const result = await getUnitById(doc.id, true);

    expect(result.source).toBe('local');
    expect(result.doc?.id).toBe(doc.id);
  });

  it('falls back to IndexedDB when the server fetch throws (device is offline)', async () => {
    const doc = createUnitDoc('Pending sync unit');
    await indexedDbStore.save(doc);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')));

    const result = await getUnitById(doc.id, true);

    expect(result.source).toBe('local');
    expect(result.doc?.id).toBe(doc.id);
  });

  it('goes directly to IndexedDB without hitting the network when not signed in', async () => {
    const doc = createUnitDoc('Anonymous unit');
    await indexedDbStore.save(doc);
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await getUnitById(doc.id, false);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.source).toBe('local');
    expect(result.doc?.id).toBe(doc.id);
  });

  it('returns null doc when the unit exists neither on server nor in IndexedDB', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(mockResponse(404, null)));

    const result = await getUnitById('nonexistent-id', true);

    expect(result.source).toBe('local');
    expect(result.doc).toBeNull();
  });
});

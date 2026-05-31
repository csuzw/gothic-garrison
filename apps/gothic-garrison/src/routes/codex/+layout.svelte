<script lang="ts">
  import { dev } from '$app/environment';
  import { setContext } from 'svelte';
  import { page } from '$app/state';
  import { CODEX_NAV } from '$lib/codex/entities';

  let { data, children } = $props();

  const path = $derived(page.url.pathname);
  const isActive = (slug: string) => path === `/codex/${slug}` || path.startsWith(`/codex/${slug}/`);

  // In dev, allow simulating the production read-only view for testing.
  let readonlyOverride = $state(false);
  const readonly = $derived(data.readonly || readonlyOverride);

  // Provide readonly state to all child pages via context.
  setContext('codex', { get readonly() { return readonly; } });

  interface Change {
    kind: string;
    entity: string;
    name: string;
  }
  let showExport = $state(false);
  let note = $state('');
  let exporting = $state(false);
  let exportError = $state<string | null>(null);
  let result = $state<{ changes: Change[]; note: string | null } | null>(null);

  function openExport() {
    result = null;
    exportError = null;
    note = '';
    showExport = true;
  }

  async function runExport() {
    exporting = true;
    exportError = null;
    result = null;
    try {
      const res = await fetch('/api/codex/export', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        exportError = data.message ?? 'Export failed';
        return;
      }
      result = data;
      note = '';
    } catch {
      exportError = 'Export failed — is the dev server still running?';
    } finally {
      exporting = false;
    }
  }
</script>

<div class="space-y-4">
  <div class="flex flex-wrap items-center gap-2">
    <h1 class="text-2xl font-semibold tracking-wide">Codex</h1>
    {#if dev}
      {#if readonlyOverride}
        <span class="badge badge-info badge-sm">read-only preview</span>
        <button class="btn btn-ghost btn-xs" onclick={() => (readonlyOverride = false)}>Exit preview</button>
      {:else}
        <span class="badge badge-warning badge-sm">dev only</span>
        <button class="btn btn-ghost btn-xs opacity-60" onclick={() => (readonlyOverride = true)}>Preview read-only</button>
      {/if}
    {/if}
    {#if !readonly}
      <button class="btn btn-primary btn-sm ml-auto" onclick={openExport}>Export to repo…</button>
    {/if}
  </div>

  {#if !readonly}
    <p class="max-w-prose text-sm opacity-70">
      Edit the shared reference data in your local database, then <strong>Export to repo</strong> to
      write the changes into <code>seed-data.ts</code> (with a changelog entry).
    </p>
  {/if}

  <nav class="tabs tabs-box w-fit border border-primary">
    {#each CODEX_NAV as item (item.slug)}
      <a href="/codex/{item.slug}" class="tab" class:tab-active={isActive(item.slug)}>{item.label}</a>
    {/each}
  </nav>

  {@render children()}
</div>

{#if showExport}
  <div class="modal modal-open" role="dialog">
    <div class="modal-box">
      <h3 class="text-lg font-semibold">Export to repo</h3>
      <p class="mt-1 text-sm opacity-70">
        Regenerates <code>seed-data.ts</code> from the database. If anything changed, a changelog
        entry is recorded with your note.
      </p>

      <label class="mt-4 block">
        <span class="mb-1 block text-sm font-medium">Changelog note</span>
        <input
          type="text"
          bind:value={note}
          class="input w-full"
          placeholder="e.g. Add Britain supplement equipment"
          disabled={exporting}
        />
        <span class="mt-1 block text-xs opacity-60">Optional — a summary is derived if left blank.</span>
      </label>

      {#if exportError}
        <div class="alert alert-error mt-4 text-sm" role="alert">{exportError}</div>
      {/if}

      {#if result}
        <div class="alert alert-success mt-4 flex-col items-start text-sm">
          {#if result.changes.length === 0}
            <span>No changes detected — <code>seed-data.ts</code> is already up to date.</span>
          {:else}
            <span>Exported <strong>{result.changes.length}</strong> change{result.changes.length === 1 ? '' : 's'}{result.note ? ` — "${result.note}"` : ''}.</span>
            <ul class="mt-1 list-inside list-disc opacity-80">
              {#each result.changes.slice(0, 8) as c (c.kind + c.entity + c.name)}
                <li>{c.kind} {c.entity}: {c.name}</li>
              {/each}
              {#if result.changes.length > 8}<li>…and {result.changes.length - 8} more</li>{/if}
            </ul>
          {/if}
        </div>
      {/if}

      <div class="modal-action">
        <button class="btn btn-ghost" onclick={() => (showExport = false)} disabled={exporting}>Close</button>
        <button class="btn btn-primary" onclick={runExport} disabled={exporting}>
          {#if exporting}<span class="loading loading-spinner loading-sm"></span>{/if}
          Export
        </button>
      </div>
    </div>
    <button class="modal-backdrop" onclick={() => (showExport = false)} aria-label="Close">close</button>
  </div>
{/if}

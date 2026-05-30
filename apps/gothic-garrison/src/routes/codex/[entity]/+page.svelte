<script lang="ts">
  import { page } from '$app/state';
  import { blankRow, codexEntity, pickFields, SOLDIER_TYPES_SLUG, type CodexEntity } from '$lib/codex/entities';

  type Row = Record<string, unknown> & { id: string };

  const slug = $derived(page.params.entity!);
  const entity = $derived(codexEntity(slug));
  const isSoldierTypes = $derived(slug === SOLDIER_TYPES_SLUG);

  let rows = $state<Row[]>([]);
  let sources = $state<{ id: string; name: string }[]>([]);
  let loading = $state(true);
  let loadError = $state<string | null>(null);

  let formMode = $state<'closed' | 'new' | 'edit'>('closed');
  // Dynamic form values keyed by field name; `any` so each input can bind:value
  // without a per-type cast (which Svelte disallows on a binding target).
  let draft = $state<Record<string, any>>({});
  let editingId = $state<string | null>(null);
  let saving = $state(false);
  let formError = $state<string | null>(null);
  let actionError = $state<string | null>(null);

  const sourceName = (id: unknown) => sources.find((s) => s.id === id)?.name ?? '—';

  async function loadAll() {
    loading = true;
    loadError = null;
    formMode = 'closed';
    actionError = null;
    try {
      const [listRes, srcRes] = await Promise.all([
        fetch(`/api/codex/${slug}`),
        fetch('/api/codex/sources'),
      ]);
      if (!listRes.ok) {
        loadError = (await listRes.json().catch(() => ({})))?.message ?? `Failed to load ${slug}`;
        rows = [];
        return;
      }
      rows = (await listRes.json()).items ?? [];
      sources = srcRes.ok ? (await srcRes.json()).items ?? [] : [];
    } catch {
      loadError = 'Could not reach the Codex API.';
    } finally {
      loading = false;
    }
  }

  // Reload whenever the entity in the URL changes.
  $effect(() => {
    void slug;
    loadAll();
  });

  function startNew(e: CodexEntity) {
    draft = blankRow(e);
    editingId = null;
    formMode = 'new';
    formError = null;
  }

  function startEdit(e: CodexEntity, row: Row) {
    draft = pickFields(e, row);
    editingId = row.id;
    formMode = 'edit';
    formError = null;
  }

  async function save(event: SubmitEvent) {
    event.preventDefault();
    saving = true;
    formError = null;
    try {
      const url = formMode === 'edit' ? `/api/codex/${slug}/${editingId}` : `/api/codex/${slug}`;
      const res = await fetch(url, {
        method: formMode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        formError = (await res.json().catch(() => ({})))?.message ?? 'Save failed';
        return;
      }
      formMode = 'closed';
      await loadAll();
    } catch {
      formError = 'Save failed — could not reach the API.';
    } finally {
      saving = false;
    }
  }

  async function remove(row: Row) {
    const label = (row.name as string) ?? (row.code as string) ?? row.id;
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    actionError = null;
    try {
      const res = await fetch(`/api/codex/${slug}/${row.id}`, { method: 'DELETE' });
      if (!res.ok) {
        actionError = (await res.json().catch(() => ({})))?.message ?? 'Delete failed';
        return;
      }
      await loadAll();
    } catch {
      actionError = 'Delete failed — could not reach the API.';
    }
  }
</script>

<svelte:head><title>Codex · {entity?.label ?? (isSoldierTypes ? 'Soldier types' : 'Codex')}</title></svelte:head>

{#if !entity && !isSoldierTypes}
  <div class="alert alert-error">Unknown Codex entity: <code>{slug}</code></div>
{:else}
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <h2 class="text-lg font-semibold">{entity?.label ?? 'Soldier types'}</h2>
      <span class="badge badge-ghost badge-sm">{rows.length}</span>
      {#if entity}
        <button class="btn btn-sm btn-primary ml-auto" onclick={() => startNew(entity)}>New {entity.singular}</button>
      {/if}
    </div>

    {#if isSoldierTypes}
      <div class="alert alert-info text-sm">
        Soldier types are read-only here — their loadout/attribute editor is a later slice.
      </div>
    {/if}

    {#if actionError}
      <div class="alert alert-error text-sm" role="alert">{actionError}</div>
    {/if}

    {#if loading}
      <div class="flex justify-center py-10"><span class="loading loading-spinner"></span></div>
    {:else if loadError}
      <div class="alert alert-error text-sm">{loadError}</div>
    {:else if rows.length === 0}
      <p class="py-6 text-sm opacity-60">None yet.</p>
    {:else if isSoldierTypes}
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm">
          <thead>
            <tr><th>Name</th><th>Source</th><th>Cost</th><th>Equipment</th></tr>
          </thead>
          <tbody>
            {#each rows as row (row.id)}
              <tr>
                <td class="font-medium">{row.name}</td>
                <td>{sourceName(row.sourceId)}</td>
                <td>{row.recruitmentCost}</td>
                <td>{row.equipmentMode}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if entity}
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm">
          <thead>
            <tr>
              {#each entity.columns as col (col)}
                <th>{entity.fields.find((f) => f.key === col)?.label ?? col}</th>
              {/each}
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each rows as row (row.id)}
              <tr>
                {#each entity.columns as col (col)}
                  {@const field = entity.fields.find((f) => f.key === col)}
                  <td>
                    {#if field?.type === 'boolean'}
                      {row[col] ? '✓' : '—'}
                    {:else if field?.type === 'source'}
                      {sourceName(row[col])}
                    {:else if field?.type === 'textarea'}
                      <span class="block max-w-xs truncate opacity-80">{row[col] ?? '—'}</span>
                    {:else}
                      {row[col] ?? '—'}
                    {/if}
                  </td>
                {/each}
                <td class="text-right whitespace-nowrap">
                  <button class="btn btn-ghost btn-xs" onclick={() => startEdit(entity, row)}>Edit</button>
                  <button class="btn btn-ghost btn-xs text-error" onclick={() => remove(row)}>Delete</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

  {#if entity && formMode !== 'closed'}
    <div class="modal modal-open" role="dialog">
      <div class="modal-box">
        <h3 class="text-lg font-semibold">
          {formMode === 'edit' ? 'Edit' : 'New'} {entity.singular}
        </h3>

        <form onsubmit={save} class="mt-4 space-y-3">
          {#each entity.fields as field (field.key)}
            <label class="block">
              <span class="mb-1 block text-sm font-medium">
                {field.label}{#if field.required}<span class="text-error"> *</span>{/if}
              </span>

              {#if field.type === 'boolean'}
                <input type="checkbox" bind:checked={draft[field.key]} class="toggle toggle-sm" />
              {:else if field.type === 'textarea'}
                <textarea bind:value={draft[field.key]} class="textarea w-full" rows="2" placeholder={field.placeholder}></textarea>
              {:else if field.type === 'number'}
                <input type="number" bind:value={draft[field.key]} min={field.min} max={field.max} required={field.required} class="input w-full" />
              {:else if field.type === 'date'}
                <input type="date" bind:value={draft[field.key]} required={field.required} class="input w-full" />
              {:else if field.type === 'enum'}
                <select bind:value={draft[field.key]} class="select w-full">
                  {#each field.options ?? [] as opt (opt)}<option value={opt}>{opt}</option>{/each}
                </select>
              {:else if field.type === 'source'}
                <select bind:value={draft[field.key]} required={field.required} class="select w-full">
                  <option value="" disabled>Choose a source…</option>
                  {#each sources as s (s.id)}<option value={s.id}>{s.name}</option>{/each}
                </select>
              {:else}
                <input type="text" bind:value={draft[field.key]} required={field.required} placeholder={field.placeholder} class="input w-full" />
              {/if}

              {#if field.help}<span class="mt-1 block text-xs opacity-60">{field.help}</span>{/if}
            </label>
          {/each}

          {#if formError}
            <div class="alert alert-error text-sm" role="alert">{formError}</div>
          {/if}

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" onclick={() => (formMode = 'closed')} disabled={saving}>Cancel</button>
            <button type="submit" class="btn btn-primary" disabled={saving}>
              {#if saving}<span class="loading loading-spinner loading-sm"></span>{/if}
              {formMode === 'edit' ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
      <button class="modal-backdrop" onclick={() => (formMode = 'closed')} aria-label="Close">close</button>
    </div>
  {/if}
{/if}

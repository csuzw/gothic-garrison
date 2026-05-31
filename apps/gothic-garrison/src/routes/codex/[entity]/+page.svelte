<script lang="ts">
  import { page } from '$app/state';
  import NationFlag from '$lib/components/NationFlag.svelte';
  import CodexSoldierTypeForm from '$lib/components/CodexSoldierTypeForm.svelte';
  import CodexMonsterTypeForm from '$lib/components/CodexMonsterTypeForm.svelte';
  import { blankRow, codexEntity, pickFields, SOLDIER_TYPES_SLUG, MONSTER_TYPES_SLUG, type CodexEntity } from '$lib/codex/entities';

  type Row = Record<string, unknown> & { id: string };

  const slug = $derived(page.params.entity!);
  const entity = $derived(codexEntity(slug));
  const isSoldierTypes = $derived(slug === SOLDIER_TYPES_SLUG);
  const isMonsterTypes = $derived(slug === MONSTER_TYPES_SLUG);

  let rows = $state<Row[]>([]);
  let sources = $state<{ id: string; name: string; code: string }[]>([]);
  let nations = $state<{ id: string; name: string; flag: string | null }[]>([]);
  let allAttributes = $state<{ id: string; name: string; isOfficer: boolean; rules: string | null }[]>([]);
  let allEquipment = $state<{ id: string; name: string; slotCost: number; isSpecial: boolean; rules: string | null }[]>([]);
  let loading = $state(true);
  let loadError = $state<string | null>(null);

  // Source filter
  let sourceFilter = $state('');
  const hasSourceFilter = $derived(
    isSoldierTypes || isMonsterTypes || (entity?.fields.some((f) => f.type === 'source') ?? false)
  );
  const filteredRows = $derived(
    sourceFilter ? rows.filter((r) => r.sourceId === sourceFilter) : rows
  );

  // Sorting
  let sortKey = $state('');
  let sortDir = $state<'asc' | 'desc'>('asc');

  const STAT_KEYS = ['speed', 'melee', 'accuracy', 'defence', 'courage', 'health'];

  function sortVal(row: Row, key: string): string | number {
    if (STAT_KEYS.includes(key)) {
      return Number(((row.stats ?? {}) as Record<string, number>)[key] ?? 0);
    }
    const v = row[key];
    if (v == null) return '';
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (key === 'sourceId') return sourceName(v).toLowerCase();
    return String(v).toLowerCase();
  }

  function sortToggle(key: string) {
    if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else { sortKey = key; sortDir = 'asc'; }
  }

  const si = (key: string) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const sortedFilteredRows = $derived(
    sortKey
      ? [...filteredRows].sort((a, b) => {
          const va = sortVal(a, sortKey);
          const vb = sortVal(b, sortKey);
          const cmp = typeof va === 'number' && typeof vb === 'number'
            ? va - vb
            : String(va).localeCompare(String(vb));
          return sortDir === 'asc' ? cmp : -cmp;
        })
      : filteredRows
  );

  // Flat-entity form state
  let formMode = $state<'closed' | 'new' | 'edit'>('closed');
  let draft = $state<Record<string, any>>({});
  let editingId = $state<string | null>(null);
  let saving = $state(false);
  let formError = $state<string | null>(null);
  let actionError = $state<string | null>(null);

  // Soldier-type form state (separate to avoid clash with generic form state)
  let stFormMode = $state<'closed' | 'new' | 'edit'>('closed');
  let stEditingRow = $state<Row | null>(null);
  let stSaving = $state(false);
  let stFormError = $state<string | null>(null);

  // Monster-type form state
  let mtFormMode = $state<'closed' | 'new' | 'edit'>('closed');
  let mtEditingRow = $state<Row | null>(null);
  let mtSaving = $state(false);
  let mtFormError = $state<string | null>(null);

  const sourceName = (id: unknown) => sources.find((s) => s.id === id)?.name ?? '—';
  const sourceCode = (id: unknown) => sources.find((s) => s.id === id)?.code ?? '?';

  async function loadAll() {
    loading = true;
    loadError = null;
    sourceFilter = '';
    sortKey = '';
    sortDir = 'asc';
    formMode = 'closed';
    stFormMode = 'closed';
    mtFormMode = 'closed';
    actionError = null;
    const isST = slug === SOLDIER_TYPES_SLUG;
    const isMT = slug === MONSTER_TYPES_SLUG;
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
      if (isST || isMT) {
        const [natRes, attrRes, eqRes] = await Promise.all([
          fetch('/api/codex/nations'),
          fetch('/api/codex/attributes'),
          fetch('/api/codex/equipment'),
        ]);
        nations = natRes.ok ? (await natRes.json()).items ?? [] : [];
        allAttributes = attrRes.ok ? (await attrRes.json()).items ?? [] : [];
        allEquipment = eqRes.ok ? (await eqRes.json()).items ?? [] : [];
      } else {
        nations = [];
        allAttributes = [];
        allEquipment = [];
      }
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
    if (sourceFilter) draft['sourceId'] = sourceFilter;
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

  let flagUploading = $state(false);
  let flagUploadError = $state<string | null>(null);

  async function uploadFlag(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    flagUploading = true;
    flagUploadError = null;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/codex/flags', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { flagUploadError = data.message ?? 'Upload failed'; return; }
      draft['flag'] = data.path;
    } catch {
      flagUploadError = 'Upload failed — could not reach the API.';
    } finally {
      flagUploading = false;
      input.value = '';
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

  // ── Soldier-type CRUD ─────────────────────────────────────────────────────────

  function startNewSoldier() {
    stEditingRow = sourceFilter ? ({ sourceId: sourceFilter } as unknown as Row) : null;
    stFormMode = 'new';
    stFormError = null;
  }

  function startEditSoldier(row: Row) {
    stEditingRow = row;
    stFormMode = 'edit';
    stFormError = null;
  }

  async function saveSoldier(body: unknown) {
    stSaving = true;
    stFormError = null;
    try {
      const url =
        stFormMode === 'edit'
          ? `/api/codex/${slug}/${stEditingRow!.id}`
          : `/api/codex/${slug}`;
      const res = await fetch(url, {
        method: stFormMode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        stFormError = (await res.json().catch(() => ({})))?.message ?? 'Save failed';
        return;
      }
      stFormMode = 'closed';
      await loadAll();
    } catch {
      stFormError = 'Save failed — could not reach the API.';
    } finally {
      stSaving = false;
    }
  }

  // ── Monster-type CRUD ─────────────────────────────────────────────────────────

  function startNewMonster() {
    mtEditingRow = sourceFilter ? ({ sourceId: sourceFilter } as unknown as Row) : null;
    mtFormMode = 'new';
    mtFormError = null;
  }

  function startEditMonster(row: Row) {
    mtEditingRow = row;
    mtFormMode = 'edit';
    mtFormError = null;
  }

  async function saveMonster(body: unknown) {
    mtSaving = true;
    mtFormError = null;
    try {
      const url =
        mtFormMode === 'edit'
          ? `/api/codex/${slug}/${mtEditingRow!.id}`
          : `/api/codex/${slug}`;
      const res = await fetch(url, {
        method: mtFormMode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        mtFormError = (await res.json().catch(() => ({})))?.message ?? 'Save failed';
        return;
      }
      mtFormMode = 'closed';
      await loadAll();
    } catch {
      mtFormError = 'Save failed — could not reach the API.';
    } finally {
      mtSaving = false;
    }
  }
</script>

<svelte:head><title>Codex · {entity?.label ?? (isSoldierTypes ? 'Soldiers' : isMonsterTypes ? 'Monsters' : 'Codex')}</title></svelte:head>

{#if !entity && !isSoldierTypes && !isMonsterTypes}
  <div class="alert alert-error">Unknown Codex entity: <code>{slug}</code></div>
{:else}
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <h2 class="text-lg font-semibold">{entity?.label ?? (isSoldierTypes ? 'Soldiers' : 'Monsters')}</h2>
      <span class="badge badge-ghost badge-sm">{filteredRows.length}</span>
      <div class="ml-auto flex items-center gap-2">
        {#if hasSourceFilter && sources.length > 1}
          <div class="join">
            <button
              class="btn btn-xs join-item {sourceFilter === '' ? 'btn-neutral' : 'btn-ghost'}"
              onclick={() => (sourceFilter = '')}
            >all</button>
            {#each sources as s (s.id)}
              <button
                class="btn btn-xs join-item font-mono {sourceFilter === s.id ? 'btn-neutral' : 'btn-ghost'}"
                onclick={() => (sourceFilter = sourceFilter === s.id ? '' : s.id)}
              >{s.code}</button>
            {/each}
          </div>
        {/if}
        {#if entity}
          <button class="btn btn-sm btn-primary" onclick={() => startNew(entity)}>New {entity.singular}</button>
        {:else if isSoldierTypes}
          <button class="btn btn-sm btn-primary" onclick={startNewSoldier}>New soldier</button>
        {:else if isMonsterTypes}
          <button class="btn btn-sm btn-primary" onclick={startNewMonster}>New monster</button>
        {/if}
      </div>
    </div>

    {#if actionError}
      <div class="alert alert-error text-sm" role="alert">{actionError}</div>
    {/if}

    {#if loading}
      <div class="flex justify-center py-10"><span class="loading loading-spinner"></span></div>
    {:else if loadError}
      <div class="alert alert-error text-sm">{loadError}</div>
    {:else if rows.length === 0}
      <p class="py-6 text-sm opacity-60">None yet.</p>
    {:else if filteredRows.length === 0}
      <p class="py-6 text-sm opacity-60">No rows match that source.</p>
    {:else if isSoldierTypes}
      <div class="overflow-x-auto overflow-y-clip">
        <table class="table table-zebra table-sm [&_td]:align-top">
          <thead>
            <tr>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('name')}>Name{si('name')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('speed')}>Spd{si('speed')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('melee')}>Mel{si('melee')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('accuracy')}>Acc{si('accuracy')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('defence')}>Def{si('defence')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('courage')}>Cou{si('courage')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('health')}>HP{si('health')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('recruitmentCost')}>Cost{si('recruitmentCost')}</th>
              <th>Attributes</th>
              <th>Equipment</th>
              <th>Nations</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each sortedFilteredRows as row (row.id)}
              {@const st = (row.stats ?? {}) as Record<string, number>}
              {@const attrIds = (row.fixedAttributeIds ?? []) as string[]}
              {@const los = (row.loadouts ?? []) as Array<{ items: Array<{ equipmentItemId: string; quantity: number }> }>}
              {@const nationIds = (row.nationIds ?? []) as string[]}
              <tr>
                <td class="whitespace-nowrap font-medium">
                  <span class="inline-flex items-center gap-1.5">
                    {row.name}
                    {#if row.sourceId}
                      <span class="badge badge-outline badge-xs font-mono">{sourceCode(row.sourceId)}</span>
                    {/if}
                  </span>
                </td>
                <td>{st.speed ?? '—'}</td>
                <td>{st.melee ?? '—'}</td>
                <td>{st.accuracy ?? '—'}</td>
                <td>{st.defence ?? '—'}</td>
                <td>{st.courage ?? '—'}</td>
                <td>{st.health ?? '—'}</td>
                <td>{row.recruitmentCost}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    {#each attrIds as aid (aid)}
                      {@const attr = allAttributes.find((a) => a.id === aid)}
                      {#if attr}<span class="badge badge-outline badge-xs" title={attr.rules ?? attr.name}>{attr.name}</span>{/if}
                    {/each}
                    {#if (row.attributePicks as number) > 0}
                      <span class="badge badge-outline badge-xs opacity-60">Officer ({row.attributePicks})</span>
                    {/if}
                  </div>
                </td>
                <td>
                  {#if row.equipmentMode === 'pool'}
                    <span class="badge badge-outline badge-xs opacity-60">Officer</span>
                  {:else}
                    <div class="flex flex-col gap-1">
                      {#each los as lo}
                        <div class="flex flex-wrap items-center gap-1">
                          {#if los.length > 1}<span class="shrink-0 opacity-40">·</span>{/if}
                          {#each lo.items as item (item.equipmentItemId)}
                            {@const eq = allEquipment.find((e) => e.id === item.equipmentItemId)}
                            {#if eq}
                              <span class="badge badge-outline badge-xs" title={eq.rules || eq.name}
                                >{eq.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
                            {/if}
                          {/each}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    {#each nationIds as nid (nid)}
                      {@const nation = nations.find((n) => n.id === nid)}
                      {#if nation}
                        <NationFlag flag={nation.flag} name={nation.name} size="sm" />
                      {/if}
                    {/each}
                  </div>
                </td>
                <td class="whitespace-nowrap text-right">
                  <button class="btn btn-ghost btn-xs" onclick={() => startEditSoldier(row)}>Edit</button>
                  <button class="btn btn-ghost btn-xs text-error" onclick={() => remove(row)}>Delete</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if isMonsterTypes}
      <div class="overflow-x-auto overflow-y-clip">
        <table class="table table-zebra table-sm [&_td]:align-top">
          <thead>
            <tr>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('name')}>Name{si('name')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('speed')}>Spd{si('speed')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('melee')}>Mel{si('melee')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('accuracy')}>Acc{si('accuracy')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('defence')}>Def{si('defence')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('courage')}>Cou{si('courage')}</th>
              <th class="cursor-pointer select-none" onclick={() => sortToggle('health')}>HP{si('health')}</th>
              <th>Attributes</th>
              <th>Equipment</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each sortedFilteredRows as row (row.id)}
              {@const st = (row.stats ?? {}) as Record<string, number>}
              {@const attrIds = (row.fixedAttributeIds ?? []) as string[]}
              {@const los = (row.loadouts ?? []) as Array<{ items: Array<{ equipmentItemId: string; quantity: number }> }>}
              <tr>
                <td class="whitespace-nowrap font-medium">
                  <span class="inline-flex items-center gap-1.5">
                    {row.name}
                    {#if row.sourceId}
                      <span class="badge badge-outline badge-xs font-mono">{sourceCode(row.sourceId)}</span>
                    {/if}
                  </span>
                </td>
                <td>{st.speed ?? '—'}</td>
                <td>{st.melee ?? '—'}</td>
                <td>{st.accuracy ?? '—'}</td>
                <td>{st.defence ?? '—'}</td>
                <td>{st.courage ?? '—'}</td>
                <td>{st.health ?? '—'}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    {#each attrIds as aid (aid)}
                      {@const attr = allAttributes.find((a) => a.id === aid)}
                      {#if attr}<span class="badge badge-outline badge-xs" title={attr.rules ?? attr.name}>{attr.name}</span>{/if}
                    {/each}
                  </div>
                </td>
                <td>
                  <div class="flex flex-col gap-1">
                    {#each los as lo}
                      <div class="flex flex-wrap items-center gap-1">
                        {#if los.length > 1}<span class="shrink-0 opacity-40">·</span>{/if}
                        {#each lo.items as item (item.equipmentItemId)}
                          {@const eq = allEquipment.find((e) => e.id === item.equipmentItemId)}
                          {#if eq}
                            <span class="badge badge-outline badge-xs" title={eq.rules || eq.name}
                              >{eq.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
                          {/if}
                        {/each}
                      </div>
                    {/each}
                  </div>
                </td>
                <td class="whitespace-nowrap text-right">
                  <button class="btn btn-ghost btn-xs" onclick={() => startEditMonster(row)}>Edit</button>
                  <button class="btn btn-ghost btn-xs text-error" onclick={() => remove(row)}>Delete</button>
                </td>
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
                {@const field = entity.fields.find((f) => f.key === col)}
                {@const sortable = field?.type !== 'textarea' && field?.type !== 'flag'}
                <th
                  class:cursor-pointer={sortable}
                  class:select-none={sortable}
                  onclick={sortable ? () => sortToggle(col) : undefined}
                >{field?.label ?? col}{sortable ? si(col) : ''}</th>
              {/each}
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each sortedFilteredRows as row (row.id)}
              <tr>
                {#each entity.columns as col (col)}
                  {@const field = entity.fields.find((f) => f.key === col)}
                  <td>
                    {#if field?.type === 'flag'}
                      <NationFlag flag={row[col] as string | null} />
                    {:else if field?.type === 'boolean'}
                      {row[col] ? '✓' : ''}
                    {:else if field?.type === 'source'}
                      {sourceName(row[col])}
                    {:else if field?.type === 'textarea'}
                      <span class="block max-w-sm truncate opacity-80">{row[col] ?? '—'}</span>
                    {:else}
                      <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <span class:capitalize={field?.capitalize}>{row[col] ?? '—'}</span>
                        {#if field?.sourceBadge && row.sourceId}
                          <span class="badge badge-outline badge-xs font-mono">{sourceCode(row.sourceId)}</span>
                        {/if}
                      </span>
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

  <!-- Flat-entity create/edit modal -->
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
                {#if field.widget === 'tag-group'}
                  <div class="join flex-wrap">
                    {#each field.options ?? [] as opt (opt)}
                      <button
                        type="button"
                        class="btn btn-sm join-item {draft[field.key] === opt ? 'btn-primary' : 'btn-ghost'}"
                        class:capitalize={field.capitalize}
                        onclick={() => (draft[field.key] = opt)}
                      >{opt}</button>
                    {/each}
                  </div>
                {:else}
                  <select bind:value={draft[field.key]} class="select w-full">
                    {#each field.options ?? [] as opt (opt)}<option value={opt}>{opt}</option>{/each}
                  </select>
                {/if}
              {:else if field.type === 'source'}
                <select bind:value={draft[field.key]} required={field.required} class="select w-full">
                  <option value="" disabled>Choose a source…</option>
                  {#each sources as s (s.id)}<option value={s.id}>{s.name}</option>{/each}
                </select>
              {:else if field.type === 'flag'}
                <div class="space-y-2">
                  {#if draft[field.key]}
                    <div class="flex items-center gap-3">
                      <NationFlag flag={draft[field.key]} size="md" />
                      <span class="font-mono text-xs opacity-60">{draft[field.key]}</span>
                    </div>
                  {/if}
                  <label class="flex cursor-pointer items-center gap-2">
                    <span class="btn btn-outline btn-sm">
                      {flagUploading ? 'Uploading…' : draft[field.key] ? 'Replace SVG…' : 'Upload SVG…'}
                    </span>
                    <input
                      type="file"
                      accept=".svg"
                      class="hidden"
                      disabled={flagUploading}
                      onchange={uploadFlag}
                    />
                  </label>
                  {#if flagUploadError}
                    <p class="text-xs text-error">{flagUploadError}</p>
                  {/if}
                </div>
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

  <!-- Soldier-type create/edit modal -->
  {#if isSoldierTypes && stFormMode !== 'closed'}
    <CodexSoldierTypeForm
      mode={stFormMode}
      row={stEditingRow ?? undefined}
      {sources}
      {nations}
      {allAttributes}
      {allEquipment}
      saving={stSaving}
      error={stFormError}
      onsave={saveSoldier}
      oncancel={() => (stFormMode = 'closed')}
    />
  {/if}

  <!-- Monster-type create/edit modal -->
  {#if isMonsterTypes && mtFormMode !== 'closed'}
    <CodexMonsterTypeForm
      mode={mtFormMode}
      row={mtEditingRow ?? undefined}
      {sources}
      {allAttributes}
      {allEquipment}
      saving={mtSaving}
      error={mtFormError}
      onsave={saveMonster}
      oncancel={() => (mtFormMode = 'closed')}
    />
  {/if}
{/if}

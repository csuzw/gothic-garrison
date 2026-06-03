<script lang="ts">
  import { getContext } from 'svelte';
  import { page } from '$app/state';
  import NationFlag from '$lib/components/NationFlag.svelte';
  import CodexFlatEntityEditor from '$lib/components/CodexFlatEntityEditor.svelte';
  import CodexSoldierTypeEditor from '$lib/components/CodexSoldierTypeEditor.svelte';
  import CodexMonsterTypeEditor from '$lib/components/CodexMonsterTypeEditor.svelte';
  import { codexEntity, SOLDIER_TYPES_SLUG, MONSTER_TYPES_SLUG, type CodexEntity } from '$lib/codex/entities';

  const codexCtx = getContext<{ readonly: boolean }>('codex');
  const readonly = $derived(codexCtx.readonly);

  type Row = Record<string, unknown> & { id: string };
  type EditTarget = { mode: 'new'; sourceId?: string } | { mode: 'edit'; row: Row } | null;

  const slug = $derived(page.params.entity!);
  const entity = $derived(codexEntity(slug));
  const isSoldierTypes = $derived(slug === SOLDIER_TYPES_SLUG);
  const isMonsterTypes = $derived(slug === MONSTER_TYPES_SLUG);

  let rows = $state<Row[]>([]);
  let sources = $state<{ id: string; name: string; code: string }[]>([]);
  let nations = $state<{ id: string; name: string; flag: string | null }[]>([]);
  let allAttributes = $state<{ id: string; name: string; pickScope: string; rules: string | null }[]>([]);
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

  // Edit targets — one per entity type, drives the editor modals
  let flatTarget = $state<EditTarget>(null);
  let stTarget = $state<EditTarget>(null);
  let mtTarget = $state<EditTarget>(null);

  // Delete error (shared across all entity types)
  let actionError = $state<string | null>(null);

  const sourceName = (id: unknown) => sources.find((s) => s.id === id)?.name ?? '—';
  const sourceCode = (id: unknown) => sources.find((s) => s.id === id)?.code ?? '?';

  async function loadAll(preserveState = false) {
    if (!preserveState) loading = true;
    loadError = null;
    if (!preserveState) {
      sourceFilter = '';
      sortKey = '';
      sortDir = 'asc';
    }
    flatTarget = null;
    stTarget = null;
    mtTarget = null;
    actionError = null;
    const isST = slug === SOLDIER_TYPES_SLUG;
    const isMT = slug === MONSTER_TYPES_SLUG;
    try {
      const [listRes, srcRes] = await Promise.all([
        fetch(`/api/reference/${slug}`),
        fetch('/api/reference/sources'),
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
          fetch('/api/reference/nations'),
          fetch('/api/reference/attributes'),
          fetch('/api/reference/equipment'),
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

  async function remove(row: Row) {
    const label = (row.name as string) ?? (row.code as string) ?? row.id;
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    actionError = null;
    try {
      const res = await fetch(`/api/reference/${slug}/${row.id}`, { method: 'DELETE' });
      if (!res.ok) {
        actionError = (await res.json().catch(() => ({})))?.message ?? 'Delete failed';
        return;
      }
      await loadAll(true);
    } catch {
      actionError = 'Delete failed — could not reach the API.';
    }
  }
</script>

<svelte:head><title>Reference · {entity?.label ?? (isSoldierTypes ? 'Soldiers' : isMonsterTypes ? 'Monsters' : 'Reference')}</title></svelte:head>

{#if !entity && !isSoldierTypes && !isMonsterTypes}
  <div class="alert alert-error">Unknown Codex entity: <code>{slug}</code></div>
{:else}
  <div class="space-y-3">
    <div class="flex items-center gap-2" class:sticky={!readonly} class:top-0={!readonly} class:z-10={!readonly} class:bg-base-100={!readonly} class:py-2={!readonly}>
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
        {#if !readonly}
          {#if entity}
            <button class="btn btn-sm btn-primary" onclick={() => (flatTarget = { mode: 'new', sourceId: sourceFilter || undefined })}>New {entity.singular}</button>
          {:else if isSoldierTypes}
            <button class="btn btn-sm btn-primary" onclick={() => (stTarget = { mode: 'new', sourceId: sourceFilter || undefined })}>New soldier</button>
          {:else if isMonsterTypes}
            <button class="btn btn-sm btn-primary" onclick={() => (mtTarget = { mode: 'new', sourceId: sourceFilter || undefined })}>New monster</button>
          {/if}
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
              <th class="min-w-[8rem]">Equipment</th>
              <th>Nations</th>
              {#if !readonly}<th class="text-right">Actions</th>{/if}
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
                    {#if row.alsoInSourceId}
                      <span class="badge badge-outline badge-xs font-mono opacity-60" title="Also in supplement">{sourceCode(row.alsoInSourceId)}</span>
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
                  <div class="flex max-w-xs flex-wrap gap-1">
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
                {#if !readonly}
                  <td class="whitespace-nowrap text-right">
                    <button class="btn btn-ghost btn-xs" onclick={() => (stTarget = { mode: 'edit', row })}>Edit</button>
                    <button class="btn btn-ghost btn-xs text-error" onclick={() => remove(row)}>Delete</button>
                  </td>
                {/if}
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
              <th class="min-w-[8rem]">Equipment</th>
              {#if !readonly}<th class="text-right">Actions</th>{/if}
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
                  <div class="flex max-w-xs flex-wrap gap-1">
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
                {#if !readonly}
                  <td class="whitespace-nowrap text-right">
                    <button class="btn btn-ghost btn-xs" onclick={() => (mtTarget = { mode: 'edit', row })}>Edit</button>
                    <button class="btn btn-ghost btn-xs text-error" onclick={() => remove(row)}>Delete</button>
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if entity}
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm [&_td]:align-top">
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
              {#if !readonly}<th class="text-right">Actions</th>{/if}
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
                      <span class="block max-w-sm opacity-80">{row[col] ?? '—'}</span>
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
                {#if !readonly}
                  <td class="text-right whitespace-nowrap">
                    <button class="btn btn-ghost btn-xs" onclick={() => (flatTarget = { mode: 'edit', row })}>Edit</button>
                    <button class="btn btn-ghost btn-xs text-error" onclick={() => remove(row)}>Delete</button>
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

  {#if !readonly}
    {#if entity}
      <CodexFlatEntityEditor
        {slug}
        {entity}
        {sources}
        target={flatTarget}
        onsaved={() => loadAll(true)}
        onclose={() => (flatTarget = null)}
      />
    {:else if isSoldierTypes}
      <CodexSoldierTypeEditor
        {slug}
        {sources}
        {nations}
        {allAttributes}
        {allEquipment}
        target={stTarget}
        onsaved={() => loadAll(true)}
        onclose={() => (stTarget = null)}
      />
    {:else if isMonsterTypes}
      <CodexMonsterTypeEditor
        {slug}
        {sources}
        {allAttributes}
        {allEquipment}
        target={mtTarget}
        onsaved={() => loadAll(true)}
        onclose={() => (mtTarget = null)}
      />
    {/if}
  {/if}
{/if}

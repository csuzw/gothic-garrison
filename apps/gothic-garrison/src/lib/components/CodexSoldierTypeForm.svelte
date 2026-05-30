<script lang="ts">
  import { untrack } from 'svelte';
  import { STAT_META, type SoldierStats } from '$lib/unit/types';

  interface DraftItem {
    equipmentItemId: string;
    quantity: number;
  }
  interface DraftLoadout {
    items: DraftItem[];
  }

  interface Props {
    mode: 'new' | 'edit';
    row?: Record<string, any>;
    sources: { id: string; name: string }[];
    nations: { id: string; name: string }[];
    allAttributes: { id: string; name: string; isOfficer: boolean }[];
    allEquipment: { id: string; name: string; slotCost: number; isSpecial: boolean }[];
    saving: boolean;
    error: string | null;
    onsave: (body: unknown) => void;
    oncancel: () => void;
  }

  let { mode, row, sources, nations, allAttributes, allEquipment, saving, error, onsave, oncancel }: Props =
    $props();

  // Capture initial prop values once — this component always mounts fresh.
  const r: Record<string, any> = untrack(() => (mode === 'edit' ? (row ?? {}) : {}));

  function initLoadouts(): DraftLoadout[] {
    const raw: any[] = r.loadouts ?? [];
    const firstEqId = untrack(() => allEquipment[0]?.id ?? '');
    if (raw.length === 0) return [{ items: [] }];
    return raw.map((lo) => ({
      items: (lo.items ?? []).map((it: any) => ({
        equipmentItemId: it.equipmentItemId ?? firstEqId,
        quantity: Number(it.quantity ?? 1),
      })),
    }));
  }

  let name = $state<string>(r.name ?? '');
  let sourceId = $state<string>(r.sourceId ?? untrack(() => sources[0]?.id) ?? '');
  let recruitmentCost = $state<number>(Number(r.recruitmentCost ?? 0));
  let maxPerUnit = $state<number | null>(r.maxPerUnit ?? null);
  let notes = $state<string>(r.notes ?? '');
  let stats = $state<SoldierStats>(
    STAT_META.reduce<SoldierStats>((acc, { key: k }) => {
      acc[k] = Number((r.stats ?? {})[k] ?? 0);
      return acc;
    }, {} as SoldierStats),
  );
  let equipmentMode = $state<'fixed' | 'choice' | 'pool'>(r.equipmentMode ?? 'fixed');
  let equipmentSlots = $state<number>(Number(r.equipmentSlots ?? 6));
  let specialSlots = $state<number>(Number(r.specialSlots ?? 2));
  let attributePicks = $state<number>(Number(r.attributePicks ?? 0));
  let nationIds = $state<string[]>([...(r.nationIds ?? [])]);
  let fixedAttributeIds = $state<string[]>([...(r.fixedAttributeIds ?? [])]);
  let loadouts = $state<DraftLoadout[]>(initLoadouts());

  const normalEquipment = $derived(allEquipment.filter((e) => !e.isSpecial));
  const specialEquipment = $derived(allEquipment.filter((e) => e.isSpecial));

  // Attribute tag-select state
  let attrSearch = $state('');
  let attrDropdownOpen = $state(false);
  let attrInputEl = $state<HTMLInputElement | undefined>(undefined);
  const filteredAttrs = $derived(
    allAttributes.filter(
      (a) =>
        !fixedAttributeIds.includes(a.id) &&
        (attrSearch === '' || a.name.toLowerCase().includes(attrSearch.toLowerCase())),
    ),
  );
  const filteredOfficerAttrs = $derived(filteredAttrs.filter((a) => a.isOfficer));
  const filteredOtherAttrs = $derived(filteredAttrs.filter((a) => !a.isOfficer));

  function setEquipmentMode(m: 'fixed' | 'choice' | 'pool') {
    equipmentMode = m;
    if (m === 'fixed') {
      loadouts = loadouts.length > 0 ? [loadouts[0]] : [{ items: [] }];
    } else if (m === 'choice') {
      if (loadouts.length === 0) loadouts = [{ items: [] }, { items: [] }];
      else if (loadouts.length === 1) loadouts = [...loadouts, { items: [] }];
    }
  }

  function toggleNation(id: string) {
    if (nationIds.includes(id)) nationIds = nationIds.filter((x) => x !== id);
    else nationIds = [...nationIds, id];
  }

  function toggleAttr(id: string) {
    if (fixedAttributeIds.includes(id)) fixedAttributeIds = fixedAttributeIds.filter((x) => x !== id);
    else fixedAttributeIds = [...fixedAttributeIds, id];
  }

  function computeLabel(items: DraftItem[]): string {
    return items
      .map((it) => {
        const name = allEquipment.find((eq) => eq.id === it.equipmentItemId)?.name ?? '?';
        return it.quantity > 1 ? `${name} ×${it.quantity}` : name;
      })
      .join(', ');
  }

  function addLoadout() {
    loadouts = [...loadouts, { items: [] }];
  }

  function removeLoadout(i: number) {
    if (loadouts.length > 2) loadouts = loadouts.filter((_, j) => j !== i);
  }

  function addItem(li: number) {
    if (!allEquipment.length) return;
    loadouts[li].items = [...loadouts[li].items, { equipmentItemId: allEquipment[0].id, quantity: 1 }];
  }

  function removeItem(li: number, ii: number) {
    loadouts[li].items = loadouts[li].items.filter((_, j) => j !== ii);
  }

  function buildBody() {
    return {
      name,
      sourceId,
      recruitmentCost,
      stats: { ...stats },
      maxPerUnit,
      equipmentMode,
      equipmentSlots: equipmentMode === 'pool' ? equipmentSlots : null,
      specialSlots: equipmentMode === 'pool' ? specialSlots : null,
      attributePicks,
      notes: notes || null,
      nationIds,
      fixedAttributeIds,
      loadouts:
        equipmentMode === 'pool'
          ? []
          : loadouts.map((lo, i) => ({
              label: computeLabel(lo.items),
              displayOrder: i,
              items: lo.items.map((it, j) => ({
                equipmentItemId: it.equipmentItemId,
                quantity: it.quantity,
                displayOrder: j,
              })),
            })),
    };
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onsave(buildBody());
  }
</script>

<div class="modal modal-open" role="dialog">
  <div class="modal-box max-w-2xl overflow-y-auto">
    <h3 class="mb-4 text-lg font-semibold">{mode === 'edit' ? 'Edit' : 'New'} soldier</h3>

    <form onsubmit={handleSubmit} class="space-y-5">

      <!-- Basic info -->
      <div class="space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wide opacity-60">Basic info</h4>

        <div class="flex gap-3">
          <label class="block flex-1 min-w-0">
            <span class="mb-1 block text-sm font-medium">Name <span class="text-error">*</span></span>
            <input type="text" bind:value={name} required placeholder="e.g. Rifleman" class="input w-full" />
          </label>
          <label class="block w-24 shrink-0">
            <span class="mb-1 block text-sm font-medium">Cost <span class="text-error">*</span></span>
            <input type="number" bind:value={recruitmentCost} min="0" max="999" required class="input w-full" />
          </label>
        </div>

        <div class="flex gap-3">
          <label class="block flex-1 min-w-0">
            <span class="mb-1 block text-sm font-medium">Source <span class="text-error">*</span></span>
            <select bind:value={sourceId} required class="select w-full">
              {#each sources as s (s.id)}<option value={s.id}>{s.name}</option>{/each}
            </select>
          </label>
          <label class="block w-24 shrink-0">
            <span class="mb-1 block text-sm font-medium">Max / unit</span>
            <input
              type="number"
              value={maxPerUnit ?? ''}
              oninput={(e) => {
                const v = (e.currentTarget as HTMLInputElement).value;
                maxPerUnit = v === '' ? null : parseInt(v, 10);
              }}
              min="1"
              max="99"
              placeholder="∞"
              class="input w-full"
            />
          </label>
        </div>

        <details>
          <summary class="cursor-pointer text-sm font-medium opacity-60 select-none">Notes</summary>
          <textarea bind:value={notes} class="textarea w-full mt-2" rows="2"></textarea>
        </details>
      </div>

      <div class="divider my-1"></div>

      <!-- Stats -->
      <div class="space-y-2">
        <h4 class="text-xs font-semibold uppercase tracking-wide opacity-60">Stats</h4>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {#each STAT_META as m (m.key)}
            <label class="block">
              <span class="mb-1 block text-center text-xs font-medium">
                <span class="sm:hidden">{m.short}</span>
                <span class="hidden sm:inline">{m.label}</span>
              </span>
              <input
                type="number"
                bind:value={stats[m.key]}
                min="0"
                max="99"
                required
                class="input input-sm w-full text-center"
              />
            </label>
          {/each}
        </div>
      </div>

      <div class="divider my-1"></div>

      <!-- Nations -->
      <div class="space-y-2">
        <h4 class="text-xs font-semibold uppercase tracking-wide opacity-60">
          Nations ({nationIds.length} selected)
        </h4>
        {#if nations.length}
          <div class="flex flex-wrap gap-1">
            {#each nations as n (n.id)}
              <button
                type="button"
                class="btn btn-xs {nationIds.includes(n.id) ? 'btn-primary' : 'btn-outline'}"
                onclick={() => toggleNation(n.id)}
              >{n.name}</button>
            {/each}
          </div>
        {:else}
          <p class="text-sm opacity-60">No nations loaded.</p>
        {/if}
      </div>

      <div class="divider my-1"></div>

      <!-- Attributes -->
      <div class="space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wide opacity-60">Attributes</h4>

        <label class="block">
          <span class="mb-1 block text-sm font-medium">Attribute picks</span>
          <input type="number" bind:value={attributePicks} min="0" max="10" class="input w-full" />
          <span class="mt-1 block text-xs opacity-60"
            >How many attributes this soldier picks from the officer pool on hire.</span
          >
        </label>

        <div class="space-y-1">
          <span class="block text-sm font-medium">Fixed attributes</span>
          <div class="relative">
            <!-- Tag input box: clicking anywhere in the padding focuses the inner input -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="input h-auto min-h-10 flex flex-wrap items-center gap-1 p-1.5 cursor-text"
              onclick={() => attrInputEl?.focus()}
              role="textbox"
              tabindex="-1"
            >
              {#each fixedAttributeIds as id (id)}
                {@const attr = allAttributes.find((a) => a.id === id)}
                {#if attr}
                  <span class="badge badge-primary gap-1 text-xs">
                    {attr.name}
                    <button
                      type="button"
                      class="leading-none"
                      onmousedown={(e) => { e.preventDefault(); toggleAttr(id); }}
                      aria-label="Remove {attr.name}"
                    >×</button>
                  </span>
                {/if}
              {/each}
              <input
                bind:this={attrInputEl}
                type="text"
                bind:value={attrSearch}
                placeholder={fixedAttributeIds.length === 0 ? 'Search attributes…' : ''}
                class="min-w-24 flex-1 bg-transparent text-sm outline-none"
                onfocus={() => (attrDropdownOpen = true)}
                onblur={() => setTimeout(() => (attrDropdownOpen = false), 150)}
                onkeydown={(e) => {
                  if (e.key === 'Escape') {
                    attrDropdownOpen = false;
                    attrSearch = '';
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                  if (e.key === 'Backspace' && attrSearch === '' && fixedAttributeIds.length > 0) {
                    toggleAttr(fixedAttributeIds[fixedAttributeIds.length - 1]);
                  }
                }}
              />
            </div>

            <!-- Dropdown -->
            {#if attrDropdownOpen}
              <div class="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-box border border-base-300 bg-base-200 shadow-lg">
                {#if filteredAttrs.length}
                  {#if filteredOfficerAttrs.length}
                    <p class="px-3 pt-2 pb-0.5 text-xs font-semibold uppercase tracking-wide opacity-50">Officer attributes</p>
                    {#each filteredOfficerAttrs as a (a.id)}
                      <button
                        type="button"
                        class="w-full px-3 py-1.5 text-left text-sm hover:bg-base-300"
                        onmousedown={(e) => { e.preventDefault(); toggleAttr(a.id); attrSearch = ''; }}
                      >{a.name}</button>
                    {/each}
                  {/if}
                  {#if filteredOtherAttrs.length}
                    {#if filteredOfficerAttrs.length}<div class="divider my-0"></div>{/if}
                    <p class="px-3 pt-2 pb-0.5 text-xs font-semibold uppercase tracking-wide opacity-50">Other attributes</p>
                    {#each filteredOtherAttrs as a (a.id)}
                      <button
                        type="button"
                        class="w-full px-3 py-1.5 text-left text-sm hover:bg-base-300"
                        onmousedown={(e) => { e.preventDefault(); toggleAttr(a.id); attrSearch = ''; }}
                      >{a.name}</button>
                    {/each}
                  {/if}
                {:else}
                  <p class="px-3 py-2 text-sm opacity-60">
                    {attrSearch ? 'No matches.' : 'All attributes selected.'}
                  </p>
                {/if}
              </div>
            {/if}
          </div>
          <p class="text-xs opacity-60">Backspace removes the last tag.</p>
        </div>
      </div>

      <div class="divider my-1"></div>

      <!-- Equipment -->
      <div class="space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wide opacity-60">Equipment</h4>

        <div>
          <span class="mb-2 block text-sm font-medium">Mode</span>
          <div class="join">
            {#each [['fixed', 'Fixed'], ['choice', 'Choice'], ['pool', 'Pool']] as [val, label] (val)}
              <button
                type="button"
                class="btn btn-sm join-item"
                class:btn-primary={equipmentMode === val}
                onclick={() => setEquipmentMode(val as 'fixed' | 'choice' | 'pool')}
              >{label}</button>
            {/each}
          </div>
          <p class="mt-1 text-xs opacity-60">
            {#if equipmentMode === 'fixed'}Always the same loadout.
            {:else if equipmentMode === 'choice'}Picks one loadout at hire.
            {:else}Builds freely from an equipment pool (like the Officer).{/if}
          </p>
        </div>

        {#if equipmentMode === 'pool'}
          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <span class="mb-1 block text-sm font-medium">Equipment slots</span>
              <input type="number" bind:value={equipmentSlots} min="0" max="20" required class="input w-full" />
            </label>
            <label class="block">
              <span class="mb-1 block text-sm font-medium">Special slots</span>
              <input type="number" bind:value={specialSlots} min="0" max="20" required class="input w-full" />
            </label>
          </div>
        {:else}
          <div class="space-y-3">
            {#each loadouts as lo, li (li)}
              <div class="rounded border border-base-300 p-3 space-y-2">
                {#if equipmentMode === 'choice'}
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium opacity-70">Loadout {li + 1}</span>
                    {#if loadouts.length > 2}
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs text-error"
                        onclick={() => removeLoadout(li)}
                      >Remove</button>
                    {/if}
                  </div>
                {/if}

                {#each lo.items as it, ii (ii)}
                  <div class="flex items-center gap-2">
                    <select bind:value={it.equipmentItemId} class="select select-sm min-w-0 flex-1">
                      {#if normalEquipment.length}
                        <optgroup label="Equipment">
                          {#each normalEquipment as eq (eq.id)}
                            <option value={eq.id}>{eq.name}{eq.slotCost === 2 ? ' (2 slots)' : ''}</option>
                          {/each}
                        </optgroup>
                      {/if}
                      {#if specialEquipment.length}
                        <optgroup label="Special Armoury">
                          {#each specialEquipment as eq (eq.id)}
                            <option value={eq.id}>{eq.name}{eq.slotCost === 2 ? ' (2 slots)' : ''}</option>
                          {/each}
                        </optgroup>
                      {/if}
                    </select>
                    <label class="flex shrink-0 items-center gap-1">
                      <span class="text-xs opacity-60">Qty</span>
                      <input type="number" bind:value={it.quantity} min="1" max="99" class="input input-sm w-14" />
                    </label>
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs shrink-0 text-error"
                      onclick={() => removeItem(li, ii)}
                    >×</button>
                  </div>
                {/each}

                <button type="button" class="btn btn-ghost btn-xs" onclick={() => addItem(li)}>
                  + Add item
                </button>
              </div>
            {/each}

            {#if equipmentMode === 'choice'}
              <button type="button" class="btn btn-outline btn-sm" onclick={addLoadout}>
                + Add loadout
              </button>
            {/if}
          </div>
        {/if}
      </div>

      {#if error}
        <div class="alert alert-error text-sm" role="alert">{error}</div>
      {/if}

      <div class="modal-action">
        <button type="button" class="btn btn-ghost" onclick={oncancel} disabled={saving}>Cancel</button>
        <button type="submit" class="btn btn-primary" disabled={saving}>
          {#if saving}<span class="loading loading-spinner loading-sm"></span>{/if}
          {mode === 'edit' ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  </div>
  <button class="modal-backdrop" onclick={oncancel} aria-label="Close">close</button>
</div>

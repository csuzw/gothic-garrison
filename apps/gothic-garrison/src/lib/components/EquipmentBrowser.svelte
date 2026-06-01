<script lang="ts">
  import { untrack } from 'svelte';
  import type { EquipmentSnapshot } from '$lib/unit/types';
  import RulesPopover from '$lib/components/RulesPopover.svelte';


  let {
    catalog,
    items,
    slots,
    specialMax,
    onChange,
  }: {
    catalog: { id: string; name: string; slotCost: number; isSpecial: boolean; rules: string | null }[];
    items: EquipmentSnapshot[];
    slots: number;
    specialMax: number;
    onChange: (items: EquipmentSnapshot[]) => void;
  } = $props();

  let qty = $state<Map<string, number>>(
    untrack(() => new Map(items.filter((it) => it.quantity > 0).map((it) => [it.itemId, it.quantity]))),
  );

  // Start collapsed if the soldier already has equipment, open if freshly added.
  let collapsed = $state(untrack(() => items.length > 0));

  const normalCatalog = $derived(catalog.filter((c) => !c.isSpecial));
  const specialCatalog = $derived(catalog.filter((c) => c.isSpecial));

  const usedSlots = $derived(
    [...qty.entries()].reduce((n, [id, q]) => {
      const c = catalog.find((x) => x.id === id);
      return n + (c ? c.slotCost * q : 0);
    }, 0),
  );

  const usedSpecial = $derived(
    [...qty.entries()].reduce((n, [id, q]) => {
      const c = catalog.find((x) => x.id === id);
      return n + (c?.isSpecial ? q : 0);
    }, 0),
  );

  const overSlots = $derived(usedSlots > slots);

  function canAdd(item: { slotCost: number; isSpecial: boolean }): boolean {
    if (usedSlots + item.slotCost > slots) return false;
    if (item.isSpecial && usedSpecial >= specialMax) return false;
    return true;
  }

  function emit() {
    onChange(
      catalog.flatMap((c) => {
        const q = qty.get(c.id) ?? 0;
        return q > 0
          ? [{ itemId: c.id, name: c.name, slotCost: c.slotCost, isSpecial: c.isSpecial, quantity: q }]
          : [];
      }),
    );
  }

  function add(id: string) {
    const item = catalog.find((c) => c.id === id);
    if (!item || !canAdd(item)) return;
    qty = new Map(qty).set(id, (qty.get(id) ?? 0) + 1);
    emit();
  }

  function remove(id: string) {
    const current = qty.get(id) ?? 0;
    if (current <= 0) return;
    const m = new Map(qty);
    if (current <= 1) m.delete(id);
    else m.set(id, current - 1);
    qty = m;
    emit();
  }

  const hasAny = $derived([...qty.values()].some((q) => q > 0));
</script>

{#snippet tags()}
  {#each normalCatalog as item (item.id)}
    {@const q = qty.get(item.id) ?? 0}
    {#if q > 0}
      <span class="badge badge-sm" title={item.rules || item.name}>{q > 1 ? `${q}× ` : ''}{item.name}</span>
    {/if}
  {/each}
  {#each specialCatalog as item (item.id)}
    {@const q = qty.get(item.id) ?? 0}
    {#if q > 0}
      <span class="badge badge-sm bg-secondary/20" title={item.rules || item.name}>{q > 1 ? `${q}× ` : ''}{item.name}</span>
    {/if}
  {/each}
{/snippet}

{#if collapsed}
  <div class="flex items-start gap-2">
    <div class="flex min-w-0 flex-1 flex-wrap gap-1">
      {#if hasAny}
        {@render tags()}
      {:else}
        <span class="text-xs opacity-40">No equipment</span>
      {/if}
    </div>
    <button class="btn btn-ghost btn-xs shrink-0" onclick={() => (collapsed = false)}>Edit</button>
  </div>
{:else}
  <div class="space-y-3">
    <div class="flex items-center gap-4">
      <div class="flex flex-1 gap-4 text-xs opacity-60">
        <span>Slots <span class:text-error={overSlots} class:opacity-100={overSlots}>{usedSlots} / {slots}</span></span>
        <span>Special {usedSpecial} / {specialMax}</span>
      </div>
      <button class="btn btn-ghost btn-xs shrink-0" onclick={() => (collapsed = true)}>Done</button>
    </div>

    {#if normalCatalog.length}
      <div class="space-y-1">
        <p class="text-xs font-medium uppercase tracking-wide opacity-40">Equipment</p>
        {#each normalCatalog as item (item.id)}
          {@const q = qty.get(item.id) ?? 0}
          {@const addable = canAdd(item)}
          <div class="bg-base-200 flex items-center gap-2 rounded px-2 py-1.5">
            <div class="min-w-0 flex-1">
              <span class="text-sm {q > 0 ? 'font-medium' : 'opacity-60'}">{item.name}</span>
              {#if item.slotCost !== 1}
                <span class="ml-1 text-xs opacity-40">{item.slotCost} slots</span>
              {/if}
              {#if item.rules && (item.name === 'Cartridge Box' || item.name === 'Shot Bag')}
                <span class="ml-1 text-xs opacity-40">{item.rules.toLowerCase().replace(/\.$/, '')}</span>
              {/if}
            </div>
            {#if item.rules}<RulesPopover label={item.name} rules={item.rules} />{/if}
            {#if q > 0}
              <button class="btn btn-ghost btn-xs shrink-0" onclick={() => remove(item.id)} aria-label="Remove one {item.name}">−</button>
              <span class="w-5 text-center text-sm font-medium tabular-nums">{q}</span>
            {:else}
              <span class="w-14"></span>
            {/if}
            <button
              class="btn btn-xs shrink-0 {q > 0 ? 'btn-primary' : 'btn-outline'}"
              onclick={() => add(item.id)}
              disabled={!addable}
              aria-label="Add {item.name}"
            >+</button>
          </div>
        {/each}
      </div>
    {/if}

    {#if specialCatalog.length}
      <div class="space-y-1">
        <p class="text-xs font-medium uppercase tracking-wide opacity-40">Special Armoury</p>
        {#each specialCatalog as item (item.id)}
          {@const q = qty.get(item.id) ?? 0}
          {@const addable = canAdd(item)}
          <div class="bg-base-200 flex items-center gap-2 rounded px-2 py-1.5">
            <div class="min-w-0 flex-1">
              <span class="text-sm {q > 0 ? 'font-medium' : 'opacity-60'}">{item.name}</span>
              {#if item.slotCost !== 1}
                <span class="ml-1 text-xs opacity-40">{item.slotCost} slots</span>
              {/if}
            </div>
            {#if item.rules}<RulesPopover label={item.name} rules={item.rules} />{/if}
            {#if q > 0}
              <button class="btn btn-ghost btn-xs shrink-0" onclick={() => remove(item.id)} aria-label="Remove one {item.name}">−</button>
              <span class="w-5 text-center text-sm font-medium tabular-nums">{q}</span>
            {:else}
              <span class="w-14"></span>
            {/if}
            <button
              class="btn btn-xs shrink-0 {q > 0 ? 'btn-primary' : 'btn-outline'}"
              onclick={() => add(item.id)}
              disabled={!addable}
              aria-label="Add {item.name}"
            >+</button>
          </div>
        {/each}
      </div>
    {/if}

    <div class="flex flex-wrap items-center gap-1 border-t border-base-300 pt-2">
      {@render tags()}
      <button class="btn btn-ghost btn-xs ml-auto shrink-0" onclick={() => (collapsed = true)}>Done</button>
    </div>
  </div>
{/if}

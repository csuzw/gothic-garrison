<script lang="ts">
  import { slotsUsed, specialUsed, type EquipmentSnapshot } from '$lib/unit/types';

  let {
    catalog,
    items,
    slots,
    specialMax,
    onAdd,
    onRemove,
  }: {
    catalog: { id: string; name: string; slotCost: number; isSpecial: boolean }[];
    items: EquipmentSnapshot[];
    slots: number;
    specialMax: number;
    onAdd: (itemId: string) => void;
    onRemove: (itemId: string) => void;
  } = $props();

  let pick = $state('');

  const used = $derived(slotsUsed(items));
  const special = $derived(specialUsed(items));
  const overSlots = $derived(used > slots);
  const addable = $derived(
    catalog.filter((c) => used + c.slotCost <= slots && (!c.isSpecial || special < specialMax)),
  );

  function add() {
    if (pick) {
      onAdd(pick);
      pick = '';
    }
  }
</script>

<div class="space-y-2">
  <div class="text-xs opacity-60">
    Slots <span class:text-error={overSlots}>{used} / {slots}</span> · Special {special} / {specialMax}
  </div>

  <div class="flex gap-2">
    <select class="select select-xs flex-1" bind:value={pick}>
      <option value="">Add equipment…</option>
      {#each addable as c (c.id)}
        <option value={c.id}>
          {c.name}{c.slotCost === 2 ? ' (2 slots)' : ''}{c.isSpecial ? ' ★' : ''}
        </option>
      {/each}
    </select>
    <button class="btn btn-xs" onclick={add} disabled={!pick}>Add</button>
  </div>

  {#if items.length}
    <ul class="flex flex-wrap gap-1">
      {#each items as it (it.itemId)}
        <li class="badge badge-sm gap-1">
          {it.quantity > 1 ? `${it.quantity}× ` : ''}{it.name}{it.isSpecial ? ' ★' : ''}
          <button type="button" class="hover:text-error" aria-label="Remove {it.name}" onclick={() => onRemove(it.itemId)}>✕</button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-xs opacity-50">No equipment yet.</p>
  {/if}
</div>

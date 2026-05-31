<script lang="ts">
  import { untrack } from 'svelte';
  import { slotsUsed, specialUsed, type EquipmentSnapshot } from '$lib/unit/types';

  interface DraftRow {
    equipmentId: string;
    quantity: number;
  }

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

  // Snapshot on mount — this component is the sole editor of this list.
  let rows = $state<DraftRow[]>(
    untrack(() => items.map((it) => ({ equipmentId: it.itemId, quantity: it.quantity }))),
  );

  function toSnapshots(): EquipmentSnapshot[] {
    return rows.flatMap((r) => {
      const c = catalog.find((cat) => cat.id === r.equipmentId);
      return c && r.quantity > 0
        ? [{ itemId: c.id, name: c.name, slotCost: c.slotCost, isSpecial: c.isSpecial, quantity: r.quantity }]
        : [];
    });
  }

  const snapshots = $derived(toSnapshots());
  const used = $derived(slotsUsed(snapshots));
  const special = $derived(specialUsed(snapshots));
  const overSlots = $derived(used > slots);

  const normalCatalog = $derived(catalog.filter((c) => !c.isSpecial));
  const specialCatalog = $derived(catalog.filter((c) => c.isSpecial));

  // Max quantity allowed for a given row within the slot/special budget.
  function maxQtyFor(row: DraftRow): number {
    const c = catalog.find((cat) => cat.id === row.equipmentId);
    if (!c || c.slotCost === 0) return 99;
    const othersSlots = snapshots
      .filter((s) => s.itemId !== row.equipmentId)
      .reduce((n, s) => n + s.slotCost * s.quantity, 0);
    const bySlots = Math.floor(Math.max(0, slots - othersSlots) / c.slotCost);
    if (!c.isSpecial) return bySlots;
    const othersSpecial = snapshots
      .filter((s) => s.isSpecial && s.itemId !== row.equipmentId)
      .reduce((n, s) => n + s.quantity, 0);
    return Math.min(bySlots, Math.max(0, specialMax - othersSpecial));
  }

  // First catalog item that fits in remaining slots (default for new rows).
  const firstAddable = $derived(
    catalog.find((c) => used + c.slotCost <= slots && (!c.isSpecial || special < specialMax)),
  );

  function emit() { onChange(toSnapshots()); }

  function addRow() {
    if (!firstAddable) return;
    rows = [...rows, { equipmentId: firstAddable.id, quantity: 1 }];
    emit();
  }

  function removeRow(i: number) {
    rows = rows.filter((_, j) => j !== i);
    emit();
  }

  function onItemChange(i: number) {
    const max = maxQtyFor(rows[i]);
    if (rows[i].quantity > max) rows[i].quantity = Math.max(1, max);
    emit();
  }

  function onQtyChange(i: number, raw: string) {
    const v = parseInt(raw, 10);
    if (!isNaN(v)) rows[i].quantity = Math.max(1, Math.min(v, maxQtyFor(rows[i])));
    emit();
  }
</script>

<div class="space-y-2">
  <div class="text-xs opacity-60">
    Slots <span class:text-error={overSlots}>{used} / {slots}</span> · Special {special} / {specialMax}
  </div>

  {#if rows.length}
    <ul class="space-y-2">
      {#each rows as row, i (i)}
        <li class="flex items-center gap-2">
          <select
            class="select select-xs min-w-0 flex-1"
            bind:value={rows[i].equipmentId}
            onchange={() => onItemChange(i)}
          >
            {#if normalCatalog.length}
              <optgroup label="Equipment">
                {#each normalCatalog as c (c.id)}
                  <option value={c.id} title={c.rules || c.name}>{c.name}{c.slotCost === 2 ? ' (2 slots)' : ''}</option>
                {/each}
              </optgroup>
            {/if}
            {#if specialCatalog.length}
              <optgroup label="Special Armoury">
                {#each specialCatalog as c (c.id)}
                  <option value={c.id} title={c.rules || c.name}>{c.name}{c.slotCost === 2 ? ' (2 slots)' : ''}</option>
                {/each}
              </optgroup>
            {/if}
          </select>
          <label class="flex shrink-0 items-center gap-1">
            <span class="text-xs opacity-60">Qty</span>
            <input
              type="number"
              value={row.quantity}
              min="1"
              max={maxQtyFor(row)}
              oninput={(e) => onQtyChange(i, (e.currentTarget as HTMLInputElement).value)}
              class="input input-xs w-14"
            />
          </label>
          <button type="button" class="btn btn-ghost btn-xs shrink-0 text-error" onclick={() => removeRow(i)}>×</button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-xs opacity-50">No equipment yet.</p>
  {/if}

  <button type="button" class="btn btn-ghost btn-xs" disabled={!firstAddable} onclick={addRow}>
    + Add item
  </button>
</div>

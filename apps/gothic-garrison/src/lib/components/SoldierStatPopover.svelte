<script lang="ts">
  import { STAT_META } from '$lib/unit/types';
  import type { RefSoldier } from '$lib/server/reference';

  let { soldier }: { soldier: RefSoldier } = $props();

  let open = $state(false);

  const fmtStat = (value: number, mod: boolean) => mod ? (value >= 0 ? `+${value}` : `${value}`) : `${value}`;
</script>

<button
  type="button"
  class="btn btn-ghost btn-xs opacity-40 hover:opacity-80"
  onclick={() => (open = !open)}
  aria-label="Stats for {soldier.name}"
><span class="text-base leading-none">ⓘ</span></button>

{#if open}
  <div
    role="presentation"
    class="fixed inset-0 z-40"
    onclick={() => (open = false)}
  ></div>
  <div class="fixed left-1/2 top-24 z-50 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-box border border-base-300 bg-base-100 p-3 shadow-xl">
    <div class="mb-2 flex items-center gap-2">
      <span class="text-sm font-semibold">{soldier.name}</span>
      <span class="badge badge-ghost badge-sm shrink-0">{soldier.recruitmentCost} pts</span>
    </div>
    <div class="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
      {#each STAT_META as m}
        <span class="opacity-80">{m.short} <span class="font-medium opacity-100">{fmtStat(soldier.stats[m.key], m.mod)}</span></span>
      {/each}
    </div>
    {#if soldier.fixedAttributes.length || soldier.attributePicks > 0}
      <div class="mt-2 flex flex-wrap gap-1">
        {#each soldier.fixedAttributes as a}
          <span class="badge badge-xs badge-ghost" title={a.rules || a.name}>{a.name}</span>
        {/each}
        {#if soldier.attributePicks > 0}
          <span class="badge badge-xs badge-ghost opacity-60">Officer ({soldier.attributePicks})</span>
        {/if}
      </div>
    {/if}
    {#if soldier.equipmentMode === 'pool'}
      <p class="mt-2 text-xs opacity-50">Officer</p>
    {:else if soldier.equipmentMode === 'fixed' && soldier.loadouts.length}
      <p class="mt-2 text-xs opacity-50">
        {soldier.loadouts[0].items.map((i) => (i.quantity > 1 ? `${i.quantity}× ` : '') + i.name).join(', ')}
      </p>
    {:else if soldier.equipmentMode === 'choice' && soldier.loadouts.length}
      <p class="mt-2 text-xs opacity-50">
        {soldier.loadouts.map((l) => l.label).join(' / ')}
      </p>
    {/if}
  </div>
{/if}

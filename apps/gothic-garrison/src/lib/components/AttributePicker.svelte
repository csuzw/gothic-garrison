<script lang="ts">
  import type { AttributeSnapshot } from '$lib/unit/types';

  let {
    pool,
    selected,
    max,
    fixed = [],
    granted = [],
    onToggle,
  }: {
    pool: { id: string; name: string; rules: string | null }[];
    selected: AttributeSnapshot[];
    max: number;
    fixed?: { name: string; rules: string | null }[];
    /** Attributes granted by a creation choice (e.g. Elite Guard → Light Infantry Training). */
    granted?: { name: string; rules: string | null }[];
    onToggle: (id: string, name: string) => void;
  } = $props();

  const selectedIds = $derived(new Set(selected.map((a) => a.id)));
  const atMax = $derived(selected.length >= max);
</script>

<div class="space-y-2">
  {#if fixed.length || granted.length}
    <div class="flex flex-wrap items-center gap-1">
      <span class="text-xs opacity-60">Has:</span>
      {#each fixed as f}<span class="badge badge-sm badge-ghost" title={f.rules || f.name}>{f.name}</span>{/each}
      {#each granted as g}<span class="badge badge-sm badge-outline badge-success" title={g.rules || g.name}>{g.name}</span>{/each}
    </div>
  {/if}

  <div class="text-xs opacity-60">Pick {max} attribute{max === 1 ? '' : 's'} · {selected.length} / {max}</div>
  <div class="flex flex-wrap gap-1">
    {#each pool as a (a.id)}
      {@const isSel = selectedIds.has(a.id)}
      <button
        type="button"
        class="btn btn-xs {isSel ? 'btn-primary' : 'btn-outline'}"
        title={a.rules || a.name}
        disabled={!isSel && atMax}
        onclick={() => onToggle(a.id, a.name)}
      >
        {a.name}
      </button>
    {/each}
  </div>
</div>

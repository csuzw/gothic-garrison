<script lang="ts">
  import { CODEX_NAV } from '$lib/codex/entities';

  // Live row counts per entity, fetched from the dev-only /api/codex endpoints.
  let counts = $state<Record<string, number | null>>({});

  $effect(() => {
    for (const item of CODEX_NAV) {
      fetch(`/api/reference/${item.slug}`)
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((d) => (counts[item.slug] = d.items?.length ?? 0))
        .catch(() => (counts[item.slug] = null));
    }
  });
</script>

<svelte:head><title>Reference · Gothic Garrison</title></svelte:head>

<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
  {#each CODEX_NAV as item (item.slug)}
    <li>
      <a href="/reference/{item.slug}" class="card bg-base-200 card-compact transition hover:bg-base-300">
        <div class="card-body flex-row items-center justify-between">
          <span class="font-medium">{item.label}</span>
          <span class="badge badge-ghost">
            {counts[item.slug] ?? '…'}
          </span>
        </div>
      </a>
    </li>
  {/each}
</ul>

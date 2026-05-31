<script lang="ts">
  import StatLine from '$lib/components/StatLine.svelte';

  let { data } = $props();
</script>

<svelte:head><title>Bestiary · Gothic Garrison</title></svelte:head>

{#if data.bestiary.length === 0}
  <section class="mx-auto max-w-md space-y-2 py-12 text-center">
    <h1 class="text-2xl font-semibold">Bestiary</h1>
    <p class="opacity-70">No monsters yet. Add them in the Codex.</p>
  </section>
{:else}
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">Bestiary</h1>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.bestiary as monster (monster.id)}
        <div class="card bg-base-200 card-compact">
          <div class="card-body gap-3">

            <!-- Name + source badge -->
            <div class="flex items-center gap-2">
              <h2 class="card-title text-base">{monster.name}</h2>
              <span class="badge badge-outline badge-sm font-mono">{monster.sourceCode}</span>
            </div>

            <!-- Notes -->
            {#if monster.description}
              <p class="text-sm opacity-70">{monster.description}</p>
            {/if}

            <!-- Stats -->
            <StatLine stats={monster.stats} />

            <!-- Attributes -->
            <div class="space-y-1">
              <p class="text-xs font-semibold">Attributes</p>
              {#if monster.attributes.length > 0}
                <div class="flex flex-wrap gap-1">
                  {#each monster.attributes as attr (attr)}
                    <span class="badge badge-outline badge-sm">{attr}</span>
                  {/each}
                </div>
              {:else}
                <p class="text-xs opacity-50">None</p>
              {/if}
            </div>

            <!-- Equipment -->
            <div class="space-y-1">
              <p class="text-xs font-semibold">Equipment</p>
              {#if monster.loadouts.length === 0}
                <p class="text-xs opacity-50">None</p>
              {:else if monster.equipmentMode === 'fixed'}
                {@const items = monster.loadouts[0]?.items ?? []}
                {#if items.length > 0}
                  <div class="flex flex-wrap gap-1">
                    {#each items as item (item.name)}
                      <span class="badge badge-outline badge-sm">
                        {item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name}
                      </span>
                    {/each}
                  </div>
                {:else}
                  <p class="text-xs opacity-50">None</p>
                {/if}
              {:else}
                {#each monster.loadouts as lo, i (i)}
                  <div class="flex flex-wrap items-center gap-1">
                    <span class="text-xs opacity-50 shrink-0">Option {i + 1}:</span>
                    {#each lo.items as item (item.name)}
                      <span class="badge badge-outline badge-sm">
                        {item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name}
                      </span>
                    {/each}
                    {#if lo.items.length === 0}
                      <span class="text-xs opacity-50">None</span>
                    {/if}
                  </div>
                {/each}
              {/if}
            </div>

          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

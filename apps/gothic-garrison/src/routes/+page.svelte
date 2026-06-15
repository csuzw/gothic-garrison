<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { PageProps } from './$types';
  import NationFlag from '$lib/components/NationFlag.svelte';
  import { getUnitStore, indexedDbStore } from '$lib/unit/store';
  import { createUnitDoc, OUTSIDE_NATION_RULE_CODE, BASE_RECRUITMENT_BUDGET, type UnitSummary } from '$lib/unit/types';

  let { data }: PageProps = $props();

  const signedIn = $derived(!!page.data.user);
  const flagByNationId = $derived(new Map(data.nations.map((n) => [n.id, n.flag])));

  let units = $state<UnitSummary[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let creating = $state(false);
  let pendingDeleteId = $state<string | null>(null);

  let pickerOpen = $state(false);
  let selectedNation = $state<{ id: string; name: string } | null>(null);
  let optionsOpen = $state(false);
  let infoNationId = $state<string | null>(null);

  const supplementSources = $derived(data.sources.filter((s) => s.kind === 'supplement'));
  let enabledSupplementCodes = $state<string[]>(
    untrack(() => data.sources.filter((s) => s.kind === 'supplement').map((s) => s.code)),
  );
  let allowOutsideNation = $state(true);
  let baseBudget = $state(BASE_RECRUITMENT_BUDGET);

  const MIN_BUDGET = 50;
  const MAX_BUDGET = 300;

  const allSupplementsEnabled = $derived(
    supplementSources.every((s) => enabledSupplementCodes.includes(s.code)),
  );
  const filteredNations = $derived(
    data.nations.filter((n) => n.sourceCode === 'core' || enabledSupplementCodes.includes(n.sourceCode)),
  );
  const optionsCustomised = $derived(!allSupplementsEnabled || !allowOutsideNation || baseBudget !== BASE_RECRUITMENT_BUDGET);
  const infoNation = $derived(infoNationId ? filteredNations.find((n) => n.id === infoNationId) : null);

  $effect(() => {
    if (selectedNation && !filteredNations.some((n) => n.id === selectedNation!.id)) {
      selectedNation = null;
    }
  });

  function toggleSupplement(code: string) {
    const idx = enabledSupplementCodes.indexOf(code);
    if (idx >= 0) enabledSupplementCodes.splice(idx, 1);
    else enabledSupplementCodes.push(code);
  }

  const dateFmt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  async function load() {
    loading = true;
    error = null;
    try {
      units = await getUnitStore(signedIn).list();
      if (units.length === 0) pickerOpen = true;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  onMount(load);

  async function createWithNation() {
    if (!selectedNation) return;
    creating = true;
    try {
      const doc = createUnitDoc();
      doc.nationId = selectedNation.id;
      doc.nationName = selectedNation.name;
      if (!allSupplementsEnabled) {
        doc.enabledSourceCodes = ['core', ...enabledSupplementCodes];
      }
      if (allowOutsideNation) {
        doc.optionalRules = [OUTSIDE_NATION_RULE_CODE];
      }
      if (baseBudget !== BASE_RECRUITMENT_BUDGET) {
        doc.baseBudget = baseBudget;
      }
      // When offline and signed in, save to IndexedDB so the unit persists
      // locally and migrates to the server automatically on reconnect.
      const store = signedIn && !navigator.onLine ? indexedDbStore : getUnitStore(signedIn);
      await store.save(doc);
      await goto(`/units/${doc.id}`);
    } catch (e) {
      error = (e as Error).message;
      creating = false;
    }
  }

  function togglePicker() {
    pickerOpen = !pickerOpen;
    if (!pickerOpen) selectedNation = null;
  }

  function memberTypeCounts(members: { soldierTypeId: string | null; name: string }[]) {
    return [...members.reduce((map, m) => {
      const key = m.soldierTypeId ?? m.name;
      const existing = map.get(key);
      if (existing) existing.count++;
      else map.set(key, { name: m.name, count: 1 });
      return map;
    }, new Map<string, { name: string; count: number }>()).values()];
  }

  async function remove(id: string) {
    try {
      await getUnitStore(signedIn).remove(id);
      pendingDeleteId = null;
      await load();
    } catch (e) {
      error = (e as Error).message;
    }
  }
</script>

<svelte:head>
  <title>Gothic Garrison – Silver Bayonet List Builder</title>
  <meta name="description" content="Free fan-made list builder for The Silver Bayonet tabletop wargame. Build and print your warband, works offline on mobile." />
</svelte:head>

<section class="space-y-6">
  <p class="text-sm opacity-60">
    Gothic Garrison is a free, unofficial list builder for <em>The Silver Bayonet</em> — the gothic horror skirmish wargame by Joseph A. McCullough. Build your warband, browse soldiers and equipment, and print your unit cards.
  </p>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-2xl font-semibold">Your units</h1>
    <button class="btn btn-primary btn-sm" onclick={togglePicker} disabled={creating}>
      New unit
      <span class="text-xs opacity-60">{pickerOpen ? '▲' : '▼'}</span>
    </button>
  </div>

  {#if pickerOpen}
  <div>
    <!-- Sticky action bar — navbar is not fixed so top-0 is correct -->
    <div class="sticky top-0 z-10 rounded-box bg-base-200 px-4 py-3 shadow-sm">
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm font-medium opacity-80">Select a nation to start your unit:</p>
        <div class="flex shrink-0 items-center gap-2">
          <div class="relative">
            <button
              class="btn btn-ghost btn-sm btn-square"
              onclick={() => (optionsOpen = true)}
              aria-label={optionsCustomised ? 'Build options (customised)' : 'Build options'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path fill-rule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .205 1.251l-1.18 2.044a1 1 0 0 1-1.186.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.113a7.047 7.047 0 0 1 0-2.228L1.821 7.773a1 1 0 0 1-.205-1.251l1.18-2.044a1 1 0 0 1 1.186-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
              </svg>
            </button>
            {#if optionsCustomised}
              <span class="pointer-events-none absolute right-1 top-1 h-2 w-2 rounded-full bg-warning"></span>
            {/if}
          </div>
          <button
            class="btn btn-primary btn-sm"
            onclick={createWithNation}
            disabled={!selectedNation || creating}
          >
            {#if creating}<span class="loading loading-spinner loading-xs"></span>{/if}
            Create
          </button>
        </div>
      </div>
    </div>

    <!-- Nation grid -->
    <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {#each filteredNations as n (n.id)}
        {@const selected = selectedNation?.id === n.id}
        <div
          role="button"
          tabindex="0"
          class="card w-full cursor-pointer text-left transition-all
            {selected ? 'bg-primary/15 ring-2 ring-primary' : 'bg-base-200 hover:bg-base-300'}"
          onclick={() => (selectedNation = selected ? null : { id: n.id, name: n.name })}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectedNation = selected ? null : { id: n.id, name: n.name }; } }}
        >
          <div class="card-body gap-1.5 p-3">
            <div class="flex flex-wrap items-center gap-2">
              <NationFlag flag={n.flag} name={n.name} />
              <span class="font-semibold">{n.name}</span>
              <span class="badge badge-outline badge-sm ml-auto font-mono">{n.sourceCode}</span>
              {#if n.description}
                <button
                  type="button"
                  class="btn btn-ghost btn-xs shrink-0 p-0 opacity-40 hover:opacity-80 sm:hidden"
                  onclick={(e) => { e.stopPropagation(); infoNationId = infoNationId === n.id ? null : n.id; }}
                  aria-label="About {n.name}"
                ><span class="text-base leading-none">ⓘ</span></button>
              {/if}
            </div>
            {#if n.description}
              <p class="hidden text-xs leading-relaxed opacity-60 sm:block">{n.description}</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
  {/if}

  <p class="text-sm opacity-70">
    {#if signedIn}
      Synced to your account — available on any device you sign in to.
    {:else}
      Stored on this device. <a href="/sign-in" class="link link-primary">Sign in</a> to sync across devices.
    {/if}
  </p>

  {#if error}
    <div class="alert alert-error text-sm" role="alert">{error}</div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-10"><span class="loading loading-spinner"></span></div>
  {:else if units.length === 0}
    <div class="card bg-base-200">
      <div class="card-body items-center text-center">
        <p class="opacity-70">No units yet — choose a nation above to get started.</p>
      </div>
    </div>
  {:else}
    <ul class="grid gap-2 sm:grid-cols-2">
      {#each units as u (u.id)}
        <li class="card bg-base-200 card-compact">
          <div class="card-body flex-row items-center justify-between gap-3">
            <a href="/units/{u.id}" class="min-w-0 flex-1">
              <span class="flex items-center gap-1.5 truncate font-medium">
                <NationFlag flag={u.nationId ? (flagByNationId.get(u.nationId) ?? null) : null} size="sm" />
                {u.name}
              </span>
              <span class="block text-xs opacity-60">
                Updated {dateFmt.format(new Date(u.updatedAt))}
              </span>
              {#if u.members.length > 0}
                {@const counts = memberTypeCounts(u.members)}
                <div class="mt-1 flex flex-wrap gap-1">
                  {#each counts as t}
                    <span class="badge badge-sm">{t.count > 1 ? `${t.count}× ` : ''}{t.name}</span>
                  {/each}
                </div>
              {/if}
            </a>
            <button
              class="btn btn-ghost btn-sm btn-square shrink-0"
              onclick={() => goto(`/units/${u.id}/print`)}
              aria-label="Print {u.name}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path fill-rule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0 1 18 8.653v4.097A2.25 2.25 0 0 1 15.75 15h-.241l.305 1.984A1.75 1.75 0 0 1 14.084 19H5.915a1.75 1.75 0 0 1-1.73-2.016L4.492 15H4.25A2.25 2.25 0 0 1 2 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.749-.107 1.126-.153V2.75Zm8.5 3.397a41.533 41.533 0 0 0-7 0V2.75a.25.25 0 0 1 .25-.25h6.5a.25.25 0 0 1 .25.25v3.397ZM6.608 12.5a.25.25 0 0 0-.247.212l-.419 2.716a.25.25 0 0 0 .247.287h7.822a.25.25 0 0 0 .247-.287l-.419-2.716a.25.25 0 0 0-.247-.212H6.608Z" clip-rule="evenodd" />
              </svg>
            </button>
            {#if pendingDeleteId === u.id}
              <div class="flex shrink-0 items-center gap-1">
                <button class="btn btn-error btn-xs" onclick={() => remove(u.id)}>Delete</button>
                <button class="btn btn-ghost btn-xs" onclick={() => (pendingDeleteId = null)}>Cancel</button>
              </div>
            {:else}
              <button
                class="btn btn-ghost btn-sm btn-square text-error shrink-0"
                onclick={() => (pendingDeleteId = u.id)}
                aria-label="Delete {u.name}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                  <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                </svg>
              </button>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<!-- Build options modal -->
{#if optionsOpen}
  <div role="presentation" class="fixed inset-0 z-40 bg-black/50" onclick={() => (optionsOpen = false)}></div>
  <div class="fixed left-1/2 top-1/2 z-50 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-box bg-base-100 p-5 shadow-xl">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-semibold">Build options</h3>
      <button class="btn btn-ghost btn-xs btn-square" onclick={() => (optionsOpen = false)} aria-label="Close">✕</button>
    </div>
    <div class="space-y-4">
      {#if supplementSources.length > 0}
        <div>
          <p class="mb-2 text-xs font-medium opacity-70">Supplements</p>
          <div class="space-y-1.5">
            {#each supplementSources as src (src.code)}
              <label class="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={enabledSupplementCodes.includes(src.code)}
                  onchange={() => toggleSupplement(src.code)}
                />
                <span class="text-sm">{src.name}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
      <div>
        <p class="mb-2 text-xs font-medium opacity-70">Optional rules</p>
        <label class="flex cursor-pointer items-center gap-2">
          <input type="checkbox" class="checkbox checkbox-sm" bind:checked={allowOutsideNation} />
          <span class="text-sm">Allow one outside-nation soldier (+8 pts)</span>
        </label>
      </div>
      <div>
        <p class="mb-2 text-xs font-medium opacity-70">Recruitment budget</p>
        <div class="flex items-center gap-2">
          <div class="join">
            <button class="btn btn-ghost btn-sm join-item" onclick={() => (baseBudget = Math.max(MIN_BUDGET, baseBudget - 5))} disabled={baseBudget <= MIN_BUDGET}>−5</button>
            <span class="btn btn-sm join-item pointer-events-none tabular-nums">{baseBudget} pts</span>
            <button class="btn btn-ghost btn-sm join-item" onclick={() => (baseBudget = Math.min(MAX_BUDGET, baseBudget + 5))} disabled={baseBudget >= MAX_BUDGET}>+5</button>
          </div>
          {#if baseBudget !== BASE_RECRUITMENT_BUDGET}
            <button class="btn btn-ghost btn-xs opacity-60" onclick={() => (baseBudget = BASE_RECRUITMENT_BUDGET)}>Reset</button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Nation description popover (mobile) -->
{#if infoNation?.description}
  <div role="presentation" class="fixed inset-0 z-40" onclick={() => (infoNationId = null)}></div>
  <div class="fixed left-1/2 top-24 z-50 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-box border border-base-300 bg-base-100 p-3 shadow-xl">
    <p class="mb-1.5 text-sm font-semibold">{infoNation.name}</p>
    <p class="text-xs leading-relaxed opacity-70">{infoNation.description}</p>
  </div>
{/if}

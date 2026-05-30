<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { PageProps } from './$types';
  import NationFlag from '$lib/components/NationFlag.svelte';
  import { getUnitStore } from '$lib/unit/store';
  import { createUnitDoc, type UnitSummary } from '$lib/unit/types';

  let { data }: PageProps = $props();

  const signedIn = $derived(!!page.data.user);
  const flagByNationId = $derived(new Map(data.nations.map((n) => [n.id, n.flag])));

  let units = $state<UnitSummary[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let creating = $state(false);

  let pickerOpen = $state(false);
  let selectedNation = $state<{ id: string; name: string } | null>(null);

  const dateFmt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  async function load() {
    loading = true;
    error = null;
    try {
      units = await getUnitStore(signedIn).list();
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
      await getUnitStore(signedIn).save(doc);
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

  async function remove(id: string) {
    if (!confirm('Delete this unit? This cannot be undone.')) return;
    try {
      await getUnitStore(signedIn).remove(id);
      await load();
    } catch (e) {
      error = (e as Error).message;
    }
  }
</script>

<svelte:head><title>Units · Gothic Garrison</title></svelte:head>

<section class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-2xl font-semibold">Your units</h1>
    <button class="btn btn-primary btn-sm" onclick={togglePicker} disabled={creating}>
      New unit
      <span class="text-xs opacity-60">{pickerOpen ? '▲' : '▼'}</span>
    </button>
  </div>

  {#if pickerOpen}
    <div class="card bg-base-200">
      <div class="card-body gap-4 p-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium opacity-80">Select a nation to start your unit:</p>
          <button
            class="btn btn-primary btn-sm shrink-0"
            onclick={createWithNation}
            disabled={!selectedNation || creating}
          >
            {#if creating}<span class="loading loading-spinner loading-xs"></span>{/if}
            Create
          </button>
        </div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {#each data.nations as n (n.id)}
            {@const selected = selectedNation?.id === n.id}
            <button
              class="card w-full cursor-pointer text-left transition-all
                {selected ? 'bg-primary/15 ring-2 ring-primary' : 'bg-base-100 hover:bg-base-300'}"
              onclick={() => (selectedNation = selected ? null : { id: n.id, name: n.name })}
            >
              <div class="card-body gap-1.5 p-3">
                <div class="flex flex-wrap items-center gap-2">
                  <NationFlag flag={n.flag} name={n.name} />
                  <span class="font-semibold">{n.name}</span>
                  <span class="badge badge-outline badge-sm ml-auto font-mono">{n.sourceCode}</span>
                </div>
                {#if n.notes}
                  <p class="hidden text-xs leading-relaxed opacity-60 sm:block">{n.notes}</p>
                {/if}
              </div>
            </button>
          {/each}
        </div>
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
        <p class="opacity-70">No units yet.</p>
        <button class="btn btn-primary btn-sm" onclick={togglePicker} disabled={creating}>
          Choose a nation to get started
        </button>
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
            </a>
            <button
              class="btn btn-ghost btn-sm text-error"
              onclick={() => remove(u.id)}
              aria-label="Delete {u.name}"
            >
              Delete
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

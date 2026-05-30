<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { getUnitStore } from '$lib/unit/store';
  import { createUnitDoc, type UnitSummary } from '$lib/unit/types';

  const signedIn = $derived(!!page.data.user);

  let units = $state<UnitSummary[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let creating = $state(false);

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

  async function createNew() {
    creating = true;
    try {
      const doc = createUnitDoc();
      await getUnitStore(signedIn).save(doc);
      await goto(`/units/${doc.id}`);
    } catch (e) {
      error = (e as Error).message;
      creating = false;
    }
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
  <div class="flex items-center justify-between gap-3">
    <h1 class="text-2xl font-semibold">Your units</h1>
    <button class="btn btn-primary btn-sm" onclick={createNew} disabled={creating}>
      {#if creating}<span class="loading loading-spinner loading-xs"></span>{/if}
      New unit
    </button>
  </div>

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
        <button class="btn btn-primary btn-sm" onclick={createNew} disabled={creating}>
          Create your first
        </button>
      </div>
    </div>
  {:else}
    <ul class="grid gap-2 sm:grid-cols-2">
      {#each units as u (u.id)}
        <li class="card bg-base-200 card-compact">
          <div class="card-body flex-row items-center justify-between gap-3">
            <a href="/units/{u.id}" class="min-w-0 flex-1">
              <span class="block truncate font-medium">{u.name}</span>
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

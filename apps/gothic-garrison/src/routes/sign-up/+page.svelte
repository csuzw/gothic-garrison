<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { signUp } from '$lib/auth-client';
  import { migrateAnonymousUnits } from '$lib/unit/store';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let error = $state<string | null>(null);
  let busy = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = null;
    busy = true;
    const { error: err } = await signUp.email({ name, email, password });
    if (err) {
      error = err.message ?? 'Could not create your account.';
      busy = false;
      return;
    }
    try {
      await migrateAnonymousUnits();
    } catch {
      // Migration is best-effort; never block sign-up on it.
    }
    await invalidateAll();
    await goto('/');
  }
</script>

<svelte:head><title>Create account · Gothic Garrison</title></svelte:head>

<section class="mx-auto w-full max-w-sm">
  <h1 class="mb-1 text-2xl font-semibold">Create account</h1>
  <p class="mb-6 text-sm opacity-70">
    An account lets you save units to the cloud and sync across devices.
  </p>

  {#if error}
    <div class="alert alert-error mb-4 text-sm" role="alert">{error}</div>
  {/if}

  <form onsubmit={submit} class="space-y-4">
    <label class="block">
      <span class="mb-1 block text-sm font-medium">Name</span>
      <input
        type="text"
        bind:value={name}
        required
        autocomplete="name"
        class="input w-full"
        placeholder="Captain Renaud"
      />
    </label>
    <label class="block">
      <span class="mb-1 block text-sm font-medium">Email</span>
      <input
        type="email"
        bind:value={email}
        required
        autocomplete="email"
        class="input w-full"
        placeholder="you@example.com"
      />
    </label>
    <label class="block">
      <span class="mb-1 block text-sm font-medium">Password</span>
      <input
        type="password"
        bind:value={password}
        required
        minlength="8"
        autocomplete="new-password"
        class="input w-full"
      />
      <span class="mt-1 block text-xs opacity-60">At least 8 characters.</span>
    </label>
    <button type="submit" class="btn btn-primary w-full" disabled={busy}>
      {#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
      Create account
    </button>
  </form>

  <p class="mt-6 text-center text-sm opacity-70">
    Already have an account? <a href="/sign-in" class="link link-primary">Sign in</a>
  </p>
</section>

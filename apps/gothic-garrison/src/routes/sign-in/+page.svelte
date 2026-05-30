<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { signIn } from '$lib/auth-client';
  import { migrateAnonymousUnits } from '$lib/unit/store';

  let email = $state('');
  let password = $state('');
  let error = $state<string | null>(null);
  let busy = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = null;
    busy = true;
    const { error: err } = await signIn.email({ email, password });
    if (err) {
      error = err.message ?? 'Could not sign in. Check your email and password.';
      busy = false;
      return;
    }
    try {
      await migrateAnonymousUnits();
    } catch {
      // Migration is best-effort; never block sign-in on it.
    }
    await invalidateAll();
    await goto('/');
  }
</script>

<svelte:head><title>Sign in · Gothic Garrison</title></svelte:head>

<section class="mx-auto w-full max-w-sm">
  <h1 class="mb-1 text-2xl font-semibold">Sign in</h1>
  <p class="mb-6 text-sm opacity-70">
    Sign in to save units to your account. You can keep building without one.
  </p>

  {#if error}
    <div class="alert alert-error mb-4 text-sm" role="alert">{error}</div>
  {/if}

  <form onsubmit={submit} class="space-y-4">
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
        autocomplete="current-password"
        class="input w-full"
      />
    </label>
    <div class="text-right">
      <a href="/forgot-password" class="link link-hover text-xs opacity-70">Forgot password?</a>
    </div>
    <button type="submit" class="btn btn-primary w-full" disabled={busy}>
      {#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
      Sign in
    </button>
  </form>

  <p class="mt-6 text-center text-sm opacity-70">
    No account? <a href="/sign-up" class="link link-primary">Create one</a>
  </p>
</section>

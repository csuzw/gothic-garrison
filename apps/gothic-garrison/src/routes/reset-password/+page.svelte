<script lang="ts">
  import { authClient } from '$lib/auth-client';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  let password = $state('');
  let busy = $state(false);
  let done = $state(false);
  let error = $state<string | null>(null);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!data.token) {
      error = 'Missing reset token. Open the link from your reset email.';
      return;
    }
    error = null;
    busy = true;
    const { error: err } = await authClient.resetPassword({ newPassword: password, token: data.token });
    busy = false;
    if (err) {
      error = err.message ?? 'Could not reset your password. The link may have expired.';
      return;
    }
    done = true;
  }
</script>

<svelte:head><title>Choose a new password · Gothic Garrison</title></svelte:head>

<section class="mx-auto w-full max-w-sm">
  <h1 class="mb-1 text-2xl font-semibold">Choose a new password</h1>

  {#if done}
    <div class="alert alert-success mt-4 text-sm" role="status">
      Your password has been reset.
    </div>
    <p class="mt-6 text-center text-sm opacity-70">
      <a href="/sign-in" class="link link-primary">Sign in</a>
    </p>
  {:else if !data.token && !data.linkError}
    <p class="mt-4 text-sm opacity-70">
      Open the password-reset link from your email to continue, or
      <a href="/forgot-password" class="link link-primary">request a new one</a>.
    </p>
  {:else}
    <p class="mb-6 text-sm opacity-70">Pick a new password for your account.</p>

    {#if error || data.linkError}
      <div class="alert alert-error mb-4 text-sm" role="alert">
        {error ?? 'This reset link is invalid or has expired.'}
        {#if data.linkError}
          <a href="/forgot-password" class="link">Request a new link</a>
        {/if}
      </div>
    {/if}

    <form onsubmit={submit} class="space-y-4">
      <label class="block">
        <span class="mb-1 block text-sm font-medium">New password</span>
        <input
          type="password"
          bind:value={password}
          required
          minlength="8"
          autocomplete="new-password"
          class="input w-full"
          disabled={!data.token}
        />
        <span class="mt-1 block text-xs opacity-60">At least 8 characters.</span>
      </label>
      <button type="submit" class="btn btn-primary w-full" disabled={busy || !data.token}>
        {#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
        Reset password
      </button>
    </form>
  {/if}
</section>

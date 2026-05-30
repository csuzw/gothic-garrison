<script lang="ts">
  import { authClient } from '$lib/auth-client';

  let email = $state('');
  let error = $state<string | null>(null);
  let busy = $state(false);
  let sent = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = null;
    busy = true;
    const { error: err } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    });
    busy = false;
    if (err) {
      error = err.message ?? 'Could not send the reset email. Please try again.';
      return;
    }
    sent = true;
  }
</script>

<svelte:head><title>Reset password · Gothic Garrison</title></svelte:head>

<section class="mx-auto w-full max-w-sm">
  <h1 class="mb-1 text-2xl font-semibold">Reset password</h1>

  {#if sent}
    <div class="alert alert-success mt-4 text-sm" role="status">
      If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox.
    </div>
    <p class="mt-6 text-center text-sm opacity-70">
      <a href="/sign-in" class="link link-primary">Back to sign in</a>
    </p>
  {:else}
    <p class="mb-6 text-sm opacity-70">
      Enter your email and we'll send you a link to choose a new password.
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
      <button type="submit" class="btn btn-primary w-full" disabled={busy}>
        {#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
        Send reset link
      </button>
    </form>

    <p class="mt-6 text-center text-sm opacity-70">
      Remembered it? <a href="/sign-in" class="link link-primary">Sign in</a>
    </p>
  {/if}
</section>

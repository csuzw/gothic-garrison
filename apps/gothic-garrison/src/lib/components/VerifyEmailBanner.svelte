<script lang="ts">
  import { authClient } from '$lib/auth-client';

  let { user }: { user: { email: string; emailVerified: boolean } | null } = $props();

  let status = $state<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function resend() {
    if (!user) return;
    status = 'sending';
    const { error } = await authClient.sendVerificationEmail({
      email: user.email,
      callbackURL: '/',
    });
    status = error ? 'error' : 'sent';
  }
</script>

{#if user && !user.emailVerified}
  <div class="alert alert-warning rounded-none text-sm">
    <span class="flex-1">
      Verify your email (<strong>{user.email}</strong>) to secure your account.
    </span>
    {#if status === 'sent'}
      <span class="opacity-80">Verification email sent — check your inbox.</span>
    {:else}
      <button class="btn btn-sm" onclick={resend} disabled={status === 'sending'}>
        {#if status === 'sending'}<span class="loading loading-spinner loading-xs"></span>{/if}
        Resend email
      </button>
      {#if status === 'error'}
        <span class="opacity-80">Couldn't send — try again.</span>
      {/if}
    {/if}
  </div>
{/if}

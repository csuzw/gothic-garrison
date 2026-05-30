<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { signOut } from '$lib/auth-client';

  let { user }: { user: { name: string; email: string } | null } = $props();

  let busy = $state(false);

  const initial = $derived((user?.name || user?.email || '?').charAt(0).toUpperCase());

  async function handleSignOut() {
    busy = true;
    try {
      await signOut();
      await invalidateAll();
      await goto('/');
    } finally {
      busy = false;
    }
  }
</script>

{#if user}
  <details class="dropdown dropdown-end">
    <summary class="btn btn-ghost btn-sm list-none gap-2">
      <div class="avatar avatar-placeholder">
        <div class="bg-primary text-primary-content w-7 rounded-full">
          <span class="text-xs">{initial}</span>
        </div>
      </div>
      <span class="hidden max-w-[14ch] truncate sm:inline">{user.name || user.email}</span>
    </summary>
    <ul class="dropdown-content menu bg-base-200 rounded-box z-10 mt-2 w-56 p-2 shadow">
      <li class="menu-title truncate">{user.email}</li>
      <li>
        <button onclick={handleSignOut} disabled={busy}>
          {#if busy}<span class="loading loading-spinner loading-xs"></span>{/if}
          Sign out
        </button>
      </li>
    </ul>
  </details>
{:else}
  <a href="/sign-in" class="btn btn-ghost btn-sm">Sign in</a>
{/if}

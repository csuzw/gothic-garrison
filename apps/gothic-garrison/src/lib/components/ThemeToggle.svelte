<script lang="ts">
  import { onMount } from 'svelte';

  type Theme = 'garrison' | 'garrison-light';

  let theme = $state<Theme>('garrison');

  onMount(() => {
    // The inline script in app.html has already applied the saved theme to
    // <html> before paint; mirror it into local state for the toggle.
    const applied = document.documentElement.dataset.theme;
    theme = applied === 'garrison-light' ? 'garrison-light' : 'garrison';
  });

  function toggle() {
    theme = theme === 'garrison' ? 'garrison-light' : 'garrison';
    document.documentElement.dataset.theme = theme;

    // Keep the mobile address-bar colour in step with the theme.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'garrison-light' ? '#f0e9da' : '#0e0b08');
    }

    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Private mode / storage disabled — toggle still works for the session.
    }
  }
</script>

<button
  type="button"
  class="btn btn-ghost btn-square"
  onclick={toggle}
  aria-label="Toggle light and dark theme"
  title={theme === 'garrison' ? 'Switch to parchment (light)' : 'Switch to dark'}
>
  {#if theme === 'garrison'}
    <!-- moon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  {:else}
    <!-- sun -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
      />
    </svg>
  {/if}
</button>

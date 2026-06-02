<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Logo from '$lib/components/Logo.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import UserMenu from '$lib/components/UserMenu.svelte';
  import VerifyEmailBanner from '$lib/components/VerifyEmailBanner.svelte';
  import { migrateAnonymousUnits } from '$lib/unit/store';

  let { children, data } = $props();

  let isOnline = $state(true);

  onMount(() => {
    isOnline = navigator.onLine;

    const handleOnline = async () => {
      isOnline = true;
      if (data.user) {
        try { await migrateAnonymousUnits(); } catch {}
      }
    };
    const handleOffline = () => { isOnline = false; };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Warm the Workbox runtime cache for reference data.
    if (isOnline) fetch('/api/reference/snapshot').catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  // href === null → shown but disabled ("coming soon").
  const navLinks: { label: string; href: string | null }[] = [
    { label: 'Units', href: '/' },
    { label: 'Campaigns', href: null },
    { label: 'Cheat Sheet', href: '/cheat-sheet' },
    { label: 'Reference', href: '/reference' },
  ];

  const pathname = $derived(page.url.pathname);
  function isActive(href: string | null): boolean {
    if (!href) return false;
    if (href === '/') return pathname === '/' || pathname.startsWith('/units');
    return pathname === href || pathname.startsWith(href + '/');
  }
</script>

<div class="flex min-h-dvh flex-col">
  <header class="navbar bg-base-200 border-b border-primary shadow-sm print:hidden">
    <div class="container mx-auto flex items-center gap-2 px-4">
      <!-- Mobile: page links in a dropdown -->
      <details class="dropdown lg:hidden">
        <summary class="btn btn-ghost btn-sm btn-square list-none" aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </summary>
        <ul class="dropdown-content menu bg-base-200 rounded-box z-10 mt-2 w-52 p-2 shadow">
          {#each navLinks as link (link.label)}
            <li>
              {#if link.href}
                <a href={link.href} class:menu-active={isActive(link.href)}>{link.label}</a>
              {:else}
                <span class="opacity-40">{link.label} <span class="badge badge-ghost badge-xs">soon</span></span>
              {/if}
            </li>
          {/each}
        </ul>
      </details>

      <a href="/" class="flex items-center gap-2 text-xl font-semibold tracking-wide">
        <Logo class="size-7 text-primary" />
        <span class="hidden sm:inline">Gothic Garrison</span>
      </a>

      <!-- Desktop: inline page links -->
      <nav class="ml-4 hidden items-center gap-1 lg:flex">
        {#each navLinks as link (link.label)}
          {#if link.href}
            <a href={link.href} class="btn btn-ghost btn-sm" class:btn-active={isActive(link.href)}>
              {link.label}
            </a>
          {:else}
            <span class="btn btn-ghost btn-sm btn-disabled opacity-40" aria-disabled="true">
              {link.label}<span class="badge badge-ghost badge-xs ml-1">soon</span>
            </span>
          {/if}
        {/each}
      </nav>

      <div class="ml-auto flex items-center gap-1">
        <UserMenu user={data.user} />
        <ThemeToggle />
        <a href="/about" class="btn btn-ghost btn-sm btn-square" class:btn-active={isActive('/about')} aria-label="About">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path stroke-linecap="round" d="M12 16v-4M12 8h.01" />
          </svg>
        </a>
      </div>
    </div>
  </header>

  <VerifyEmailBanner user={data.user} />

  {#if !isOnline}
    <div role="status" class="flex items-center justify-center gap-2 bg-warning/15 px-4 py-2 text-center text-xs text-warning-content print:hidden">
      Offline — new units are saved locally and will sync when you reconnect.
    </div>
  {/if}

  <main class="container mx-auto flex-1 px-4 py-6">
    {@render children()}
  </main>

  <footer class="mt-8 border-t border-primary print:hidden">
    <div class="container mx-auto space-y-2 px-4 py-6 text-center text-xs opacity-70">
      <p>
        Gothic Garrison · An unofficial fan-made list builder for <em>The Silver Bayonet</em>. ·
        <a href="https://github.com/csuzw/gothic-garrison" target="_blank" rel="noopener noreferrer" class="link">GitHub</a>
      </p>
      <p>
        <em>The Silver Bayonet</em> was created by <strong>Joseph A. McCullough</strong>, with
        supplements by <strong>Ash Barker</strong> and <strong>T.C. Stephen</strong>, and is published by
        <a href="https://www.ospreypublishing.com/" target="_blank" rel="noopener noreferrer" class="link">
          Osprey Publishing
        </a>. All game content and rules data remain the property of the authors and Osprey
        Publishing. Gothic Garrison is not affiliated with or endorsed by them.
      </p>
    </div>
  </footer>
</div>

<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<div class="min-h-dvh flex flex-col">
  <header class="navbar bg-base-200 shadow-sm">
    <div class="container mx-auto px-4">
      <a href="/" class="text-xl font-semibold tracking-wide">⚔ Gothic Garrison</a>
    </div>
  </header>

  <main class="container mx-auto px-4 py-6 flex-1">
    {@render children()}
  </main>

  <footer class="border-t border-base-200 mt-8">
    <div class="container mx-auto px-4 py-6 text-center text-xs opacity-70 space-y-2">
      <p>
        Gothic Garrison · An unofficial fan-made list builder for
        <em>The Silver Bayonet</em>.
      </p>
      <p>
        <em>The Silver Bayonet</em> and its supplements were created by
        <strong>Joseph A. McCullough</strong>, <strong>Ash Barker</strong>, and
        <strong>T.C. Stephen</strong>, and are published by
        <a
          href="https://www.ospreypublishing.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="link"
        >
          Osprey Publishing
        </a>. All game content and rules data remain the property of the
        authors and Osprey Publishing. Gothic Garrison is not affiliated with
        or endorsed by them.
      </p>
    </div>
  </footer>
</div>

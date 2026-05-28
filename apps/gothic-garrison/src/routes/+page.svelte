<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const dateFmt = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  function formatPublished(d: string): string {
    return dateFmt.format(new Date(d));
  }
</script>

<section class="prose prose-invert max-w-none">
  <h1 class="!mb-2">Build your warband.</h1>
  <p class="opacity-80">
    A list builder and (soon) campaign manager for The Silver Bayonet. Works on your phone, works offline,
    works without an account.
  </p>
</section>

<section class="mt-8">
  <h2 class="text-lg font-semibold mb-3">Sources</h2>

  {#if !data.dbAvailable}
    <div class="alert alert-warning">
      Database not reachable. Start Postgres with <code>docker compose up -d</code> and run
      <code>pnpm db:migrate &amp;&amp; pnpm db:seed</code>.
    </div>
  {:else if data.sources.length === 0}
    <div class="alert">No sources seeded yet — run <code>pnpm db:seed</code>.</div>
  {:else}
    <ul class="grid gap-2 sm:grid-cols-2">
      {#each data.sources as source (source.id)}
        <li class="card bg-base-200 card-compact">
          <div class="card-body">
            <div class="flex items-center justify-between gap-3">
              <span class="font-medium">{source.name}</span>
              <span class="badge badge-ghost text-xs">{source.kind}</span>
            </div>
            <div class="text-xs opacity-60 mt-1">
              {source.author} · {formatPublished(source.publishedDate)}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

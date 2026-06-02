<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const dateFmt = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formatPublished = (d: string) => dateFmt.format(new Date(d));

  const changeBadge: Record<string, string> = {
    added: 'badge-success',
    updated: 'badge-info',
    removed: 'badge-error',
  };
</script>

<svelte:head><title>About · Gothic Garrison</title></svelte:head>

<section class="space-y-3">
  <h1 class="text-2xl font-semibold">About</h1>
  <p class="max-w-prose opacity-80">
    Gothic Garrison is a free, account-optional list builder and (soon) campaign manager for
    <em>The Silver Bayonet</em>. It works on your phone, works offline, and needs no account to
    start building.
  </p>
</section>

<section class="mt-8">
  <h2 class="mb-3 text-lg font-semibold">Sources</h2>

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
          <div class="card-body flex-row gap-3 p-3">
            {#if source.coverImageUrl}
              <a
                href={source.ospreyCoverUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0"
                tabindex={source.ospreyCoverUrl ? 0 : -1}
              >
                <img
                  src={source.coverImageUrl}
                  alt="{source.name} cover"
                  class="h-24 w-auto rounded object-cover shadow"
                />
              </a>
            {/if}
            <div class="flex min-w-0 flex-col justify-center gap-1">
              <div class="flex items-center justify-between gap-2">
                {#if source.ospreyCoverUrl}
                  <a
                    href={source.ospreyCoverUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link font-medium leading-snug"
                  >{source.name}</a>
                {:else}
                  <span class="font-medium leading-snug">{source.name}</span>
                {/if}
                <span class="badge badge-ghost shrink-0 text-xs">{source.kind}</span>
              </div>
              <div class="text-xs opacity-60">
                {source.author} · {formatPublished(source.publishedDate)}
              </div>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<section class="mt-8">
  <h2 class="mb-3 text-lg font-semibold">Reference data changelog</h2>

  {#if data.changelog.length === 0}
    <p class="text-sm opacity-60">No reference-data changes recorded yet.</p>
  {:else}
    <ol class="space-y-3">
      {#each data.changelog as entry (entry.date)}
        <li class="card bg-base-200 card-compact">
          <div class="card-body">
            <div class="flex items-baseline justify-between gap-3">
              <span class="font-medium">{entry.note}</span>
              <time class="text-xs opacity-60" datetime={entry.date}>{formatPublished(entry.date)}</time>
            </div>
            <ul class="mt-1 flex flex-wrap gap-1.5">
              {#each entry.changes as change (change.kind + change.entity + change.name)}
                <li class="badge badge-sm {changeBadge[change.kind] ?? 'badge-ghost'}">
                  {change.kind} {change.entity}: {change.name}
                </li>
              {/each}
            </ul>
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</section>

<script lang="ts">
  import { onMount } from 'svelte';
  import type { StoredEmail } from '$lib/server/store';

  let emails = $state<StoredEmail[]>([]);
  let selectedId = $state<string | null>(null);
  let loading = $state(true);

  const selected = $derived(emails.find((e) => e.id === selectedId) ?? null);

  async function refresh() {
    loading = true;
    const res = await fetch('/api/inbox');
    const data = (await res.json()) as { emails: StoredEmail[] };
    emails = data.emails;
    if (selectedId && !emails.some((e) => e.id === selectedId)) selectedId = null;
    if (!selectedId && emails.length > 0) selectedId = emails[0]!.id;
    loading = false;
  }

  async function clearAll() {
    if (!confirm('Clear all captured emails?')) return;
    await fetch('/api/inbox', { method: 'DELETE' });
    selectedId = null;
    await refresh();
  }

  function recipients(to: string | string[] | undefined): string {
    if (!to) return '';
    return Array.isArray(to) ? to.join(', ') : to;
  }

  onMount(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  });
</script>

<div class="flex items-center justify-between mb-4">
  <h1 class="text-lg font-semibold">
    Inbox
    <span class="badge badge-ghost ml-2">{emails.length}</span>
  </h1>
  <div class="flex gap-2">
    <button class="btn btn-sm" onclick={refresh} disabled={loading}>Refresh</button>
    <button class="btn btn-sm btn-error btn-outline" onclick={clearAll} disabled={emails.length === 0}>
      Clear
    </button>
  </div>
</div>

{#if emails.length === 0 && !loading}
  <div class="alert">
    No emails yet. POST one to
    <code class="ml-1">/emails</code> with a Resend-shaped body and a Bearer token.
  </div>
{:else}
  <div class="grid md:grid-cols-[320px_1fr] gap-4">
    <ul class="menu bg-base-200 rounded-box p-2 max-h-[70vh] overflow-auto">
      {#each emails as email (email.id)}
        <li>
          <button
            class={selectedId === email.id ? 'active' : ''}
            onclick={() => (selectedId = email.id)}
          >
            <div class="flex flex-col items-start text-left">
              <div class="font-semibold truncate w-full">{email.subject}</div>
              <div class="text-xs opacity-70 truncate w-full">to {recipients(email.to)}</div>
              <div class="text-[10px] opacity-50">{new Date(email.receivedAt).toLocaleString()}</div>
            </div>
          </button>
        </li>
      {/each}
    </ul>

    <article class="bg-base-200 rounded-box p-4">
      {#if selected}
        <header class="border-b border-base-300 pb-3 mb-3 space-y-1 text-sm">
          <div><strong>Subject:</strong> {selected.subject}</div>
          <div><strong>From:</strong> {selected.from}</div>
          <div><strong>To:</strong> {recipients(selected.to)}</div>
          {#if selected.cc}<div><strong>Cc:</strong> {recipients(selected.cc)}</div>{/if}
          {#if selected.bcc}<div><strong>Bcc:</strong> {recipients(selected.bcc)}</div>{/if}
          <div class="text-xs opacity-60">id {selected.id}</div>
        </header>
        {#if selected.html}
          <iframe
            title="email body"
            srcdoc={selected.html}
            class="w-full min-h-[400px] bg-white rounded"
          ></iframe>
        {:else if selected.text}
          <pre class="whitespace-pre-wrap text-sm">{selected.text}</pre>
        {:else}
          <p class="opacity-60 italic">No body.</p>
        {/if}
      {:else}
        <p class="opacity-60">Select an email to view it.</p>
      {/if}
    </article>
  </div>
{/if}

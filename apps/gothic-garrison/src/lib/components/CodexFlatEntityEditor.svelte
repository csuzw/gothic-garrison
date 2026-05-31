<script lang="ts">
  import { tick } from 'svelte';
  import NationFlag from '$lib/components/NationFlag.svelte';
  import { blankRow, pickFields, type CodexEntity } from '$lib/codex/entities';

  function autofocusFirst(node: HTMLElement) {
    tick().then(() => node.querySelector<HTMLElement>('input:not([type=hidden]), select, textarea')?.focus());
  }

  type Row = Record<string, unknown> & { id: string };

  interface Props {
    slug: string;
    entity: CodexEntity;
    sources: { id: string; name: string; code: string }[];
    target: { mode: 'new'; sourceId?: string } | { mode: 'edit'; row: Row } | null;
    onsaved: () => void;
    onclose: () => void;
  }

  let { slug, entity, sources, target, onsaved, onclose }: Props = $props();

  let draft = $state<Record<string, any>>({});
  let editingId = $state<string | null>(null);
  let saving = $state(false);
  let formError = $state<string | null>(null);
  let flagUploading = $state(false);
  let flagUploadError = $state<string | null>(null);

  $effect(() => {
    if (target === null) return;
    formError = null;
    flagUploadError = null;
    if (target.mode === 'new') {
      const newDraft = blankRow(entity);
      if (target.sourceId) newDraft['sourceId'] = target.sourceId;
      draft = newDraft;
      editingId = null;
    } else {
      draft = pickFields(entity, target.row);
      editingId = target.row.id;
    }
  });

  async function save(event: SubmitEvent) {
    event.preventDefault();
    saving = true;
    formError = null;
    try {
      const url = editingId ? `/api/reference/${slug}/${editingId}` : `/api/reference/${slug}`;
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        formError = (await res.json().catch(() => ({})))?.message ?? 'Save failed';
        return;
      }
      onclose();
      onsaved();
    } catch {
      formError = 'Save failed — could not reach the API.';
    } finally {
      saving = false;
    }
  }

  async function uploadFlag(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    flagUploading = true;
    flagUploadError = null;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/reference/flags', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { flagUploadError = data.message ?? 'Upload failed'; return; }
      draft['flag'] = data.path;
    } catch {
      flagUploadError = 'Upload failed — could not reach the API.';
    } finally {
      flagUploading = false;
      input.value = '';
    }
  }
</script>

{#if target !== null}
  <div class="modal modal-open" role="dialog">
    <div class="modal-box" use:autofocusFirst>
      <h3 class="text-lg font-semibold">
        {target.mode === 'edit' ? 'Edit' : 'New'} {entity.singular}
      </h3>

      <form onsubmit={save} class="mt-4 space-y-3">
        {#each entity.fields as field (field.key)}
          <label class="block">
            <span class="mb-1 block text-sm font-medium">
              {field.label}{#if field.required}<span class="text-error"> *</span>{/if}
            </span>

            {#if field.type === 'boolean'}
              <input type="checkbox" bind:checked={draft[field.key]} class="toggle toggle-sm" />
            {:else if field.type === 'textarea'}
              <textarea bind:value={draft[field.key]} class="textarea w-full" rows="2" placeholder={field.placeholder}></textarea>
            {:else if field.type === 'number'}
              <input type="number" bind:value={draft[field.key]} min={field.min} max={field.max} required={field.required} class="input w-full" />
            {:else if field.type === 'date'}
              <input type="date" bind:value={draft[field.key]} required={field.required} class="input w-full" />
            {:else if field.type === 'enum'}
              {#if field.widget === 'tag-group'}
                <div class="join flex-wrap">
                  {#each field.options ?? [] as opt (opt)}
                    <button
                      type="button"
                      class="btn btn-sm join-item {draft[field.key] === opt ? 'btn-primary' : 'btn-ghost'}"
                      class:capitalize={field.capitalize}
                      onclick={() => (draft[field.key] = opt)}
                    >{opt}</button>
                  {/each}
                </div>
              {:else}
                <select bind:value={draft[field.key]} class="select w-full">
                  {#each field.options ?? [] as opt (opt)}<option value={opt}>{opt}</option>{/each}
                </select>
              {/if}
            {:else if field.type === 'source'}
              <select bind:value={draft[field.key]} required={field.required} class="select w-full">
                <option value="" disabled>Choose a source…</option>
                {#each sources as s (s.id)}<option value={s.id}>{s.name}</option>{/each}
              </select>
            {:else if field.type === 'flag'}
              <div class="space-y-2">
                {#if draft[field.key]}
                  <div class="flex items-center gap-3">
                    <NationFlag flag={draft[field.key]} size="md" />
                    <span class="font-mono text-xs opacity-60">{draft[field.key]}</span>
                  </div>
                {/if}
                <label class="flex cursor-pointer items-center gap-2">
                  <span class="btn btn-outline btn-sm">
                    {flagUploading ? 'Uploading…' : draft[field.key] ? 'Replace SVG…' : 'Upload SVG…'}
                  </span>
                  <input
                    type="file"
                    accept=".svg"
                    class="hidden"
                    disabled={flagUploading}
                    onchange={uploadFlag}
                  />
                </label>
                {#if flagUploadError}
                  <p class="text-xs text-error">{flagUploadError}</p>
                {/if}
              </div>
            {:else}
              <input type="text" bind:value={draft[field.key]} required={field.required} placeholder={field.placeholder} class="input w-full" />
            {/if}

            {#if field.help}<span class="mt-1 block text-xs opacity-60">{field.help}</span>{/if}
          </label>
        {/each}

        {#if formError}
          <div class="alert alert-error text-sm" role="alert">{formError}</div>
        {/if}

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" onclick={onclose} disabled={saving}>Cancel</button>
          <button type="submit" class="btn btn-primary" disabled={saving}>
            {#if saving}<span class="loading loading-spinner loading-sm"></span>{/if}
            {target.mode === 'edit' ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
    <button class="modal-backdrop" onclick={onclose} aria-label="Close">close</button>
  </div>
{/if}

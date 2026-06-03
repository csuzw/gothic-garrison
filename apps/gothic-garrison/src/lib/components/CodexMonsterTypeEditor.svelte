<script lang="ts">
  import CodexMonsterTypeForm from '$lib/components/CodexMonsterTypeForm.svelte';

  type Row = Record<string, unknown> & { id: string };

  interface Props {
    slug: string;
    sources: { id: string; name: string }[];
    allAttributes: { id: string; name: string; pickScope: string; rules: string | null }[];
    allEquipment: { id: string; name: string; slotCost: number; isSpecial: boolean; rules: string | null }[];
    target: { mode: 'new'; sourceId?: string } | { mode: 'edit'; row: Row } | null;
    onsaved: () => void;
    onclose: () => void;
  }

  let { slug, sources, allAttributes, allEquipment, target, onsaved, onclose }: Props = $props();

  let saving = $state(false);
  let saveError = $state<string | null>(null);

  async function save(body: unknown) {
    saving = true;
    saveError = null;
    try {
      const editingId = target?.mode === 'edit' ? target.row.id : null;
      const url = editingId ? `/api/reference/${slug}/${editingId}` : `/api/reference/${slug}`;
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        saveError = (await res.json().catch(() => ({})))?.message ?? 'Save failed';
        return;
      }
      onclose();
      onsaved();
    } catch {
      saveError = 'Save failed — could not reach the API.';
    } finally {
      saving = false;
    }
  }
</script>

{#if target !== null}
  <CodexMonsterTypeForm
    mode={target.mode}
    row={target.mode === 'edit' ? target.row : (target.sourceId ? ({ sourceId: target.sourceId } as any) : undefined)}
    {sources}
    {allAttributes}
    {allEquipment}
    {saving}
    error={saveError}
    onsave={save}
    oncancel={onclose}
  />
{/if}

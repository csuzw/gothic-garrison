<script lang="ts">
  import { randomName } from '$lib/names.js';

  let { nation, soldierType = null, onroll }: {
    nation: string | null;
    soldierType?: string | null;
    onroll: (name: string) => void;
  } = $props();
</script>

<div class="flex gap-1 shrink-0">
  <button
    type="button"
    class="btn btn-sm btn-outline btn-info text-lg"
    title="Random male name"
    onclick={() => onroll(randomName(nation, 'male', soldierType))}
  >♂</button>
  <button
    type="button"
    class="btn btn-sm btn-outline btn-error text-lg"
    title="Random female name"
    onclick={() => onroll(randomName(nation, 'female', soldierType))}
  >♀</button>
</div>

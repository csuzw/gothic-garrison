<script lang="ts">
  let { label, rules }: { label: string; rules: string } = $props();
  let open = $state(false);
</script>

<button
  type="button"
  class="btn btn-ghost btn-xs shrink-0 opacity-40 hover:opacity-80"
  onclick={() => (open = !open)}
  aria-label="Rules for {label}"
><span class="text-base leading-none">ⓘ</span></button>

{#if open}
  <div role="presentation" class="fixed inset-0 z-40" onclick={() => (open = false)}></div>
  <div class="fixed left-1/2 top-24 z-50 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-box border border-base-300 bg-base-100 p-3 shadow-xl">
    <p class="mb-1.5 text-sm font-semibold">{label}</p>
    <p class="text-xs leading-relaxed opacity-70">{rules}</p>
  </div>
{/if}

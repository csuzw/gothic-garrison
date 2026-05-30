<script lang="ts">
  let { flag, name = '', size = 'md' }: { flag: string | null; name?: string; size?: 'sm' | 'md' } = $props();
  const isImage = $derived(flag ? flag.includes('/') : false);
  const imgClass = $derived(size === 'sm' ? 'h-3.5 w-auto' : 'h-5 w-auto');
</script>

{#if flag}
  {#if isImage}
    <img src={flag} alt="{name} flag" class="{imgClass} inline-block shrink-0 object-contain" />
  {:else}
    <span class="shrink-0 leading-none" aria-label="{name} flag">{flag}</span>
  {/if}
{/if}

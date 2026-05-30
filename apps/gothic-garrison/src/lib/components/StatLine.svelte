<script lang="ts">
  import type { SoldierStats } from '$lib/unit/types';

  let { stats, baseStats }: { stats: SoldierStats; baseStats?: SoldierStats } = $props();

  const fmtMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
  const fmt = (n: number, mod: boolean) => (mod ? fmtMod(n) : `${n}`);
  const deltaClass = (delta: number) =>
    delta > 0 ? 'text-success' : delta < 0 ? 'text-error' : 'opacity-60';

  // Speed, Defence, Health are absolute values; Melee, Accuracy, Courage are dice modifiers.
  const cols = $derived([
    { label: 'Speed',    short: 'Spd', value: stats.speed,    mod: false, delta: baseStats ? stats.speed    - baseStats.speed    : 0 },
    { label: 'Melee',   short: 'Mel', value: stats.melee,    mod: true,  delta: baseStats ? stats.melee    - baseStats.melee    : 0 },
    { label: 'Accuracy',short: 'Acc', value: stats.accuracy, mod: true,  delta: baseStats ? stats.accuracy - baseStats.accuracy : 0 },
    { label: 'Defence', short: 'Def', value: stats.defence,  mod: false, delta: baseStats ? stats.defence  - baseStats.defence  : 0 },
    { label: 'Courage', short: 'Cou', value: stats.courage,  mod: true,  delta: baseStats ? stats.courage  - baseStats.courage  : 0 },
    { label: 'Health',  short: 'Hp',  value: stats.health,   mod: false, delta: baseStats ? stats.health   - baseStats.health   : 0 },
  ]);
</script>

<!-- Mobile: flex row with even gaps (abbreviated labels) -->
<div class="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:hidden">
  {#each cols as c}
    <span class={deltaClass(c.delta)}>{c.short} {fmt(c.value, c.mod)}</span>
  {/each}
</div>

<!-- Desktop: two-row table with full stat names -->
<table class="hidden text-xs sm:table">
  <thead>
    <tr>
      {#each cols as c}
        <th class="pb-0.5 pr-4 text-left font-normal opacity-60">{c.label}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    <tr>
      {#each cols as c}
        <td class="pr-4 {deltaClass(c.delta)}">{fmt(c.value, c.mod)}</td>
      {/each}
    </tr>
  </tbody>
</table>

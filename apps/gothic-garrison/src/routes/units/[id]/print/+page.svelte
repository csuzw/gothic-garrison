<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import type { PageProps } from './$types';
  import NationFlag from '$lib/components/NationFlag.svelte';
  import { getUnitStore } from '$lib/unit/store';
  import {
    normalizeUnitDoc,
    officerStats,
    unitBudget,
    unitSpent,
    memberPurchasedCost,
    STAT_META,
    type UnitDoc,
    type EquipmentSnapshot,
    type AttributeSnapshot,
  } from '$lib/unit/types';

  let { data }: PageProps = $props();

  const signedIn = $derived(!!page.data.user);
  const id = $derived(page.params.id!);

  let doc = $state<UnitDoc | null>(null);
  let loading = $state(true);
  let notFound = $state(false);

  onMount(async () => {
    try {
      const found = await getUnitStore(signedIn).get(id);
      if (found) doc = normalizeUnitDoc(found);
      else notFound = true;
    } finally {
      loading = false;
    }
  });

  const budget = $derived(doc ? unitBudget(doc) : 0);
  const spent = $derived(doc ? unitSpent(doc) : 0);
  const officerStatLine = $derived(doc ? officerStats(doc.officer) : null);
  const equipById = $derived(new Map(data.reference.equipment.map((e) => [e.id, e])));
  const soldierRef = (typeId: string | null) => data.reference.soldiers.find((s) => s.id === typeId);

  let showRules = $state(true);

  const allAttributeRules = $derived.by(() => {
    if (!doc) return [];
    const map = new Map<string, string>();
    const add = (name: string, rules: string | null | undefined) => {
      if (rules && !map.has(name)) map.set(name, rules);
    };
    for (const a of doc.officer.attributes) {
      add(a.name, data.reference.attributes.find((r) => r.id === a.id)?.rules);
    }
    for (const m of doc.members) {
      const ref = soldierRef(m.soldierTypeId);
      for (const a of ref?.fixedAttributes ?? []) add(a.name, a.rules);
      for (const a of m.attributes) {
        add(a.name, data.reference.attributes.find((r) => r.id === a.id)?.rules);
      }
      for (const a of m.purchasedAttributes ?? []) {
        add(a.name, data.reference.attributes.find((r) => r.id === a.id)?.rules);
      }
    }
    return [...map.entries()].map(([name, rules]) => ({ name, rules })).sort((a, b) => a.name.localeCompare(b.name));
  });

  const allEquipmentRules = $derived.by(() => {
    if (!doc) return [];
    const map = new Map<string, string>();
    const add = (name: string, itemId: string) => {
      const rules = equipById.get(itemId)?.rules;
      if (rules && !map.has(name)) map.set(name, rules);
    };
    for (const it of doc.officer.equipment) add(it.name, it.itemId);
    for (const m of doc.members) {
      for (const it of m.equipment) add(it.name, it.itemId);
      for (const it of m.specialEquipment) add(it.name, it.itemId);
    }
    return [...map.entries()].map(([name, rules]) => ({ name, rules })).sort((a, b) => a.name.localeCompare(b.name));
  });

  function fmtStat(value: number, mod: boolean): string {
    if (mod) return value >= 0 ? `+${value}` : `${value}`;
    return `${value}`;
  }

  function fmtEquipment(items: EquipmentSnapshot[]): string {
    return items.map((it) => (it.quantity > 1 ? `${it.quantity}× ${it.name}` : it.name)).join(', ');
  }

  function fmtAttributes(attrs: AttributeSnapshot[]): string {
    return attrs.map((a) => a.name).join(', ');
  }
</script>

<svelte:head><title>{doc ? `${doc.name} · Print` : 'Print'} · Gothic Garrison</title></svelte:head>

<style>
  /* Screen: use daisyUI base-200 (set via bg-base-200 class in markup) */
  /* Print: force a light grey with black text so headers are legible */
  @media print {
    .card-header {
      background-color: #d1d5db !important;
      color: #000000 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* Regular cell values (stats, attribute/equipment text) */
    table td {
      color: #6b7280 !important;
    }
    /* "Attributes:" / "Equipment:" labels — same black as headers */
    .cell-label {
      color: #000000 !important;
    }
    .cards-grid {
      grid-template-columns: 1fr !important;
    }
    .no-print {
      display: none !important;
    }
  }
</style>

{#if loading}
  <div class="flex justify-center py-10"><span class="loading loading-spinner"></span></div>
{:else if notFound}
  <div class="py-10 text-center opacity-70">Unit not found.</div>
{:else if doc}
  <div class="no-print mb-6 flex items-center gap-3">
    <a href="/units/{id}" class="link link-hover text-sm opacity-70">← Back to builder</a>
    <div class="ml-auto flex items-center gap-3">
      {#if doc.nationName}
        {@const nat = data.reference.nations.find((n) => n.id === doc!.nationId)}
        <span class="flex items-center gap-1.5 text-sm opacity-70">
          <NationFlag flag={nat?.flag ?? null} name={doc.nationName} />
          {doc.nationName}
        </span>
      {/if}
      <span class="text-sm opacity-60">{spent} / {budget} pts · {doc.members.length} soldier{doc.members.length !== 1 ? 's' : ''}</span>
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" class="checkbox checkbox-sm" bind:checked={showRules} />
        Rules reference
      </label>
      <button class="btn btn-primary btn-sm" onclick={() => window.print()}>Print / Save PDF</button>
    </div>
  </div>

  <h1 class="no-print mb-4 text-xl font-bold">{doc.name}</h1>

  <div class="cards-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

    <!-- Officer card -->
    {#if officerStatLine}
      <table class="w-full border-collapse text-xs print:break-inside-avoid">
        <tbody>
          <tr>
            <th colspan="4" class="card-header bg-base-200 border border-black px-2 py-1 text-center uppercase tracking-widest font-normal">Name</th>
            <th class="card-header bg-base-200 border border-black px-2 py-1 text-center uppercase tracking-widest font-normal">Type</th>
            <th class="card-header bg-base-200 border border-black px-2 py-1 text-center uppercase tracking-widest font-normal">Tier</th>
            <th class="card-header bg-base-200 border border-black px-2 py-1 text-center uppercase tracking-widest font-normal">XP</th>
          </tr>
          <tr>
            <td colspan="4" class="border border-black h-8 px-2 align-middle">{doc.officer.name || ''}</td>
            <td class="border border-black h-8 px-2 align-middle">Officer</td>
            <td class="border border-black h-8"></td>
            <td class="border border-black h-8"></td>
          </tr>
          <tr>
            {#each STAT_META as m}
              <th class="card-header bg-base-200 border border-black px-1 py-1 text-center font-normal">{m.label}</th>
            {/each}
            <th class="card-header bg-base-200 border border-black px-1 py-1 text-center font-normal">Recruitment</th>
          </tr>
          <tr>
            {#each STAT_META as m}
              <td class="border border-black h-8 text-center align-middle">{fmtStat(officerStatLine[m.key], m.mod)}</td>
            {/each}
            <td class="border border-black h-8 text-center align-middle">{budget}</td>
          </tr>
          <tr>
            <td colspan="7" class="border border-black px-2 py-1">
              <span class="cell-label font-semibold">Attributes:</span> {fmtAttributes(doc.officer.attributes)}
            </td>
          </tr>
          <tr>
            <td colspan="7" class="border border-black px-2 py-1">
              <span class="cell-label font-semibold">Equipment:</span> {fmtEquipment(doc.officer.equipment)}
            </td>
          </tr>
        </tbody>
      </table>
    {/if}

    <!-- Soldier cards -->
    {#each doc.members as m (m.id)}
      {@const ref = soldierRef(m.soldierTypeId)}
      {@const allAttrStr = [...(ref?.fixedAttributes ?? []).map((a) => a.name), ...m.attributes.map((a) => a.name), ...(m.purchasedAttributes ?? []).map((a) => a.name)].join(', ')}
      {@const allEquip = [...m.equipment, ...m.specialEquipment]}
      <table class="w-full border-collapse text-xs print:break-inside-avoid">
        <tbody>
          <tr>
            <th colspan="4" class="card-header bg-base-200 border border-black px-2 py-1 text-center uppercase tracking-widest font-normal">Name</th>
            <th class="card-header bg-base-200 border border-black px-2 py-1 text-center uppercase tracking-widest font-normal">Type</th>
            <th class="card-header bg-base-200 border border-black px-2 py-1 text-center uppercase tracking-widest font-normal">Tier</th>
            <th class="card-header bg-base-200 border border-black px-2 py-1 text-center uppercase tracking-widest font-normal">XP</th>
          </tr>
          <tr>
            <td colspan="4" class="border border-black h-8 px-2 align-middle">{m.customName || ''}</td>
            <td class="border border-black h-8 px-2 align-middle">{m.name}</td>
            <td class="border border-black h-8"></td>
            <td class="border border-black h-8"></td>
          </tr>
          <tr>
            {#each STAT_META as meta}
              <th class="card-header bg-base-200 border border-black px-1 py-1 text-center font-normal">{meta.label}</th>
            {/each}
            <th class="card-header bg-base-200 border border-black px-1 py-1 text-center font-normal">Recruitment</th>
          </tr>
          <tr>
            {#if m.stats}
              {#each STAT_META as meta}
                <td class="border border-black h-8 text-center align-middle">{fmtStat(m.stats[meta.key], meta.mod)}</td>
              {/each}
            {:else}
              {#each STAT_META as _}<td class="border border-black h-8"></td>{/each}
            {/if}
            <td class="border border-black h-8 text-center align-middle">{m.cost + memberPurchasedCost(m)}</td>
          </tr>
          <tr>
            <td colspan="7" class="border border-black px-2 py-1">
              <span class="cell-label font-semibold">Attributes:</span> {allAttrStr}
            </td>
          </tr>
          <tr>
            <td colspan="7" class="border border-black px-2 py-1">
              <span class="cell-label font-semibold">Equipment:</span> {fmtEquipment(allEquip)}
            </td>
          </tr>
        </tbody>
      </table>
    {/each}

  </div>

  {#if showRules && (allAttributeRules.length > 0 || allEquipmentRules.length > 0)}
    <!-- Forced page break before reference tables -->
    <div class="break-before-page"></div>

    <div class="space-y-6">
      {#if allAttributeRules.length > 0}
        <div>
          <h2 class="no-print mb-2 text-base font-semibold">Attributes</h2>
          <table class="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th class="card-header bg-base-200 border border-black px-2 py-1 text-left font-normal uppercase tracking-widest w-1/4">Attribute</th>
                <th class="card-header bg-base-200 border border-black px-2 py-1 text-left font-normal uppercase tracking-widest">Rules</th>
              </tr>
            </thead>
            <tbody>
              {#each allAttributeRules as a}
                <tr>
                  <td class="border border-black px-2 py-1 align-top font-semibold cell-label">{a.name}</td>
                  <td class="border border-black px-2 py-1 align-top">{a.rules}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      {#if allEquipmentRules.length > 0}
        <div>
          <h2 class="no-print mb-2 text-base font-semibold">Equipment</h2>
          <table class="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th class="card-header bg-base-200 border border-black px-2 py-1 text-left font-normal uppercase tracking-widest w-1/4">Item</th>
                <th class="card-header bg-base-200 border border-black px-2 py-1 text-left font-normal uppercase tracking-widest">Rules</th>
              </tr>
            </thead>
            <tbody>
              {#each allEquipmentRules as e}
                <tr>
                  <td class="border border-black px-2 py-1 align-top font-semibold cell-label">{e.name}</td>
                  <td class="border border-black px-2 py-1 align-top">{e.rules}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}

{/if}

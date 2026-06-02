<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { PageProps } from './$types';
  import AttributePicker from '$lib/components/AttributePicker.svelte';
  import EquipmentBrowser from '$lib/components/EquipmentBrowser.svelte';
  import NationFlag from '$lib/components/NationFlag.svelte';
  import SoldierStatPopover from '$lib/components/SoldierStatPopover.svelte';
  import StatLine from '$lib/components/StatLine.svelte';
  import { getUnitStore, getUnitById, indexedDbStore, type UnitSource } from '$lib/unit/store';
  import {
    unitBudget,
    unitSpent,
    officerSpecialMax,
    soldierSpecialMax,
    memberSpecialPicks,
    specialUsed,
    normalizeUnitDoc,
    officerStats,
    OFFICER_BASE_STATS,
    MAX_SOLDIERS,
    OFFICER_EQUIPMENT_SLOTS,
    OFFICER_ATTRIBUTE_PICKS,
    OUTSIDE_NATION_RULE_CODE,
    OUTSIDE_NATION_SOLDIER_COST,
    type UnitDoc,
    type AttributeSnapshot,
    type EquipmentSnapshot,
    type MemberSnapshot,
  } from '$lib/unit/types';

  let { data }: PageProps = $props();

  const signedIn = $derived(!!page.data.user);
  const id = $derived(page.params.id!);

  let doc = $state<UnitDoc | null>(null);
  let loading = $state(true);
  let notFound = $state(false);
  let saving = $state(false);
  let saved = $state(false);
  let error = $state<string | null>(null);
  let printConfirming = $state(false);
  let savedSnapshot = '';
  let unitSource = $state<UnitSource>('local');
  let isOnline = $state(true);

  onMount(() => {
    isOnline = navigator.onLine;
    const handleOnline = () => { isOnline = true; };
    const handleOffline = () => { isOnline = false; };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load the unit asynchronously without blocking the cleanup return.
    (async () => {
      try {
        const result = await getUnitById(id, signedIn);
        unitSource = result.source;
        if (result.doc) {
          doc = normalizeUnitDoc(result.doc);
          savedSnapshot = JSON.stringify(doc);
        } else notFound = true;
      } catch (e) {
        error = (e as Error).message;
      } finally {
        loading = false;
      }
    })();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  // Server-stored units are read-only when offline — saves would fail anyway.
  const saveReadOnly = $derived(!isOnline && unitSource === 'server');
  // Offline-created (local) units always use IndexedDB; server units use the server store.
  const activeStore = $derived(unitSource === 'local' ? indexedDbStore : getUnitStore(signedIn));

  const budget = $derived(doc ? unitBudget(doc) : 0);
  const spent = $derived(doc ? unitSpent(doc) : 0);
  const overBudget = $derived(spent > budget);
  const officerStatLine = $derived(doc ? officerStats(doc.officer) : null);

  const nationId = $derived(doc?.nationId ?? null);
  const members = $derived(doc?.members ?? []);
  const rosterFull = $derived(members.length >= MAX_SOLDIERS);

  let soldierPickerCollapsed = $state(false);
  let _soldierPickerAutoInit = false;
  $effect(() => {
    if (!_soldierPickerAutoInit && doc !== null) {
      _soldierPickerAutoInit = true;
      soldierPickerCollapsed = members.length > 0;
    }
  });

  const memberTypeCounts = $derived(
    [...members.reduce((map, m) => {
      const key = m.soldierTypeId ?? m.id;
      const existing = map.get(key);
      if (existing) existing.count++;
      else map.set(key, { name: m.name, count: 1 });
      return map;
    }, new Map<string, { name: string; count: number }>()).values()]
  );

  function sourceEnabled(sourceCode: string): boolean {
    return doc?.enabledSourceCodes == null || doc.enabledSourceCodes.includes(sourceCode);
  }

  const officerPool = $derived(data.reference.attributes.filter((a) => a.isOfficer && sourceEnabled(a.sourceCode)));
  const equipCatalog = $derived(data.reference.equipment.filter((e) => sourceEnabled(e.sourceCode)));
  const equipById = $derived(new Map(equipCatalog.map((e) => [e.id, e])));
  const specialCatalog = $derived(equipCatalog.filter((e) => e.isSpecial));
  const soldierRef = (typeId: string | null) => data.reference.soldiers.find((s) => s.id === typeId);

  const available = $derived(
    nationId === null
      ? []
      : data.reference.soldiers.filter((s) => s.nationIds.includes(nationId!) && sourceEnabled(s.sourceCode)),
  );
  const addable = $derived(
    available.filter((s) => {
      if (s.maxPerUnit == null) return true;
      return members.filter((m) => m.soldierTypeId === s.id).length < s.maxPerUnit;
    }),
  );

  const hasOutsideNationRule = $derived(doc?.optionalRules.includes(OUTSIDE_NATION_RULE_CODE) ?? false);
  const outsideNationMember = $derived(members.find((m) => m.isOutsideNationPick) ?? null);
  const outsideNationAvailable = $derived(
    hasOutsideNationRule && nationId !== null
      ? data.reference.soldiers.filter(
          (s) => !s.nationIds.includes(nationId!) && sourceEnabled(s.sourceCode),
        )
      : [],
  );

  // ── attributes ────────────────────────────────────────────────────────────
  function toggleAttr(list: AttributeSnapshot[], attrId: string, name: string, max: number) {
    const i = list.findIndex((a) => a.id === attrId);
    if (i >= 0) list.splice(i, 1);
    else if (list.length < max) list.push({ id: attrId, name });
  }

  // ── equipment ───────────────────────────────────────────────────────────────
  function snapshotItems(items: EquipmentSnapshot[]): EquipmentSnapshot[] {
    return items.map((it) => ({ ...it }));
  }
  function toggleMemberSpecial(m: UnitDoc['members'][number], item: { id: string; name: string; slotCost: number; isSpecial: boolean }, max: number) {
    const i = m.specialEquipment.findIndex((e) => e.itemId === item.id);
    if (i >= 0) m.specialEquipment.splice(i, 1);
    else if (m.specialEquipment.length < max) m.specialEquipment.push({ itemId: item.id, name: item.name, slotCost: item.slotCost, isSpecial: true, quantity: 1 });
  }

  function selectLoadout(m: UnitDoc['members'][number], loadoutId: string) {
    const ref = soldierRef(m.soldierTypeId);
    const lo = ref?.loadouts.find((l) => l.id === loadoutId);
    m.loadoutId = loadoutId;
    m.equipment = lo ? snapshotItems(lo.items) : [];
  }

  function addSoldierInline(s: (typeof available)[number], outsideNation = false) {
    if (!doc || rosterFull) return;
    const member: MemberSnapshot = {
      id: crypto.randomUUID(),
      soldierTypeId: s.id,
      name: s.name,
      cost: s.recruitmentCost + (outsideNation ? OUTSIDE_NATION_SOLDIER_COST : 0),
      ...(outsideNation && { isOutsideNationPick: true }),
      stats: s.stats,
      attributes: [],
      equipment: [],
      specialEquipment: [],
      loadoutId: null,
    };
    const first = s.loadouts[0];
    if (first && s.equipmentMode === 'fixed') member.equipment = snapshotItems(first.items);
    else if (first && s.equipmentMode === 'choice') {
      member.loadoutId = first.id;
      member.equipment = snapshotItems(first.items);
    }
    doc.members.push(member);
  }

  function removeSoldierFromTile(typeId: string) {
    if (!doc) return;
    const member = doc.members.findLast((m) => m.soldierTypeId === typeId);
    if (member) removeMember(member.id);
  }

  function removeMember(memberId: string) {
    if (!doc) return;
    doc.members = doc.members.filter((m) => m.id !== memberId);
  }

  function validateBeforeSave(d: UnitDoc): string | null {
    const offMax = officerSpecialMax(d.officer);
    if (specialUsed(d.officer.equipment) > offMax) {
      return `Officer has more special equipment than allowed (max ${offMax}). Add Supernatural Veteran or unequip a special item.`;
    }
    for (const m of d.members) {
      const ref = soldierRef(m.soldierTypeId);
      if (!ref) continue;
      const max = ref.equipmentMode === 'pool'
        ? soldierSpecialMax(m, ref.specialSlots ?? 2, ref.fixedAttributes)
        : memberSpecialPicks(m, ref.fixedAttributes);
      const used = ref.equipmentMode === 'pool'
        ? specialUsed(m.equipment)
        : m.specialEquipment.length;
      if (used > max) {
        const who = m.customName ? `${m.name} (${m.customName})` : m.name;
        return `${who} has more special equipment than allowed (max ${max}). Add Supernatural Veteran or unequip a special item.`;
      }
    }
    return null;
  }

  async function save() {
    if (!doc || saveReadOnly) return;
    const validationError = validateBeforeSave(doc);
    if (validationError) {
      error = validationError;
      return;
    }
    saving = true;
    error = null;
    try {
      doc = await activeStore.save(doc);
      savedSnapshot = JSON.stringify(doc);
      saved = true;
      setTimeout(() => (saved = false), 2000);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      saving = false;
    }
  }

  async function handlePrint() {
    if (!doc) return;
    if (JSON.stringify(doc) !== savedSnapshot) {
      printConfirming = true;
      return;
    }
    await goto(`/units/${id}/print`);
  }

  async function saveAndPrint() {
    if (!doc || saveReadOnly) return;
    const validationError = validateBeforeSave(doc);
    if (validationError) {
      error = validationError;
      printConfirming = false;
      return;
    }
    saving = true;
    error = null;
    try {
      doc = await activeStore.save(doc);
      savedSnapshot = JSON.stringify(doc);
      saved = true;
      setTimeout(() => (saved = false), 2000);
      printConfirming = false;
      await goto(`/units/${id}/print`);
    } catch (e) {
      error = (e as Error).message;
      printConfirming = false;
    } finally {
      saving = false;
    }
  }

  function discardAndPrint() {
    printConfirming = false;
    goto(`/units/${id}/print`);
  }

  async function remove() {
    if (!doc || saveReadOnly || !confirm('Delete this unit? This cannot be undone.')) return;
    try {
      await activeStore.remove(id);
      await goto('/');
    } catch (e) {
      error = (e as Error).message;
    }
  }
</script>

<svelte:head><title>{doc ? doc.name : 'Unit'} · Gothic Garrison</title></svelte:head>

{#if loading}
  <div class="flex justify-center py-10"><span class="loading loading-spinner"></span></div>
{:else if notFound}
  <div class="mx-auto max-w-md text-center">
    <p class="opacity-70">That unit couldn't be found.</p>
    <a href="/" class="link link-primary">Back to your units</a>
  </div>
{:else if doc}
  <section class="mx-auto max-w-2xl space-y-6">
    <div class="sticky top-0 z-20 flex items-center justify-between gap-3 bg-base-100 py-3 shadow-sm">
      <a href="/" class="link link-hover text-sm opacity-70">← Units</a>
      {#if !soldierPickerCollapsed}
        <span class="text-xs tabular-nums opacity-60" class:text-error={overBudget}>
          {members.length}/{MAX_SOLDIERS} · {budget - spent} pts left
        </span>
      {/if}
      <div class="flex items-center gap-2">
        {#if saved}
          <span class="text-success text-sm">Saved ✓</span>
        {:else if saveReadOnly}
          <span class="text-xs opacity-50">Offline</span>
        {/if}
        <button class="btn btn-primary btn-sm" onclick={save} disabled={saving || saveReadOnly}>
          {#if saving}<span class="loading loading-spinner loading-xs"></span>{/if}
          Save
        </button>
        <button class="btn btn-ghost btn-sm" onclick={handlePrint}>Print</button>
      </div>
    </div>

    {#if error}<div class="alert alert-error text-sm" role="alert">{error}</div>{/if}

    <div>
      <span class="mb-1 block text-sm font-medium">Nation</span>
      {#if doc.nationName}
        {@const nat = data.reference.nations.find((n) => n.id === doc!.nationId)}
        <div class="flex items-center gap-2 rounded-box bg-base-200 px-3 py-2.5">
          <NationFlag flag={nat?.flag ?? null} name={doc.nationName} />
          <span class="text-sm">{doc.nationName}</span>
        </div>
      {:else}
        <div class="rounded-box bg-base-200 px-3 py-2.5 text-sm opacity-50">No nation set</div>
      {/if}
      {#if doc.enabledSourceCodes !== null}
        {@const activeSupplements = data.reference.sources.filter(
          (s) => s.kind === 'supplement' && doc!.enabledSourceCodes!.includes(s.code),
        )}
        <p class="mt-1 text-xs opacity-50">
          {activeSupplements.length === 0 ? 'Core only' : `Supplements: ${activeSupplements.map((s) => s.name).join(', ')}`}
        </p>
      {/if}
    </div>

    <label class="block">
      <span class="mb-1 block text-sm font-medium">Unit name</span>
      <input type="text" bind:value={doc.name} class="input w-full" placeholder="The Night Watch" />
    </label>

    <div class="stats bg-base-200 w-full border border-primary">
      <div class="stat">
        <div class="stat-title">Recruitment</div>
        <div class="stat-value text-2xl" class:text-error={overBudget}>{spent} / {budget}</div>
        <div class="stat-desc">
          pts spent
          {#if doc.officer.commandStyle === 'recruitment'}· +5 from Command Style{/if}
          {#if overBudget}· over budget{/if}
        </div>
      </div>
    </div>

    <!-- Officer -->
    <div class="card bg-base-200">
      <div class="card-body gap-4">
        <h2 class="card-title text-base">Officer <span class="badge badge-ghost">Leader · free</span></h2>

        <label class="block">
          <span class="mb-1 block text-sm font-medium">Name</span>
          <input type="text" bind:value={doc.officer.name} class="input w-full" placeholder="Capitaine Renaud" />
        </label>

        <details>
          <summary class="cursor-pointer text-xs opacity-60 select-none">Bio / notes</summary>
          <textarea
            bind:value={doc.officer.bio}
            class="textarea textarea-sm mt-1 w-full text-sm"
            placeholder="Background, appearance, notes…"
            rows="3"
          ></textarea>
        </details>

        {#if officerStatLine}
          <StatLine stats={officerStatLine} baseStats={OFFICER_BASE_STATS} />
        {/if}

        <div class="grid gap-3 sm:grid-cols-3">
          <div>
            <span class="mb-1 block text-xs font-medium opacity-70">Combat Training</span>
            <div class="join">
              <input type="radio" class="join-item btn btn-xs" name="combat" aria-label="+1 Melee" value="melee" bind:group={doc.officer.combatTraining} />
              <input type="radio" class="join-item btn btn-xs" name="combat" aria-label="+1 Accuracy" value="accuracy" bind:group={doc.officer.combatTraining} />
            </div>
          </div>
          <div>
            <span class="mb-1 block text-xs font-medium opacity-70">Physical Edge</span>
            <div class="join">
              <input type="radio" class="join-item btn btn-xs" name="physical" aria-label="+1 Health" value="health" bind:group={doc.officer.physicalEdge} />
              <input type="radio" class="join-item btn btn-xs" name="physical" aria-label="+1 Speed" value="speed" bind:group={doc.officer.physicalEdge} />
            </div>
          </div>
          <div>
            <span class="mb-1 block text-xs font-medium opacity-70">Command Style</span>
            <div class="join">
              <input type="radio" class="join-item btn btn-xs" name="command" aria-label="+1 Courage" value="courage" bind:group={doc.officer.commandStyle} />
              <input type="radio" class="join-item btn btn-xs" name="command" aria-label="+5 Recruitment" value="recruitment" bind:group={doc.officer.commandStyle} />
            </div>
          </div>
        </div>

        <div>
          <span class="mb-1 block text-sm font-medium">Attributes</span>
          <AttributePicker
            pool={officerPool}
            selected={doc.officer.attributes}
            max={OFFICER_ATTRIBUTE_PICKS}
            onToggle={(aid, name) => toggleAttr(doc!.officer.attributes, aid, name, OFFICER_ATTRIBUTE_PICKS)}
          />
        </div>
        <div>
          <span class="mb-1 block text-sm font-medium">Equipment</span>
          <EquipmentBrowser
            catalog={equipCatalog}
            items={doc.officer.equipment}
            slots={OFFICER_EQUIPMENT_SLOTS}
            specialMax={officerSpecialMax(doc.officer)}
            onChange={(newItems) => { doc!.officer.equipment = newItems; }}
          />
        </div>
      </div>
    </div>

    <!-- Soldiers -->
    <div class="card bg-base-200">
      <div class="card-body gap-4">
        <h2 class="card-title text-base">
          Soldiers <span class="badge badge-ghost">{members.length} / {MAX_SOLDIERS}</span>
        </h2>

        {#if !doc.nationId}
          <p class="text-sm opacity-60">Pick a nation to choose soldiers.</p>
        {:else}
          {#snippet soldierTags()}
            {#each memberTypeCounts as t (t.name)}
              <span class="badge badge-sm">{t.count > 1 ? `${t.count}× ` : ''}{t.name}</span>
            {/each}
          {/snippet}

          {#if soldierPickerCollapsed}
            <div class="flex items-start gap-2">
              <div class="flex min-w-0 flex-1 flex-wrap gap-1">
                {#if members.length > 0}
                  {@render soldierTags()}
                {:else}
                  <span class="text-xs opacity-40">No soldiers yet</span>
                {/if}
              </div>
              <button class="btn btn-ghost btn-xs shrink-0" onclick={() => (soldierPickerCollapsed = false)}>Edit</button>
            </div>
          {:else}
            <div class="space-y-1">
              {#each available as s (s.id)}
                {@const count = members.filter((m) => m.soldierTypeId === s.id).length}
                {@const atCap = s.maxPerUnit != null && count >= s.maxPerUnit}
                {@const cantAdd = rosterFull || atCap || spent + s.recruitmentCost > budget}
                <div class="bg-base-100 flex items-center gap-2 rounded px-3 py-2">
                  <div class="min-w-0 flex-1">
                    <span class="text-sm font-medium">{s.name}</span>
                    {#if s.maxPerUnit != null}
                      <span class="ml-1 text-xs opacity-40">max {s.maxPerUnit}</span>
                    {/if}
                  </div>
                  <SoldierStatPopover soldier={s} />
                  <span class="badge badge-ghost badge-sm w-14 shrink-0 justify-center tabular-nums">{s.recruitmentCost} pts</span>
                  {#if count > 0}
                    <button
                      class="btn btn-ghost btn-xs shrink-0"
                      onclick={() => removeSoldierFromTile(s.id)}
                      aria-label="Remove one {s.name}"
                    >−</button>
                    <span class="w-4 text-center text-sm font-medium tabular-nums">{count}</span>
                  {:else}
                    <span class="w-12"></span>
                  {/if}
                  <button
                    class="btn btn-xs shrink-0 {count > 0 ? 'btn-primary' : 'btn-outline'}"
                    onclick={() => addSoldierInline(s)}
                    disabled={cantAdd}
                    aria-label="Add {s.name}"
                  >+</button>
                </div>
              {/each}
            </div>
            {#if hasOutsideNationRule}
              <div class="mt-2 space-y-1">
                <p class="text-xs font-medium opacity-60">
                  Outside-nation recruit
                  <span class="badge badge-xs badge-ghost">+{OUTSIDE_NATION_SOLDIER_COST} pts</span>
                  {#if outsideNationMember}<span class="badge badge-xs badge-warning">{outsideNationMember.name}</span>{/if}
                </p>
                {#if outsideNationMember}
                  <div class="bg-base-100 flex items-center gap-2 rounded px-3 py-2 ring-1 ring-warning/30">
                    <span class="min-w-0 flex-1 text-sm font-medium">{outsideNationMember.name}</span>
                    <span class="badge badge-warning badge-sm shrink-0 tabular-nums">{outsideNationMember.cost} pts</span>
                    <button
                      class="btn btn-ghost btn-xs shrink-0"
                      onclick={() => removeMember(outsideNationMember!.id)}
                      aria-label="Remove outside-nation soldier"
                    >−</button>
                  </div>
                {:else}
                  {#each outsideNationAvailable as s (s.id)}
                    {@const cantAdd = rosterFull || spent + s.recruitmentCost + OUTSIDE_NATION_SOLDIER_COST > budget}
                    <div class="bg-base-100 flex items-center gap-2 rounded px-3 py-2">
                      <div class="min-w-0 flex-1">
                        <span class="text-sm font-medium">{s.name}</span>
                        {#if s.maxPerUnit != null}
                          <span class="ml-1 text-xs opacity-40">max {s.maxPerUnit}</span>
                        {/if}
                      </div>
                      <SoldierStatPopover soldier={s} />
                      <span class="badge badge-ghost badge-sm w-20 shrink-0 justify-center tabular-nums">{s.recruitmentCost}+{OUTSIDE_NATION_SOLDIER_COST} pts</span>
                      <span class="w-12"></span>
                      <button
                        class="btn btn-xs btn-outline shrink-0"
                        onclick={() => addSoldierInline(s, true)}
                        disabled={cantAdd}
                        aria-label="Recruit {s.name} (outside nation)"
                      >+</button>
                    </div>
                  {/each}
                {/if}
              </div>
            {/if}

            <div class="flex flex-wrap items-center gap-1 border-t border-base-300 pt-2">
              {@render soldierTags()}
              {#if members.length === 0}<span class="text-xs opacity-40">No soldiers yet</span>{/if}
              <button class="btn btn-ghost btn-xs ml-auto shrink-0" onclick={() => (soldierPickerCollapsed = true)}>Done</button>
            </div>
          {/if}

          {#if members.length === 0}
            <p class="text-sm opacity-60">No soldiers yet. The Officer leads them for free.</p>
          {:else}
            <ul class="space-y-3">
              {#each members as m (m.id)}
                {@const ref = soldierRef(m.soldierTypeId)}
                <li class="bg-base-100 space-y-2 rounded p-3">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex min-w-0 flex-1 items-center gap-2">
                      <span class="font-medium">{m.name}</span>
                      <span class="badge badge-sm shrink-0">{m.cost} pts</span>
                      {#if m.isOutsideNationPick}
                        <span class="badge badge-warning badge-xs shrink-0">outside nation</span>
                      {/if}
                    </div>
                    <button class="btn btn-ghost btn-xs text-error shrink-0" onclick={() => removeMember(m.id)} aria-label="Remove {m.name}">Remove</button>
                  </div>

                  <input
                    type="text"
                    bind:value={m.customName}
                    class="input input-xs w-full"
                    placeholder="Character name (optional)"
                    aria-label="Character name for {m.name}"
                  />

                  <details>
                    <summary class="cursor-pointer text-xs opacity-60 select-none">Bio / notes</summary>
                    <textarea
                      bind:value={m.bio}
                      class="textarea textarea-sm mt-1 w-full text-sm"
                      placeholder="Background, appearance, notes…"
                      rows="2"
                    ></textarea>
                  </details>

                  {#if m.stats}
                    <StatLine stats={m.stats} />
                  {/if}

                  {#if ref}
                    {#if ref.attributePicks > 0}
                      <AttributePicker
                        pool={officerPool}
                        selected={m.attributes}
                        max={ref.attributePicks}
                        fixed={ref.fixedAttributes}
                        onToggle={(aid, name) => toggleAttr(m.attributes, aid, name, ref.attributePicks)}
                      />
                    {:else if ref.fixedAttributes.length}
                      <div class="flex flex-wrap gap-1">
                        {#each ref.fixedAttributes as a}<span class="badge badge-xs badge-ghost" title={a.rules || a.name}>{a.name}</span>{/each}
                      </div>
                    {/if}

                    <div>
                      <span class="mb-1 block text-xs font-medium opacity-70">Equipment</span>
                      {#if ref.equipmentMode === 'pool'}
                        <EquipmentBrowser
                          catalog={equipCatalog}
                          items={m.equipment}
                          slots={ref.equipmentSlots ?? OFFICER_EQUIPMENT_SLOTS}
                          specialMax={soldierSpecialMax(m, ref.specialSlots ?? 2, ref.fixedAttributes)}
                          onChange={(newItems) => { m.equipment = newItems; }}
                        />
                      {:else if ref.equipmentMode === 'choice'}
                        <div class="join flex-wrap gap-y-1">
                          {#each ref.loadouts as lo (lo.id)}
                            <button
                              type="button"
                              class="btn btn-xs join-item {lo.id === m.loadoutId ? 'btn-primary' : 'btn-outline'}"
                              onclick={() => selectLoadout(m, lo.id)}
                            >{lo.label}</button>
                          {/each}
                        </div>
                      {:else}
                        <div class="flex flex-wrap gap-1">
                          {#each m.equipment as it (it.itemId)}
                            <span class="badge badge-sm" title={equipById.get(it.itemId)?.rules || it.name}>{it.quantity > 1 ? `${it.quantity}× ` : ''}{it.name}</span>
                          {/each}
                        </div>
                      {/if}

                      {#if ref.equipmentMode === 'fixed' || ref.equipmentMode === 'choice'}
                        {@const spMax = memberSpecialPicks(m, ref.fixedAttributes)}
                        <div class="mt-2">
                          <span class="mb-1 block text-xs opacity-60">Special item (pick {spMax})</span>
                          <div class="flex flex-wrap gap-1">
                            {#each specialCatalog as item (item.id)}
                              {@const isSel = m.specialEquipment.some((e) => e.itemId === item.id)}
                              <button
                                type="button"
                                class="btn btn-xs {isSel ? 'btn-primary' : 'btn-outline'}"
                                title={item.rules || item.name}
                                disabled={!isSel && m.specialEquipment.length >= spMax}
                                onclick={() => toggleMemberSpecial(m, item, spMax)}
                              >{item.name}</button>
                            {/each}
                          </div>
                        </div>
                      {/if}
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      </div>
    </div>

  </section>

  {#if printConfirming}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-base-100 rounded-box w-full max-w-sm p-6 shadow-xl">
        <h3 class="mb-1 font-semibold">Unsaved changes</h3>
        <p class="mb-4 text-sm opacity-70">Save before printing, or discard changes?</p>
        <div class="flex flex-wrap justify-end gap-2">
          <button class="btn btn-ghost btn-sm" onclick={() => (printConfirming = false)}>Cancel</button>
          <button class="btn btn-outline btn-sm" onclick={discardAndPrint}>Discard & Print</button>
          <button class="btn btn-primary btn-sm" onclick={saveAndPrint} disabled={saving}>
            {#if saving}<span class="loading loading-spinner loading-xs"></span>{/if}
            Save & Print
          </button>
        </div>
      </div>
    </div>
  {/if}

{/if}

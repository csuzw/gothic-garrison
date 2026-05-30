<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { PageProps } from './$types';
  import AttributePicker from '$lib/components/AttributePicker.svelte';
  import EquipmentBuilder from '$lib/components/EquipmentBuilder.svelte';
  import NationFlag from '$lib/components/NationFlag.svelte';
  import StatLine from '$lib/components/StatLine.svelte';
  import { getUnitStore } from '$lib/unit/store';
  import {
    unitBudget,
    unitSpent,
    officerSpecialMax,
    officerStats,
    OFFICER_BASE_STATS,
    MAX_SOLDIERS,
    OFFICER_EQUIPMENT_SLOTS,
    OFFICER_ATTRIBUTE_PICKS,
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
  let selectedSoldierId = $state('');

  onMount(async () => {
    try {
      const found = await getUnitStore(signedIn).get(id);
      if (found) doc = found;
      else notFound = true;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  });

  const budget = $derived(doc ? unitBudget(doc) : 0);
  const spent = $derived(doc ? unitSpent(doc) : 0);
  const overBudget = $derived(spent > budget);
  const officerStatLine = $derived(doc ? officerStats(doc.officer) : null);

  const nationId = $derived(doc?.nationId ?? null);
  const members = $derived(doc?.members ?? []);
  const rosterFull = $derived(members.length >= MAX_SOLDIERS);

  const officerPool = $derived(data.reference.attributes.filter((a) => a.isOfficer));
  const equipById = $derived(new Map(data.reference.equipment.map((e) => [e.id, e])));
  const specialCatalog = $derived(data.reference.equipment.filter((e) => e.isSpecial));
  const soldierRef = (typeId: string | null) => data.reference.soldiers.find((s) => s.id === typeId);

  const available = $derived(
    nationId === null ? [] : data.reference.soldiers.filter((s) => s.nationIds.includes(nationId!)),
  );
  const addable = $derived(
    available.filter((s) => {
      if (s.maxPerUnit == null) return true;
      return members.filter((m) => m.soldierTypeId === s.id).length < s.maxPerUnit;
    }),
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
  function setMemberSpecial(m: UnitDoc['members'][number], item: { id: string; name: string; slotCost: number; isSpecial: boolean }) {
    m.specialEquipment = { itemId: item.id, name: item.name, slotCost: item.slotCost, isSpecial: true, quantity: 1 };
  }
  function clearMemberSpecial(m: UnitDoc['members'][number]) {
    m.specialEquipment = null;
  }

  function selectLoadout(m: UnitDoc['members'][number], loadoutId: string) {
    const ref = soldierRef(m.soldierTypeId);
    const lo = ref?.loadouts.find((l) => l.id === loadoutId);
    m.loadoutId = loadoutId;
    m.equipment = lo ? snapshotItems(lo.items) : [];
  }

  function addSelected() {
    if (!doc || !selectedSoldierId || rosterFull) return;
    const s = data.reference.soldiers.find((x) => x.id === selectedSoldierId);
    if (!s) return;
    const member = {
      id: crypto.randomUUID(),
      soldierTypeId: s.id,
      name: s.name,
      cost: s.recruitmentCost,
      stats: s.stats,
      attributes: [] as AttributeSnapshot[],
      equipment: [] as EquipmentSnapshot[],
      specialEquipment: null as EquipmentSnapshot | null,
      loadoutId: null as string | null,
    };
    const first = s.loadouts[0];
    if (first && s.equipmentMode === 'fixed') member.equipment = snapshotItems(first.items);
    else if (first && s.equipmentMode === 'choice') {
      member.loadoutId = first.id;
      member.equipment = snapshotItems(first.items);
    }
    doc.members.push(member);
    selectedSoldierId = '';
  }

  function removeMember(memberId: string) {
    if (!doc) return;
    doc.members = doc.members.filter((m) => m.id !== memberId);
  }

  async function save() {
    if (!doc) return;
    saving = true;
    error = null;
    try {
      doc = await getUnitStore(signedIn).save(doc);
      saved = true;
      setTimeout(() => (saved = false), 2000);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      saving = false;
    }
  }

  async function remove() {
    if (!doc || !confirm('Delete this unit? This cannot be undone.')) return;
    try {
      await getUnitStore(signedIn).remove(id);
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
    <div class="flex items-center justify-between gap-3">
      <a href="/" class="link link-hover text-sm opacity-70">← Units</a>
      <div class="flex items-center gap-2">
        {#if saved}<span class="text-success text-sm">Saved ✓</span>{/if}
        <button class="btn btn-primary btn-sm" onclick={save} disabled={saving}>
          {#if saving}<span class="loading loading-spinner loading-xs"></span>{/if}
          Save
        </button>
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
          <EquipmentBuilder
            catalog={data.reference.equipment}
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
          <div class="flex gap-2">
            <select class="select select-sm flex-1" bind:value={selectedSoldierId} disabled={rosterFull}>
              <option value="">{rosterFull ? 'Roster full (7)' : 'Add a soldier…'}</option>
              {#each addable as s (s.id)}
                <option value={s.id}>{s.name} · {s.recruitmentCost} pts</option>
              {/each}
            </select>
            <button class="btn btn-sm" onclick={addSelected} disabled={!selectedSoldierId || rosterFull}>Add</button>
          </div>

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
                        {#each ref.fixedAttributes as a}<span class="badge badge-xs badge-ghost">{a}</span>{/each}
                      </div>
                    {/if}

                    <div>
                      <span class="mb-1 block text-xs font-medium opacity-70">Equipment</span>
                      {#if ref.equipmentMode === 'pool'}
                        <EquipmentBuilder
                          catalog={data.reference.equipment}
                          items={m.equipment}
                          slots={ref.equipmentSlots ?? OFFICER_EQUIPMENT_SLOTS}
                          specialMax={ref.specialSlots ?? 2}
                          onChange={(newItems) => { m.equipment = newItems; }}
                        />
                      {:else if ref.equipmentMode === 'choice'}
                        <select class="select select-xs w-full" onchange={(e) => selectLoadout(m, e.currentTarget.value)}>
                          {#each ref.loadouts as lo (lo.id)}
                            <option value={lo.id} selected={lo.id === m.loadoutId}>{lo.label}</option>
                          {/each}
                        </select>
                      {:else}
                        <div class="flex flex-wrap gap-1">
                          {#each m.equipment as it (it.itemId)}
                            <span class="badge badge-sm">{it.quantity > 1 ? `${it.quantity}× ` : ''}{it.name}</span>
                          {/each}
                        </div>
                      {/if}

                      {#if ref.equipmentMode === 'fixed' || ref.equipmentMode === 'choice'}
                        <div class="mt-2">
                          <span class="mb-1 block text-xs opacity-60">Special item (pick 1)</span>
                          <div class="flex flex-wrap gap-1">
                            {#each specialCatalog as item (item.id)}
                              {@const isSel = m.specialEquipment?.itemId === item.id}
                              <button
                                type="button"
                                class="btn btn-xs {isSel ? 'btn-primary' : 'btn-outline'}"
                                disabled={!isSel && m.specialEquipment != null}
                                onclick={() => isSel ? clearMemberSpecial(m) : setMemberSpecial(m, item)}
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

    <div class="flex justify-end">
      <button class="btn btn-ghost btn-sm text-error" onclick={remove}>Delete unit</button>
    </div>
  </section>

{/if}

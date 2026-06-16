<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { PageProps } from './$types';
  import AttributePicker from '$lib/components/AttributePicker.svelte';
  import EquipmentBrowser from '$lib/components/EquipmentBrowser.svelte';
  import NationFlag from '$lib/components/NationFlag.svelte';
  import NameRollButtons from '$lib/components/NameRollButtons.svelte';
  import SoldierStatPopover from '$lib/components/SoldierStatPopover.svelte';
  import StatLine from '$lib/components/StatLine.svelte';
  import { getUnitStore, getUnitById, indexedDbStore, type UnitSource } from '$lib/unit/store';
  import {
    unitBudget,
    unitSpent,
    memberPurchasedCost,
    officerSpecialMax,
    soldierSpecialMax,
    memberSpecialPicks,
    specialUsed,
    normalizeUnitDoc,
    officerStats,
    effectiveStats,
    xpToTier,
    pendingUpgradeCount,
    unitPowerRanking,
    OFFICER_BASE_STATS,
    MAX_SOLDIERS,
    OFFICER_EQUIPMENT_SLOTS,
    OFFICER_ATTRIBUTE_PICKS,
    OUTSIDE_NATION_RULE_CODE,
    OUTSIDE_NATION_SOLDIER_COST,
    BASE_RECRUITMENT_BUDGET,
    XP_TIER_THRESHOLDS,
    TIER_UPGRADE_OPTIONS,
    TIER_UPGRADE_LABELS,
    type UnitDoc,
    type OfficerSnapshot,
    type AttributeSnapshot,
    type EquipmentSnapshot,
    type MemberSnapshot,
    type TierUpgrade,
    type TierUpgradeType,
    type CampaignEffect,
    type MemberStatus,
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
          // Heal stale loadout IDs: seed re-runs regenerate UUIDs, so a saved
          // unit's loadoutId may no longer match any current reference row.
          // Re-select the first available loadout silently before taking the
          // snapshot so this doesn't appear as an unsaved change.
          for (const m of doc.members) {
            const ref = data.reference.soldiers.find((s) => s.id === m.soldierTypeId);
            if (ref?.equipmentMode === 'choice' && !ref.loadouts.some((l) => l.id === m.loadoutId)) {
              const first = ref.loadouts[0];
              if (first) { m.loadoutId = first.id; m.equipment = snapshotItems(first.items); }
            }
          }
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
  const baseBudget = $derived(doc?.baseBudget ?? BASE_RECRUITMENT_BUDGET);
  const officerStatLine = $derived(
    doc ? effectiveStats(officerStats(doc.officer), doc.officer.tierUpgrades ?? [], doc.officer.campaignEffects ?? []) : null,
  );

  const nationId = $derived(doc?.nationId ?? null);
  const members = $derived((doc?.members ?? []).filter((m) => (m.status ?? 'active') === 'active'));
  const removedMembers = $derived((doc?.members ?? []).filter((m) => (m.status ?? 'active') !== 'active'));
  const rosterFull = $derived(members.length >= MAX_SOLDIERS);

  // Campaign
  const campaignMode = $derived(doc?.campaignMode ?? false);
  const powerRanking = $derived(doc ? unitPowerRanking(doc) : 0);
  const officerTier = $derived(xpToTier(doc?.officer.xp ?? 0));
  const officerPending = $derived(pendingUpgradeCount(doc?.officer.xp ?? 0, doc?.officer.tierUpgrades ?? []));
  function lowestPendingTier(xp: number, upgrades: TierUpgrade[]): number {
    return upgrades.length + 1;
  }

  let campaignConfirming = $state(false);
  interface TierUpgradeTarget { isOfficer: boolean; memberId: string | null; tier: number; }
  let tierUpgradeTarget = $state<TierUpgradeTarget | null>(null);
  let tierUpgradePickingAttr = $state(false);
  interface TableResultTarget { isOfficer: boolean; memberId: string | null; table: 'injury' | 'madness'; }
  let tableResultTarget = $state<TableResultTarget | null>(null);
  let tableResultSubTable = $state(false);
  let retireConfirmId = $state<string | null>(null);
  let officerRemoveConfirming = $state(false);

  // Table result definitions (Flesh Wound excluded — no effect to store)
  const INJURY_RESULTS = [
    { id: 'dead', label: 'Dead', desc: 'Removed from roster permanently', terminal: 'dead' as Exclude<MemberStatus, 'active'> },
    { id: 'perm_injury', label: 'Permanent Injury', desc: 'Roll on Permanent Injury table', subTable: true as const },
    { id: 'slow_recovery', label: 'Slow Recovery', desc: '-3 Health (start of next game)', effect: { label: 'Slow Recovery', statDelta: { health: -3 as number } } },
  ] as const;
  const PERM_INJURY_RESULTS = [
    { id: 'leg', label: 'Leg wound (-1 Speed)', effect: { label: 'Leg wound', statDelta: { speed: -1 as number } } },
    { id: 'arm', label: 'Arm wound (-1 Melee)', effect: { label: 'Arm wound', statDelta: { melee: -1 as number } } },
    { id: 'shakes', label: 'Shakes (-1 Accuracy)', effect: { label: 'Shakes', statDelta: { accuracy: -1 as number } } },
    { id: 'jitters', label: 'Jitters (-1 Courage)', effect: { label: 'Jitters', statDelta: { courage: -1 as number } } },
    { id: 'internal', label: 'Internal Injuries (-1 Health)', effect: { label: 'Internal Injuries', statDelta: { health: -1 as number } } },
  ] as const;
  const MADNESS_RESULTS = [
    { id: 'perm_insane', label: 'Permanently Insane', desc: 'Removed from roster permanently', terminal: 'permanently_insane' as Exclude<MemberStatus, 'active'> },
    { id: 'episode', label: 'Episode of Madness', desc: 'In-game effect', effect: { label: 'Episode of Madness' } },
    { id: 'spy', label: 'Spy for the Harvestmen', desc: 'In-game effect', effect: { label: 'Spy for the Harvestmen' } },
    { id: 'cursed', label: 'Cursed', desc: 'In-game effect', effect: { label: 'Cursed' } },
    { id: 'imbalanced', label: 'Imbalanced', desc: 'In-game effect', effect: { label: 'Imbalanced' } },
    { id: 'confused', label: 'Confused', desc: 'In-game effect', effect: { label: 'Confused' } },
    { id: 'nagging_doubt', label: 'Nagging Doubt (-1 Health)', desc: '-1 Health', effect: { label: 'Nagging Doubt', statDelta: { health: -1 as number } } },
  ] as const;

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

  const officerPool = $derived(
    data.reference.attributes.filter(
      (a) => (a.pickScope === 'officer' || a.pickScope === 'any') && sourceEnabled(a.sourceCode),
    ),
  );
  const soldierPickableAttrs = $derived(
    data.reference.attributes.filter(
      (a) => (a.pickScope === 'soldier' || a.pickScope === 'any') && sourceEnabled(a.sourceCode),
    ),
  );
  const equipCatalog = $derived(data.reference.equipment.filter((e) => sourceEnabled(e.sourceCode)));
  const equipById = $derived(new Map(equipCatalog.map((e) => [e.id, e])));
  const specialCatalog = $derived(equipCatalog.filter((e) => e.isSpecial));
  const soldierRef = (typeId: string | null) => data.reference.soldiers.find((s) => s.id === typeId);

  const available = $derived(
    nationId === null
      ? []
      : data.reference.soldiers.filter(
          (s) =>
            s.nationIds.includes(nationId!) &&
            (sourceEnabled(s.sourceCode) ||
              (s.alsoInSourceCode != null && sourceEnabled(s.alsoInSourceCode))),
        ),
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

  function togglePurchasedAttr(m: MemberSnapshot, attr: { id: string; name: string; costDelta: number }) {
    const i = m.purchasedAttributes.findIndex((a) => a.id === attr.id);
    if (i >= 0) m.purchasedAttributes.splice(i, 1);
    else m.purchasedAttributes.push({ id: attr.id, name: attr.name, costDelta: attr.costDelta });
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
      purchasedAttributes: [],
      equipment: [],
      specialEquipment: [],
      loadoutId: null,
      ...(doc.campaignMode && { xp: 0, tierUpgrades: [], campaignEffects: [] }),
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

  // ── campaign ─────────────────────────────────────────────────────────────────

  function freshOfficer(): OfficerSnapshot {
    return { name: '', combatTraining: 'melee', physicalEdge: 'health', commandStyle: 'courage', attributes: [], equipment: [], xp: 0, tierUpgrades: [], campaignEffects: [] };
  }

  function startCampaign() {
    if (!doc) return;
    doc.campaignMode = true;
    doc.removedOfficers ??= [];
    doc.officer.xp ??= 0;
    doc.officer.tierUpgrades ??= [];
    doc.officer.campaignEffects ??= [];
    for (const m of doc.members) {
      m.xp ??= 0;
      m.tierUpgrades ??= [];
      m.campaignEffects ??= [];
    }
    campaignConfirming = false;
  }

  function getCampaignTarget(isOfficer: boolean, memberId: string | null): OfficerSnapshot | MemberSnapshot | null {
    if (!doc) return null;
    if (isOfficer) return doc.officer;
    return doc.members.find((m) => m.id === memberId) ?? null;
  }

  function applyTierUpgrade(type: TierUpgradeType, attrId?: string, attrName?: string) {
    if (!doc || !tierUpgradeTarget) return;
    const target = getCampaignTarget(tierUpgradeTarget.isOfficer, tierUpgradeTarget.memberId);
    if (!target) return;
    target.tierUpgrades ??= [];
    const upgrade: TierUpgrade = { tier: tierUpgradeTarget.tier, type };
    if (type === 'new_attribute' && attrId && attrName) {
      upgrade.attributeId = attrId;
      upgrade.attributeName = attrName;
    }
    target.tierUpgrades.push(upgrade);
    tierUpgradeTarget = null;
    tierUpgradePickingAttr = false;
  }

  function removeCampaignEffect(target: OfficerSnapshot | MemberSnapshot, effectId: string) {
    target.campaignEffects = (target.campaignEffects ?? []).filter((e) => e.id !== effectId);
  }

  function applyInjuryResult(result: typeof INJURY_RESULTS[number]) {
    if (!tableResultTarget || !doc) return;
    const { isOfficer, memberId } = tableResultTarget;
    if ('terminal' in result) {
      archiveMember(isOfficer, memberId, result.terminal, result.terminal === 'dead' ? 'Killed in battle' : 'Permanent insanity');
      tableResultTarget = null;
      tableResultSubTable = false;
    } else if ('subTable' in result) {
      tableResultSubTable = true;
    } else if ('effect' in result) {
      const target = getCampaignTarget(isOfficer, memberId);
      if (target) {
        target.campaignEffects ??= [];
        target.campaignEffects.push({ id: crypto.randomUUID(), label: result.effect.label, statDelta: result.effect.statDelta });
      }
      tableResultTarget = null;
      tableResultSubTable = false;
    }
  }

  function applyPermInjuryResult(result: typeof PERM_INJURY_RESULTS[number]) {
    if (!tableResultTarget || !doc) return;
    const target = getCampaignTarget(tableResultTarget.isOfficer, tableResultTarget.memberId);
    if (target) {
      target.campaignEffects ??= [];
      target.campaignEffects.push({ id: crypto.randomUUID(), label: result.effect.label, statDelta: result.effect.statDelta });
    }
    tableResultTarget = null;
    tableResultSubTable = false;
  }

  function applyMadnessResult(result: typeof MADNESS_RESULTS[number]) {
    if (!tableResultTarget || !doc) return;
    const { isOfficer, memberId } = tableResultTarget;
    if ('terminal' in result) {
      archiveMember(isOfficer, memberId, result.terminal, 'Permanent insanity');
      tableResultTarget = null;
    } else if ('effect' in result) {
      const target = getCampaignTarget(isOfficer, memberId);
      if (target) {
        target.campaignEffects ??= [];
        target.campaignEffects.push({ id: crypto.randomUUID(), label: result.effect.label, statDelta: 'statDelta' in result.effect ? result.effect.statDelta : undefined });
      }
      tableResultTarget = null;
    }
  }

  function archiveMember(isOfficer: boolean, memberId: string | null, status: Exclude<MemberStatus, 'active'>, reason: string) {
    if (!doc) return;
    if (isOfficer) {
      doc.removedOfficers ??= [];
      doc.removedOfficers.push({ ...doc.officer, status, removalReason: reason });
      doc.officer = freshOfficer();
    } else {
      const m = doc.members.find((x) => x.id === memberId);
      if (m) { m.status = status; m.removalReason = reason; }
    }
  }

  function retireMember(memberId: string) {
    const m = doc?.members.find((x) => x.id === memberId);
    if (m) { m.status = 'retired'; m.removalReason = 'Retired'; }
    retireConfirmId = null;
  }

  function retireOfficer() {
    if (!doc) return;
    archiveMember(true, null, 'retired', 'Retired');
    officerRemoveConfirming = false;
  }

  function validateBeforeSave(d: UnitDoc): string | null {
    const offMax = officerSpecialMax(d.officer);
    if (specialUsed(d.officer.equipment) > offMax) {
      return `Officer has more special equipment than allowed (max ${offMax}). Add Supernatural Veteran or unequip a special item.`;
    }
    for (const m of d.members) {
      const ref = soldierRef(m.soldierTypeId);
      if (!ref) continue;
      if (ref.equipmentMode === 'choice' && !ref.loadouts.some((l) => l.id === m.loadoutId)) {
        const who = m.customName ? `${m.name} (${m.customName})` : m.name;
        return `${who} needs a loadout selected.`;
      }
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
          {#if baseBudget !== BASE_RECRUITMENT_BUDGET}· base {baseBudget} pts{/if}
          {#if campaignMode && doc.officer.tierUpgrades?.some(u => u.type === 'budget_5' || u.type === 'budget_10')}· +{doc.officer.tierUpgrades.reduce((s,u)=>s+(u.type==='budget_5'?5:u.type==='budget_10'?10:0),0)} from tier upgrades{/if}
          {#if overBudget}· over budget{/if}
        </div>
      </div>
      {#if campaignMode}
        <div class="stat">
          <div class="stat-title">Unit Power</div>
          <div class="stat-value text-2xl">{powerRanking}</div>
          <div class="stat-desc">sum of tiers</div>
        </div>
      {/if}
    </div>

    {#if !campaignMode}
      <div class="flex items-center justify-between rounded-box bg-base-200 px-3 py-2">
        <span class="text-sm opacity-70">Campaign mode</span>
        <button class="btn btn-ghost btn-xs" onclick={() => (campaignConfirming = true)}>Start campaign</button>
      </div>
    {/if}

    <!-- Officer -->
    <div class="card bg-base-200">
      <div class="card-body gap-4">
        <h2 class="card-title text-base">Officer <span class="badge badge-ghost">Leader · free</span></h2>

        <div class="block">
          <span class="mb-1 block text-sm font-medium">Name</span>
          <div class="flex items-center gap-2">
            <input type="text" bind:value={doc.officer.name} class="input flex-1" placeholder="Capitaine Renaud" />
            <NameRollButtons nation={doc.nationName ?? null} onroll={(name) => (doc!.officer.name = name)} />
          </div>
        </div>

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

        {#if campaignMode}
          <div class="border-t border-base-300 pt-3 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge badge-outline shrink-0">Tier {officerTier}</span>
              <label class="flex items-center gap-1.5 text-sm">
                XP
                <input type="number" min="0" step="1" bind:value={doc.officer.xp} class="input input-xs w-20 tabular-nums" />
              </label>
              {#if officerPending > 0}
                <button
                  class="badge badge-warning cursor-pointer"
                  onclick={() => { tierUpgradeTarget = { isOfficer: true, memberId: null, tier: lowestPendingTier(doc!.officer.xp ?? 0, doc!.officer.tierUpgrades ?? []) }; tierUpgradePickingAttr = false; }}
                >Choose Tier {lowestPendingTier(doc.officer.xp ?? 0, doc.officer.tierUpgrades ?? [])} upgrade ›</button>
              {/if}
            </div>
            {#if (doc.officer.tierUpgrades ?? []).length > 0}
              <div class="flex flex-wrap gap-1">
                {#each doc.officer.tierUpgrades ?? [] as u}
                  <span class="badge badge-success badge-xs">T{u.tier} {u.type === 'new_attribute' ? u.attributeName ?? 'Attribute' : TIER_UPGRADE_LABELS[u.type]}</span>
                {/each}
              </div>
            {/if}
            {#if (doc.officer.campaignEffects ?? []).length > 0}
              <div class="flex flex-wrap gap-1">
                {#each doc.officer.campaignEffects ?? [] as effect (effect.id)}
                  <span class="badge badge-error badge-sm gap-1">
                    {effect.label}
                    <button class="ml-0.5 opacity-70 hover:opacity-100" onclick={() => removeCampaignEffect(doc!.officer, effect.id)} aria-label="Remove {effect.label}">×</button>
                  </span>
                {/each}
              </div>
            {/if}
            <div class="flex flex-wrap gap-2">
              <button class="btn btn-outline btn-xs" onclick={() => { tableResultTarget = { isOfficer: true, memberId: null, table: 'injury' }; tableResultSubTable = false; }}>Injury &amp; Death…</button>
              <button class="btn btn-outline btn-xs" onclick={() => { tableResultTarget = { isOfficer: true, memberId: null, table: 'madness' }; tableResultSubTable = false; }}>Madness…</button>
              <button class="btn btn-ghost btn-xs text-error ml-auto" onclick={() => (officerRemoveConfirming = true)}>Retire Officer…</button>
            </div>
          </div>
        {/if}
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
                    {#if !campaignMode}
                      <button
                        class="btn btn-ghost btn-xs shrink-0"
                        onclick={() => removeSoldierFromTile(s.id)}
                        aria-label="Remove one {s.name}"
                      >−</button>
                    {:else}
                      <span class="w-6"></span>
                    {/if}
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
                    {#if !campaignMode}
                      <button
                        class="btn btn-ghost btn-xs shrink-0"
                        onclick={() => removeMember(outsideNationMember!.id)}
                        aria-label="Remove outside-nation soldier"
                      >−</button>
                    {/if}
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
                      <span class="badge badge-sm shrink-0">{m.cost + memberPurchasedCost(m)} pts</span>
                      {#if m.isOutsideNationPick}
                        <span class="badge badge-warning badge-xs shrink-0">outside nation</span>
                      {/if}
                    </div>
                    {#if !campaignMode}
                      <button class="btn btn-ghost btn-xs text-error shrink-0" onclick={() => removeMember(m.id)} aria-label="Remove {m.name}">Remove</button>
                    {/if}
                  </div>

                  <div class="flex items-center gap-1">
                    <input
                      type="text"
                      bind:value={m.customName}
                      class="input input-xs flex-1"
                      placeholder="Character name (optional)"
                      aria-label="Character name for {m.name}"
                    />
                    <NameRollButtons nation={doc.nationName ?? null} soldierType={m.name} onroll={(name) => (m.customName = name)} />
                  </div>

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
                    {@const effStats = effectiveStats(m.stats, m.tierUpgrades ?? [], m.campaignEffects ?? [])}
                    <StatLine stats={effStats} baseStats={m.stats} />
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

                    {#if soldierPickableAttrs.length > 0}
                      {@const alreadyPickedIds = new Set(m.attributes.map((a) => a.id))}
                      {@const buyable = soldierPickableAttrs.filter((a) => !alreadyPickedIds.has(a.id))}
                      {#if buyable.length > 0}
                        <div>
                          <span class="mb-1 block text-xs font-medium opacity-70">Optional upgrades</span>
                          <div class="flex flex-wrap gap-1">
                            {#each buyable as attr (attr.id)}
                              {@const isPicked = m.purchasedAttributes.some((a) => a.id === attr.id)}
                              <button
                                type="button"
                                class="btn btn-xs {isPicked ? 'btn-primary' : 'btn-outline'}"
                                title={attr.rules || attr.name}
                                disabled={!isPicked && spent + attr.costDelta > budget}
                                onclick={() => togglePurchasedAttr(m, attr)}
                              >{attr.name}{#if attr.costDelta > 0} <span class="opacity-60">+{attr.costDelta}</span>{/if}</button>
                            {/each}
                          </div>
                        </div>
                      {/if}
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
                        {#if m.loadoutId === null}
                          <p class="text-xs text-warning">Pick a loadout to continue.</p>
                        {/if}
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

                  {#if campaignMode}
                    {@const mTier = xpToTier(m.xp ?? 0)}
                    {@const mPending = pendingUpgradeCount(m.xp ?? 0, m.tierUpgrades ?? [])}
                    <div class="border-t border-base-300 pt-2 space-y-2">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="badge badge-outline badge-sm shrink-0">Tier {mTier}</span>
                        <label class="flex items-center gap-1.5 text-xs">
                          XP
                          <input type="number" min="0" step="1" bind:value={m.xp} class="input input-xs w-16 tabular-nums" />
                        </label>
                        {#if mPending > 0}
                          <button
                            class="badge badge-warning badge-sm cursor-pointer"
                            onclick={() => { tierUpgradeTarget = { isOfficer: false, memberId: m.id, tier: lowestPendingTier(m.xp ?? 0, m.tierUpgrades ?? []) }; tierUpgradePickingAttr = false; }}
                          >Choose Tier {lowestPendingTier(m.xp ?? 0, m.tierUpgrades ?? [])} upgrade ›</button>
                        {/if}
                      </div>
                      {#if (m.tierUpgrades ?? []).length > 0}
                        <div class="flex flex-wrap gap-1">
                          {#each m.tierUpgrades ?? [] as u}
                            <span class="badge badge-success badge-xs">T{u.tier} {u.type === 'new_attribute' ? u.attributeName ?? 'Attribute' : TIER_UPGRADE_LABELS[u.type]}</span>
                          {/each}
                        </div>
                      {/if}
                      {#if (m.campaignEffects ?? []).length > 0}
                        <div class="flex flex-wrap gap-1">
                          {#each m.campaignEffects ?? [] as effect (effect.id)}
                            <span class="badge badge-error badge-xs gap-1">
                              {effect.label}
                              <button class="ml-0.5 opacity-70 hover:opacity-100" onclick={() => removeCampaignEffect(m, effect.id)} aria-label="Remove {effect.label}">×</button>
                            </span>
                          {/each}
                        </div>
                      {/if}
                      <div class="flex flex-wrap gap-2">
                        <button class="btn btn-outline btn-xs" onclick={() => { tableResultTarget = { isOfficer: false, memberId: m.id, table: 'injury' }; tableResultSubTable = false; }}>Injury &amp; Death…</button>
                        <button class="btn btn-outline btn-xs" onclick={() => { tableResultTarget = { isOfficer: false, memberId: m.id, table: 'madness' }; tableResultSubTable = false; }}>Madness…</button>
                        <button class="btn btn-ghost btn-xs text-error ml-auto" onclick={() => (retireConfirmId = m.id)}>Retire…</button>
                      </div>
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      </div>
    </div>

    <!-- Removed members -->
    {#if campaignMode && (removedMembers.length > 0 || (doc.removedOfficers ?? []).length > 0)}
      {@const allRemoved = [...(doc.removedOfficers ?? []).map(o => ({ kind: 'officer' as const, data: o })), ...removedMembers.map(m => ({ kind: 'soldier' as const, data: m }))]}
      <details class="card bg-base-200">
        <summary class="card-body py-3 cursor-pointer select-none flex-row items-center gap-2">
          <span class="font-medium text-sm">Removed members</span>
          <span class="badge badge-ghost badge-sm">{allRemoved.length}</span>
        </summary>
        <div class="card-body pt-0 space-y-2">
          {#each allRemoved as entry (entry.kind === 'officer' ? 'officer-' + (entry.data as OfficerSnapshot).name : (entry.data as MemberSnapshot).id)}
            {@const isOfficer = entry.kind === 'officer'}
            {@const officer = isOfficer ? (entry.data as OfficerSnapshot) : null}
            {@const soldier = !isOfficer ? (entry.data as MemberSnapshot) : null}
            <div class="bg-base-100 rounded p-3 space-y-1 opacity-70">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-sm">{isOfficer ? (officer!.name || 'Unnamed Officer') : (soldier!.customName || soldier!.name)}</span>
                {#if !isOfficer && soldier!.customName}<span class="text-xs opacity-60">{soldier!.name}</span>{/if}
                <span class="badge badge-xs badge-ghost">{isOfficer ? 'Officer' : 'Soldier'}</span>
                {#if officer?.status || soldier?.status}
                  {@const st = officer?.status ?? soldier?.status}
                  <span class="badge badge-xs {st === 'dead' ? 'badge-error' : st === 'permanently_insane' ? 'badge-warning' : 'badge-ghost'}">
                    {st === 'dead' ? 'Killed' : st === 'permanently_insane' ? 'Permanently Insane' : 'Retired'}
                  </span>
                {/if}
                {#if officer?.removalReason || soldier?.removalReason}
                  <span class="text-xs opacity-50">{officer?.removalReason ?? soldier?.removalReason}</span>
                {/if}
                <span class="badge badge-xs badge-outline ml-auto">Tier {xpToTier(officer?.xp ?? soldier?.xp ?? 0)}</span>
              </div>
              {#if isOfficer}
                {@const stats = effectiveStats(officerStats(officer!), officer!.tierUpgrades ?? [], officer!.campaignEffects ?? [])}
                <StatLine stats={stats} />
              {:else if soldier!.stats}
                {@const stats = effectiveStats(soldier!.stats, soldier!.tierUpgrades ?? [], soldier!.campaignEffects ?? [])}
                <StatLine stats={stats} />
              {/if}
            </div>
          {/each}
        </div>
      </details>
    {/if}

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

  <!-- Campaign: confirm start -->
  {#if campaignConfirming}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-base-100 rounded-box w-full max-w-sm p-6 shadow-xl">
        <h3 class="mb-1 font-semibold">Start campaign?</h3>
        <p class="mb-4 text-sm opacity-70">Enables XP, tier, and injury tracking. This cannot be undone.</p>
        <div class="flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm" onclick={() => (campaignConfirming = false)}>Cancel</button>
          <button class="btn btn-primary btn-sm" onclick={startCampaign}>Start Campaign</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Campaign: tier upgrade picker -->
  {#if tierUpgradeTarget && doc}
    {@const target = getCampaignTarget(tierUpgradeTarget.isOfficer, tierUpgradeTarget.memberId)}
    {@const options = (TIER_UPGRADE_OPTIONS[tierUpgradeTarget.tier] ?? []).filter(t => tierUpgradeTarget!.isOfficer || (t !== 'budget_5' && t !== 'budget_10'))}
    {@const alreadyPickedAttrIds = new Set([...(target && 'attributes' in target ? target.attributes.map(a => a.id) : []), ...(target?.tierUpgrades ?? []).filter(u => u.type === 'new_attribute').map(u => u.attributeId ?? '')])}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-base-100 rounded-box w-full max-w-sm p-6 shadow-xl">
        {#if !tierUpgradePickingAttr}
          <h3 class="mb-1 font-semibold">Tier {tierUpgradeTarget.tier} upgrade</h3>
          <p class="mb-4 text-sm opacity-70">Choose one upgrade for reaching Tier {tierUpgradeTarget.tier}.</p>
          <div class="space-y-2 mb-4">
            {#each options as opt}
              {#if opt === 'new_attribute'}
                <button class="btn btn-outline btn-sm w-full justify-start" onclick={() => (tierUpgradePickingAttr = true)}>{TIER_UPGRADE_LABELS[opt]}</button>
              {:else}
                <button class="btn btn-outline btn-sm w-full justify-start" onclick={() => applyTierUpgrade(opt)}>{TIER_UPGRADE_LABELS[opt]}</button>
              {/if}
            {/each}
          </div>
          <div class="flex justify-end">
            <button class="btn btn-ghost btn-sm" onclick={() => { tierUpgradeTarget = null; tierUpgradePickingAttr = false; }}>Cancel</button>
          </div>
        {:else}
          <h3 class="mb-1 font-semibold">New Attribute</h3>
          <p class="mb-3 text-sm opacity-70">Pick one attribute from the officer pool.</p>
          <div class="max-h-64 overflow-y-auto space-y-1 mb-4">
            {#each officerPool.filter(a => !alreadyPickedAttrIds.has(a.id)) as attr}
              <button class="btn btn-outline btn-sm w-full justify-start text-left" onclick={() => applyTierUpgrade('new_attribute', attr.id, attr.name)}>{attr.name}</button>
            {/each}
          </div>
          <div class="flex justify-end">
            <button class="btn btn-ghost btn-sm" onclick={() => (tierUpgradePickingAttr = false)}>← Back</button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Campaign: table result picker -->
  {#if tableResultTarget && doc}
    {@const targetName = tableResultTarget.isOfficer ? (doc.officer.name || 'Officer') : (doc.members.find(m => m.id === tableResultTarget!.memberId)?.customName || doc.members.find(m => m.id === tableResultTarget!.memberId)?.name || 'Soldier')}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-base-100 rounded-box w-full max-w-sm p-6 shadow-xl">
        {#if !tableResultSubTable}
          <h3 class="mb-1 font-semibold">{tableResultTarget.table === 'injury' ? 'Injury & Death' : 'Madness'} — {targetName}</h3>
          <p class="mb-3 text-sm opacity-70">Select the result of the dice roll.</p>
          <div class="space-y-2 mb-4">
            {#if tableResultTarget.table === 'injury'}
              {#each INJURY_RESULTS as result}
                <button class="btn btn-outline btn-sm w-full text-left justify-start flex-col items-start h-auto py-2" onclick={() => applyInjuryResult(result)}>
                  <span class="font-medium">{result.label}</span>
                  <span class="text-xs opacity-60 normal-case">{result.desc}</span>
                </button>
              {/each}
            {:else}
              {#each MADNESS_RESULTS as result}
                <button class="btn btn-outline btn-sm w-full text-left justify-start flex-col items-start h-auto py-2" onclick={() => applyMadnessResult(result)}>
                  <span class="font-medium">{result.label}</span>
                  <span class="text-xs opacity-60 normal-case">{result.desc}</span>
                </button>
              {/each}
            {/if}
          </div>
          <div class="flex justify-end">
            <button class="btn btn-ghost btn-sm" onclick={() => { tableResultTarget = null; tableResultSubTable = false; }}>Cancel</button>
          </div>
        {:else}
          <h3 class="mb-1 font-semibold">Permanent Injury — {targetName}</h3>
          <p class="mb-3 text-sm opacity-70">Select the injury result.</p>
          <div class="space-y-2 mb-4">
            {#each PERM_INJURY_RESULTS as result}
              <button class="btn btn-outline btn-sm w-full justify-start" onclick={() => applyPermInjuryResult(result)}>{result.label}</button>
            {/each}
          </div>
          <div class="flex justify-end">
            <button class="btn btn-ghost btn-sm" onclick={() => (tableResultSubTable = false)}>← Back</button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Campaign: retire soldier confirm -->
  {#if retireConfirmId && doc}
    {@const retiring = doc.members.find(m => m.id === retireConfirmId)}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-base-100 rounded-box w-full max-w-sm p-6 shadow-xl">
        <h3 class="mb-1 font-semibold">Retire {retiring?.customName || retiring?.name}?</h3>
        <p class="mb-4 text-sm opacity-70">They will be archived and no longer count toward your roster or budget. This cannot be undone.</p>
        <div class="flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm" onclick={() => (retireConfirmId = null)}>Cancel</button>
          <button class="btn btn-error btn-sm" onclick={() => retireMember(retireConfirmId!)}>Retire</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Campaign: retire officer confirm -->
  {#if officerRemoveConfirming && doc}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-base-100 rounded-box w-full max-w-sm p-6 shadow-xl">
        <h3 class="mb-1 font-semibold">Retire {doc.officer.name || 'Officer'}?</h3>
        <p class="mb-4 text-sm opacity-70">The current officer will be archived and you'll fill in a fresh replacement. This cannot be undone.</p>
        <div class="flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm" onclick={() => (officerRemoveConfirming = false)}>Cancel</button>
          <button class="btn btn-error btn-sm" onclick={retireOfficer}>Retire &amp; Replace</button>
        </div>
      </div>
    </div>
  {/if}

{/if}

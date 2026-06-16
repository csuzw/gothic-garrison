<svelte:head>
  <title>Campaign Post-Battle Cheat Sheet · Gothic Garrison</title>
</svelte:head>

<style>
  @page {
    size: A4;
    margin: 1cm 1.1cm;
  }

  @media print {
    :global(main) {
      padding: 0 !important;
      max-width: none !important;
    }

    .cs-wrap {
      font-size: 7.2pt;
      line-height: 1.3;
      color: #000;
      background: #fff;
      columns: 2;
      column-gap: 0.7cm;
    }

    /* flatten grid rows so sections flow freely into columns */
    .cs-wrap > div {
      display: contents;
    }

    .cs-section {
      display: block;
      background: #f5f5f5;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 5px 6px;
      break-inside: avoid;
      margin-bottom: 4pt;
    }

    .cs-table td,
    .cs-table th {
      padding: 1px 4px;
      font-size: inherit;
    }

    h1,
    .cs-heading {
      font-size: 8.5pt;
    }

    .no-print {
      display: none !important;
    }
  }
</style>

<div class="no-print mb-5 flex items-center justify-between gap-4">
  <h1 class="text-2xl font-bold">Campaign Post-Battle Cheat Sheet</h1>
  <button class="btn btn-primary btn-sm" onclick={() => window.print()}>
    Print / Save PDF
  </button>
</div>

<div class="cs-wrap space-y-3 text-sm">

  <!-- ── POST-BATTLE SEQUENCE ─────────────────────────────────────── -->
  <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
    <h2 class="cs-heading text-base font-bold uppercase tracking-wide">Post-Battle Sequence</h2>
    <ol class="list-decimal space-y-1.5 pl-4">
      <li>
        <strong>Injuries, Deaths &amp; Madness</strong> — For every figure reduced to 0 Health during the battle, roll on the <strong>Injury &amp; Death</strong> table. For every figure that collapsed due to a Terror Check, roll on the <strong>Madness</strong> table. Any leftover Power or Skill Dice remaining in the Fate Pool may be used to reroll a result — but only once, and the second result must be accepted.
      </li>
      <li>
        <strong>Experience</strong> — Every surviving figure earns <strong>1 XP</strong>. The scenario also provides a bonus XP pool; each surviving figure may receive at most <strong>1 additional XP</strong> from this pool (excess is lost). In rare cases a figure may earn a further <strong>1 XP</strong> for completing a specific in-scenario objective. Maximum XP per figure per battle is <strong>3</strong> (typically 1–2). Check the Experience Tier table; for each new tier reached the figure chooses an upgrade.
      </li>
      <li>
        <strong>Research</strong> — This step is scenario-specific. See the scenario rules for details. (Not tracked in Gothic Garrison.)
      </li>
      <li>
        <strong>Reorganise &amp; Re-equip</strong> — Any figure may change equipment freely. You may retire any officer or soldier and recruit replacements, provided you remain within the current recruitment cap. If you have lost your officer, create a new Tier-0 replacement; soldiers may be retained. Choosing to start completely fresh (new list) resets all XP. The recruitment cap may increase from officer tier upgrades.
      </li>
      <li>
        <strong>Unit Power Ranking</strong> — Sum the tiers of all active figures (officer + soldiers). Starts at 0; rises as XP is accumulated over the campaign.
      </li>
    </ol>
  </section>

  <!-- ── ROW 1: Injury & Death · Permanent Injury ─────────────────── -->
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading text-base font-bold uppercase tracking-wide">Injury &amp; Death</h2>
      <p class="opacity-70 italic text-xs">Roll when a figure reaches 0 Health.</p>
      <div class="overflow-x-auto">
        <table class="cs-table table table-xs w-full">
          <thead>
            <tr><th>Roll</th><th>Result</th></tr>
          </thead>
          <tbody>
            <tr>
              <td class="whitespace-nowrap font-semibold">1</td>
              <td><strong>Dead</strong> — Removed from roster permanently.</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap font-semibold">2–3</td>
              <td><strong>Permanent Injury</strong> — Roll on the Permanent Injury table.</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap font-semibold">4</td>
              <td><strong>Slow Recovery</strong> — Starts the next game with −3 Health.</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap font-semibold">5+</td>
              <td><strong>Flesh Wound</strong> — Starts the next game with full Health. No lasting effect.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading text-base font-bold uppercase tracking-wide">Permanent Injury</h2>
      <p class="opacity-70 italic text-xs">Roll when the Injury &amp; Death result is 2–3.</p>
      <div class="overflow-x-auto">
        <table class="cs-table table table-xs w-full">
          <thead>
            <tr><th>Roll</th><th>Result</th></tr>
          </thead>
          <tbody>
            <tr>
              <td class="whitespace-nowrap font-semibold">1–2</td>
              <td><strong>Leg wound</strong> — −1 Speed (permanent).</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap font-semibold">3–4</td>
              <td><strong>Arm wound</strong> — −1 Melee (permanent).</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap font-semibold">5–6</td>
              <td><strong>Shakes</strong> — −1 Accuracy (permanent).</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap font-semibold">7–8</td>
              <td><strong>Jitters</strong> — −1 Courage (permanent).</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap font-semibold">9–10</td>
              <td><strong>Internal Injuries</strong> — −1 Health (permanent).</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </div>

  <!-- ── MADNESS ───────────────────────────────────────────────────── -->
  <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
    <h2 class="cs-heading text-base font-bold uppercase tracking-wide">Madness</h2>
    <p class="opacity-70 italic text-xs">Roll when a figure collapses due to a Terror Check.</p>
    <div class="overflow-x-auto">
      <table class="cs-table table table-xs w-full">
        <thead>
          <tr><th>Roll</th><th>Result</th></tr>
        </thead>
        <tbody>
          <tr>
            <td class="whitespace-nowrap font-semibold">1</td>
            <td><strong>Permanently Insane</strong> — Removed from roster permanently.</td>
          </tr>
          <tr>
            <td class="whitespace-nowrap font-semibold">2</td>
            <td><strong>Episode of Madness</strong> — If the controlling player rolls the same number on both dice on an Initiative Check while this figure is on the table, it counts as a monster for that turn. It activates in the Monster Phase following normal monster rules. This can only happen once per game.</td>
          </tr>
          <tr>
            <td class="whitespace-nowrap font-semibold">3</td>
            <td><strong>Spy for the Harvestmen</strong> — If this figure is part of your unit, one random opponent starts the game with an extra Monster Die in their Fate Pool. No player may receive more than one Monster Die in this way.</td>
          </tr>
          <tr>
            <td class="whitespace-nowrap font-semibold">4</td>
            <td><strong>Cursed</strong> — This figure now critically fails a Melee or Accuracy Check if both the Power Die and Skill Die show 1 or 2, even if Critical Failure rules are not in use.</td>
          </tr>
          <tr>
            <td class="whitespace-nowrap font-semibold">5</td>
            <td><strong>Imbalanced</strong> — This figure receives −3 to all Checks to avoid falling.</td>
          </tr>
          <tr>
            <td class="whitespace-nowrap font-semibold">6–7</td>
            <td><strong>Confused</strong> — Any time this figure chooses to Dive for Cover, it moves in a random direction instead.</td>
          </tr>
          <tr>
            <td class="whitespace-nowrap font-semibold">8–10</td>
            <td><strong>Nagging Doubt</strong> — −1 Health (permanent).</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ── EXPERIENCE TIER ──────────────────────────────────────────── -->
  <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
    <h2 class="cs-heading text-base font-bold uppercase tracking-wide">Experience Tier</h2>
    <p class="opacity-70 italic text-xs">+5 Recruit and +10 Recruit are officer-only options.</p>
    <div class="overflow-x-auto">
      <table class="cs-table table table-xs w-full">
        <thead>
          <tr><th>XP Total</th><th>Tier</th><th>Upgrade (choose one)</th></tr>
        </thead>
        <tbody>
          <tr><td class="font-semibold">5</td><td class="font-semibold">1</td><td>+1 Courage</td></tr>
          <tr><td class="font-semibold">10</td><td class="font-semibold">2</td><td>+1 Health, or New Attribute, or +5 Recruit†</td></tr>
          <tr><td class="font-semibold">18</td><td class="font-semibold">3</td><td>+1 Melee, or +1 Accuracy, or +10 Recruit†</td></tr>
          <tr><td class="font-semibold">30</td><td class="font-semibold">4</td><td>+1 Courage</td></tr>
          <tr><td class="font-semibold">45</td><td class="font-semibold">5</td><td>+1 Health, or New Attribute, or +5 Recruit†</td></tr>
          <tr><td class="font-semibold">65</td><td class="font-semibold">6</td><td>+1 Courage, or +1 Health, or New Attribute, or +5 Recruit†</td></tr>
          <tr><td class="font-semibold">100</td><td class="font-semibold">7</td><td>+1 Courage, or +1 Health, or New Attribute, or +5 Recruit†</td></tr>
          <tr><td class="font-semibold">150</td><td class="font-semibold">8</td><td>+1 Courage, or +1 Health, or New Attribute, or +5 Recruit†</td></tr>
          <tr><td class="font-semibold">200</td><td class="font-semibold">9</td><td>+1 Courage, or +1 Health, or New Attribute, or +5 Recruit†</td></tr>
        </tbody>
      </table>
    </div>
    <p class="text-xs opacity-60">† Officer only. +Recruit increases the unit's recruitment budget for the campaign.</p>
  </section>

</div>

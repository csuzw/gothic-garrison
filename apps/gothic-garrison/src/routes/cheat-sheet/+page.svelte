<svelte:head>
  <title>Cheat Sheet · Gothic Garrison</title>
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

    .cs-subheading {
      font-size: 7.5pt;
    }

    .src-tag {
      font-size: 6pt;
      border: 1px solid #888;
      border-radius: 3px;
      padding: 0 3px;
      color: #555;
      font-family: monospace;
      background: transparent;
      vertical-align: middle;
    }
  }
</style>

<div class="print:hidden mb-5 flex items-center justify-between gap-4">
  <h1 class="text-2xl font-bold">Cheat Sheet</h1>
  <button class="btn btn-primary btn-sm" onclick={() => window.print()}>
    Print / Save PDF
  </button>
</div>

<div class="cs-wrap space-y-3 text-sm">

  <!-- ── CHECKS ───────────────────────────────────────────────────── -->
  <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
    <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
      Checks
      <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:46</span>
    </h2>
    <p>A <strong>Check</strong> is named after the relevant stat. To resolve it, roll <strong>2D10</strong> and add that stat — for example, a <strong>Courage Check</strong> means roll 2D10 and add your Courage stat.</p>
    <p>Some checks have a <strong>Target Number (TN)</strong> — the total you must equal or beat to succeed. For example, a <strong>Courage Check (TN12)</strong> requires your 2D10 + Courage to be 12 or higher.</p>
  </section>

  <!-- ── ROW 1: Turn Phases + Actions · Movement ─────────────────── -->
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Turn Phases
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:47</span>
      </h2>
      <ol class="list-decimal space-y-1 pl-4">
        <li><strong>Initiative Phase</strong> — Each player rolls 2D10; highest = Primary Player. Double 1s or 10s trigger an Unexpected Event or Encounter.</li>
        <li><strong>Primary Player Phase 1</strong> — Activates up to half their force, rounding down.</li>
        <li><strong>Monster Phase</strong> — All monsters activate. Skip if none.</li>
        <li><strong>Secondary Player Phase</strong> — Secondary player activates all units. Additional players in descending initiative order.</li>
        <li><strong>Primary Player Phase 2</strong> — Primary player activates all remaining units.</li>
      </ol>

      <h2 class="cs-heading mt-1 flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Actions
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:52</span>
      </h2>
      <p>Each figure performs <strong>2 actions</strong> per turn but may only <strong>Move once</strong>.</p>
      <dl class="space-y-0.5">
        <div class="flex gap-1"><dt class="shrink-0 font-semibold">Move —</dt><dd>Move inches equal to Speed stat.</dd></div>
        <div class="flex gap-1"><dt class="shrink-0 font-semibold">Shoot —</dt><dd>Fire weapon; mark with token until reloaded.</dd></div>
        <div class="flex gap-1"><dt class="shrink-0 font-semibold">Reload —</dt><dd>Reload one firearm. Two pistols need two Reload actions.</dd></div>
        <div class="flex gap-1"><dt class="shrink-0 font-semibold">Investigate —</dt><dd>In contact with a clue; no enemy within 1".</dd></div>
        <div class="flex gap-1"><dt class="shrink-0 font-semibold">Sprint —</dt><dd>Sprint Check ≤10: +2" move. 11+: +4" move.</dd></div>
      </dl>
      <p class="opacity-70 italic">Melee is triggered by moving into base contact via Move or Sprint. Backing Off does not cause Melee.</p>
    </section>

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Movement
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:53</span>
      </h2>

      <h3 class="cs-subheading font-semibold">Difficult Terrain</h3>
      <p>Bogs, mud, ruins, ice, underbrush. Movement is <strong>halved</strong> unless specified otherwise.</p>

      <h3 class="cs-subheading font-semibold">Jumping</h3>
      <p>Horizontal gaps: movement is <strong>halved</strong> when jumping (Speed 6 can jump 3"). Sprinting can increase jump distance. Figures can jump down 3" but must end on the ground. Failing a jump triggers a Fall.</p>
      <p class="opacity-70 italic text-xs">Example: Speed 6, 5" movement left, sprint roll 4 (+2"): total 3.5" toward a 4" gap — fail, falls.</p>

      <h3 class="cs-subheading font-semibold">Falling</h3>
      <p>When damaged within 1" of a drop: <strong>Speed Check (TN12)</strong>. Fail → falls from closest point.</p>
      <ul class="list-disc space-y-0.5 pl-4">
        <li>≤3" — no damage</li>
        <li>&gt;3" — 1D10 damage</li>
        <li>&gt;6" — 2D10 damage</li>
        <li>&gt;9" — 3D10 damage (continues per 3")</li>
      </ul>
      <p>Mounted figures take <strong>double</strong> fall damage.</p>
    </section>

  </div>

  <!-- ── ROW 2: Melee · Shooting ──────────────────────────────────── -->
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Melee
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:58</span>
      </h2>
      <p>Melee Check ≥ target's <strong>Defence</strong> = hit. Fatigue Tokens lower both Melee and Defence by −1 each.</p>

      <h3 class="cs-subheading font-semibold">Damage</h3>
      <p>Use the Power Die or Skill Die as specified by the weapon.</p>

      <h3 class="cs-subheading font-semibold">Enemy Action</h3>
      <p><strong>Strike Back</strong> — Enemy attacks the active figure; attacker must then Back Off if it survives.</p>
      <p><strong>Back Off</strong> — Move 2" away from the attacker.</p>

      <h3 class="cs-subheading font-semibold">Forced Attack</h3>
      <p>Moving within 1" of an enemy lets the enemy Force the Attack: both move into base contact and the active figure performs Melee. Monsters always Force if able. Figures with 2 Fatigue Tokens cannot Force.</p>

      <h3 class="cs-subheading font-semibold">Fatigue Tokens</h3>
      <p>Both figures gain 1 token after combat. Max 2 per turn. Each token: −1 Melee, −1 Defence. All tokens lost at end of round.</p>

      <h3 class="cs-subheading font-semibold">Distractions</h3>
      <p>A friendly figure within 2" of an enemy may spend an action to give the enemy a Fatigue Token, ending its turn immediately.</p>
    </section>

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Shooting
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:60</span>
      </h2>
      <p>Accuracy Check ≥ target's Defence (with modifiers below) = hit.</p>
      <p>Target may react:</p>
      <ul class="list-disc space-y-0.5 pl-4">
        <li><strong>Return Fire</strong> — if weapon loaded and in range</li>
        <li><strong>Dive for Cover</strong> — move 2" not in LoS and ≥6" from any enemy</li>
        <li>Do nothing</li>
      </ul>
      <p class="opacity-70 italic">Most monsters don't react. Monsters with guns Return Fire; some Dive for Cover.</p>

      <div class="overflow-x-auto">
        <table class="cs-table table table-xs w-full">
          <caption class="mb-1 text-left font-semibold">Shooting Modifiers</caption>
          <thead>
            <tr><th>Condition</th><th class="text-center">Mod</th></tr>
          </thead>
          <tbody>
            <tr><td>Shooter moved this activation</td><td class="text-center">−1</td></tr>
            <tr><td>Target in cover (legs/torso/head obstructed)</td><td class="text-center">−1</td></tr>
            <tr><td>Shooter is mounted</td><td class="text-center">−2</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="cs-heading mt-1 flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Critical Hits &amp; Failures
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:63</span>
        <span class="badge badge-warning badge-xs font-normal normal-case tracking-normal">optional</span>
      </h2>
      <p><strong>Critical Hit</strong> — Both dice = 10. Target takes +2 damage. Melee: target must Back Off. Shooting: target cannot react.</p>
      <p><strong>Critical Failure</strong> — Both dice = 1. Fate Dice cannot alter this roll. Melee weapon → counts as Improvised for the rest of the scenario. Ranged weapon → cannot fire.</p>
    </section>

  </div>

  <!-- ── ROW 3: Cavalry · Fate Pool ──────────────────────────────── -->
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Cavalry
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:65</span>
      </h2>
      <p>Requires <strong>Combat Rider</strong> attribute. Cannot investigate clues or fire Volley Guns. −2 Shooting penalty when mounted.</p>
      <p><strong>Dismount</strong> — Uses the Move action. Cannot remount once dismounted.</p>
      <p><strong>Movement</strong> — Speed 8". Same rules for Difficult Terrain and Jumping. Cannot enter structures or climb; can jump ≤0.5" obstacles. Fall damage is doubled.</p>
      <p><strong>Melee (attacking)</strong> — +1 Melee, +1 Damage.</p>
      <p><strong>Melee (vs unmounted attacker)</strong> — Cavalry gain +1 Defence; unmounted attacker must always Back Off.</p>
      <p><strong>Melee (both mounted)</strong> — Standard rules apply.</p>
    </section>

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        The Fate Pool
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:69</span>
      </h2>
      <p>Standard pool: <strong>2 Power Dice · 2 Skill Dice · 1 Monster Die</strong></p>

      <h3 class="cs-subheading font-semibold">Reroll</h3>
      <p>Reroll any die; keep new result only if higher. Once per action per figure. Power/Skill dice only affect their own type. Cannot Reroll a Reroll.</p>

      <h3 class="cs-subheading font-semibold">Negate Damage</h3>
      <p>Roll D10. On 10: all damage ignored. Otherwise: result ÷2 (round up) = damage negated. Once per action. Cannot be Rerolled.</p>

      <h3 class="cs-subheading font-semibold">Quick Reload</h3>
      <p>Spend a Power or Skill die to Reload without using an action (allows Move + Quick Reload + Fire). Once per Activation.</p>

      <h3 class="cs-subheading font-semibold">Monster Dice</h3>
      <p>Affects Monster rolls only:</p>
      <ul class="list-disc space-y-0.5 pl-4">
        <li>Change result of a Monster check (worse results ignored)</li>
        <li>Reduce damage a Monster takes (see Negate Damage)</li>
        <li>Change a Monster's target (another figure or Clue Marker)</li>
      </ul>
      <p class="opacity-70 italic">Only one player can affect a Monster per activation — first to declare gets priority.</p>
    </section>

  </div>

  <!-- ── ROW 4: Terror Checks · Monster + Necromancer Actions ──────── -->
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Terror Checks
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:67</span>
      </h2>
      <p>Courage Check − Terror value. <strong>11+ is the best outcome.</strong> If already suffering a failed check and a new one is failed: take the worse result (terror only worsens).</p>

      <div class="overflow-x-auto">
        <table class="cs-table table table-xs w-full">
          <thead>
            <tr><th>Total</th><th>Result</th></tr>
          </thead>
          <tbody>
            <tr>
              <td class="whitespace-nowrap">≤2</td>
              <td><strong>Collapse</strong> — Removed from table; roll on Madness Table after game.</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap">3–4</td>
              <td><strong>Paralysed</strong> — Ends turn; no action next activation. Each subsequent activation: Courage Check (TN14); pass = Shaken instead.</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap">5–6</td>
              <td><strong>Shaken</strong> — −1 to all checks for rest of game.</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap">7–8</td>
              <td><strong>Stunned</strong> — Ends turn; −1 to all checks until end of next activation.</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap">9–10</td>
              <td><strong>Distracted</strong> — −1 to all checks until end of next activation.</td>
            </tr>
            <tr>
              <td class="whitespace-nowrap">11+</td>
              <td><strong>No effect.</strong> Unfazed.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Monster Actions
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:73</span>
      </h2>
      <p>Lowest HP activates first. Ties: Primary Player picks.</p>
      <ol class="list-decimal space-y-1 pl-4">
        <li><strong>Weapon unloaded?</strong> Yes → Reload (move action). No → proceed.</li>
        <li><strong>Loaded weapon + soldier in range/LoS?</strong> Yes → Shoot closest; reload if hasn't moved. No → proceed.</li>
        <li><strong>Soldier in LoS?</strong> Yes → Move full speed toward closest; melee if base contact. No → Move toward closest Clue Marker; if none, toward closest soldier regardless of LoS.</li>
      </ol>
      <p>Monsters always <strong>Return Fire</strong> (if loaded) or <strong>Strike Back</strong> (melee). Never Back Off or Dive for Cover.</p>

      <h2 class="cs-heading mt-2 flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Necromancer Actions
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">italy:33</span>
      </h2>
      <p>On activation, check nearest player figure distance — this attribute activates <strong>before any other action</strong>:</p>
      <ul class="list-disc space-y-0.5 pl-4">
        <li>Within 24" → use <strong>Raise the Dead</strong></li>
        <li>Over 24" → use <strong>Dark Gift</strong></li>
      </ul>
      <p>Reactions (Acolyte / Il Negromante only): <strong>Dive for Cover</strong> when targeted by shooting; <strong>Back Off</strong> if surviving melee.</p>
    </section>

  </div>

  <!-- ── ROW 5: Unexpected Events · Encounter Table ─────────────── -->
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Unexpected Events
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:49</span>
      </h2>
      <p class="opacity-70 italic">Triggered on double 10s in the Initiative Phase. Gain 1 Skill or Power Die.</p>

      <div class="overflow-x-auto">
        <table class="cs-table table table-xs w-full">
          <thead>
            <tr><th>Roll</th><th>Event</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td><strong>Rain</strong> — All shooting −2.</td></tr>
            <tr><td>2</td><td><strong>Fog</strong> — Max line of sight 10".</td></tr>
            <tr><td>3</td><td><strong>Wail of Terror</strong> — All units make a Terror Check (−0).</td></tr>
            <tr><td>4</td><td><strong>Deluge</strong> — −4 to all shooting, −1 movement speed.</td></tr>
            <tr><td>5</td><td><strong>Artillery Strike</strong> — Each player rolls; add +2 per Artillerist. Highest result targets one non-Officer enemy unit; that player rolls 1 die and takes damage equal to roll.</td></tr>
            <tr><td>6</td><td><strong>Wheel of Fate Turns</strong> — No Power or Skill dice from Fate Pool this turn. Monster dice unaffected.</td></tr>
            <tr><td>7</td><td><strong>Strength of the Faithful</strong> — Units with a Holy Symbol regain up to 3 HP.</td></tr>
            <tr><td>8</td><td><strong>Powerful Enchantment</strong> — All units: Courage Check (TN10) or cannot attack.</td></tr>
            <tr><td>9</td><td><strong>Mysterious Movement</strong> — Each player picks two opposing models and swaps their positions.</td></tr>
            <tr><td>10</td><td><strong>Lucky Find</strong> — Both players equip a Special Armoury item to one unit for the scenario.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="cs-section space-y-2 rounded-lg bg-base-200 p-3">
      <h2 class="cs-heading flex items-center gap-2 text-base font-bold uppercase tracking-wide">
        Unexpected Encounter Table
        <span class="src-tag badge badge-outline badge-xs font-mono font-normal normal-case tracking-normal">core:50</span>
      </h2>
      <p class="opacity-70 italic">Triggered on double 1s in the Initiative Phase. Gain 1 Monster Die. Monster Phase occurs before Primary Player Phase 1.</p>

      <div class="overflow-x-auto">
        <table class="cs-table table table-xs w-full">
          <thead>
            <tr><th>Roll</th><th>Encounter</th><th>Roll</th><th>Encounter</th></tr>
          </thead>
          <tbody>
            <tr><td>2</td><td>Demon</td><td>12</td><td>Hobgoblin</td></tr>
            <tr><td>3</td><td>Troll</td><td>13</td><td>Dark Wolf</td></tr>
            <tr><td>4</td><td>Black Dog</td><td>14</td><td>Living Scarecrow</td></tr>
            <tr><td>5</td><td>Possessed</td><td>15</td><td>Changeling</td></tr>
            <tr><td>6</td><td>Goblin</td><td>16</td><td>Living Armour</td></tr>
            <tr><td>7</td><td>Ghoul</td><td>17</td><td>Pixie</td></tr>
            <tr><td>8</td><td>Vampire Bat</td><td>18</td><td>Ghost</td></tr>
            <tr><td>9</td><td>Revenant</td><td>19</td><td>Werewolf</td></tr>
            <tr><td>10</td><td>Bandit</td><td>20</td><td>Vampire</td></tr>
            <tr><td>11</td><td>Cultist</td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
    </section>

  </div>

  <p class="cs-credit pt-2 text-center text-xs opacity-60 print:text-[6pt]">
    Based on a cheat sheet by PureZestyLemons.
  </p>

</div>

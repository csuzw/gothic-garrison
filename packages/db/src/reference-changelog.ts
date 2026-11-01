// AUTO-GENERATED — do not edit by hand.
// Appended to by `pnpm db:export-seed` (src/export-seed-data.ts) whenever an
// export detects reference-data changes vs the committed seed-data.ts. Each
// entry pairs a human note (from `--note`, or a derived summary) with the
// structured diff. Newest first. The About page renders this directly — it is a
// plain data module with no DB dependency, so it works offline.
/* eslint-disable */

export type ReferenceChangeKind = 'added' | 'updated' | 'removed';

export interface ReferenceChange {
  kind: ReferenceChangeKind;
  /** Singular entity label, e.g. "soldier type", "equipment", "nation". */
  entity: string;
  /** Human-readable name of the affected row. */
  name: string;
}

export interface ReferenceChangelogEntry {
  /** ISO timestamp of the export that produced this entry. */
  date: string;
  /** One-line summary of the editing session. */
  note: string;
  changes: ReferenceChange[];
}

export const referenceChangelog: ReferenceChangelogEntry[] = [
  {
    "date": "2026-11-01T12:51:49.255Z",
    "note": "Add Venice — The Alchemist's Legacy supplement",
    "changes": [
      {
        "kind": "added",
        "entity": "source",
        "name": "Venice — The Alchemist's Legacy"
      },
      {
        "kind": "added",
        "entity": "nation",
        "name": "Kingdom of Italy"
      },
      {
        "kind": "added",
        "entity": "nation",
        "name": "The Vatican"
      },
      {
        "kind": "added",
        "entity": "nation",
        "name": "Venice"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Austria"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Britain"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Calabresi"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Egypt"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "France"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Kingdom of Naples"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Lower Canada"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Prussia"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Russia"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Spain"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Trading Companies"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "United States"
      },
      {
        "kind": "updated",
        "entity": "nation",
        "name": "Upper Canada"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Alchemical Boost"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Alchemist"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Alley Rat"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Chains of Death"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Concealed Pistol"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Dark Alchemy"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Dirty Fighter"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Elite Guard"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Ethereal Hand Weapon"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Fins"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Gendarme"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Mercenary"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "No Opening"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Self-Preservation"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Sophisian Grimoire"
      },
      {
        "kind": "added",
        "entity": "attribute",
        "name": "Subterfuge"
      },
      {
        "kind": "added",
        "entity": "equipment",
        "name": "Bolt Quiver"
      },
      {
        "kind": "added",
        "entity": "equipment",
        "name": "Crossbow"
      },
      {
        "kind": "added",
        "entity": "equipment",
        "name": "Multi-Barrelled Pistol"
      },
      {
        "kind": "added",
        "entity": "equipment",
        "name": "Polearm"
      },
      {
        "kind": "updated",
        "entity": "equipment",
        "name": "Blunderbuss"
      },
      {
        "kind": "updated",
        "entity": "equipment",
        "name": "Volley Gun"
      },
      {
        "kind": "added",
        "entity": "soldier type",
        "name": "Alchemist"
      },
      {
        "kind": "added",
        "entity": "soldier type",
        "name": "Assassin"
      },
      {
        "kind": "added",
        "entity": "soldier type",
        "name": "Congregant"
      },
      {
        "kind": "added",
        "entity": "soldier type",
        "name": "Gendarme"
      },
      {
        "kind": "added",
        "entity": "soldier type",
        "name": "Gondolier"
      },
      {
        "kind": "added",
        "entity": "soldier type",
        "name": "Local Guide"
      },
      {
        "kind": "added",
        "entity": "soldier type",
        "name": "Mercenary"
      },
      {
        "kind": "added",
        "entity": "soldier type",
        "name": "Swiss Guardsman"
      },
      {
        "kind": "added",
        "entity": "soldier type",
        "name": "Vatican Agent"
      },
      {
        "kind": "added",
        "entity": "soldier type",
        "name": "Velite"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Agent Provocateur"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Artillerist"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Champion of Faith"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Coachman"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Conscript"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Doctor"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Grenadier"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Guard"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Heavy Cavalryman"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Highwayman"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Infantryman"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Irregular"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Junior Officer"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Knight Hospitaller"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Light Cavalryman"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Light Infantryman"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Marine"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Occultist"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Provincial Soldier"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Sailor"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Sapper"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Supernatural Investigator"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Swordsman"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Vivandiere"
      },
      {
        "kind": "updated",
        "entity": "soldier type",
        "name": "Voltigeur"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Bravo Brawler"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Bravo Lieutenant"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Bravo Scoundrel"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Canal Lane Slasher"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Canal Serpent"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Civic Guardsman"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Count Monterosso"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Deep One"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Drowned"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Homunculus"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Lion Statue Golem"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Lion Statue Guardian"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Plague Skeleton"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Rogue Alchemist"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Sophisian Occultist"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "The Broker"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Thrall Guard"
      },
      {
        "kind": "added",
        "entity": "monster type",
        "name": "Wreckbound"
      }
    ]
  }
];

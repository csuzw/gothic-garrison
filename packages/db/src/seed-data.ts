// AUTO-GENERATED — do not edit by hand.
// Exported from the database by `pnpm db:export-seed` (src/export-seed-data.ts).
// This is the canonical, git-committed reference data seeded into every
// environment via `pnpm db:seed`. To change it, edit reference rows in the
// local-only Codex and re-export, so each change is a reviewable diff.
/* eslint-disable */

export type EquipmentMode = 'fixed' | 'choice' | 'pool';
export type SourceKind = 'core' | 'supplement';
export type AllowedFor = 'officer' | 'soldier' | 'both';

export interface SeedSource { code: string; name: string; kind: SourceKind; publishedDate: string; author: string; }
export interface SeedNation { name: string; sourceCode: string; notes: string | null; soldiers: string[]; }
export interface SeedAttribute { name: string; isOfficer: boolean; sourceCode: string; note: string; }
export interface SeedEquipment { name: string; category: string; slotCost: number; isSpecial: boolean; allowedFor: AllowedFor; sourceCode: string; note: string; }
export interface SeedOptionalRule { code: string; name: string; description: string; sourceCode: string; }
export interface SeedLoadoutItem { name: string; qty: number; }
export interface SeedLoadout { label: string; order: number; items: SeedLoadoutItem[]; }
export interface SeedSoldier {
  name: string;
  sourceCode: string;
  recruitmentCost: number;
  stats: { speed: number; melee: number; accuracy: number; defence: number; courage: number; health: number };
  maxPerUnit: number | null;
  equipmentMode: EquipmentMode;
  equipmentSlots: number | null;
  specialSlots: number | null;
  attributePicks: number;
  abilities: string[];
  notes: string | null;
  fixedAttributes: string[];
  loadouts: SeedLoadout[];
}

export const sources: SeedSource[] = [
  {
    "code": "britain",
    "name": "Britain — Bones of Albion",
    "kind": "supplement",
    "publishedDate": "2025-09-25",
    "author": "Joseph A. McCullough"
  },
  {
    "code": "canada",
    "name": "Canada",
    "kind": "supplement",
    "publishedDate": "2023-11-23",
    "author": "Ash Barker"
  },
  {
    "code": "carpathians",
    "name": "The Carpathians — Castle Fier",
    "kind": "supplement",
    "publishedDate": "2023-05-25",
    "author": "Joseph A. McCullough"
  },
  {
    "code": "core",
    "name": "The Silver Bayonet",
    "kind": "core",
    "publishedDate": "2021-11-11",
    "author": "Joseph A. McCullough"
  },
  {
    "code": "egypt",
    "name": "Egypt — Shadow of the Sphinx",
    "kind": "supplement",
    "publishedDate": "2024-05-23",
    "author": "Joseph A. McCullough"
  },
  {
    "code": "italy",
    "name": "Italy — The Shades of Calabria",
    "kind": "supplement",
    "publishedDate": "2024-11-28",
    "author": "T.C. Stephen"
  }
];

export const nations: SeedNation[] = [
  {
    "name": "Austria",
    "sourceCode": "core",
    "notes": null,
    "soldiers": [
      "Agent Provocateur",
      "Artillerist",
      "Coachman",
      "Conscript",
      "Dhamphir",
      "Doctor",
      "Grenadier",
      "Heavy Cavalryman",
      "Highwayman",
      "Infantryman",
      "Junior Officer",
      "Light Cavalryman",
      "Light Infantryman",
      "Occultist",
      "Provincial Soldier",
      "Sapper",
      "Supernatural Investigator",
      "Tactician",
      "Veteran Hunter",
      "Woodsman"
    ]
  },
  {
    "name": "Britain",
    "sourceCode": "core",
    "notes": null,
    "soldiers": [
      "Agent Provocateur",
      "Artillerist",
      "Bow Street Runner",
      "Coachman",
      "Conscript",
      "Doctor",
      "Grenadier",
      "Heavy Cavalryman",
      "Highlander",
      "Highwayman",
      "Infantryman",
      "Junior Officer",
      "Light Cavalryman",
      "Light Infantryman",
      "Marine",
      "Native Scout",
      "Occultist",
      "Provincial Soldier",
      "Rifleman",
      "Sailor",
      "Sapper",
      "Supernatural Investigator",
      "Veteran Hunter"
    ]
  },
  {
    "name": "Calabresi",
    "sourceCode": "italy",
    "notes": null,
    "soldiers": [
      "Agent Provocateur",
      "Calabrian Clergyman",
      "Champion of Faith",
      "Coachman",
      "Highwayman",
      "Irregular",
      "Lupo Mannaro",
      "Native Scout",
      "Occultist",
      "Supernatural Investigator",
      "Swordsman",
      "Tactician",
      "Veteran Hunter"
    ]
  },
  {
    "name": "Egypt",
    "sourceCode": "egypt",
    "notes": null,
    "soldiers": [
      "Artillerist",
      "Bedouin Raider",
      "Champion of Faith",
      "Coachman",
      "Doctor",
      "Egyptian Conscript",
      "Follower of the Old Gods",
      "Highwayman",
      "Infantryman",
      "Irregular",
      "Janissary",
      "Junior Officer",
      "Light Cavalryman",
      "Mameluke",
      "Native Scout",
      "Occultist",
      "Sailor",
      "Sapper",
      "Supernatural Investigator",
      "Swordsman",
      "Veteran Hunter"
    ]
  },
  {
    "name": "France",
    "sourceCode": "core",
    "notes": null,
    "soldiers": [
      "Agent Provocateur",
      "Artillerist",
      "Coachman",
      "Conscript",
      "Doctor",
      "Grenadier",
      "Guard",
      "Heavy Cavalryman",
      "Highwayman",
      "Infantryman",
      "Junior Officer",
      "Knight Hospitaller",
      "Light Cavalryman",
      "Light Infantryman",
      "Marine",
      "Native Scout",
      "Occultist",
      "Provincial Soldier",
      "Sailor",
      "Sapper",
      "Supernatural Investigator",
      "Veteran Hunter",
      "Vivandiere",
      "Voltigeur",
      "Woodsman"
    ]
  },
  {
    "name": "Kingdom of Naples",
    "sourceCode": "italy",
    "notes": null,
    "soldiers": [
      "Agent Provocateur",
      "Artillerist",
      "Champion of Faith",
      "Coachman",
      "Conscript",
      "Doctor",
      "Grenadier",
      "Highwayman",
      "Infantryman",
      "Irregular",
      "Junior Officer",
      "Light Cavalryman",
      "Light Infantryman",
      "Native Scout",
      "Provincial Soldier",
      "Sapper",
      "Supernatural Investigator",
      "Swordsman",
      "Veteran Hunter"
    ]
  },
  {
    "name": "Lower Canada",
    "sourceCode": "canada",
    "notes": null,
    "soldiers": [
      "Artillerist",
      "Champion of Faith",
      "Coachman",
      "Doctor",
      "Guard",
      "Highwayman",
      "Infantryman",
      "Junior Officer",
      "Light Cavalryman",
      "Loup Garou",
      "Native Scout",
      "Occultist",
      "Sailor",
      "Supernatural Investigator",
      "Veteran Hunter",
      "Vivandiere",
      "Voyageur",
      "Woodsman"
    ]
  },
  {
    "name": "Prussia",
    "sourceCode": "core",
    "notes": null,
    "soldiers": [
      "Agent Provocateur",
      "Artillerist",
      "Coachman",
      "Conscript",
      "Doctor",
      "Grenadier",
      "Guard",
      "Heavy Cavalryman",
      "Highwayman",
      "Infantryman",
      "Junior Officer",
      "Light Cavalryman",
      "Light Infantryman",
      "Occultist",
      "Provincial Soldier",
      "Rifleman",
      "Sapper",
      "Supernatural Investigator",
      "Swordsman",
      "Tactician",
      "Veteran Hunter",
      "Woodsman"
    ]
  },
  {
    "name": "Russia",
    "sourceCode": "core",
    "notes": null,
    "soldiers": [
      "Agent Provocateur",
      "Artillerist",
      "Champion of Faith",
      "Coachman",
      "Conscript",
      "Doctor",
      "Grenadier",
      "Heavy Cavalryman",
      "Highwayman",
      "Infantryman",
      "Irregular",
      "Junior Officer",
      "Knight Hospitaller",
      "Light Cavalryman",
      "Light Infantryman",
      "Marine",
      "Provincial Soldier",
      "Rifleman",
      "Sailor",
      "Sapper",
      "Supernatural Investigator",
      "Veteran Hunter",
      "Werebear",
      "Woodsman"
    ]
  },
  {
    "name": "Spain",
    "sourceCode": "core",
    "notes": null,
    "soldiers": [
      "Agent Provocateur",
      "Artillerist",
      "Champion of Faith",
      "Coachman",
      "Conscript",
      "Doctor",
      "Grenadier",
      "Heavy Cavalryman",
      "Highwayman",
      "Infantryman",
      "Irregular",
      "Junior Officer",
      "Knight Hospitaller",
      "Light Cavalryman",
      "Light Infantryman",
      "Marine",
      "Native Scout",
      "Provincial Soldier",
      "Sailor",
      "Sapper",
      "Supernatural Investigator",
      "Swordsman",
      "Veteran Hunter",
      "Woodsman"
    ]
  },
  {
    "name": "Trading Companies",
    "sourceCode": "canada",
    "notes": null,
    "soldiers": [
      "Champion of Faith",
      "Coachman",
      "Dhamphir",
      "Discovery Serviceman",
      "Doctor",
      "Grenadier",
      "Highlander",
      "Highwayman",
      "Infantryman",
      "Junior Officer",
      "Light Cavalryman",
      "Loup Garou",
      "Marine",
      "Native Scout",
      "Occultist",
      "Sailor",
      "Sapper",
      "Supernatural Investigator",
      "Tactician",
      "Veteran Hunter",
      "Voyageur",
      "Werebear",
      "Woodsman"
    ]
  },
  {
    "name": "United States",
    "sourceCode": "canada",
    "notes": null,
    "soldiers": [
      "Artillerist",
      "Champion of Faith",
      "Coachman",
      "Doctor",
      "Grenadier",
      "Heavy Cavalryman",
      "Highwayman",
      "Infantryman",
      "Junior Officer",
      "Light Cavalryman",
      "Marine",
      "Native Scout",
      "Occultist",
      "Rifleman",
      "Sailor",
      "Sapper",
      "Supernatural Investigator",
      "Veteran Hunter",
      "Woodsman"
    ]
  },
  {
    "name": "Upper Canada",
    "sourceCode": "canada",
    "notes": null,
    "soldiers": [
      "Artillerist",
      "Coachman",
      "Discovery Serviceman",
      "Doctor",
      "Grenadier",
      "Guard",
      "Highlander",
      "Highwayman",
      "Infantryman",
      "Junior Officer",
      "Light Cavalryman",
      "Marine",
      "Native Scout",
      "Occultist",
      "Sapper",
      "Supernatural Investigator",
      "Tactician",
      "Veteran Hunter",
      "Woodsman"
    ]
  }
];

export const attributes: SeedAttribute[] = [
  {
    "name": "Allergy (Silver and Fire)",
    "isOfficer": false,
    "sourceCode": "canada",
    "note": "This figure is allergic to both Silver and Fire."
  },
  {
    "name": "Ancient Spells",
    "isOfficer": false,
    "sourceCode": "egypt",
    "note": "A figure with this Attribute may spend an action to call upon its supernatural knowledge to try and bend reality."
  },
  {
    "name": "Artillerist",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "The figure is skilled in the use of artillery pieces."
  },
  {
    "name": "Blessed of Britain",
    "isOfficer": false,
    "sourceCode": "britain",
    "note": "Once per game, if this figure is on the table, the player may convert one Power Die in their Fate Pool into a Skill Die, or vice versa."
  },
  {
    "name": "Combat Engineer",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "The figure is skilled in the construction and demolition of battlefield structures, such as bridges and fortifications."
  },
  {
    "name": "Combat Rider",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure is trained to fight while mounted on a horse."
  },
  {
    "name": "Damage Reduction 1",
    "isOfficer": false,
    "sourceCode": "core",
    "note": "Whenever the figure takes damage, the amount of damage is reduced by 1, to a minimum of 0."
  },
  {
    "name": "Experience in the Desert",
    "isOfficer": false,
    "sourceCode": "egypt",
    "note": "This figure is experienced in desert conditions."
  },
  {
    "name": "Expert Climber",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "The figure is a skilled climber, either due to natural abilities or significant amounts of practice."
  },
  {
    "name": "Fey-Touched",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure has some association with the fairy realm, either spending time there, being enchanted by a fairy, or having learned secrets through intense study."
  },
  {
    "name": "Fire-Starter",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure may replace either a Move or Shoot action to swap one item of Specialist Equipment it is carrying with Oil and Torches."
  },
  {
    "name": "Great Faith",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure has an extremely strong faith in a higher power that sometimes allows it to damage creatures that would otherwise be immune to their weapons."
  },
  {
    "name": "Hard to Put Down",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "If a Fate Die is used to negate damage to this figure, the player may roll the die twice and choose which result to take."
  },
  {
    "name": "Indefatigable",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure may never be given more than one fatigue token."
  },
  {
    "name": "Inspiring",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "All allied figures within 6\" and line of sight of this figure receive +1 to all Courage Checks."
  },
  {
    "name": "Light Infantry Training",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure does not suffer a -1 modifier when Moving and Shooting, but can only move at a Speed of 4 when utilising this ability."
  },
  {
    "name": "Lunge",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure may spend an action to fight a round of melee against a target within 1\" instead of needing to be in contact."
  },
  {
    "name": "Master of Cover",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure is skilled at taking advantage of any little bit of cover it can find."
  },
  {
    "name": "Medic",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure is skilled in battlefield medicine."
  },
  {
    "name": "Miracles",
    "isOfficer": false,
    "sourceCode": "core",
    "note": "A figure with this Attribute may spend an action to call upon a higher power for miraculous intervention."
  },
  {
    "name": "Monster Expert",
    "isOfficer": false,
    "sourceCode": "core",
    "note": "If a figure with Monster Expert is part of a unit, the player may add one extra Monster Die to their Fate Pool at the start of each game."
  },
  {
    "name": "Nimble",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure is skilled at moving quickly through difficult terrain."
  },
  {
    "name": "Quick Heal",
    "isOfficer": false,
    "sourceCode": "canada",
    "note": "At the start of each turn, this figure regains 1 lost Health point (up to its starting Health)."
  },
  {
    "name": "Quick Load",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "In an emergency, this figure is practiced at loading a weapon extremely quickly."
  },
  {
    "name": "Quick to Run",
    "isOfficer": false,
    "sourceCode": "italy",
    "note": "Any time this character receives damage to their Health, roll a Terror Check."
  },
  {
    "name": "Scourge of Britain",
    "isOfficer": false,
    "sourceCode": "britain",
    "note": "Once per game, if this figure is on the table, the player may convert one Skill Die or Fate Die in their Fate Pool into a Monster Die."
  },
  {
    "name": "Skinshift (Bear)",
    "isOfficer": false,
    "sourceCode": "core",
    "note": "Skinshift: The figure may spend an action and pass a Courage Check (TN14) to change form, or when it takes damage it may optionally attempt that Check withou…"
  },
  {
    "name": "Skinshift (Werewolf)",
    "isOfficer": false,
    "sourceCode": "italy",
    "note": "Skinshift: The figure may spend an action and pass a Courage Check (TN14) to change form, or when it takes damage it may optionally attempt that Check withou…"
  },
  {
    "name": "Skinshift (Wolf)",
    "isOfficer": false,
    "sourceCode": "canada",
    "note": "Skinshift: The figure may spend an action and pass a Courage Check (TN14) to change form, or when it takes damage it may optionally attempt that Check withou…"
  },
  {
    "name": "Sneak",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "Once per scenario, this figure can move unseen if it does not attack this turn and stays its own movement range away from any hostile character or monster."
  },
  {
    "name": "Spells",
    "isOfficer": false,
    "sourceCode": "core",
    "note": "A figure with this Attribute may spend an action to call upon its supernatural knowledge to try and bend reality in some helpful way."
  },
  {
    "name": "Steady Legs",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure is used to moving and fighting on unsteady platforms, such as the deck of a ship."
  },
  {
    "name": "Strong",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure does +1 damage whenever it hits with a Melee Attack."
  },
  {
    "name": "Supernatural Veteran",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure has fought and survived many fights against the forces of darkness and has learned how to properly prepare."
  },
  {
    "name": "Swimmer",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure does not count any water terrain feature as difficult ground and, when in water, may choose to count as being in cover."
  },
  {
    "name": "Tactician",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "If a figure with Tactician is part of a unit, the player may add one extra Skill Die to their Fate Pool at the start of each game."
  },
  {
    "name": "Unflappable",
    "isOfficer": true,
    "sourceCode": "core",
    "note": "This figure has an internal strength that sometimes allows it to face the most horrific of dangers."
  }
];

export const equipment: SeedEquipment[] = [
  {
    "name": "Blunderbuss",
    "category": "weapon",
    "slotCost": 1,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "8\", Power Die+1, −1 Shoot, 2 targets @1\""
  },
  {
    "name": "Breastplate",
    "category": "armour",
    "slotCost": 1,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Armour (1), −1 Speed; firearms ignore it"
  },
  {
    "name": "Cartridge Box",
    "category": "gear",
    "slotCost": 1,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Reload musket or rifle"
  },
  {
    "name": "Cold Iron Shot",
    "category": "special-armoury",
    "slotCost": 0,
    "isSpecial": true,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Upgrade ammo — vs. goblins etc."
  },
  {
    "name": "Cold Iron Weapon",
    "category": "special-armoury",
    "slotCost": 0,
    "isSpecial": true,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Upgrade weapon — vs. goblins etc."
  },
  {
    "name": "Fencing Weapon",
    "category": "weapon",
    "slotCost": 1,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Melee, Skill Die dmg"
  },
  {
    "name": "Hand Weapon",
    "category": "weapon",
    "slotCost": 1,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Melee, Power Die dmg"
  },
  {
    "name": "Heavy Weapon",
    "category": "weapon",
    "slotCost": 2,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Melee, Power Die+1 (2 slots)"
  },
  {
    "name": "Holy Symbol",
    "category": "special-armoury",
    "slotCost": 0,
    "isSpecial": true,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Protection vs. undead/demons"
  },
  {
    "name": "Improvised Weapon",
    "category": "weapon",
    "slotCost": 1,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Melee, Power Die−1"
  },
  {
    "name": "Musket",
    "category": "weapon",
    "slotCost": 2,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "24\", Power Die dmg, bayonet"
  },
  {
    "name": "Oil and Torches",
    "category": "special-armoury",
    "slotCost": 1,
    "isSpecial": true,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Fire — vs. vampires/werewolves/trolls"
  },
  {
    "name": "Pistol",
    "category": "weapon",
    "slotCost": 1,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "8\", Power Die; max 2/figure"
  },
  {
    "name": "Rifle",
    "category": "weapon",
    "slotCost": 2,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "30\", Skill Die dmg (not Power!)"
  },
  {
    "name": "Salt Bag",
    "category": "special-armoury",
    "slotCost": 1,
    "isSpecial": true,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Load salt — vs. ghosts/demons"
  },
  {
    "name": "Shot Bag",
    "category": "gear",
    "slotCost": 1,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Reload blunderbuss"
  },
  {
    "name": "Silver Shot",
    "category": "special-armoury",
    "slotCost": 0,
    "isSpecial": true,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Upgrade ammo — vs. werewolves"
  },
  {
    "name": "Silver Weapon",
    "category": "special-armoury",
    "slotCost": 0,
    "isSpecial": true,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "Upgrade weapon — vs. werewolves"
  },
  {
    "name": "Volley Gun",
    "category": "weapon",
    "slotCost": 2,
    "isSpecial": false,
    "allowedFor": "both",
    "sourceCode": "core",
    "note": "14\", Power Die+1, −1 Shoot, 3 targets"
  }
];

export const optionalRules: SeedOptionalRule[] = [];

export const soldiers: SeedSoldier[] = [
  {
    "name": "Agent Provocateur",
    "sourceCode": "italy",
    "recruitmentCost": 22,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 1,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "choice",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Master of Cover",
      "Sneak",
      "Supernatural Veteran"
    ],
    "notes": null,
    "fixedAttributes": [
      "Master of Cover",
      "Sneak",
      "Supernatural Veteran"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon, 2 Pistols",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 2
          }
        ]
      },
      {
        "label": "Hand Weapon, Blunderbuss, Shot Bag",
        "order": 1,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Blunderbuss",
            "qty": 1
          },
          {
            "name": "Shot Bag",
            "qty": 1
          }
        ]
      },
      {
        "label": "Fencing Weapon, 2 Pistols",
        "order": 2,
        "items": [
          {
            "name": "Fencing Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 2
          }
        ]
      },
      {
        "label": "Fencing Weapon, Blunderbuss, Shot Bag",
        "order": 3,
        "items": [
          {
            "name": "Fencing Weapon",
            "qty": 1
          },
          {
            "name": "Blunderbuss",
            "qty": 1
          },
          {
            "name": "Shot Bag",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Artillerist",
    "sourceCode": "core",
    "recruitmentCost": 10,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Artillerist"
    ],
    "notes": null,
    "fixedAttributes": [
      "Artillerist"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Bedouin Raider",
    "sourceCode": "egypt",
    "recruitmentCost": 18,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Combat Rider",
      "Experience in the Desert"
    ],
    "notes": null,
    "fixedAttributes": [
      "Combat Rider",
      "Experience in the Desert"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          },
          {
            "name": "Hand Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Bow Street Runner",
    "sourceCode": "britain",
    "recruitmentCost": 13,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 1,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [],
    "notes": null,
    "fixedAttributes": [],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Pistol",
            "qty": 2
          },
          {
            "name": "Hand Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Calabrian Clergyman",
    "sourceCode": "italy",
    "recruitmentCost": 14,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 13,
      "courage": 1,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "choice",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Great Faith"
    ],
    "notes": null,
    "fixedAttributes": [
      "Great Faith"
    ],
    "loadouts": [
      {
        "label": "Musket, Cartridge Box",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      },
      {
        "label": "Blunderbuss, Shot Bag",
        "order": 1,
        "items": [
          {
            "name": "Blunderbuss",
            "qty": 1
          },
          {
            "name": "Shot Bag",
            "qty": 1
          }
        ]
      },
      {
        "label": "Hand Weapon, Pistol",
        "order": 2,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          }
        ]
      },
      {
        "label": "Volley Gun",
        "order": 3,
        "items": [
          {
            "name": "Volley Gun",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Champion of Faith",
    "sourceCode": "core",
    "recruitmentCost": 20,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 13,
      "courage": 3,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Miracles",
      "Supernatural Veteran"
    ],
    "notes": null,
    "fixedAttributes": [
      "Miracles",
      "Supernatural Veteran"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Coachman",
    "sourceCode": "carpathians",
    "recruitmentCost": 15,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 0,
      "health": 12
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Hard to Put Down"
    ],
    "notes": null,
    "fixedAttributes": [
      "Hard to Put Down"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Blunderbuss",
            "qty": 1
          },
          {
            "name": "Shot Bag",
            "qty": 1
          },
          {
            "name": "Hand Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Conscript",
    "sourceCode": "italy",
    "recruitmentCost": 6,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": -1,
      "defence": 13,
      "courage": -1,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Quick to Run"
    ],
    "notes": null,
    "fixedAttributes": [
      "Quick to Run"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Dhamphir",
    "sourceCode": "core",
    "recruitmentCost": 30,
    "stats": {
      "speed": 7,
      "melee": 2,
      "accuracy": 1,
      "defence": 14,
      "courage": 3,
      "health": 12
    },
    "maxPerUnit": 1,
    "equipmentMode": "pool",
    "equipmentSlots": 6,
    "specialSlots": 2,
    "attributePicks": 0,
    "abilities": [
      "Damage Reduction 1",
      "Strong",
      "Indefatigable"
    ],
    "notes": null,
    "fixedAttributes": [
      "Damage Reduction 1",
      "Indefatigable",
      "Strong"
    ],
    "loadouts": []
  },
  {
    "name": "Discovery Serviceman",
    "sourceCode": "canada",
    "recruitmentCost": 18,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 1,
      "health": 12
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Expert Climber",
      "Steady Legs"
    ],
    "notes": null,
    "fixedAttributes": [
      "Expert Climber",
      "Steady Legs"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Blunderbuss",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          },
          {
            "name": "Shot Bag",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Doctor",
    "sourceCode": "core",
    "recruitmentCost": 10,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 0,
      "defence": 13,
      "courage": 1,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Medic"
    ],
    "notes": null,
    "fixedAttributes": [
      "Medic"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Egyptian Conscript",
    "sourceCode": "egypt",
    "recruitmentCost": 4,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 11,
      "courage": -2,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [],
    "notes": null,
    "fixedAttributes": [],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Follower of the Old Gods",
    "sourceCode": "egypt",
    "recruitmentCost": 20,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 13,
      "courage": 3,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Ancient Spells",
      "Supernatural Veteran"
    ],
    "notes": null,
    "fixedAttributes": [
      "Ancient Spells",
      "Supernatural Veteran"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Grenadier",
    "sourceCode": "core",
    "recruitmentCost": 15,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 14,
      "courage": 1,
      "health": 11
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [],
    "notes": null,
    "fixedAttributes": [],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Guard",
    "sourceCode": "core",
    "recruitmentCost": 18,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 14,
      "courage": 2,
      "health": 12
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Supernatural Veteran"
    ],
    "notes": null,
    "fixedAttributes": [
      "Supernatural Veteran"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Heavy Cavalryman",
    "sourceCode": "core",
    "recruitmentCost": 23,
    "stats": {
      "speed": 5,
      "melee": 2,
      "accuracy": 1,
      "defence": 13,
      "courage": 2,
      "health": 12
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Combat Rider"
    ],
    "notes": null,
    "fixedAttributes": [
      "Combat Rider"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Breastplate",
            "qty": 1
          },
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Highlander",
    "sourceCode": "core",
    "recruitmentCost": 18,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 1,
      "defence": 13,
      "courage": 1,
      "health": 11
    },
    "maxPerUnit": null,
    "equipmentMode": "choice",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [],
    "notes": null,
    "fixedAttributes": [],
    "loadouts": [
      {
        "label": "Musket, Cartridge Box",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      },
      {
        "label": "Heavy Weapon, Pistol",
        "order": 1,
        "items": [
          {
            "name": "Heavy Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Highwayman",
    "sourceCode": "carpathians",
    "recruitmentCost": 18,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Combat Rider"
    ],
    "notes": null,
    "fixedAttributes": [
      "Combat Rider"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Pistol",
            "qty": 2
          }
        ]
      }
    ]
  },
  {
    "name": "Infantryman",
    "sourceCode": "core",
    "recruitmentCost": 10,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [],
    "notes": null,
    "fixedAttributes": [],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Irregular",
    "sourceCode": "core",
    "recruitmentCost": 15,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "choice",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Nimble",
      "Master of Cover"
    ],
    "notes": null,
    "fixedAttributes": [
      "Master of Cover",
      "Nimble"
    ],
    "loadouts": [
      {
        "label": "Musket, Cartridge Box",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      },
      {
        "label": "Hand Weapon, 2 Pistols",
        "order": 1,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 2
          }
        ]
      }
    ]
  },
  {
    "name": "Janissary",
    "sourceCode": "egypt",
    "recruitmentCost": 12,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 1,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [],
    "notes": null,
    "fixedAttributes": [],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          },
          {
            "name": "Fencing Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Junior Officer",
    "sourceCode": "core",
    "recruitmentCost": 22,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 1,
      "defence": 13,
      "courage": 2,
      "health": 12
    },
    "maxPerUnit": 1,
    "equipmentMode": "choice",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 1,
    "abilities": [],
    "notes": null,
    "fixedAttributes": [],
    "loadouts": [
      {
        "label": "Hand Weapon, 2 Pistols",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 2
          }
        ]
      },
      {
        "label": "Fencing Weapon, 2 Pistols",
        "order": 1,
        "items": [
          {
            "name": "Fencing Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 2
          }
        ]
      }
    ]
  },
  {
    "name": "Knight Hospitaller",
    "sourceCode": "egypt",
    "recruitmentCost": 15,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 1,
      "defence": 13,
      "courage": 2,
      "health": 12
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Medic"
    ],
    "notes": null,
    "fixedAttributes": [
      "Medic"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Holy Symbol",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Light Cavalryman",
    "sourceCode": "core",
    "recruitmentCost": 18,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 1,
      "defence": 13,
      "courage": 1,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Combat Rider"
    ],
    "notes": null,
    "fixedAttributes": [
      "Combat Rider"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Light Infantryman",
    "sourceCode": "italy",
    "recruitmentCost": 16,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Light Infantry Training"
    ],
    "notes": null,
    "fixedAttributes": [
      "Light Infantry Training"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Loup Garou",
    "sourceCode": "canada",
    "recruitmentCost": 30,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 14,
      "courage": 1,
      "health": 14
    },
    "maxPerUnit": 1,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Skinshift (Wolf)",
      "Allergy (Silver and Fire)",
      "Quick Heal"
    ],
    "notes": null,
    "fixedAttributes": [
      "Allergy (Silver and Fire)",
      "Quick Heal",
      "Skinshift (Wolf)"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Lupo Mannaro",
    "sourceCode": "italy",
    "recruitmentCost": 30,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 12,
      "courage": 3,
      "health": 11
    },
    "maxPerUnit": 1,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Skinshift (Werewolf)"
    ],
    "notes": null,
    "fixedAttributes": [
      "Skinshift (Werewolf)"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Mameluke",
    "sourceCode": "egypt",
    "recruitmentCost": 30,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 2,
      "defence": 13,
      "courage": 2,
      "health": 12
    },
    "maxPerUnit": null,
    "equipmentMode": "choice",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 1,
    "abilities": [
      "Combat Rider"
    ],
    "notes": null,
    "fixedAttributes": [
      "Combat Rider"
    ],
    "loadouts": [
      {
        "label": "Musket, Cartridge Box, Pistol, Hand Weapon",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          },
          {
            "name": "Hand Weapon",
            "qty": 1
          }
        ]
      },
      {
        "label": "Musket, Cartridge Box, Pistol, Fencing Weapon",
        "order": 1,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          },
          {
            "name": "Fencing Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Marine",
    "sourceCode": "core",
    "recruitmentCost": 12,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 1,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Steady Legs"
    ],
    "notes": null,
    "fixedAttributes": [
      "Steady Legs"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Native Scout",
    "sourceCode": "core",
    "recruitmentCost": 18,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 2,
      "health": 12
    },
    "maxPerUnit": null,
    "equipmentMode": "choice",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Master of Cover"
    ],
    "notes": null,
    "fixedAttributes": [
      "Master of Cover"
    ],
    "loadouts": [
      {
        "label": "Musket, Cartridge Box",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      },
      {
        "label": "Heavy Weapon",
        "order": 1,
        "items": [
          {
            "name": "Heavy Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Occultist",
    "sourceCode": "core",
    "recruitmentCost": 20,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 13,
      "courage": 3,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Spells",
      "Supernatural Veteran"
    ],
    "notes": null,
    "fixedAttributes": [
      "Spells",
      "Supernatural Veteran"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Provincial Soldier",
    "sourceCode": "italy",
    "recruitmentCost": 8,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 0,
      "defence": 13,
      "courage": -1,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [],
    "notes": null,
    "fixedAttributes": [],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Rifleman",
    "sourceCode": "core",
    "recruitmentCost": 18,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 2,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [],
    "notes": null,
    "fixedAttributes": [],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Rifle",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Sailor",
    "sourceCode": "core",
    "recruitmentCost": 12,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Expert Climber",
      "Steady Legs"
    ],
    "notes": null,
    "fixedAttributes": [
      "Expert Climber",
      "Steady Legs"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Sapper",
    "sourceCode": "core",
    "recruitmentCost": 12,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Combat Engineer"
    ],
    "notes": null,
    "fixedAttributes": [
      "Combat Engineer"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          },
          {
            "name": "Heavy Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Supernatural Investigator",
    "sourceCode": "core",
    "recruitmentCost": 22,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 1,
      "defence": 14,
      "courage": 0,
      "health": 12
    },
    "maxPerUnit": null,
    "equipmentMode": "choice",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Supernatural Veteran",
      "Monster Expert"
    ],
    "notes": null,
    "fixedAttributes": [
      "Monster Expert",
      "Supernatural Veteran"
    ],
    "loadouts": [
      {
        "label": "Fencing Weapon, 2 Pistols",
        "order": 0,
        "items": [
          {
            "name": "Fencing Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 2
          }
        ]
      },
      {
        "label": "Heavy Weapon, Pistol",
        "order": 1,
        "items": [
          {
            "name": "Heavy Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Swordsman",
    "sourceCode": "core",
    "recruitmentCost": 22,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 1,
      "defence": 14,
      "courage": 1,
      "health": 11
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Indefatigable"
    ],
    "notes": null,
    "fixedAttributes": [
      "Indefatigable"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Fencing Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Tactician",
    "sourceCode": "core",
    "recruitmentCost": 20,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 14,
      "courage": 2,
      "health": 12
    },
    "maxPerUnit": null,
    "equipmentMode": "choice",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Tactician"
    ],
    "notes": null,
    "fixedAttributes": [
      "Tactician"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon, 2 Pistols",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 2
          }
        ]
      },
      {
        "label": "Fencing Weapon, 2 Pistols",
        "order": 1,
        "items": [
          {
            "name": "Fencing Weapon",
            "qty": 1
          },
          {
            "name": "Pistol",
            "qty": 2
          }
        ]
      }
    ]
  },
  {
    "name": "Veteran Hunter",
    "sourceCode": "core",
    "recruitmentCost": 30,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 2,
      "defence": 14,
      "courage": 0,
      "health": 12
    },
    "maxPerUnit": null,
    "equipmentMode": "pool",
    "equipmentSlots": 6,
    "specialSlots": 2,
    "attributePicks": 1,
    "abilities": [],
    "notes": null,
    "fixedAttributes": [],
    "loadouts": []
  },
  {
    "name": "Vivandiere",
    "sourceCode": "core",
    "recruitmentCost": 10,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 13,
      "courage": 3,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Inspiring",
      "Master of Cover",
      "Supernatural Veteran"
    ],
    "notes": null,
    "fixedAttributes": [
      "Inspiring",
      "Master of Cover",
      "Supernatural Veteran"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Voltigeur",
    "sourceCode": "italy",
    "recruitmentCost": 18,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 2,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Nimble",
      "Light Infantry Training"
    ],
    "notes": null,
    "fixedAttributes": [
      "Light Infantry Training",
      "Nimble"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Voyageur",
    "sourceCode": "canada",
    "recruitmentCost": 20,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 14,
      "courage": 1,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Steady Legs",
      "Strong"
    ],
    "notes": null,
    "fixedAttributes": [
      "Steady Legs",
      "Strong"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Hand Weapon",
            "qty": 1
          },
          {
            "name": "Rifle",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Werebear",
    "sourceCode": "core",
    "recruitmentCost": 30,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 14,
      "courage": 0,
      "health": 12
    },
    "maxPerUnit": 1,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Skinshift (Bear)"
    ],
    "notes": null,
    "fixedAttributes": [
      "Skinshift (Bear)"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Heavy Weapon",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Woodsman",
    "sourceCode": "canada",
    "recruitmentCost": 15,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "maxPerUnit": null,
    "equipmentMode": "fixed",
    "equipmentSlots": null,
    "specialSlots": null,
    "attributePicks": 0,
    "abilities": [
      "Nimble",
      "Fire-Starter"
    ],
    "notes": null,
    "fixedAttributes": [
      "Fire-Starter",
      "Nimble"
    ],
    "loadouts": [
      {
        "label": "Standard",
        "order": 0,
        "items": [
          {
            "name": "Rifle",
            "qty": 1
          },
          {
            "name": "Cartridge Box",
            "qty": 1
          }
        ]
      }
    ]
  }
];

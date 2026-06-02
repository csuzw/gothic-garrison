// AUTO-GENERATED — do not edit by hand.
// Exported from the database by `pnpm db:export-seed` (src/export-seed-data.ts).
// This is the canonical, git-committed reference data seeded into every
// environment via `pnpm db:seed`. To change it, edit reference rows in the
// local-only Codex and re-export, so each change is a reviewable diff.
/* eslint-disable */

export type EquipmentMode = 'fixed' | 'choice' | 'pool';
export type SourceKind = 'core' | 'supplement';

export interface SeedSource { code: string; name: string; kind: SourceKind; publishedDate: string; author: string; ospreyCoverUrl: string | null; coverImageUrl: string | null; }
export interface SeedNation { name: string; sourceCode: string; description: string | null; flag: string | null; soldiers: string[]; }
export interface SeedAttribute { name: string; isOfficer: boolean; sourceCode: string; rules: string; }
export interface SeedEquipment { name: string; category: string; slotCost: number; isSpecial: boolean; sourceCode: string; rules: string; }
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
  description: string | null;
  fixedAttributes: string[];
  loadouts: SeedLoadout[];
}
export interface SeedMonster {
  name: string;
  sourceCode: string;
  experience: number;
  stats: { speed: number; melee: number; accuracy: number; defence: number; courage: number; health: number };
  equipmentMode: 'fixed' | 'choice';
  description: string | null;
  fixedAttributes: string[];
  loadouts: SeedLoadout[];
}

export const sources: SeedSource[] = [
  {
    "code": "britain",
    "name": "Britain — Bones of Albion",
    "kind": "supplement",
    "publishedDate": "2025-09-25",
    "author": "Joseph A. McCullough",
    "ospreyCoverUrl": "https://www.ospreypublishing.com/uk/silver-bayonet-britain-bones-of-albion-9781472869357/",
    "coverImageUrl": "https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_300,c_scale/jackets/9781472869357.jpg"
  },
  {
    "code": "canada",
    "name": "Canada",
    "kind": "supplement",
    "publishedDate": "2023-11-23",
    "author": "Ash Barker",
    "ospreyCoverUrl": "https://www.ospreypublishing.com/uk/silver-bayonet-canada-9781472858870/",
    "coverImageUrl": "https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_300,c_scale/jackets/9781472858870.jpg"
  },
  {
    "code": "carpathians",
    "name": "The Carpathians — Castle Fier",
    "kind": "supplement",
    "publishedDate": "2023-05-25",
    "author": "Joseph A. McCullough",
    "ospreyCoverUrl": "https://www.ospreypublishing.com/uk/silver-bayonet-the-carpathians-castle-fier-9781472858788/",
    "coverImageUrl": "https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_300,c_scale/jackets/9781472858788.jpg"
  },
  {
    "code": "core",
    "name": "The Silver Bayonet",
    "kind": "core",
    "publishedDate": "2021-11-11",
    "author": "Joseph A. McCullough",
    "ospreyCoverUrl": "https://www.ospreypublishing.com/uk/silver-bayonet-9781472844859/",
    "coverImageUrl": "https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_300,c_scale/jackets/9781472844859.jpg"
  },
  {
    "code": "egypt",
    "name": "Egypt — Shadow of the Sphinx",
    "kind": "supplement",
    "publishedDate": "2024-05-23",
    "author": "Joseph A. McCullough",
    "ospreyCoverUrl": "https://www.ospreypublishing.com/uk/silver-bayonet-egypt-shadow-of-the-sphinx-9781472858863/",
    "coverImageUrl": "https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_300,c_scale/jackets/9781472858863.jpg"
  },
  {
    "code": "italy",
    "name": "Italy — The Shades of Calabria",
    "kind": "supplement",
    "publishedDate": "2024-11-28",
    "author": "T.C. Stephen",
    "ospreyCoverUrl": "https://www.ospreypublishing.com/uk/silver-bayonet-italy-the-shades-of-calabria-9781472865861/",
    "coverImageUrl": "https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_300,c_scale/jackets/9781472865861.jpg"
  }
];

export const nations: SeedNation[] = [
  {
    "name": "Austria",
    "sourceCode": "core",
    "description": "The Habsburg Empire was Napoleon's most relentless continental adversary—suffering crushing defeats at Austerlitz (1805) and Wagram (1809), yet always returning to the fight until the final coalition brought France down.",
    "flag": "/flags/austria.svg",
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
    "description": "The world's pre-eminent naval power and the only major nation never subdued by Napoleon—bankrolling coalitions, strangling French trade, and fighting the long Peninsular campaign that opened the road to Paris.",
    "flag": "/flags/britain.svg",
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
    "description": "The fierce peasants and brigands of Calabria waged savage guerrilla war against French occupation from 1806, sustained by British gold and arms shipped from nearby Sicily.",
    "flag": "/flags/calabresi.svg",
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
    "description": "Nominally under Ottoman rule but riven by French invasion (1798), British counter-intervention, and Mamluk power struggles—until the ruthless Muhammad Ali seized control in 1805 and began remaking it as his own.",
    "flag": "/flags/egypt.svg",
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
    "description": "Under Napoleon's iron command, France dominated continental Europe from Portugal to Poland—its Grande Armée the terror of every capital and its secret services hunting enemies far stranger than mere spies.",
    "flag": "/flags/france.svg",
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
    "description": "The Bourbon rulers of Naples, driven from the mainland by Napoleon and sheltering in Sicily under British protection—exiles watching Murat occupy their throne while backing the Calabrian resistance across the water.",
    "flag": "/flags/kingdom-of-naples.svg",
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
    "description": "A British colony of predominantly French-speaking Catholics, Lower Canada sat uneasily under the Crown—its habitants repelling American invasions during the War of 1812 while its ancient forests hid older dangers still.",
    "flag": "/flags/lower-canada.svg",
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
    "description": "Frederick the Great's shadow masked Prussia's institutional rot until Jena-Auerstedt in 1806 broke the spell. Rebuilt under Scharnhorst and Gneisenau, it became a cornerstone of the coalitions that ended Napoleon.",
    "flag": "/flags/prussia.svg",
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
    "description": "A vast empire stretching from the Baltic to the Pacific, Russia twice allied and fell out with Napoleon before his catastrophic 1812 invasion—a campaign that began in triumph and ended in frozen ruin, turning the tide of the whole war.",
    "flag": "/flags/russia.svg",
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
    "description": "French troops entered as allies in 1808 and stayed as conquerors—sparking the Peninsular War, a brutal guerrilla conflict that bled France white and gave Wellington his road to victory.",
    "flag": "/flags/spain.svg",
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
    "description": "The fur-trading giants—Hudson's Bay Company and the North West Company—acted as quasi-governmental powers across the Canadian interior, fielding their own hired fighters to protect interests that no government could reach.",
    "flag": "/flags/trading-companies.svg",
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
    "description": "A young republic still finding its feet, the US stood on the precipice of war with Britain over trade and impressment—a conflict that became the War of 1812, fought largely on the Canadian frontier it tried and failed to seize.",
    "flag": "/flags/united-states.svg",
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
    "description": "The culturally British settlements along the northern shore of the Great Lakes, populated largely by Loyalists who had fled the American Revolution—and now in 1812 facing a fresh American invasion across the same border.",
    "flag": "/flags/upper-canada.svg",
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
    "name": "Allergy (Blessed Weapons)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Indestructible and Damage Reduction are ignored for Blessed Weapon attacks against this figure."
  },
  {
    "name": "Allergy (Cold Iron)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Indestructible and Damage Reduction are ignored for Cold Iron attacks against this figure."
  },
  {
    "name": "Allergy (Enchanted Weapons)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Indestructible and Damage Reduction are ignored for Enchanted Weapon attacks against this figure."
  },
  {
    "name": "Allergy (Fire)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Indestructible and Damage Reduction are ignored for Fire attacks against this figure."
  },
  {
    "name": "Allergy (Salt)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Indestructible and Damage Reduction are ignored for Salt attacks against this figure."
  },
  {
    "name": "Allergy (Silver)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Indestructible and Damage Reduction are ignored for Silver attacks against this figure."
  },
  {
    "name": "Ancient Spells",
    "isOfficer": false,
    "sourceCode": "egypt",
    "rules": "Spend an action; Courage Check (TN10). On success, choose one: Control Creature (add 1 Monster Die if unit has none), Flaming Weapon (figure within 8\" LoS gains +1 Melee damage and Fire attacks for the game), or Viper (place a viper within 3\", min 1\" from others). Figure suffers 1 damage either way."
  },
  {
    "name": "Artillerist",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "At least one figure with this attribute must be within 1\" of an artillery piece to employ it. Specific uses noted in scenarios."
  },
  {
    "name": "Blessed of Britain",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "Once per game, convert one Power Die to a Skill Die or vice versa; this figure regains up to 3 lost Health."
  },
  {
    "name": "Brittle",
    "isOfficer": false,
    "sourceCode": "italy",
    "rules": "If struck with a Heavy Weapon, or critically hit by any weapon, remove this figure from the table."
  },
  {
    "name": "Chaotic",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "If a Monster Die is used to influence this figure's movement.  Roll a D10, on a 1-3 discard the Monster Die with no effect, other it works as normal."
  },
  {
    "name": "Chilling Touch",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Melee attacks ignore armour and deal +1 damage."
  },
  {
    "name": "Combat Engineer",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "Skilled in construction and demolition of battlefield structures and use of gunpowder as an explosive. Specific uses noted in scenarios."
  },
  {
    "name": "Combat Rider",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "This figure is trained to fight while mounted on a horse. See Cavalry rules."
  },
  {
    "name": "Command Skeletal Roman Legionary",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "All Skeletal Roman Legionaries gain +1 Speed, +1 Courage, and the Strong attribute while this figure is in play."
  },
  {
    "name": "Curse of the Evil Eye",
    "isOfficer": false,
    "sourceCode": "italy",
    "rules": "Attack rolls of 9 or 10 against this figure, or Attack rolls of 1 or 2 made by this figure are rerolled.  Second roll stands.  Figures with Great Faith attribute or Holy Symbol are immune to this."
  },
  {
    "name": "Damage Reduction - Projectiles Only (4)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Whenever this figure takes damage from a projectile, reduce it by 4 (minimum 0)."
  },
  {
    "name": "Damage Reduction - Projectiles Only (8)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Whenever this figure takes damage from a projectile, reduce it by 8 (minimum 0)."
  },
  {
    "name": "Damage Reduction (1)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Whenever this figure takes damage, reduce it by 1 (minimum 0)."
  },
  {
    "name": "Damage Reduction (2)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Whenever this figure takes damage, reduce it by 2 (minimum 0)."
  },
  {
    "name": "Damage Reduction (3)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Whenever this figure takes damage, reduce it by 3 (minimum 0)."
  },
  {
    "name": "Damage Reduction (4)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Whenever this figure takes damage, reduce it by 4 (minimum 0)."
  },
  {
    "name": "Damage Reduction (5)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Whenever this figure takes damage, reduce it by 5 (minimum 0)."
  },
  {
    "name": "Damage Reduction (6)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Whenever this figure takes damage, reduce it by 6 (minimum 0)."
  },
  {
    "name": "Damage Reduction (7)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Whenever this figure takes damage, reduce it by 7 (minimum 0)."
  },
  {
    "name": "Damage Reduction (8)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Whenever this figure takes damage, reduce it by 8 (minimum 0)."
  },
  {
    "name": "Dark Gift",
    "isOfficer": false,
    "sourceCode": "italy",
    "rules": "On activation, make a Courage Check (TN10).  On success, heal any undead creatures within 6\" by 2.  If there are no undead creatures within 6\", heal self 2 or if at full Health, use Raise  the Dead attribute."
  },
  {
    "name": "Demonic Fire",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Can make Shooting Attacks at 12\" that are enchanted and +2 damage.  Does not require reloading."
  },
  {
    "name": "Ethereal",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "See and move through terrain.  Never suffers Speed penalties for difficult ground, obstacles, or climbing."
  },
  {
    "name": "Ethereal Cavalry",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "All cavalry rules apply to Melee and Shooting for this figure but not Movement.  Counts as having Ethereal.  Cannot dismount."
  },
  {
    "name": "Ethereal Firearms",
    "isOfficer": false,
    "sourceCode": "italy",
    "rules": "Acts like a musket, but does not need reloading.  Can only fire once per turn.  Ignores armour and does +1 damage.  Optionally, hard mode, ignores cover."
  },
  {
    "name": "Experience in the Desert",
    "isOfficer": false,
    "sourceCode": "egypt",
    "rules": "The special rules Extreme Temperatures, Loose Sand, and Thirst do not apply to this figure."
  },
  {
    "name": "Expert Climber",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "This figure may climb at its normal movement rate (1\" of climbing = 1\" of movement)."
  },
  {
    "name": "Fey-Touched",
    "isOfficer": true,
    "sourceCode": "carpathians",
    "rules": "All attacks made by this figure count as Enchanted. May be given to any soldier at +4 recruitment cost."
  },
  {
    "name": "Fire-Starter",
    "isOfficer": true,
    "sourceCode": "carpathians",
    "rules": "May replace a Move or Shoot action to swap one carried Specialist Equipment item for Oil and Torches. Returns to normal equipment after the game."
  },
  {
    "name": "Flitting Movement",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "When activated, move 6\" in a random direction.  Moves through other figures, cannot move off the table or be within 1\" of another figure at end of movement."
  },
  {
    "name": "Flying",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Can move over  or up any terrain without movement penalty."
  },
  {
    "name": "Frenzy",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "If this figure causes damage with a Melee Attack, it's opponent must Back Off.  A Monster Die can only be used to change movement to a Movement to Attack action for this figure."
  },
  {
    "name": "Great Faith",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "This figure's weapons always count as Blessed."
  },
  {
    "name": "Hard to Put Down",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "If a Fate Die is used to negate damage to this figure, the player may roll the die twice and choose which result to take."
  },
  {
    "name": "Head-Taker",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "Any figure reduced to 0 Health by this figure suffers -1 to roll on Injury and Death table after game."
  },
  {
    "name": "Hypnotic",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Enemies that Move to Attack this figure must make a Courage Check (TN12).  If they fail, they still move but cannot make a Melee Check.  This figure can still Strike Back or Back Off."
  },
  {
    "name": "Indefatigable",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "This figure may never have more than one fatigue token.  Any effect that would give a second is ignored."
  },
  {
    "name": "Indestructible",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Immune to all sources of damage except those it has an Allergy to."
  },
  {
    "name": "Induce Terror",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "On activation, any opponents in LoS make a Terror Check at -3 within 8\", and -1 otherwise."
  },
  {
    "name": "Inimical to Technology",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Cannot use technology with 6\" of this figure.  Shooting Checks for firearms or artillery will automatically miss."
  },
  {
    "name": "Inspiring",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "Allied figures within 6\" and LoS receive +1 to Courage Checks (not the Inspiring figure itself). Only one Inspiring bonus applies per figure regardless of how many are in range."
  },
  {
    "name": "Irritant",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "This figure will never attack.  If it moves into contact with an enemy, give the enemy a fatigue token and move this figure 1\" back.  If attacked, this creature will always Back Off."
  },
  {
    "name": "Large",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Shooting Checks made against this figure are at +1."
  },
  {
    "name": "Light Infantry Training",
    "isOfficer": true,
    "sourceCode": "italy",
    "rules": "This figure does not suffer a -1 modifier when Moving and Shooting, but can only move at a Speed of 4 when utilising this ability."
  },
  {
    "name": "Lunge",
    "isOfficer": true,
    "sourceCode": "canada",
    "rules": "Spend an action to fight melee against a target within 1\" without needing contact (within 2\" if this figure also has Large). May be measured vertically."
  },
  {
    "name": "Master of Cover",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "If this figure is in cover and targeted by a Shooting Attack, the cover penalty to the attacker is -2 instead of -1."
  },
  {
    "name": "Medic",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "Activate within 1\" of a friendly figure without moving: spend action to heal 2 Health (cannot heal the same figure two turns in a row). If a figure is reduced to exactly 0 Health, lay it on its side — a Medic who reaches it may heal normally. Enemy contact removes a 0-Health figure."
  },
  {
    "name": "Miracles",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Spend an action; Courage Check (TN10). On success, choose one: Healing (figure within 8\" LoS regains 3 Health, not self), Courage (figure within 8\" LoS gains +1 Courage for the game), or Bless Weapon (figure within 8\" LoS has one weapon count as Blessed for the game). Figure suffers 1 damage either way."
  },
  {
    "name": "Monster Expert",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Adds 1 Monster Die to the unit's Fate Pool at the start of each game. Only one extra die regardless of how many Monster Expert figures are in the unit."
  },
  {
    "name": "Nimble",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "Suffers no movement penalties for difficult ground."
  },
  {
    "name": "Paralyse",
    "isOfficer": false,
    "sourceCode": "italy",
    "rules": "If this figure damages another figure with a Melee Attack, that figure is Paralysed (see Terror Check rules)."
  },
  {
    "name": "Powerful Jaws",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "On Melee Attack use higher of Power Die and Skill Die to determine damage."
  },
  {
    "name": "Quick Heal",
    "isOfficer": false,
    "sourceCode": "canada",
    "rules": "At the start of each turn, this figure regains 1 lost Health point (up to its starting Health)."
  },
  {
    "name": "Quick Healing",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Gain 2 points of Health every time it activates up to it's starting value."
  },
  {
    "name": "Quick Load",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "May fire an unloaded weapon at -2 to the Shooting Attack. Critical failure on a roll of 2-4."
  },
  {
    "name": "Quick to Run",
    "isOfficer": false,
    "sourceCode": "italy",
    "rules": "Any time this character receives damage to their Health, roll a Terror Check."
  },
  {
    "name": "Rage",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Make a Courage Check (TN14).  On failure must Move or Move to Attack the closest enemy.  On success can use actions normally."
  },
  {
    "name": "Raise the Dead",
    "isOfficer": false,
    "sourceCode": "italy",
    "rules": "Roll D10 to summon monster with 3\" of this figure (1-5: Skeletal Soldier, 6-8: Revenant, 9: Black Dog, 10: Ghost)."
  },
  {
    "name": "Reanimate",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "If reduced to 0 Health lay on side.  At end of each turn roll D10 and on a 10 stand back up with 1 Health.  If reduced to 0 Health with Blessed or Fire attack or a figure with a Blessed of Fire Attack moves into contact while at 0 Health remove from table."
  },
  {
    "name": "Rock Hurler",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Can make Shooting Attacks at 12\" and uses the Power die for damage."
  },
  {
    "name": "Rusted Weapon",
    "isOfficer": false,
    "sourceCode": "italy",
    "rules": "All this figures weapons treated as Hand Weapons regardless of type."
  },
  {
    "name": "Scourge of Britain",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "Once per game, convert one Skill Die or Fate Die to a Monster Die; this figure regains up to 3 lost Health."
  },
  {
    "name": "Skeleton",
    "isOfficer": false,
    "sourceCode": "italy",
    "rules": "When reduced to 0 Health, becomes a Bone Pile (unless destroyed due to Brittle attribute).  If there are no figures with the Raise the Dead attribute in play, becomes a Bone Pile.  A figure with Raise the Dead attribute can choose, instead of rolling, to spend a Monster Die to turn a Bone Pile in LoS into a Skeletal Soldier with full health"
  },
  {
    "name": "Skinshift (Bear)",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Spend an action and pass Courage Check (TN14) to change form (may also attempt free when taking damage). Bear form: +1 Melee, +2 Courage; gains Very Strong, Damage Reduction (2), and Rage. May not Investigate clue markers in bear form. Same rules to revert (no free attempt from damage)."
  },
  {
    "name": "Skinshift (Werewolf)",
    "isOfficer": false,
    "sourceCode": "italy",
    "rules": "Spend an action and pass Courage Check (TN14) to change form (may also attempt free when taking damage). Werewolf form: +2 Defence, +3 Health; gains Strong, Indefatigable, Quick Healing, and Hard to Put Down. May not investigate clue markers in werewolf form. Same rules to revert (no free attempt from damage)."
  },
  {
    "name": "Skinshift (Wolf)",
    "isOfficer": false,
    "sourceCode": "canada",
    "rules": "Spend an action and pass Courage Check (TN14) to change form (may also attempt free when taking damage). Wolf form: +1 Melee, +2 Courage; gains Strong, Damage Reduction (5), Nimble, Quick, and Master of Cover. May not use firearms or investigate clue markers in wolf form. Same rules to revert (no free attempt from damage)."
  },
  {
    "name": "Sneak",
    "isOfficer": true,
    "sourceCode": "italy",
    "rules": "Once per scenario, move unseen by not attacking and staying more than own movement range from all enemies. Sneak persists until next activation or an enemy enters movement range. While sneaking: enemies cannot draw LoS unless (1) this figure is not in cover, or (2) the enemy is within movement range. Substantial cover maintains sneak even in melee range."
  },
  {
    "name": "Soul Shear",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "If this figure damages an enemy with a Melee Attack, the damaged figure must take a Terror Check (-Damage)."
  },
  {
    "name": "Spells",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "Spend an action; Courage Check (TN10). On success, choose one: Curse (target in LoS must pass Courage Check (TN18) or suffer -1 to all rolls for the game; max -2), Manipulate (convert one Fate Pool die to any other type), or Enchant Weapon (figure within 8\" LoS has one weapon count as Enchanted for the game). Figure suffers 1 damage either way."
  },
  {
    "name": "Steady Legs",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "+2 to any Check to avoid falling. Never suffers penalties for fighting or shooting on an unsteady platform (e.g. ship deck)."
  },
  {
    "name": "Strong",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "This figure does +1 damage whenever it hits with a Melee Attack."
  },
  {
    "name": "Supernatural Veteran",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "Soldiers may select 2 items from the Special Armoury (instead of 1). Officers may select 3. Does not increase overall equipment capacity."
  },
  {
    "name": "Swimmer",
    "isOfficer": true,
    "sourceCode": "canada",
    "rules": "Does not count water terrain as difficult ground; may count as in cover while in water. If used as cover during a game, all ranged weapons are fouled for the rest of that encounter."
  },
  {
    "name": "Tactician",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "Adds 1 Skill Die to the unit's Fate Pool at the start of each game. Only one extra die regardless of how many Tactician figures are in the unit."
  },
  {
    "name": "Unflappable",
    "isOfficer": true,
    "sourceCode": "core",
    "rules": "When this figure fails a Courage Check (including Terror Checks), spend any die from the Fate Pool to pass automatically (or get No Effect on a Terror Check)."
  },
  {
    "name": "Very Strong",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "This figure does +2 damage whenever it hits with a Melee Attack."
  },
  {
    "name": "Weakened by Faith",
    "isOfficer": false,
    "sourceCode": "core",
    "rules": "This figure suffers -3 to Melee Attack rolls when fighting against a figure carrying a Holy Symbol."
  },
  {
    "name": "Weather Control",
    "isOfficer": false,
    "sourceCode": "britain",
    "rules": "At end of each turn roll D10.  1-3: Wind - All Shooting Attacks -2.  4-6: Rain - All Shooting Attacks that only roll 1s and 2s are treated as Critical Failures.  7-8: Ice - All Sprint Checks -4.  If roll 0 or less fall over and lose 2 Health.  Effects last until end of scenario.  9-10: Lightning Strike - Roll Power Die.  Unit member closest to this figure takes that damage.  The player whose figure suffered damage may use a Power Die to reroll the damage."
  }
];

export const equipment: SeedEquipment[] = [
  {
    "name": "Blunderbuss",
    "category": "weapon",
    "slotCost": 1,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "8\", Power Die+1, −1 to Shoot Checks, 2 potential targets (with 1\" of each other, separate Check for each), ignore Armour (1), Shot Bag to reload, can be used as Improvised Weapon."
  },
  {
    "name": "Breastplate",
    "category": "armour",
    "slotCost": 1,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "Armour (1) - firearms ignore it, Speed -1."
  },
  {
    "name": "Cartridge Box",
    "category": "gear",
    "slotCost": 1,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "Reload musket or rifle."
  },
  {
    "name": "Cold Iron Shot",
    "category": "upgrade",
    "slotCost": 0,
    "isSpecial": true,
    "sourceCode": "core",
    "rules": "Ammo upgrade, shooting attacks ignore Damage Reduction and Indestructible on targets with Allergy (Cold Iron), 0 slots."
  },
  {
    "name": "Cold Iron Weapon",
    "category": "upgrade",
    "slotCost": 0,
    "isSpecial": true,
    "sourceCode": "core",
    "rules": "Melee weapon upgrade, attacks ignore Damage Reduction and Indestructible on targets with Allergy (Cold Iron), 0 slots."
  },
  {
    "name": "Fencing Weapon",
    "category": "weapon",
    "slotCost": 1,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "Melee, Skill Die."
  },
  {
    "name": "Hand Weapon",
    "category": "weapon",
    "slotCost": 1,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "Melee, Power Die."
  },
  {
    "name": "Heavy Weapon",
    "category": "weapon",
    "slotCost": 2,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "Melee, Power Die+1, 2 slots."
  },
  {
    "name": "Holy Symbol",
    "category": "gear",
    "slotCost": 1,
    "isSpecial": true,
    "sourceCode": "core",
    "rules": "Figures with Weakened by Faith suffer -3 to Melee attack rolls when in combat against the carrier."
  },
  {
    "name": "Improvised Weapon",
    "category": "weapon",
    "slotCost": 1,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "Melee, Power Die−1."
  },
  {
    "name": "Musket",
    "category": "weapon",
    "slotCost": 2,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "24\", Power Die, Cartridge Box to reload, ignore Armour (1), includes bayonet (Hand Weapon), 2 slots."
  },
  {
    "name": "Oil and Torches",
    "category": "gear",
    "slotCost": 1,
    "isSpecial": true,
    "sourceCode": "core",
    "rules": "Counts as Improvised Weapon but cannot use weapons that take up 2 or more slots, spend action to light, fire attacks ignore Damage Reduction and Indestructible on targets with Allergy (Fire)."
  },
  {
    "name": "Pistol",
    "category": "weapon",
    "slotCost": 1,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "8\", Power Die, Max 2 per figure, ignore Armour (1), can be used as Improvised Weapon."
  },
  {
    "name": "Rifle",
    "category": "weapon",
    "slotCost": 2,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "30\", Skill Die, Cartridge Box to reload, ignore Armour (1), includes bayonet (Hand Weapon), 2 slots."
  },
  {
    "name": "Salt Bag",
    "category": "gear",
    "slotCost": 1,
    "isSpecial": true,
    "sourceCode": "core",
    "rules": "Salt attacks ignore Damage Reduction and Indestructible on targets with Allergy (Salt)."
  },
  {
    "name": "Shot Bag",
    "category": "gear",
    "slotCost": 1,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "Reload blunderbuss."
  },
  {
    "name": "Silver Shot",
    "category": "upgrade",
    "slotCost": 0,
    "isSpecial": true,
    "sourceCode": "core",
    "rules": "Ammo upgrade, shooting attacks ignore Damage Reduction and Indestructible on targets with Allergy (Silver), 0 slots."
  },
  {
    "name": "Silver Weapon",
    "category": "upgrade",
    "slotCost": 0,
    "isSpecial": true,
    "sourceCode": "core",
    "rules": "Melee weapon upgrade, attacks ignore Damage Reduction and Indestructible on targets with Allergy (Silver), 0 slots."
  },
  {
    "name": "Volley Gun",
    "category": "weapon",
    "slotCost": 2,
    "isSpecial": false,
    "sourceCode": "core",
    "rules": "14\", Power Die+1, −1 to Shoot Checks, 3 potentials targets  (with 1\" of each other, separate Check for each), ignores Armour (1), cannot be reloaded, 2 slots."
  }
];


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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
    "fixedAttributes": [
      "Damage Reduction (1)",
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
    "fixedAttributes": [
      "Allergy (Fire)",
      "Allergy (Silver)",
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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
    "description": null,
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

export const monsters: SeedMonster[] = [
  {
    "name": "Anglo-Saxon Zombie",
    "sourceCode": "britain",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 0,
      "defence": 12,
      "courage": 5,
      "health": 10
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Damage Reduction - Projectiles Only (4)",
      "Indefatigable",
      "Reanimate"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Anglo-Saxon Zombie Thegn",
    "sourceCode": "britain",
    "experience": 1,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 13,
      "courage": 5,
      "health": 12
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Damage Reduction (4)",
      "Indefatigable",
      "Reanimate",
      "Strong"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Bandit",
    "sourceCode": "core",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 12,
      "courage": 0,
      "health": 10
    },
    "equipmentMode": "fixed",
    "description": null,
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
      }
    ]
  },
  {
    "name": "Black Dog",
    "sourceCode": "core",
    "experience": 2,
    "stats": {
      "speed": 8,
      "melee": 3,
      "accuracy": 0,
      "defence": 13,
      "courage": 6,
      "health": 18
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Allergy (Enchanted Weapons)",
      "Chilling Touch",
      "Ethereal",
      "Indefatigable",
      "Indestructible",
      "Soul Shear"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  },
  {
    "name": "Brigante Chief",
    "sourceCode": "italy",
    "experience": 2,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 13,
      "courage": 1,
      "health": 10
    },
    "equipmentMode": "choice",
    "description": null,
    "fixedAttributes": [
      "Indefatigable",
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
        "label": "Hand Weapon, Pistol ×2",
        "order": 2,
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
    "name": "Brigante/Brigantessa",
    "sourceCode": "italy",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 0,
      "defence": 12,
      "courage": 0,
      "health": 10
    },
    "equipmentMode": "choice",
    "description": null,
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
        "label": "Hand Weapon, Pistol ×2",
        "order": 2,
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
    "name": "Changeling",
    "sourceCode": "core",
    "experience": 2,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 13,
      "courage": 4,
      "health": 12
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Cold Iron)",
      "Allergy (Enchanted Weapons)",
      "Damage Reduction (4)",
      "Strong"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Civilian",
    "sourceCode": "britain",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 11,
      "courage": -2,
      "health": 10
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Cultist",
    "sourceCode": "core",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 13,
      "courage": 4,
      "health": 10
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Indefatigable"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Danish Draugr",
    "sourceCode": "britain",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 13,
      "courage": 5,
      "health": 12
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Fire)",
      "Damage Reduction (4)",
      "Indefatigable",
      "Strong"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Danish Draugr Berserker",
    "sourceCode": "britain",
    "experience": 1,
    "stats": {
      "speed": 6,
      "melee": 3,
      "accuracy": 0,
      "defence": 11,
      "courage": 8,
      "health": 14
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Fire)",
      "Damage Reduction (4)",
      "Frenzy",
      "Indefatigable",
      "Strong"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Danish Draugr Wizard",
    "sourceCode": "britain",
    "experience": 1,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 0,
      "defence": 11,
      "courage": 5,
      "health": 12
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Fire)",
      "Damage Reduction (4)",
      "Indefatigable",
      "Strong",
      "Weather Control"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Dark Wolf",
    "sourceCode": "core",
    "experience": 0,
    "stats": {
      "speed": 8,
      "melee": 1,
      "accuracy": 0,
      "defence": 12,
      "courage": 0,
      "health": 8
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [],
    "loadouts": []
  },
  {
    "name": "Demon",
    "sourceCode": "core",
    "experience": 3,
    "stats": {
      "speed": 6,
      "melee": 3,
      "accuracy": 0,
      "defence": 14,
      "courage": 10,
      "health": 18
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Allergy (Salt)",
      "Damage Reduction (5)",
      "Demonic Fire",
      "Flying",
      "Soul Shear",
      "Strong",
      "Weakened by Faith"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  },
  {
    "name": "Ghost",
    "sourceCode": "core",
    "experience": 2,
    "stats": {
      "speed": 6,
      "melee": 3,
      "accuracy": 0,
      "defence": 12,
      "courage": 10,
      "health": 12
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Enchanted Weapons)",
      "Allergy (Salt)",
      "Chilling Touch",
      "Ethereal",
      "Indefatigable",
      "Indestructible",
      "Soul Shear"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  },
  {
    "name": "Ghoul",
    "sourceCode": "core",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 0,
      "defence": 13,
      "courage": 4,
      "health": 12
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Strong"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Goblin",
    "sourceCode": "core",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 15,
      "courage": 5,
      "health": 8
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Cold Iron)",
      "Damage Reduction (4)",
      "Hypnotic",
      "Inimical to Technology",
      "Master of Cover",
      "Nimble",
      "Weakened by Faith"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Grave Golem",
    "sourceCode": "italy",
    "experience": 2,
    "stats": {
      "speed": 4,
      "melee": 3,
      "accuracy": 1,
      "defence": 14,
      "courage": 0,
      "health": 18
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Salt)",
      "Damage Reduction (4)",
      "Hard to Put Down",
      "Large"
    ],
    "loadouts": [
      {
        "label": "Heavy Weapon",
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
    "name": "Hobgoblin",
    "sourceCode": "core",
    "experience": 1,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 14,
      "courage": 5,
      "health": 14
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Damage Reduction (1)",
      "Indefatigable",
      "Strong"
    ],
    "loadouts": [
      {
        "label": "Heavy Weapon",
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
    "name": "Il Negromonte",
    "sourceCode": "italy",
    "experience": 3,
    "stats": {
      "speed": 6,
      "melee": 3,
      "accuracy": 0,
      "defence": 15,
      "courage": 10,
      "health": 15
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Chilling Touch",
      "Damage Reduction (4)",
      "Dark Gift",
      "Ethereal",
      "Hard to Put Down",
      "Quick Healing",
      "Raise the Dead",
      "Weakened by Faith"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Lindworm",
    "sourceCode": "britain",
    "experience": 3,
    "stats": {
      "speed": 8,
      "melee": 4,
      "accuracy": 0,
      "defence": 14,
      "courage": 10,
      "health": 20
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Allergy (Cold Iron)",
      "Allergy (Enchanted Weapons)",
      "Chaotic",
      "Indefatigable",
      "Indestructible",
      "Induce Terror",
      "Large",
      "Nimble",
      "Powerful Jaws",
      "Very Strong"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  },
  {
    "name": "Living Armour",
    "sourceCode": "core",
    "experience": 2,
    "stats": {
      "speed": 5,
      "melee": 2,
      "accuracy": 0,
      "defence": 14,
      "courage": 0,
      "health": 14
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Allergy (Enchanted Weapons)",
      "Indefatigable",
      "Indestructible"
    ],
    "loadouts": [
      {
        "label": "Heavy Weapon",
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
    "name": "Living Scarecrow",
    "sourceCode": "core",
    "experience": 1,
    "stats": {
      "speed": 5,
      "melee": 1,
      "accuracy": 0,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Fire)",
      "Damage Reduction (8)"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Necromancer Acolyte",
    "sourceCode": "italy",
    "experience": 2,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 0,
      "defence": 13,
      "courage": 5,
      "health": 10
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Dark Gift",
      "Quick Heal",
      "Raise the Dead"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Nightmare Witch (La Janara",
    "sourceCode": "italy",
    "experience": 1,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 0,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Allergy (Cold Iron)",
      "Curse of the Evil Eye",
      "Damage Reduction (2)",
      "Paralyse",
      "Weakened by Faith"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  },
  {
    "name": "Norman Ghost Knight",
    "sourceCode": "britain",
    "experience": 2,
    "stats": {
      "speed": 8,
      "melee": 3,
      "accuracy": 0,
      "defence": 13,
      "courage": 8,
      "health": 12
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Salt)",
      "Chilling Touch",
      "Ethereal Cavalry",
      "Indefatigable",
      "Indestructible",
      "Soul Shear"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Norman Ghost Warrior",
    "sourceCode": "britain",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 11,
      "courage": 2,
      "health": 6
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Salt)",
      "Chilling Touch",
      "Damage Reduction (7)",
      "Ethereal",
      "Indefatigable"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Norwegian Aptrganga",
    "sourceCode": "britain",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 13,
      "courage": 5,
      "health": 12
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Silver)",
      "Damage Reduction (4)",
      "Indefatigable",
      "Strong"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Norwegian Aptrganga Skin-Changer",
    "sourceCode": "britain",
    "experience": 2,
    "stats": {
      "speed": 7,
      "melee": 4,
      "accuracy": 0,
      "defence": 13,
      "courage": 5,
      "health": 16
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Silver)",
      "Indefatigable",
      "Indestructible",
      "Strong"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Pixie",
    "sourceCode": "core",
    "experience": 1,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 18,
      "courage": 0,
      "health": 1
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Flying",
      "Inimical to Technology",
      "Irritant"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  },
  {
    "name": "Possessed",
    "sourceCode": "core",
    "experience": 2,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 12,
      "courage": 3,
      "health": 14
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Damage Reduction (2)",
      "Demonic Fire",
      "Strong",
      "Weakened by Faith"
    ],
    "loadouts": [
      {
        "label": "Heavy Weapon",
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
    "name": "Possessed Boar",
    "sourceCode": "italy",
    "experience": 1,
    "stats": {
      "speed": 8,
      "melee": 1,
      "accuracy": 0,
      "defence": 10,
      "courage": 0,
      "health": 8
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Allergy (Enchanted Weapons)",
      "Allergy (Fire)",
      "Damage Reduction (5)",
      "Strong",
      "Weakened by Faith"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  },
  {
    "name": "Revenant",
    "sourceCode": "core",
    "experience": 0,
    "stats": {
      "speed": 4,
      "melee": 1,
      "accuracy": 0,
      "defence": 12,
      "courage": 5,
      "health": 10
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Damage Reduction - Projectiles Only (4)",
      "Indefatigable"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  },
  {
    "name": "Scoti Slaugh",
    "sourceCode": "britain",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 11,
      "courage": 2,
      "health": 6
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Cold Iron)",
      "Damage Reduction (7)",
      "Ethereal",
      "Flitting Movement",
      "Indefatigable"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Scoti Slaugh Head-Taker",
    "sourceCode": "britain",
    "experience": 2,
    "stats": {
      "speed": 7,
      "melee": 3,
      "accuracy": 0,
      "defence": 13,
      "courage": 8,
      "health": 16
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Cold Iron)",
      "Ethereal",
      "Flitting Movement",
      "Head-Taker",
      "Indefatigable",
      "Indestructible",
      "Soul Shear"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Skeletal Roman Centurion",
    "sourceCode": "britain",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 13,
      "courage": 0,
      "health": 10
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Enchanted Weapons)",
      "Command Skeletal Roman Legionary",
      "Damage Reduction - Projectiles Only (8)",
      "Damage Reduction (4)",
      "Indefatigable"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Skeletal Roman Legionary",
    "sourceCode": "britain",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 0,
      "defence": 13,
      "courage": 0,
      "health": 1
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Enchanted Weapons)",
      "Damage Reduction - Projectiles Only (8)",
      "Indefatigable"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Skeletal Soldier",
    "sourceCode": "italy",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 10,
      "courage": 0,
      "health": 5
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Allergy (Enchanted Weapons)",
      "Brittle",
      "Damage Reduction - Projectiles Only (4)",
      "Indefatigable",
      "Rusted Weapon",
      "Skeleton"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Spectral Soldier",
    "sourceCode": "italy",
    "experience": 1,
    "stats": {
      "speed": 6,
      "melee": 1,
      "accuracy": 1,
      "defence": 12,
      "courage": 0,
      "health": 10
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Enchanted Weapons)",
      "Allergy (Salt)",
      "Chilling Touch",
      "Ethereal",
      "Ethereal Firearms",
      "Indestructible"
    ],
    "loadouts": [
      {
        "label": "Musket",
        "order": 0,
        "items": [
          {
            "name": "Musket",
            "qty": 1
          }
        ]
      }
    ]
  },
  {
    "name": "Troll",
    "sourceCode": "core",
    "experience": 2,
    "stats": {
      "speed": 5,
      "melee": 3,
      "accuracy": 1,
      "defence": 13,
      "courage": 3,
      "health": 20
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Fire)",
      "Damage Reduction (4)",
      "Large",
      "Rock Hurler",
      "Very Strong"
    ],
    "loadouts": [
      {
        "label": "Hand Weapon",
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
    "name": "Vampire",
    "sourceCode": "core",
    "experience": 2,
    "stats": {
      "speed": 6,
      "melee": 3,
      "accuracy": 0,
      "defence": 15,
      "courage": 8,
      "health": 14
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Blessed Weapons)",
      "Allergy (Fire)",
      "Allergy (Silver)",
      "Ethereal",
      "Hypnotic",
      "Indefatigable",
      "Indestructible",
      "Soul Shear",
      "Strong",
      "Weakened by Faith"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  },
  {
    "name": "Vampire Bat",
    "sourceCode": "core",
    "experience": 0,
    "stats": {
      "speed": 6,
      "melee": 0,
      "accuracy": 0,
      "defence": 14,
      "courage": 1,
      "health": 6
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Flying"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  },
  {
    "name": "Werewolf",
    "sourceCode": "core",
    "experience": 2,
    "stats": {
      "speed": 6,
      "melee": 2,
      "accuracy": 0,
      "defence": 13,
      "courage": 3,
      "health": 12
    },
    "equipmentMode": "fixed",
    "description": null,
    "fixedAttributes": [
      "Allergy (Fire)",
      "Allergy (Silver)",
      "Damage Reduction (5)",
      "Indefatigable",
      "Master of Cover",
      "Nimble",
      "Quick Healing",
      "Strong"
    ],
    "loadouts": [
      {
        "label": "Empty",
        "order": 0,
        "items": []
      }
    ]
  }
];

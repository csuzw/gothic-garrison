-- Add equipment_mode to monster_types
ALTER TABLE "monster_types" ADD COLUMN "equipment_mode" "equipment_mode" DEFAULT 'fixed' NOT NULL;
--> statement-breakpoint
-- Create monster_loadouts
CREATE TABLE IF NOT EXISTS "monster_loadouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monster_type_id" uuid NOT NULL,
	"label" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
-- Create monster_loadout_items
CREATE TABLE IF NOT EXISTS "monster_loadout_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loadout_id" uuid NOT NULL,
	"equipment_item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
-- FKs
DO $$ BEGIN
 ALTER TABLE "monster_loadouts" ADD CONSTRAINT "monster_loadouts_monster_type_id_monster_types_id_fk" FOREIGN KEY ("monster_type_id") REFERENCES "public"."monster_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monster_loadout_items" ADD CONSTRAINT "monster_loadout_items_loadout_id_monster_loadouts_id_fk" FOREIGN KEY ("loadout_id") REFERENCES "public"."monster_loadouts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monster_loadout_items" ADD CONSTRAINT "monster_loadout_items_equipment_item_id_equipment_items_id_fk" FOREIGN KEY ("equipment_item_id") REFERENCES "public"."equipment_items"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monster_loadouts_type_idx" ON "monster_loadouts" USING btree ("monster_type_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monster_loadout_items_loadout_idx" ON "monster_loadout_items" USING btree ("loadout_id");
--> statement-breakpoint
-- Migrate existing monster_type_equipment rows into a single 'Standard' loadout per monster,
-- then drop the old table.
INSERT INTO "monster_loadouts" ("monster_type_id", "label", "display_order")
SELECT DISTINCT "monster_type_id", 'Standard', 0
FROM "monster_type_equipment";
--> statement-breakpoint
INSERT INTO "monster_loadout_items" ("loadout_id", "equipment_item_id", "quantity", "display_order")
SELECT ml."id", mte."equipment_item_id", mte."quantity", mte."display_order"
FROM "monster_type_equipment" mte
JOIN "monster_loadouts" ml ON ml."monster_type_id" = mte."monster_type_id";
--> statement-breakpoint
DROP TABLE "monster_type_equipment";

CREATE TABLE IF NOT EXISTS "monster_type_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monster_type_id" uuid NOT NULL,
	"equipment_item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monster_type_fixed_attributes" (
	"monster_type_id" uuid NOT NULL,
	"attribute_id" uuid NOT NULL,
	CONSTRAINT "monster_type_fixed_attributes_monster_type_id_attribute_id_pk" PRIMARY KEY("monster_type_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monster_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"source_id" uuid NOT NULL,
	"experience" text NOT NULL,
	"stats" jsonb NOT NULL,
	"notes" text,
	CONSTRAINT "monster_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monster_type_equipment" ADD CONSTRAINT "monster_type_equipment_monster_type_id_monster_types_id_fk" FOREIGN KEY ("monster_type_id") REFERENCES "public"."monster_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monster_type_equipment" ADD CONSTRAINT "monster_type_equipment_equipment_item_id_equipment_items_id_fk" FOREIGN KEY ("equipment_item_id") REFERENCES "public"."equipment_items"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monster_type_fixed_attributes" ADD CONSTRAINT "monster_type_fixed_attrs_type_fk" FOREIGN KEY ("monster_type_id") REFERENCES "public"."monster_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monster_type_fixed_attributes" ADD CONSTRAINT "monster_type_fixed_attrs_attr_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monster_types" ADD CONSTRAINT "monster_types_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monster_type_equipment_type_idx" ON "monster_type_equipment" USING btree ("monster_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monster_types_source_idx" ON "monster_types" USING btree ("source_id");
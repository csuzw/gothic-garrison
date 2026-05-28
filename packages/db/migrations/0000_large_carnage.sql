CREATE TYPE "public"."equipment_allowed_for" AS ENUM('officer', 'soldier', 'both');--> statement-breakpoint
CREATE TYPE "public"."equipment_mode" AS ENUM('fixed', 'choice', 'pool');--> statement-breakpoint
CREATE TYPE "public"."source_kind" AS ENUM('core', 'supplement');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "equipment_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"slot_cost" integer DEFAULT 1 NOT NULL,
	"is_special" boolean DEFAULT false NOT NULL,
	"allowed_for" "equipment_allowed_for" DEFAULT 'both' NOT NULL,
	"source_id" uuid NOT NULL,
	"notes" text,
	CONSTRAINT "equipment_items_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nation_soldier_types" (
	"nation_id" uuid NOT NULL,
	"soldier_type_id" uuid NOT NULL,
	CONSTRAINT "nation_soldier_types_nation_id_soldier_type_id_pk" PRIMARY KEY("nation_id","soldier_type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"source_id" uuid NOT NULL,
	"notes" text,
	CONSTRAINT "nations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "officer_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"source_id" uuid NOT NULL,
	CONSTRAINT "officer_attributes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "optional_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"source_id" uuid NOT NULL,
	CONSTRAINT "optional_rules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "soldier_loadout_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loadout_id" uuid NOT NULL,
	"equipment_item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "soldier_loadouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"soldier_type_id" uuid NOT NULL,
	"label" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "soldier_type_fixed_attributes" (
	"soldier_type_id" uuid NOT NULL,
	"officer_attribute_id" uuid NOT NULL,
	CONSTRAINT "soldier_type_fixed_attributes_soldier_type_id_officer_attribute_id_pk" PRIMARY KEY("soldier_type_id","officer_attribute_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "soldier_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"source_id" uuid NOT NULL,
	"recruitment_cost" integer NOT NULL,
	"stats" jsonb NOT NULL,
	"max_per_unit" integer,
	"is_junior_officer" boolean DEFAULT false NOT NULL,
	"equipment_mode" "equipment_mode" DEFAULT 'fixed' NOT NULL,
	"equipment_slots" integer,
	"special_slots" integer,
	"attribute_picks" integer DEFAULT 0 NOT NULL,
	"abilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	CONSTRAINT "soldier_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"kind" "source_kind" NOT NULL,
	"published_date" date NOT NULL,
	"author" text NOT NULL,
	CONSTRAINT "sources_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "warbands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"nation_id" uuid NOT NULL,
	"data" jsonb NOT NULL,
	"reference_snapshot_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nation_soldier_types" ADD CONSTRAINT "nation_soldier_types_nation_id_nations_id_fk" FOREIGN KEY ("nation_id") REFERENCES "public"."nations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nation_soldier_types" ADD CONSTRAINT "nation_soldier_types_soldier_type_id_soldier_types_id_fk" FOREIGN KEY ("soldier_type_id") REFERENCES "public"."soldier_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nations" ADD CONSTRAINT "nations_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "officer_attributes" ADD CONSTRAINT "officer_attributes_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "optional_rules" ADD CONSTRAINT "optional_rules_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "soldier_loadout_items" ADD CONSTRAINT "soldier_loadout_items_loadout_id_soldier_loadouts_id_fk" FOREIGN KEY ("loadout_id") REFERENCES "public"."soldier_loadouts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "soldier_loadout_items" ADD CONSTRAINT "soldier_loadout_items_equipment_item_id_equipment_items_id_fk" FOREIGN KEY ("equipment_item_id") REFERENCES "public"."equipment_items"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "soldier_loadouts" ADD CONSTRAINT "soldier_loadouts_soldier_type_id_soldier_types_id_fk" FOREIGN KEY ("soldier_type_id") REFERENCES "public"."soldier_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "soldier_type_fixed_attributes" ADD CONSTRAINT "soldier_type_fixed_attrs_type_fk" FOREIGN KEY ("soldier_type_id") REFERENCES "public"."soldier_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "soldier_type_fixed_attributes" ADD CONSTRAINT "soldier_type_fixed_attrs_attr_fk" FOREIGN KEY ("officer_attribute_id") REFERENCES "public"."officer_attributes"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "soldier_types" ADD CONSTRAINT "soldier_types_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "warbands" ADD CONSTRAINT "warbands_nation_id_nations_id_fk" FOREIGN KEY ("nation_id") REFERENCES "public"."nations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "soldier_loadout_items_loadout_idx" ON "soldier_loadout_items" USING btree ("loadout_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "soldier_loadouts_type_idx" ON "soldier_loadouts" USING btree ("soldier_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "soldier_types_source_idx" ON "soldier_types" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "warbands_user_idx" ON "warbands" USING btree ("user_id");
CREATE TYPE "public"."equipment_mode" AS ENUM('fixed', 'choice', 'pool');--> statement-breakpoint
CREATE TYPE "public"."pick_scope" AS ENUM('none', 'officer', 'soldier', 'any');--> statement-breakpoint
CREATE TYPE "public"."source_kind" AS ENUM('core', 'supplement');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"rules" text NOT NULL,
	"pick_scope" "pick_scope" DEFAULT 'none' NOT NULL,
	"cost_delta" integer DEFAULT 0 NOT NULL,
	"source_id" uuid NOT NULL,
	CONSTRAINT "attributes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "equipment_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"slot_cost" integer DEFAULT 1 NOT NULL,
	"is_special" boolean DEFAULT false NOT NULL,
	"source_id" uuid NOT NULL,
	"rules" text,
	CONSTRAINT "equipment_items_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monster_loadout_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loadout_id" uuid NOT NULL,
	"equipment_item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monster_loadouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monster_type_id" uuid NOT NULL,
	"label" text NOT NULL,
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
	"experience" integer NOT NULL,
	"stats" jsonb NOT NULL,
	"equipment_mode" "equipment_mode" DEFAULT 'fixed' NOT NULL,
	"description" text,
	CONSTRAINT "monster_types_name_unique" UNIQUE("name")
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
	"description" text,
	"flag" text,
	CONSTRAINT "nations_name_unique" UNIQUE("name")
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
	"attribute_id" uuid NOT NULL,
	CONSTRAINT "soldier_type_fixed_attributes_soldier_type_id_attribute_id_pk" PRIMARY KEY("soldier_type_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "soldier_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"source_id" uuid NOT NULL,
	"recruitment_cost" integer NOT NULL,
	"stats" jsonb NOT NULL,
	"max_per_unit" integer,
	"equipment_mode" "equipment_mode" DEFAULT 'fixed' NOT NULL,
	"equipment_slots" integer,
	"special_slots" integer,
	"attribute_picks" integer DEFAULT 0 NOT NULL,
	"also_in_source_id" uuid,
	"description" text,
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
	"osprey_cover_url" text,
	"cover_image_url" text,
	CONSTRAINT "sources_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"nation_id" uuid,
	"data" jsonb NOT NULL,
	"reference_snapshot_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attributes" ADD CONSTRAINT "attributes_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;
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
DO $$ BEGIN
 ALTER TABLE "monster_loadouts" ADD CONSTRAINT "monster_loadouts_monster_type_id_monster_types_id_fk" FOREIGN KEY ("monster_type_id") REFERENCES "public"."monster_types"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "soldier_type_fixed_attributes" ADD CONSTRAINT "soldier_type_fixed_attrs_attr_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE restrict ON UPDATE no action;
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
 ALTER TABLE "soldier_types" ADD CONSTRAINT "soldier_types_also_in_source_id_sources_id_fk" FOREIGN KEY ("also_in_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "units" ADD CONSTRAINT "units_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "units" ADD CONSTRAINT "units_nation_id_nations_id_fk" FOREIGN KEY ("nation_id") REFERENCES "public"."nations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monster_loadout_items_loadout_idx" ON "monster_loadout_items" USING btree ("loadout_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monster_loadouts_type_idx" ON "monster_loadouts" USING btree ("monster_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monster_types_source_idx" ON "monster_types" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "soldier_loadout_items_loadout_idx" ON "soldier_loadout_items" USING btree ("loadout_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "soldier_loadouts_type_idx" ON "soldier_loadouts" USING btree ("soldier_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "soldier_types_source_idx" ON "soldier_types" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "units_user_idx" ON "units" USING btree ("user_id");
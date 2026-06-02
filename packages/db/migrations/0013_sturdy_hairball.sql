ALTER TABLE "optional_rules" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "optional_rules" CASCADE;--> statement-breakpoint
ALTER TABLE "monster_types" ALTER COLUMN "equipment_mode" SET DEFAULT 'fixed';
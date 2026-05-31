-- Rename field columns to consistent names matching UI labels.
-- nations.notes         → description
-- attributes.description → rules
-- equipment_items.notes → rules
-- soldier_types.notes   → description
-- monster_types.notes   → description
ALTER TABLE "nations" RENAME COLUMN "notes" TO "description";
--> statement-breakpoint
ALTER TABLE "attributes" RENAME COLUMN "description" TO "rules";
--> statement-breakpoint
ALTER TABLE "equipment_items" RENAME COLUMN "notes" TO "rules";
--> statement-breakpoint
ALTER TABLE "soldier_types" RENAME COLUMN "notes" TO "description";
--> statement-breakpoint
ALTER TABLE "monster_types" RENAME COLUMN "notes" TO "description";
